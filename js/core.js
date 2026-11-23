"use strict";
/* ============================================================
   Hive HRIS — shared engine for every page (css/hive.css + js/hive.js)
   Sections: 1 helpers · 2 policy · 3 seed data · 4 attendance
   5 bonus engine · 6 leave balances · 7 views · 8 shell · 9 actions
   ============================================================ */

/* ---------- 1. HELPERS ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const PHP=n=>"₱"+Math.round(n).toLocaleString("en-PH");
const pad2=n=>String(n).padStart(2,"0");
const round2=n=>Math.round(n*100)/100;
const mins=s=>{const[a,b]=String(s).split(":").map(Number);return a*60+(b||0)};
const hm=m=>pad2(Math.floor(m/60))+":"+pad2(m%60);
const pdate=s=>new Date(String(s)+"T00:00:00");
const dkey=d=>d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());
const TODAY=new Date();TODAY.setHours(0,0,0,0);
const Y=dkey(TODAY);
const longDate=s=>pdate(s).toLocaleDateString("en-PH",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
const shortDate=s=>pdate(s).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"});
const ago=ts=>{const s=(Date.now()-ts)/1000;if(s<60)return"just now";if(s<3600)return Math.floor(s/60)+"m ago";
  if(s<86400)return Math.floor(s/3600)+"h ago";if(s<604800)return Math.floor(s/86400)+"d ago";
  return new Date(ts).toLocaleDateString("en-PH",{month:"short",day:"numeric"})};
const ini=n=>String(n).split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

/* icons */
const IP={
 home:'<path d="M4 11 12 4l8 7"/><path d="M6 10.5V20h12v-9.5"/><path d="M10 20v-5h4v5"/>',
 cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
 plane:'<path d="M10.5 20.5 12 15l7.5-2.2a2 2 0 0 0 0-3.8L5 5.5l1.8 5.4L4 13l3 2.2L7.5 20z"/>',
 wallet:'<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M16.5 14.5h1.5"/>',
 user:'<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4"/>',
 grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
 users:'<circle cx="9" cy="8.5" r="3.4"/><path d="M2.5 19.5c1.2-3.2 3.7-4.8 6.5-4.8s5.3 1.6 6.5 4.8"/><path d="M16 5.6a3.4 3.4 0 0 1 0 6.6M17.5 14.9c2 .7 3.4 2.2 4 4.6"/>',
 chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 mega:'<path d="M4 10v4a1.5 1.5 0 0 0 1.5 1.5H8l7 4.5V5.5L8 10H5.5A1.5 1.5 0 0 0 4 11.5z"/><path d="M18.5 9a4.5 4.5 0 0 1 0 6"/>',
 bell:'<path d="M6 9a6 6 0 0 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 13.5 6 9z"/><path d="M10 19a2.2 2.2 0 0 0 4 0"/>',
 moon:'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19"/>',
 out:'<path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8"/><path d="M11 12h10M17.5 8.5 21 12l-3.5 3.5"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 check:'<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>',
 x:'<path d="M6 6l12 12M18 6 6 18"/>',
 cl:'<path d="M14.5 5.5 8 12l6.5 6.5"/>',
 cr:'<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
 clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.2 2"/>',
 pin:'<path d="M9 3.5h6l-1 5 3.5 3.5H6.5L10 8.5z"/><path d="M12 12v8.5"/>',
 lock:'<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
 shield:'<path d="M12 3.2 19 6v5.5c0 4.4-3 7.6-7 9.3-4-1.7-7-4.9-7-9.3V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
 edit:'<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14.5 6.5 17.5 9.5"/>',
 print:'<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="2"/><path d="M7 14h10v6H7z"/>',
 dl:'<path d="M12 4v11M8 11.5 12 15.5 16 11.5"/><path d="M5 20h14"/>',
 qr:'<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.2"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.2"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1.2"/><path d="M14 14h2.5v2.5H14zM18 18h2.5v2.5H18zM18 14h2.5M14 18v2.5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 alert:'<path d="M12 4 2.8 20h18.4z"/><path d="M12 10v4.5M12 17.4v.2"/>',
 info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.2"/>',
 search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
 zap:'<path d="M13 2.5 5 13.5h6L10.5 21.5 19 10.5h-6z"/>',
 refresh:'<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4.5h-4.5"/>',
 cake:'<path d="M4.5 20.5h15v-6a2.5 2.5 0 0 0-2.5-2.5H7a2.5 2.5 0 0 0-2.5 2.5z"/><path d="M4.5 16.5h15M12 12V8.5M12 5.5v.2"/>'
};
const ico=(n,c="")=>`<svg class="i ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IP[n]||""}</svg>`;

/* ---------- 2. POLICY (single source of truth) ----------
   Change these values in one place only; every page reads from here.
   allowanceIncludesBonus:
     false → the 1.5-day monthly attendance bonus is ADDITIONAL leave
             on top of the base annual allowance (total can exceed 15).
     true  → bonus days count INSIDE the 15-day annual allowance
             (total available is capped at the allowance).
   Both interpretations are supported; switch it on the HR Admin → Leave page. */
const POLICY={
  annualAllowanceDays:15,            // base annual leave allowance (days/year)
  monthlyBonusDays:1.5,              // attendance bonus granted per qualified month
  latenessForfeitMinutes:15,         // >= this many late minutes in a month voids the bonus
  consecutiveLateForfeitDays:3,      // this many consecutive late working days voids the bonus
  allowanceIncludesBonus:false,      // false = bonus is extra · true = bonus counts inside the cap
  workStart:"09:00",                 // default scheduled clock-in
  workEnd:"18:00",                   // default scheduled clock-out
  dataStart:"2026-06-01",            // attendance records begin here (bonus program start)
  minMonth:"2026-06",                // earliest month the calendar can show
  maxMonth:"2026-12"                 // latest month the calendar can show
};

/* ---------- 3. SEED DATA ---------- */
const D=["Customer Support","Sales Outreach","Back Office","IT & Data","Admin"];
const DEMO_ME="HV-001";            // the scripted demo employee (Maria) — seed data below belongs to her
let ME=DEMO_ME;                    // whoever is signed in as an employee (set from the session in boot())
const SHIFTS={
  day:{id:"day",name:"Day Shift",start:"09:00",end:"18:00",rest:[0,6]},
  mid:{id:"mid",name:"Mid Shift",start:"12:00",end:"21:00",rest:[0,6]}
};
const shiftOf=id=>SHIFTS[(emps.find(e=>e.id===id)||{}).sh||"day"]||SHIFTS.day;

let emps=[
 {id:"HV-001",n:"Maria Santos",r:"Team Lead",d:"Customer Support",s:16000,j:"2023-02-14",b:"11-24",
  email:"maria.santos@hive.com",ph:"0917 123 4567",addr:"88 Sampaguita St, Quezon City",
  ec:"Ana Santos · 0917 000 0000",sh:"day",st:"Regular",pass:"hive123",twofa:true},
 {id:"HV-002",n:"John Reyes",r:"Sales Agent",d:"Sales Outreach",s:12000,j:"2023-06-01",b:"12-03",
  email:"john.reyes@hive.com",ph:"0918 222 3333",addr:"12 Rizal Ave, Makati City",
  ec:"Rosa Reyes · 0918 000 0000",sh:"day",st:"Regular",pass:"hive123",twofa:false},
 {id:"HV-003",n:"Angela Cruz",r:"Data Analyst",d:"IT & Data",s:19000,j:"2024-01-08",b:"11-27",
  email:"angela.cruz@hive.com",ph:"0919 333 4444",addr:"5 Katipunan Ave, Quezon City",
  ec:"Ben Cruz · 0919 000 0000",sh:"day",st:"Regular",pass:"hive123",twofa:true},
 {id:"HV-004",n:"Mark Dizon",r:"Support Agent",d:"Customer Support",s:11000,j:"2024-03-18",b:"01-15",
  email:"mark.dizon@hive.com",ph:"0920 444 5555",addr:"21 Bonifacio St, Pasig City",
  ec:"Lia Dizon · 0920 000 0000",sh:"day",st:"Probationary",pass:"hive123",twofa:false},
 {id:"HV-005",n:"Liza Ramos",r:"Back Office Specialist",d:"Back Office",s:10500,j:"2024-07-22",b:"02-09",
  email:"liza.ramos@hive.com",ph:"0921 555 6666",addr:"9 Aurora Blvd, Marikina City",
  ec:"Pedro Ramos · 0921 000 0000",sh:"mid",st:"Regular",pass:"hive123",twofa:false},
 {id:"HV-006",n:"Paolo Garcia",r:"Developer",d:"IT & Data",s:22500,j:"2022-11-02",b:"12-19",
  email:"paolo.garcia@hive.com",ph:"0922 666 7777",addr:"77 Maginhawa St, Quezon City",
  ec:"Nina Garcia · 0922 000 0000",sh:"mid",st:"Regular",pass:"hive123",twofa:true},
 {id:"HV-007",n:"Kristine Lim",r:"Executive Assistant",d:"Admin",s:13000,j:"2025-11-10",b:"03-30",
  email:"kristine.lim@hive.com",ph:"0923 777 8888",addr:"31 Taft Ave, Manila",
  ec:"Sam Lim · 0923 000 0000",sh:"day",st:"Regular",pass:"hive123",twofa:false}
];
const emp=id=>emps.find(e=>e.id===id)||{id:id,n:id,r:"",d:"",s:0,sh:"day",email:"",ph:"",addr:"",ec:"",b:"",j:"",st:""};
const nm=id=>emp(id).n;
const who=e=>`<span class="av">${ini(e.n)}</span>${esc(e.n)}`;

let holidays=[
 {d:"2026-06-12",n:"Independence Day"},{d:"2026-08-21",n:"Ninoy Aquino Day"},
 {d:"2026-11-30",n:"Bonifacio Day"},{d:"2026-12-25",n:"Christmas Day"},
 {d:"2026-12-30",n:"Rizal Day"},{d:"2027-01-01",n:"New Year's Day"}
];
const holOn=k=>holidays.find(h=>h.d===k);
let events=[
 {d:"2026-12-05",t:"2027 benefits enrollment opens",k:"hr",s:"Submit your SSS/PhilHealth changes to HR."},
 {d:"2026-12-18",t:"Year-end party",k:"event",s:"December 18 at the main office. RSVP with HR."},
 {d:"2026-12-24",t:"Half-day · offices close 1:00 PM",k:"hr",s:"Plan your leaves ahead."},
 {d:"2027-01-15",t:"Performance review window",k:"hr",s:"Self-review forms will be released."}
];
let leaves=[
 {id:1,e:"HV-002",t:"Vacation",f:"2026-11-24",to:"2026-11-26",st:"Pending",sub:Date.now()-864e5*2,rm:""},
 {id:2,e:ME,t:"Vacation",f:"2026-10-12",to:"2026-10-13",st:"Approved",sub:Date.now()-864e5*40,rm:"Enjoy!"},
 {id:3,e:"HV-006",t:"Vacation",f:"2026-12-22",to:"2026-12-29",st:"Pending",sub:Date.now()-864e5,rm:""},
 {id:4,e:ME,t:"Sick",f:"2026-09-03",to:"2026-09-03",st:"Approved",sub:Date.now()-864e5*78,rm:"Get well soon."},
 {id:5,e:ME,t:"Vacation",f:"2026-02-12",to:"2026-02-13",st:"Approved",sub:Date.now()-864e5*260,rm:""},
 {id:6,e:ME,t:"Sick",f:"2026-05-04",to:"2026-05-04",st:"Approved",sub:Date.now()-864e5*190,rm:""},
 {id:7,e:ME,t:"Vacation",f:"2026-12-24",to:"2026-12-24",st:"Pending",sub:Date.now()-36e5*5,rm:""}
];
let att=[];                                   // attendance records {e,d,in,out,note}
let fixes=[                                   // attendance correction requests
 {id:1,e:"HV-004",d:"2026-11-17",ty:"Forgot to Clock Out",time:"18:05",why:"Forgot to clock out before leaving.",file:"",st:"Pending",sub:Date.now()-864e5,rm:"",rev:null}
];
let reqs=[                                    // HR-facing overtime / document requests (admin only)
 {id:1,e:ME,t:"Certificate of Employment",d:"2026-11-10",st:"Approved"},
 {id:2,e:"HV-003",t:"Overtime",d:"2026-11-18",st:"Pending"}
];
let ann=[
 {id:1,t:"Year-end party",b:"December 18 at the main office. RSVP with HR.",d:"2026-11-17",pri:"Normal",pin:true,by:"HR Admin"},
 {id:2,t:"Office closed Nov 30",b:"Bonifacio Day — non-working holiday. Plan your deliveries accordingly.",d:"2026-11-15",pri:"Urgent",pin:true,by:"HR Admin"},
 {id:3,t:"Holiday schedule",b:"Dec 25 and Jan 1 are non-working holidays.",d:"2026-11-12",pri:"Normal",pin:false,by:"HR Admin"},
 {id:4,t:"New HMO cards",b:"Pick up your new HMO cards at the HR desk any weekday before 5 PM.",d:"2026-11-08",pri:"High",pin:false,by:"HR Admin"}
];
let notis=[                                   // employee notifications
 {id:1,ty:"announcement",t:"Year-end party on Dec 18",b:"RSVP with HR before Dec 10.",ts:Date.now()-36e5*3,read:false,go:"#emp-home"},
 {id:2,ty:"bonus",t:"October attendance bonus earned",b:"+1.5 leave days credited for October 2026.",ts:Date.now()-36e5*20,read:false,go:"#emp-leave"},
 {id:3,ty:"payslip",t:"Payslip for Nov 1–15 is available",b:"Your semi-monthly payslip is ready to view.",ts:Date.now()-864e5*2,read:false,go:"#emp-payslips"},
 {id:4,ty:"leave",t:"Vacation leave approved",b:"Oct 12–13 vacation leave was approved.",ts:Date.now()-864e5*40,read:true,go:"#emp-leave"},
 {id:5,ty:"correction",t:"Attendance correction approved",b:"Your clock-in for a recent date was fixed by HR.",ts:Date.now()-864e5*6,read:true,go:"#emp-attendance"},
 {id:6,ty:"bonus",t:"September attendance bonus voided",b:"18 late minutes exceeded the 15-minute threshold.",ts:Date.now()-864e5*25,read:true,go:"#emp-leave"},
 {id:7,ty:"hr",t:"Benefits enrollment opens Dec 5",b:"Submit SSS/PhilHealth changes to HR.",ts:Date.now()-864e5*4,read:true,go:"#emp-home"}
];
let audit=[];                                 // HR audit trail
let bonusLog={};                              // "HV-001|2026-10" -> evaluation result
let paid=false;
let reopened=0;                               // how many times HR re-opened this run to fix errors
let runs=0;                                   // how many times payroll has been run for this period                               // current payroll run processed?
let payAdj={};                                // admin payslip edits: "HV-001|Nov 16–30, 2026" -> {sss,ph,pg,extra[]}
let slipDraft=null;                           // payslip being edited in the admin modal
let q="";                                     // admin employee search
let calY=2026,calM=10,selDate=null;           // calendar state (Nov 2026)
let notiOpen=false,session=null,lastV=null,confirmCb=null;

/* ---------- 4. ATTENDANCE ENGINE ---------- */
function seed(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return((h>>>0)%1e5)/1e5}
const isRest=(k,sh)=>sh.rest.includes(pdate(k).getDay());
function genAtt(){
  const end=pdate(Y);
  for(const e of emps){
    const sh=shiftOf(e.id);
    for(let d=pdate(POLICY.dataStart);d<=end;d.setDate(d.getDate()+1)){
      const k=dkey(d);
      if(k<(e.j||"")||isRest(k,sh)||holOn(k)||onLeave(e.id,k))continue;   // nothing before the hire date; none on approved leave
      if(seed(e.id+k)<.045)continue;                       // absent (no record)
      const st=mins(sh.start),en=mins(sh.end),r2=seed(e.id+k+"i");
      const inT=r2>.9?hm(st+3+Math.floor(seed(e.id+k+"l")*16))   // late 3–18 min
                     :hm(st-Math.floor(seed(e.id+k+"e")*13));     // early / on time
      const outT=k===Y?null:(seed(e.id+k+"o")>.965?null:hm(en+Math.floor(seed(e.id+k+"x")*13)-3)); // nobody clocked out yet today
      att.push({e:e.id,d:k,in:inT,out:outT,note:""});
    }
  }
}
/* Maria's own history is scripted so the bonus engine shows every scenario */
function seedME(){
  att=att.filter(r=>r.e!==DEMO_ME||r.d<POLICY.dataStart);
  const sh=SHIFTS.day,end=pdate(Y);
  const over={"2026-07-14":"09:04","2026-07-15":"09:05","2026-07-16":"09:05",
              "2026-08-13":"09:10","2026-09-08":"09:09","2026-09-22":"09:09",
              "2026-10-20":"09:14","2026-11-10":"09:06","2026-11-12":"09:04"};
  const noOut={"2026-06-11":1,"2026-06-18":1};             // incomplete records → June pending
  for(let d=pdate(POLICY.dataStart);d<end;d.setDate(d.getDate()+1)){   // stop before today so you can clock in live
    const k=dkey(d);
    if(isRest(k,sh)||holOn(k)||onLeave(DEMO_ME,k))continue;      // no record on approved leave
    att.push({e:DEMO_ME,d:k,in:over[k]||"08:"+pad2(45+d.getDate()%10),
              out:noOut[k]?null:"18:"+pad2(1+d.getDate()%8),note:""});
  }
}
const recFor=(e,k)=>att.find(r=>r.e===e&&r.d===k);
function dayState(e,k){                                    // status of one date for one employee
  const sh=shiftOf(e),h=holOn(k);
  if(k<(emp(e).j||""))return{st:"none"};                    // before the hire date there is nothing to record
  if(h)return{st:"hol",hol:h};
  if(isRest(k,sh))return{st:"rest"};
  if(k<=Y&&onLeave(e,k))return{st:"leave"};
  const r=recFor(e,k);
  if(!r)return k===Y?{st:"none"}:(k<Y?{st:"absent"}:{st:"future"});
  if(r.in==null||r.out==null)return Object.assign({st:"inc"},r);
  const late=Math.max(0,mins(r.in)-mins(sh.start));
  return Object.assign({st:late>0?"late":"on",late:late},r);
}

function workdaysOfMonth(y,m,sh){                           // all working days of a month
  const out=[],last=new Date(y,m+1,0).getDate();
  for(let d=1;d<=last;d++){const k=y+"-"+pad2(m+1)+"-"+pad2(d);
    if(!isRest(k,sh)&&!holOn(k))out.push(k)}
  return out;
}
const onLeave=(e,k)=>leaves.some(l=>l.e===e&&l.st==="Approved"&&k>=l.f&&k<=l.to);
function monthFacts(e,y,m){                                 // raw counts for a month
  const sh=shiftOf(e),days=workdaysOfMonth(y,m,sh).filter(k=>k<=Y&&k>=(emp(e).j||""));
  let on=0,late=0,lateMin=0,absent=0,inc=0,leave=0,consec=0,maxConsec=0;
  for(const k of days){
    const s=dayState(e,k);
    if(s.st==="on"){on++;consec=0}
    else if(s.st==="late"){late++;lateMin+=s.late;consec++;if(consec>maxConsec)maxConsec=consec}
    else if(s.st==="leave"){leave++;consec=0}
    else if(s.st==="absent"){absent++;consec=0}
    else if(s.st==="inc"){inc++;consec=0}
  }
  const total=days.length,resolved=on+late+leave;
  return{on,late,lateMin,absent,inc,leave,total,resolved,
    complete:total>0&&resolved===total,maxConsec,
    pendingFix:fixes.some(f=>f.e===e&&f.st==="Pending"&&f.d.slice(0,7)===y+"-"+pad2(m+1))};
}
/* Monthly bonus evaluation — automatic, rule-driven, never hand-assigned */
function evalMonth(e,y,m){
  const f=monthFacts(e,y,m),ym=y+"-"+pad2(m+1);
  const ended=y<TODAY.getFullYear()||(y===TODAY.getFullYear()&&m<TODAY.getMonth());
  let status,reason;
  if(!ended){status="Pending Evaluation";reason="Month in progress"}
  else if(f.lateMin>=POLICY.latenessForfeitMinutes){
    status="Voided";reason="Voided — "+POLICY.latenessForfeitMinutes+"-minute lateness threshold reached"}
  else if(f.maxConsec>=POLICY.consecutiveLateForfeitDays){
    status="Voided";reason="Voided — "+POLICY.consecutiveLateForfeitDays+" consecutive late days"}
  else if(!f.complete){status="Pending Evaluation";reason="Attendance records are incomplete"}
  else if(f.pendingFix){status="Pending Evaluation";reason="Unresolved attendance issue"}
  else{status="Qualified";reason="All conditions met"}
  const amount=status==="Qualified"?POLICY.monthlyBonusDays:0;
  return Object.assign({ym:ym,status:status,reason:reason,amount:amount,evaluatedAt:Date.now()},f);
}
/* Runs automatically for every past month; re-runs when corrections change history */
function ensureBonus(notify){
  const y=TODAY.getFullYear(),m=TODAY.getMonth();
  for(const e of emps){
    for(let i=6;i<=12;i++){                                 // Jun 2026 → Dec 2026 window
      const yy=2026,mm=i-1;
      if(yy>y||(yy===y&&mm>m))continue;                     // never evaluate future months
      const key=e.id+"|"+yy+"-"+pad2(mm+1);
      if((yy+"-"+pad2(mm+1))<String(e.j||"").slice(0,7))continue;   // no evaluation before the hire month
      const prev=bonusLog[key],next=evalMonth(e.id,yy,mm);
      bonusLog[key]=next;
      if(notify&&prev&&prev.status!==next.status&&e.id===ME){
        if(next.status==="Qualified")pushNoti("bonus",next.ym+" attendance bonus earned",
          "+"+POLICY.monthlyBonusDays+" leave days credited for "+next.ym+".","#emp-leave");
        else if(next.status==="Voided")pushNoti("bonus",next.ym+" attendance bonus voided",
          next.reason+".","#emp-leave");
      }
    }
  }
}
function bonusRows(e){                                       // bonus history, newest first
  const out=[];
  for(const k in bonusLog)if(k.split("|")[0]===e)out.push(bonusLog[k]);
  return out.sort((a,b)=>a.ym<b.ym?1:-1);
}

/* ---------- 6. LEAVE BALANCES ---------- */
function leaveDays(from,to,e){                              // working days only (rest days + holidays excluded)
  if(!from||!to)return 0;
  const a=pdate(from),b=pdate(to);
  if(isNaN(a)||isNaN(b)||b<a)return 0;
  const sh=shiftOf(e||ME);let n=0;
  for(let d=new Date(a);d<=b;d.setDate(d.getDate()+1)){
    const k=dkey(d);
    if(!isRest(k,sh)&&!holOn(k))n++;
  }
  return n;
}
function bal(eid){
  eid=eid||ME;
  const y=TODAY.getFullYear();
  const e0=emp(eid),startM=(e0.j&&+e0.j.slice(0,4)===y)?+e0.j.slice(5,7)-1:0;   // hired this year → accrue from the hire month
  const earned=round2(POLICY.annualAllowanceDays*Math.max(0,TODAY.getMonth()-startM)/12); // accrued to end of last month
  let used=0,pend=0;
  for(const l of leaves){
    if(l.e!==eid||pdate(l.f).getFullYear()!==y)continue;
    const n=leaveDays(l.f,l.to,eid);
    if(l.st==="Approved")used+=n;else if(l.st==="Pending")pend+=n;
  }
  let bonusEarned=0,forfeited=0;
  for(const r of bonusRows(eid)){
    if(r.ym.slice(0,4)!==String(y))continue;
    if(r.status==="Qualified")bonusEarned+=r.amount;
    else if(r.status==="Voided")forfeited+=POLICY.monthlyBonusDays;
  }
  let entitled=earned+bonusEarned;
  if(POLICY.allowanceIncludesBonus)entitled=Math.min(entitled,POLICY.annualAllowanceDays);
  return{allowance:POLICY.annualAllowanceDays,earned:earned,used:used,pending:pend,
    bonusEarned:round2(bonusEarned),forfeited:round2(forfeited),
    entitled:round2(entitled),remaining:Math.max(0,round2(entitled-used-pend)),
    includesBonus:POLICY.allowanceIncludesBonus};
}
function overlaps(a1,a2,b1,b2){return a1<=b2&&b1<=a2}
/* ---------- SHARED UI HELPERS ---------- */
const tg=s=>`<span class="tag ${/Approved|Paid|Processed|On time|Qualified/.test(s)?"ok":/Rejected|Absent|Voided|Urgent/.test(s)?"bad":/Pending|Upcoming|Draft/.test(s)?"wait":""}">${esc(s)}</span>`;
const priTag=p=>`<span class="tag ${p==="Urgent"?"bad":p==="High"?"wait":""}">${esc(p)}</span>`;
const head=(a,b,c)=>`<div class="eyebrow">${esc(a)}</div><h1>${b}</h1><p class="lead">${esc(c)}</p>`;
function tbl(h,rows,empty,bare){
  const inner=`<table><thead><tr>${h.map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>`+
    (rows.length?rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")
                :`<tr><td class="mut" colspan="${h.length}">${esc(empty||"Nothing here yet.")}</td></tr>`)+
    `</tbody></table>`;
  return bare?`<div class="wrap">${inner}</div>`:`<div class="card flat wrap" style="padding:8px">${inner}</div>`;
}
const stat=(f,t,v,sub)=>`<div class="card stat"><div class="fig">${esc(f)}</div><h3>${esc(t)}</h3><div class="big">${v}</div>${sub?`<small>${sub}</small>`:""}</div>`;
const mini=(label,val,note)=>`<div><div class="fig">${esc(label)}</div><div style="font-size:25px;font-weight:600;letter-spacing:-.03em;font-variant-numeric:tabular-nums;margin-top:4px">${val}</div>${note?`<div style="font-size:11.5px;color:var(--mut);margin-top:3px">${esc(note)}</div>`:""}</div>`;
const toast=(m,bad)=>{const t=$("#ts");if(!t)return;t.textContent=m;t.className="on"+(bad?" bad":"");
  clearTimeout(toast.k);toast.k=setTimeout(()=>{t.className=""},2800)};
function modal(h,opts){opts=opts||{};const m=$("#md");if(m)m.innerHTML=
  `<div class="mb"><div class="mc${opts.wide?" wide":""}">${h}${opts.noClose?"":`<div class="mact no-print"><button data-a="close">Close</button></div>`}</div></div>`}
const closeModal=()=>{const m=$("#md");if(m)m.innerHTML=""};
function confirmDlg(msg,cb){confirmCb=cb;
  modal(`<div class="fig">PLEASE CONFIRM</div><h3 style="margin-top:10px">${esc(msg)}</h3>
    <div class="mact no-print"><button data-a="cno">Cancel</button><button class="pri" data-a="cyes">Confirm</button></div>`,{noClose:true})}
function busy(btn,label,ms,done){
  if(!btn){done();return}
  const old=btn.innerHTML;btn.disabled=true;btn.innerHTML=`<span class="spin"></span> ${esc(label)}`;
  setTimeout(()=>{try{done()}catch(e){console.error(e);toast("Something went wrong",true)}
    finally{try{btn.disabled=false;btn.innerHTML=old}catch(e){}}},ms);
}
function errBox(form,msg){let b=form.querySelector(".err-box");
  if(!b){b=document.createElement("p");b.className="err-box";b.hidden=true;form.prepend(b)}
  b.innerHTML=ico("alert")+"<span>"+esc(msg)+"</span>";b.hidden=false;
  const i=form.querySelector("input,select,textarea");if(i&&i.focus)i.focus()}
const clearErr=form=>{const b=form&&form.querySelector(".err-box");if(b)b.hidden=true};

let nid=100;
function pushNoti(ty,t,b,go){notis.unshift({id:++nid,e:ME,ty:ty,t:t,b:b,ts:Date.now(),read:false,go:go||"#emp-home"})}
const myNotis=()=>notis.filter(n=>(n.e||DEMO_ME)===ME);   // each employee only sees their own notifications
const unread=()=>myNotis().filter(n=>!n.read).length;
const NOTI_ICON={announcement:"mega",leave:"plane",correction:"cal",payslip:"wallet",bonus:"zap",hr:"info",payroll:"wallet"};

/* ---------- LOGIN ---------- */
function hexArt(){const r=26,w=Math.sqrt(3)*r,on=[2,5,6,9,12,14];let c="",i=0,cx=0,cy=0;
  for(let a=0;a<4;a++)for(let b=0;b<5;b++){
    const x=b*w+(a%2?w/2:0)+w/2+8,y=a*r*1.5+r+8;
    const p=[0,1,2,3,4,5].map(k=>{const t=Math.PI/180*(60*k-30);
      return(x+r*.92*Math.cos(t)).toFixed(1)+","+(y+r*.92*Math.sin(t)).toFixed(1)}).join(" ");
    if(i===7){cx=x;cy=y}
    c+=`<polygon points="${p}" class="hx${i===7?" core":on.includes(i)?" on":""}"/>`;i++}
  return`<svg class="hex" viewBox="0 0 ${(5.5*w+16).toFixed(0)} ${(3*r*1.5+2*r+16).toFixed(0)}" aria-hidden="true">${c}<text x="${cx}" y="${cy+5}" text-anchor="middle" font-size="13" font-weight="700" fill="#0b0b0a">HR</text></svg>`}

function notiItem(n){
  return`<button class="nitem${n.read?"":" unread"}" data-a="nti" data-i="${n.id}">
    <span class="nd"></span>${ico(NOTI_ICON[n.ty]||"info")}
    <span style="flex:1"><b>${esc(n.t)}</b><span>${esc(n.b)}</span><time>${ago(n.ts)}</time></span></button>`;
}

function periods(){
  const out=[],y0=TODAY.getFullYear(),m0=TODAY.getMonth();
  for(let i=0;i<8;i++){
    let y=y0,m=m0-Math.floor(i/2);
    while(m<0){m+=12;y--}
    const last=new Date(y,m+1,0).getDate(),mon=new Date(y,m,1).toLocaleDateString("en-PH",{month:"short"});
    for(const h of[{d1:16,d2:last},{d1:1,d2:15}]){
      const from=y+"-"+pad2(m+1)+"-"+pad2(h.d1),to=y+"-"+pad2(m+1)+"-"+pad2(h.d2);
      if(from>Y)continue;
      const st=to<Y?"Paid":(paid?"Processed":"Upcoming");
      out.push({label:`${mon} ${h.d1}–${h.d2}, ${y}`,from:from,to:to,st:st});
    }
  }
  return out;
}
/* BIR withholding tax on compensation — TRAIN table (effective 2023 onward), SEMI-MONTHLY column.
   Tax-free up to 10,417 per cutoff = 20,833 a month. Rows: [over, base tax, rate on the excess]. */
const WHT=[[333333,91770.70,.35],[83333,16770.70,.30],[33333,4270.70,.25],[16667,937.50,.20],[10417,0,.15]];

function whtSemi(t){for(const r of WHT){if(t>r[0])return round2(r[1]+(t-r[0])*r[2])}return 0}
const RATES={sss:.05,ph:.025,pg:.02};
const pctLbl=k=>+(RATES[k]*100).toFixed(2)+"%";
const CONTRIB=e=>({sss:round2(e.s*RATES.sss),ph:round2(e.s*RATES.ph),pg:round2(e.s*RATES.pg)});   // standard amounts
const isIC=e=>!!e&&e.ty==="Independent contractor";   
function payWith(e,adj){
  const half=e.s,allow=Math.round(e.s*.04);                    // e.s = semi-monthly salary = basic pay of one payslip
  const otHrs=(parseInt(e.id.slice(3),10)%3)*2,otRate=(e.s/22/8)*1.25,ot=Math.round(otHrs*otRate);
  const extras=adj&&adj.extra?adj.extra:[];
  const extra=extras.reduce((a,x)=>a+(+x.amt||0),0);          // additional pay (e.g. holiday pay) — none by default
  const g=half+allow+ot+extra;
  const def=CONTRIB(e);
  const c=k=>adj&&adj[k]?(adj[k].on?Math.max(0,+adj[k].amt||0):0):(isIC(e)?0:def[k]);
  const sss=c("sss"),ph=c("ph"),pg=c("pg");
  const taxable=Math.max(0,g-allow-sss-ph-pg);                  // withholding tax is computed AFTER SSS / PhilHealth / Pag-IBIG and non-taxable allowances
  const tx=whtSemi(taxable);                                   // automatic — not editable
  const ded=sss+ph+pg+tx;
  return{half:half,allow:allow,otHrs:otHrs,ot:ot,extras:extras,extra:extra,g:g,sss:sss,ph:ph,pg:pg,
    taxable:taxable,tx:tx,ded:ded,net:g-ded,def:def,edited:!!adj};
}
function pay(e,label){return payWith(e,label?payAdj[e.id+"|"+label]:null)}
const slipOpen=label=>{const p=periods().find(q=>q.label===label);return !!p&&p.st==="Upcoming"};   
function slipDoc(id,period){
  const e=emp(id),x=pay(e,period),isMe=id===ME,isAdm=!!(session&&session.role==="adm"),canEdit=isAdm&&slipOpen(period);
  const crow=(k,label)=>{const nd=x[k]<=0,g=nd?' style="opacity:.55"':"";
    return `<div class="k"${g}>${label}${nd?' <span class="tag">Not deducted</span>':""}</div><div class="v"${g}>−${PHP(x[k])}</div>`};
  return `<div class="slipdoc print-area">
    <div class="sphd">
      <div><div class="fig">PAYSLIP</div><h3 style="margin-top:6px">${esc(e.n)}</h3>
        <div class="mut" style="font-size:13px">${esc(e.id)} · ${esc(e.r)} · ${esc(e.d)}${isIC(e)?" · Independent contractor":""}</div></div>
      <div style="text-align:right"><b>${esc(period)}</b><div class="mut" style="font-size:12.5px">Pay date: ${period.split(",")[0].includes("–")?esc(period.split(",")[0].split("–").pop().trim()):""} ${esc(period.split(",")[1]||"").trim()}</div></div>
    </div>
    <div class="fig" style="margin-top:14px">EARNINGS</div>
    <div class="docgrid">
      <div class="k">Basic pay (semi-monthly)</div><div class="v">${PHP(x.half)}</div>
      <div class="k">Allowances (transport &amp; COLA)</div><div class="v">${PHP(x.allow)}</div>
      <div class="k">Overtime (${x.otHrs} hrs × 125%)</div><div class="v">${PHP(x.ot)}</div>
      ${x.extras.filter(z=>+z.amt>0).map(z=>`<div class="k">${esc(z.label||"Additional pay")}</div><div class="v">${PHP(z.amt)}</div>`).join("")}
      <div class="k" style="font-weight:700;color:var(--tx)">Gross pay</div><div class="v" style="font-weight:700">${PHP(x.g)}</div>
    </div>
    <div class="fig" style="margin-top:16px">DEDUCTIONS</div>
    <div class="docgrid">
      ${crow("sss","SSS contribution ("+pctLbl("sss")+")")}
      ${crow("ph","PhilHealth contribution ("+pctLbl("ph")+")")}
      ${crow("pg","Pag-IBIG contribution ("+pctLbl("pg")+")")}
      <div class="k">Taxable income (gross − allowances − contributions)</div><div class="v mut">${PHP(x.taxable)}</div>
      <div class="k">Withholding tax</div><div class="v">−${PHP(x.tx)}</div>
      <div class="k" style="font-weight:700;color:var(--tx)">Total deductions</div><div class="v" style="font-weight:700">−${PHP(x.ded)}</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-top:18px;padding-top:14px;border-top:2px solid var(--ac)">
      <div><div class="fig">NET PAY</div><div class="net">${PHP(x.net)}</div></div>
      <div class="mut" style="font-size:12px;max-width:38ch">Withholding tax follows the BIR TRAIN semi-monthly table (nothing is withheld up to ₱10,417 taxable per cutoff, i.e. ₱20,833 a month). Allowances are treated as non-taxable de minimis benefits. Contribution rates are samples for this prototype — verify against current SSS, PhilHealth and Pag-IBIG tables before production use.</div>
    </div>
    <div class="mact no-print">
      <button data-a="close">Close</button>
      <button data-a="print">${ico("print")} Print / Save as PDF</button>
      ${canEdit?`<button class="pri" data-a="slipedit" data-i="${esc(id)}|${esc(period)}">${ico("edit")} Edit payslip</button>`:""}
      ${isMe?"":`<span class="mut" style="font-size:12px;align-self:center">HR preview${isAdm&&!canEdit?" · locked (payroll processed)":""}</span>`}
    </div>
  </div>`;
}

function line(){const v=[88,92,90,96,85,93,95],X=i=>30+i*90,Yy=n=>170-(n-80)*7,p=v.map((n,i)=>X(i)+","+Yy(n));
  return`<svg viewBox="0 0 600 200" style="width:100%;margin-top:8px"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ac)" stop-opacity=".35"/><stop offset="1" stop-color="var(--ac)" stop-opacity="0"/></linearGradient></defs>${[80,90,100].map(n=>`<line x1="30" x2="570" y1="${Yy(n)}" y2="${Yy(n)}" stroke="var(--line)"/>`).join("")}<path d="M${p.join(" L")} L570,180 L30,180Z" fill="url(#g)"/><path d="M${p.join(" L")}" fill="none" stroke="var(--ac)" stroke-width="3" stroke-linejoin="round"/>${v.map((n,i)=>`<circle cx="${X(i)}" cy="${Yy(n)}" r="4.5" fill="var(--ac)"/>`).join("")}${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((n,i)=>`<text x="${X(i)}" y="198" text-anchor="middle" style="fill:var(--mut);font:11px ui-monospace,monospace">${n}</text>`).join("")}</svg>`}
const pend=()=>leaves.filter(l=>l.st==="Pending").length+fixes.filter(f=>f.st==="Pending").length+reqs.filter(r=>r.st==="Pending").length;
const todayLogs=()=>att.filter(r=>r.d===Y&&r.in);

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
    c+=`<div class="${cls}" aria-label="${esc(longDate(k))}${tip?" — "+esc(tip):""}">${d}${sub?`<small>${sub}</small>`:""}</div>`;
  }
  return c;
}
function leaveLegend(){
  const L=[["var(--leave)","Approved leave"],["var(--inc)","Pending leave"],["var(--info)","Holiday"],["var(--mut)","Rest day"]];
  return `<div class="leg big">${L.map(x=>`<span><i style="background:${x[0]}"></i>${x[1]}</span>`).join("")}
    <span><i style="background:transparent;box-shadow:inset 0 0 0 2px var(--ac)"></i>Today</span></div>`;
}
function leaveCalCard(forEmp){
  return `<div class="card">
    <div class="cardhd"><div><div class="fig">${forEmp?"MY LEAVE CALENDAR":"TEAM CALENDAR"}</div><h3>${TODAY.toLocaleDateString("en-PH",{month:"long",year:"numeric"})}</h3></div>
      <span class="mut" style="font-size:12.5px">${forEmp?"Your approved and pending leave, holidays and rest days":"Initials show who is on leave — purple is approved, orange is still pending"}</span></div>
    <div class="cal">${teamCal(forEmp)}</div>${leaveLegend()}
  </div>`;
}

/* Each page registers its own screen and handlers here (see the <script> inside every *.html page). */
const HIVE={view:null,actions:{},forms:{},beforeRender:null,afterRender:null,tick:null};
/* ---------- QR CLOCK-IN: token + punch engine (employee page shows the code, admin scan page reads it) ---------- */
const QR_SECRET="hive-demo-secret";   // prototype only — in production sign with HMAC on a server
const QR_TTL=30;                      // seconds a code stays on screen
const QR_MAX_AGE=90;                  // seconds the scanner still accepts it
const qrSign=str=>{let h=5381;str=str+QR_SECRET;for(let i=0;i<str.length;i++)h=((h<<5)+h+str.charCodeAt(i))>>>0;return h.toString(36)};
const makeToken=id=>{const ts=Math.floor(Date.now()/1000);return["HIVE",id,ts,qrSign(id+"|"+ts)].join("|")};
function readToken(text){
  const p=String(text).split("|");
  if(p[0]!=="HIVE"||p.length!==4)return{err:"Not a Hive QR code"};
  if(qrSign(p[1]+"|"+p[2])!==p[3])return{err:"Invalid QR code"};
  if(Math.abs(Date.now()/1000-Number(p[2]))>QR_MAX_AGE)return{err:"QR expired — ask the employee to refresh their screen"};
  return{id:p[1]};
}
const nowHM=()=>{const d=new Date();return pad2(d.getHours())+":"+pad2(d.getMinutes())};
/* first scan of the day = clock in, second = clock out */
function punchFor(id){
  const e=emps.find(x=>x.id===id);
  if(!e)return{ok:false,msg:"Unknown employee"};
  const sh=shiftOf(id);
  if(Y<(e.j||""))return{ok:false,msg:e.n+" starts on "+shortDate(e.j)};
  if(onLeave(id,Y))return{ok:false,msg:e.n+" is on approved leave today"};
  const off=holOn(Y)?"holiday":isRest(Y,sh)?"rest day":"";   // not a scheduled workday: still logged, but never counted late
  let r=recFor(id,Y);
  if(r&&r.in&&r.out)return{ok:false,msg:e.n+" already completed today ("+r.in+"–"+r.out+")"};
  const t=nowHM(),note=(ti,b)=>notis.unshift({id:++nid,e:id,ty:"hr",t:ti,b:b,ts:Date.now(),read:false,go:"#emp-attendance"});
  if(!r||!r.in){
    if(!r){r={e:id,d:Y,in:null,out:null,note:""};att.push(r)}
    r.in=t;r.note=off?"QR clock in · "+off+" work":"QR clock in";
    const late=off?0:Math.max(0,mins(t)-mins(sh.start));
    audit.unshift({ts:Date.now(),who:"HR Admin",act:"QR clock in",det:e.n+" · "+Y+" · "+t+(late?" · "+late+" min late":"")});
    note("Clocked in at "+t,late?"Late by "+late+" min":"On time");
    ensureBonus(true);
    return{ok:true,late:late>0,msg:e.n+" clocked IN at "+t+(off?" · "+off+" work":late?" · late by "+late+" min":" · on time")};
  }
  if(mins(t)<mins(r.in))return{ok:false,msg:"Clock-out can't be before clock-in ("+r.in+")"};
  r.out=t;
  const w=mins(t)-mins(r.in);
  audit.unshift({ts:Date.now(),who:"HR Admin",act:"QR clock out",det:e.n+" · "+Y+" · "+t});
  note("Clocked out at "+t,Math.floor(w/60)+"h "+(w%60)+"m worked");
  ensureBonus(true);
  return{ok:true,msg:e.n+" clocked OUT at "+t+" · "+Math.floor(w/60)+"h "+(w%60)+"m worked"};
}
/* employee side: draw / refresh the rotating QR whenever #qrBox is on screen */
function paintQR(){
  const box=document.getElementById("qrBox");if(!box)return;
  if(!window.QRCode){box.innerHTML='<p style="color:#555;font-size:12px;margin:0">QR library did not load — check your internet connection.</p>';return}
  const age=Date.now()-(+box.dataset.t||0);
  if(!box.firstChild||age>=QR_TTL*1000){
    box.innerHTML="";box.dataset.t=Date.now();
    new QRCode(box,{text:makeToken(ME),width:200,height:200,correctLevel:QRCode.CorrectLevel.M});
  }
  const bar=document.getElementById("qrBar");
  if(bar)bar.style.width=Math.max(0,100-(Date.now()-box.dataset.t)/(QR_TTL*10))+"%";
}

function hiveStart(){boot();render();showFlash()}

/* ---------- PAGES & NAVIGATION (one HTML file per module) ---------- */
const PAGES={
  emp:{home:"employee_home.html",attendance:"employee_attendance.html",leave:"employee_leave.html",
       payslips:"employee_payslips.html",profile:"employee_profile.html",setup:"employee_setup.html"},
  adm:{dashboard:"admin_home.html",employees:"admin_employees.html",attendance:"admin_attendance.html",
       leave:"admin_leave.html",payroll:"admin_payroll.html",announcements:"admin_announcements.html",
       reports:"admin_reports.html",scan:"admin_scan.html"}
};
const SIGNIN="signin.html";
const fileOf=h=>{const p=String(h).replace(/^#/,"").split("-");return(PAGES[p[0]]||{})[p[1]]||SIGNIN};
const homeOf=role=>role==="emp"?"#emp-home":"#adm-dashboard";
const curFile=()=>{const P=window.HIVE_PAGE||{};return P.page==="signin"?SIGNIN:((PAGES[P.role]||{})[P.page]||"")};
let noSave=false;
function goTo(h){saveState();location.href=String(h).indexOf(".html")>-1?h:fileOf(h)}
function fixLinks(root){root.querySelectorAll('a[href^="#emp-"],a[href^="#adm-"]').forEach(a=>a.setAttribute("href",fileOf(a.getAttribute("href"))))}
const setFlash=m=>{try{sessionStorage.setItem("hive.flash",m)}catch(e){}};
function showFlash(){try{const m=sessionStorage.getItem("hive.flash");if(m){sessionStorage.removeItem("hive.flash");toast(m)}}catch(e){}}

/* ---------- SHARED STATE — saved in the browser so all pages see the same data ---------- */
const STORE="hive.state.v1";
const ST={
  emps:[()=>emps,v=>{emps=v}],holidays:[()=>holidays,v=>{holidays=v}],events:[()=>events,v=>{events=v}],
  leaves:[()=>leaves,v=>{leaves=v}],att:[()=>att,v=>{att=v}],fixes:[()=>fixes,v=>{fixes=v}],
  reqs:[()=>reqs,v=>{reqs=v}],ann:[()=>ann,v=>{ann=v}],notis:[()=>notis,v=>{notis=v}],
  audit:[()=>audit,v=>{audit=v}],bonusLog:[()=>bonusLog,v=>{bonusLog=v}],paid:[()=>paid,v=>{paid=v}],
  reopened:[()=>reopened,v=>{reopened=v}],runs:[()=>runs,v=>{runs=v}],payAdj:[()=>payAdj,v=>{payAdj=v}],
  calY:[()=>calY,v=>{calY=v}],calM:[()=>calM,v=>{calM=v}],selDate:[()=>selDate,v=>{selDate=v}],
  session:[()=>session,v=>{session=v}]
};
/* data saved before salary became semi-monthly (no salBasis marker) held MONTHLY salaries: halve them once */
const semiEmps=o=>Array.isArray(o&&o.emps)?(o.salBasis==="semi"?o.emps:o.emps.map(e=>Object.assign({},e,{s:Math.round((+e.s||0)/2)}))):null;
function saveState(){
  if(noSave)return;
  try{const o={Y:Y,nid:nid,salBasis:"semi"};for(const k in ST)o[k]=ST[k][0]();localStorage.setItem(STORE,JSON.stringify(o))}catch(e){}
}
function loadState(){            // returns true when saved data is from today
  try{const raw=localStorage.getItem(STORE);if(!raw)return false;const o=JSON.parse(raw);
    for(const k in ST){if(o[k]!==undefined)ST[k][1](o[k])}
    const m=semiEmps(o);if(m)emps=m;
    if(o.nid)nid=o.nid;
    return o.Y===Y}catch(e){return false}
}

/* ---------- SHELL / ROUTER ---------- */
const EMP={home:"Home",attendance:"Attendance",leave:"Leave",payslips:"Payslips",profile:"My Profile"};
const ADM={dashboard:"Dashboard",employees:"Employees",attendance:"Attendance",leave:"Leave",payroll:"Payroll",announcements:"Announcements",reports:"Reports",scan:"Scan QR"};
const EMP_ICON={home:"home",attendance:"cal",leave:"plane",payslips:"wallet",profile:"user"};
const ADM_ICON={dashboard:"grid",employees:"users",attendance:"cal",leave:"plane",payroll:"wallet",announcements:"mega",reports:"chart",scan:"qr"};

function themeIsDark(){
  const t=document.documentElement.getAttribute("data-theme");
  if(t)return t==="dark";
  return!!(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);
}
function toggleTheme(){
  const next=themeIsDark()?"light":"dark";
  document.documentElement.setAttribute("data-theme",next);
  try{localStorage.setItem("hive.theme",next)}catch(e){}
}
function shell(role,page,content){
  const N=role==="emp"?EMP:ADM,ICONS=role==="emp"?EMP_ICON:ADM_ICON;
  const me=role==="emp"?emp(ME):{n:"HR Admin",r:"Administrator"};
  return `<div class="shell">
    <aside class="side" aria-label="Sidebar">
      <div class="brand"><i></i><span>Hive HRIS<small>${role==="emp"?"Employee portal":"HR admin"}</small></span></div>
      <nav class="navgrp" aria-label="Main navigation">
        <div class="fig">${role==="emp"?"MY WORKSPACE":"MANAGEMENT"}</div>
        ${Object.entries(N).map(([k,l])=>`<a class="ni${k===page?" on":""}" href="#${role}-${k}"${k===page?' aria-current="page"':""}>${ico(ICONS[k])}<span>${l}</span></a>`).join("")}
      </nav>
      <div class="sidefoot">
        <div class="who"><span class="av">${ini(me.n)}</span><span><b>${esc(me.n)}</b><span>${esc(me.r)}</span></span></div>
        <button class="ni" data-a="logout">${ico("out")}<span>Sign out</span></button>
      </div>
    </aside>
    <div class="main">
      <header class="bar">
        <button class="ib burger" data-a="menu" aria-label="Toggle menu">${ico("menu")}</button>
        <div class="crumb">Hive HRIS · <b>${esc(N[page]||"")}</b></div>
        <div class="sp"></div>
        <button class="ib" data-a="theme" aria-label="Toggle colour theme">${ico(themeIsDark()?"sun":"moon")}</button>
        ${role==="emp"?`<button class="ib" data-a="bell" aria-label="Notifications" aria-expanded="${notiOpen}">${ico("bell")}${unread()?`<b>${unread()}</b>`:""}</button>`:""}
      </header>
      <main id="app">${content}</main>
    </div>
  </div>
  ${notiOpen&&role==="emp"?`<div class="bellp" id="bp" role="dialog" aria-label="Notifications">
    <div class="row between" style="margin:0 0 6px"><div class="fig">NOTIFICATIONS · ${myNotis().length}</div>
      <button class="sm" data-a="readall">Mark all read</button></div>
    ${myNotis().map(n=>notiItem(n)).join("")||`<p class="mut">All caught up.</p>`}
    <p class="mut" style="font-size:11.5px;margin:12px 0 0">This is your full notification history — click one to jump to its page.</p>
  </div>`:""}`;
}
function setupShell(content){                              // first-login page: no sidebar, nothing else reachable
  return `<header class="setuphd">
    <div class="brand" style="padding:0"><i></i><span>Hive HRIS<small>Account setup</small></span></div>
    <div class="row" style="margin:0">
      <button class="ib" data-a="theme" aria-label="Toggle colour theme">${ico(themeIsDark()?"sun":"moon")}</button>
      <button class="sm" data-a="logout">${ico("out")} Sign out</button>
    </div></header>
  <main id="app" class="setupmain">${content}</main>`;
}
function render(){
  const root=$("#root");if(!root)return;
  const P=window.HIVE_PAGE||{};
  if(P.page==="signin"){                                   // sign-in page
    if(session){goTo(homeOf(session.role));return}
    root.innerHTML=loginView();document.body.classList.remove("menu-open");return}
  if(!session){goTo("#login");return}                      // not signed in → back to sign-in
  if(session.role!==P.role){goTo(homeOf(session.role));return}   // wrong portal → own home
  if(session.role==="emp"){                                // first-login gate
    const me=emps.find(e=>e.id===session.id);
    if(!me){session=null;goTo("#login");return}              // account was removed by HR
    if(me.pend&&P.page!=="setup"){goTo("#emp-setup");return}  // profile not finished → setup page only
    if(!me.pend&&P.page==="setup"){goTo("#emp-home");return}
  }
  const role=P.role,page=P.page;
  if(HIVE.beforeRender)HIVE.beforeRender();
  root.innerHTML=page==="setup"?setupShell(HIVE.view?HIVE.view():""):shell(role,page,HIVE.view?HIVE.view():"");
  fixLinks(root);
  if(!lastV){
    lastV=true;
    root.querySelectorAll("#app h1,#app .card,#app .eyebrow").forEach((el,i)=>{
      el.classList.add("rv");el.style.animationDelay=Math.min(i*60,500)+"ms"});
  }
  const s=$("#q");
  if(s)s.oninput=ev=>{q=ev.target.value;const p=ev.target.selectionStart;render();
    const n=$("#q");if(n){n.focus();try{n.setSelectionRange(p,p)}catch(x){}}};
  tickClock();
  paintQR();
  if(HIVE.afterRender)HIVE.afterRender();
  saveState();
}
function tickClock(){
  const c=$("#clk");if(!c)return;
  const d=new Date();
  c.textContent=pad2(d.getHours())+":"+pad2(d.getMinutes())+":"+pad2(d.getSeconds());
}

/* ---------- ACTIONS ---------- */
function printSlip(){
  document.body.classList.add("printing");
  const clean=()=>{document.body.classList.remove("printing");window.removeEventListener("afterprint",clean)};
  window.addEventListener("afterprint",clean);
  setTimeout(()=>{try{window.print()}finally{setTimeout(clean,1200)}},80);
}

const fname=form=>{const el=form.querySelector('[type="file"]');return el&&el.files&&el.files[0]?el.files[0].name:""};
function act(a,i,el){
  const done=msg=>{render();if(msg)toast(msg)};
  const _h=HIVE.actions[a];if(_h){_h(i,el,a);return}
  if(a==="close"){closeModal();confirmCb=null;slipDraft=null;return}
  if(a==="cno"){closeModal();confirmCb=null;return}
  if(a==="cyes"){const cb=confirmCb;confirmCb=null;closeModal();if(cb)cb();return}
  if(a==="menu"){document.body.classList.toggle("menu-open");return}
  if(a==="theme"){toggleTheme();render();return}
  if(a==="bell"){notiOpen=!notiOpen;render();return}
  if(a==="readall"){myNotis().forEach(n=>n.read=true);render();toast("All notifications marked as read");return}
  if(a==="nti"){const n=notis.find(x=>x.id==i);if(!n)return;
    n.read=true;notiOpen=false;
    if(n.go&&fileOf(n.go)!==curFile())goTo(n.go);else render();
    return}
  if(a==="logout"){session=null;notiOpen=false;closeModal();document.body.classList.remove("menu-open");
    setFlash("Signed out");goTo("#login");return}
  
  
  if(a==="vis"){const t=document.getElementById(i);if(!t)return;
    const on=t.type==="password";t.type=on?"text":"password";
    const b=document.querySelector('[data-a="vis"][data-i="'+i+'"]');if(b)b.textContent=on?"Hide":"Show";return}
  
  
  
  
  
  
  
  
  
  
  
  if(a==="slip"){const p=i.split("|");modal(slipDoc(p[0],p.slice(1).join("|")),{wide:true,noClose:true});return}
  
  if(a==="print"){printSlip();return}
  
  
  
  
  
  
  
  
  
  
  
  
  
  
}

/* ---------- FORMS ---------- */
document.addEventListener("click",ev=>{
  if(ev.target.classList&&ev.target.classList.contains("mb")){closeModal();confirmCb=null;return}
  const b=ev.target.closest?ev.target.closest("[data-a]"):null;
  if(!b)return;
  ev.preventDefault();
  try{act(b.dataset.a,b.dataset.i,b)}
  catch(err){console.error(err);toast("Something went wrong",true)}
});
const sc=$("#sc");if(sc)sc.addEventListener("click",()=>document.body.classList.remove("menu-open"));
document.addEventListener("keydown",ev=>{
  if(ev.key!=="Escape")return;
  if($("#md")&&$("#md").innerHTML){closeModal();confirmCb=null;return}
  if(notiOpen){notiOpen=false;render();return}
  document.body.classList.remove("menu-open");
});
function liveDays(ev){
  const el=ev.target;
  if(!el.dataset||el.dataset.live===undefined)return;
  const form=el.form||el.closest("form");if(!form)return;
  const box=form.querySelector("#lvDays");if(!box)return;
  const get=n=>{const x=form.querySelector('[name="'+n+'"]');return x?x.value:""};
  const from=get("f"),to=get("to"),target=get("e")||ME;
  if(!from||!to){
    box.textContent="Pick your dates — the number of leave days is calculated automatically (rest days and holidays are excluded).";
    return}
  const n=leaveDays(from,to,target),b=bal(target);
  box.innerHTML=`<b style="color:var(--tx)">${n} leave day${n===1?"":"s"}</b> — rest days and holidays are excluded. Available right now: <b style="color:var(--tx)">${b.remaining} days</b>.`;
}
document.addEventListener("input",liveDays);
document.addEventListener("change",liveDays);

document.addEventListener("submit",ev=>{
  const k=ev.target.dataset.f;if(!k)return;
  ev.preventDefault();
  const form=ev.target;
  const f=Object.fromEntries(new FormData(form).entries());
  const btn=form.querySelector('button[type="submit"]')||form.querySelector("button.pri");
  clearErr(form);
  try{
    const _h=HIVE.forms[k];if(_h){_h(form,f,btn,ev,k);return}
    
    
    /* --- leave request (employee + admin on behalf) --- */
    if(k==="leave"){
      const target=f.e||ME,b=bal(target);
      if(!f.f||!f.to)return errBox(form,"Choose both a start and an end date.");
      if(f.to<f.f)return errBox(form,"The end date must be on or after the start date.");
      if(f.f<Y)return errBox(form,"The start date can't be in the past.");
      const n=leaveDays(f.f,f.to,target);
      if(n<1)return errBox(form,"That range contains no working days — rest days and holidays don't count.");
      if(n>b.remaining)return errBox(form,"Not enough leave: you requested "+n+" day(s) but only "+b.remaining+" are available.");
      const clash=leaves.find(l=>l.e===target&&l.st!=="Rejected"&&overlaps(f.f,f.to,l.f,l.to));
      if(clash)return errBox(form,"This overlaps your "+clash.t.toLowerCase()+" leave ("+shortDate(clash.f)+" → "+shortDate(clash.to)+", "+clash.st.toLowerCase()+").");
      busy(btn,"Submitting…",600,()=>{
        leaves.unshift({id:Date.now(),e:target,t:f.t,f:f.f,to:f.to,st:"Pending",sub:Date.now(),
          why:String(f.why||"").trim(),rm:"",file:fname(form)});
        if(target===ME)pushNoti("leave","Leave request submitted",
          f.t+" · "+shortDate(f.f)+" → "+shortDate(f.to)+" ("+n+" days)","#emp-leave");
        render();
        toast("Leave request sent — "+n+" day(s) pending approval");
      });
      return;
    }
    
    
    
    
    
  }catch(err){console.error(err);toast("Something went wrong",true)}
});

/* ---------- BOOT ---------- */
function boot(){
  try{const t=localStorage.getItem("hive.theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}
  const sameDay=loadState();
  if(session&&session.role==="emp")ME=session.id;   // employee pages act as whoever signed in
  if(!sameDay){att=[];genAtt();seedME()}      // first visit, or a new day → rebuild attendance
  ensureBonus(false);
}
addEventListener("pagehide",saveState);
setInterval(()=>{tickClock();paintQR();if(HIVE.tick)HIVE.tick()},1000);