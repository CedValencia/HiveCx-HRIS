/* ============================================================
   Hive HRIS — clickable leave calendar (shared by HR Admin + Employee)

   Load this AFTER js/core.js and BEFORE the page's own script:
     <script src="js/core.js"></script>
     <script src="js/leave-day.js"></script>

   It replaces teamCal() and leaveCalCard() from core.js so every day on the
   calendar opens a "day details" panel:
     · HR Admin  → every pending/approved request on that day, with
                   Approve / Reject buttons right in the panel.
     · Employee  → their own leave on that day, plus an anonymous note when
                   someone else has a pending (or approved) request there.
   ============================================================ */
"use strict";

/* Employee privacy switch. The panel always tells an employee when a request
   is pending on a day (no names, types or reasons). Set this to false to hide
   the "day is taken" note for days where a teammate is already approved. */
const LD_EMP_SEES_TAKEN=true;

let ldLastDay=null;   // the day whose panel is open, so it can reopen after a decision

/* ---------- styles for the clickable cells and the panel ---------- */
(function(){
  const s=document.createElement("style");
  s.textContent=`
  .cal .day[data-a="day"]{cursor:pointer}
  .cal .day[data-a="day"]:hover{box-shadow:inset 0 0 0 1.5px var(--ac)}
  .cal .day[data-a="day"]:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
  .ldchips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
  .ldi{border:1px solid var(--line);border-radius:var(--rsm);background:var(--panel2);padding:12px 14px;margin-top:10px}
  .ldrow{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap}
  .ldi textarea{width:100%;margin-top:10px}
  .ldact{display:flex;gap:8px;margin-top:10px}
  .ldnote{margin-top:10px;font-size:13px}
  `;
  document.head.appendChild(s);
})();

/* ---------- calendar grid (same colours and priority as before, now clickable) ---------- */
function teamCal(forEmp){
  const y=TODAY.getFullYear(),m=TODAY.getMonth(),last=new Date(y,m+1,0).getDate(),sh=forEmp?shiftOf(forEmp):SHIFTS.day;
  let c=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x=>`<div class="h">${x}</div>`).join("");
  c+=`<div class="h"></div>`.repeat(new Date(y,m,1).getDay());
  for(let d=1;d<=last;d++){
    const k=y+"-"+pad2(m+1)+"-"+pad2(d);
    const inRange=l=>k>=l.f&&k<=l.to&&(!forEmp||l.e===forEmp);
    const ap=leaves.filter(l=>l.st==="Approved"&&inRange(l)),pe=leaves.filter(l=>l.st==="Pending"&&inRange(l));
    let cls="day",sub="",tip="";
    if(ap.length){cls+=" leave";sub=forEmp?"on leave":ap.map(l=>ini(nm(l.e))).join(" ");tip="Approved leave"}
    else if(pe.length){cls+=" inc";sub=forEmp?"pending":pe.map(l=>ini(nm(l.e))).join(" ");tip="Pending leave"}
    else if(holOn(k)){cls+=" hol";sub=holOn(k).n.split(" ")[0].slice(0,9).toLowerCase();tip="Holiday · "+holOn(k).n}
    else if(isRest(k,sh)){cls+=" rest";sub="rest";tip="Rest day"}
    if(k===Y)cls+=" td";
    c+=`<div class="${cls}" role="button" tabindex="0" data-a="day" data-i="${k}" aria-label="${esc(longDate(k))}${tip?" — "+esc(tip):""}. Open day details">${d}${sub?`<small>${sub}</small>`:""}</div>`;
  }
  return c;
}

function leaveCalCard(forEmp){
  return `<div class="card">
    <div class="cardhd"><div><div class="fig">${forEmp?"MY LEAVE CALENDAR":"TEAM CALENDAR"}</div><h3>${TODAY.toLocaleDateString("en-PH",{month:"long",year:"numeric"})}</h3></div>
      <span class="mut" style="font-size:12.5px">${forEmp
        ?"Your approved and pending leave, holidays and rest days. Click a day for details."
        :"Initials show who is on leave: purple is approved, orange is still pending. Click a day to review its requests."}</span></div>
    <div class="cal">${teamCal(forEmp)}</div>${leaveLegend()}
  </div>`;
}

/* ---------- day panel ---------- */
const ldOverlap=k=>leaves.filter(l=>k>=l.f&&k<=l.to);

function ldChips(k,sh){
  const out=[],h=holOn(k);
  if(h)out.push(`<span class="tag">Holiday · ${esc(h.n)}</span>`);
  if(isRest(k,sh))out.push(`<span class="tag">Rest day</span>`);
  if(k===Y)out.push(`<span class="tag">Today</span>`);
  return out.length?`<div class="ldchips">${out.join("")}</div>`:"";
}

function ldAdminHtml(k){
  const all=ldOverlap(k).filter(l=>l.st==="Pending"||l.st==="Approved")
    .sort((a,b)=>(a.st===b.st?0:a.st==="Pending"?-1:1)||nm(a.e).localeCompare(nm(b.e)));
  const pend=all.filter(l=>l.st==="Pending").length,appr=all.length-pend;
  const people=new Set(all.map(l=>l.e)).size;
  const approved=all.find(l=>l.st==="Approved");
  const warn=people>1
    ?`<div class="hintbox" style="color:var(--inc);margin-top:12px">${people} people have leave on this day, but policy allows one person per day.${
        approved?" "+esc(nm(approved.e))+" is already approved, so approving anyone else would clash."
                :" Approve only one of them."}</div>`
    :"";
  const items=all.map(l=>{
    const n=leaveDays(l.f,l.to,l.e),pending=l.st==="Pending";
    return `<div class="ldi">
      <div class="ldrow"><div>
        <b>${esc(nm(l.e))}</b>
        <div class="mut" style="font-size:13px">${esc(l.t)} · ${shortDate(l.f)} → ${shortDate(l.to)} · ${n} working day${n===1?"":"s"}</div>
        ${l.why?`<div class="mut" style="font-size:13px;margin-top:4px">Reason: ${esc(l.why)}</div>`:""}
      </div>${tg(l.st)}</div>
      ${pending
        ?`<textarea data-rm="lv${l.id}" rows="1" placeholder="Remarks (optional)"></textarea>
          <div class="ldact"><button class="sm pri" data-a="lvap" data-i="${l.id}">Approve</button><button class="sm dngr" data-a="lvrj" data-i="${l.id}">Reject</button></div>`
        :l.rm?`<div class="mut ldnote">${esc(l.rm)}</div>`:""}
    </div>`;
  }).join("");
  return `<div class="fig">DAY DETAILS</div><h3 style="margin-top:6px">${esc(longDate(k))}</h3>
    ${ldChips(k,SHIFTS.day)}
    <p class="mut" style="font-size:13px;margin:10px 0 0">${all.length?pend+" pending · "+appr+" approved":"No one is on leave this day."}</p>
    ${warn}${items}`;
}

function ldEmpHtml(k){
  const day=ldOverlap(k).filter(l=>l.st==="Pending"||l.st==="Approved");
  const mine=day.filter(l=>l.e===ME),others=day.filter(l=>l.e!==ME);
  const op=new Set(others.filter(l=>l.st==="Pending").map(l=>l.e)).size;
  const oa=others.some(l=>l.st==="Approved");
  const ownItems=mine.map(l=>{
    const n=leaveDays(l.f,l.to,ME);
    return `<div class="ldi">
      <div class="ldrow"><div>
        <b>Your ${esc(l.t.toLowerCase())} leave</b>
        <div class="mut" style="font-size:13px">${shortDate(l.f)} → ${shortDate(l.to)} · ${n} working day${n===1?"":"s"}</div>
      </div>${tg(l.st)}</div>
      <div class="mut ldnote">${l.st==="Pending"?"Waiting for HR to approve or reject this request.":l.rm?esc(l.rm):""}</div>
    </div>`;
  }).join("");
  const notes=[];
  if(op)notes.push(`<div class="hintbox" style="margin-top:10px">${
    op===1?"A leave request is pending for this day.":op+" leave requests are pending for this day."
  } HR allows one person on leave per day, so at most one of them can be approved.</div>`);
  if(oa&&LD_EMP_SEES_TAKEN)notes.push(`<div class="hintbox" style="margin-top:10px">Leave is already approved for this day. HR allows one person on leave per day, so new requests for it are unlikely to be approved.</div>`);
  const empty=!mine.length&&!notes.length;
  return `<div class="fig">DAY DETAILS</div><h3 style="margin-top:6px">${esc(longDate(k))}</h3>
    ${ldChips(k,shiftOf(ME))}
    ${ownItems}${notes.join("")}
    ${empty?`<p class="mut" style="font-size:13px;margin:10px 0 0">No leave requests on this day.</p>`:""}`;
}

function openLeaveDay(k){
  ldLastDay=k;
  const emp=window.HIVE_PAGE&&window.HIVE_PAGE.role==="emp";
  modal(emp?ldEmpHtml(k):ldAdminHtml(k));
}

/* After HR decides a request from inside the panel, come back to the same day
   if more requests are still waiting there. */
function reopenLeaveDay(){
  if(ldLastDay&&ldOverlap(ldLastDay).some(l=>l.st==="Pending"))openLeaveDay(ldLastDay);
}

HIVE.actions=HIVE.actions||{};
HIVE.actions["day"]=function(k){openLeaveDay(k)};

/* keyboard: Enter or Space on a focused day opens it */
document.addEventListener("keydown",ev=>{
  if(ev.key!=="Enter"&&ev.key!==" ")return;
  const c=ev.target.closest&&ev.target.closest('.day[data-a="day"]');
  if(!c)return;
  ev.preventDefault();c.click();
});
