/* ============================================================
   Hive HRIS — loading screen: a bee builds the honeycomb.

   One self-contained file (its own CSS + SVG, no dependencies).
   Add this as the FIRST thing inside <body> on every page:
     <body>
     <script src="js/hive-loader.js"></script>

   · First page of a browser session: the full build (~2.6 s).
   · Later pages: a quick version (~1.2 s).
   · Waits for the page to finish loading, then fades out.
   · Uses your theme tokens (--bg, --ac, --tx, --mut, --line), so it
     follows light/dark. Honors "reduce motion".
   ============================================================ */
(function(){
"use strict";
if(window.__hvlLoader)return;window.__hvlLoader=true;

/* ---- settings ---- */
var CFG={
  firstSpeed:1.15,    // 1 = relaxed, higher = faster build (first page of a session)
  laterSpeed:2.4,     // speed on every later page
  showOnLater:true,   // false = only show on the first page of a session
  maxMs:7000          // failsafe: never keep the screen up longer than this
};

var KEY="hive.loader.seen",first=true;
try{first=!sessionStorage.getItem(KEY);sessionStorage.setItem(KEY,"1")}catch(e){}
if(!first&&!CFG.showOnLater)return;

var reduce=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
var speed=first?CFG.firstSpeed:CFG.laterSpeed;
var doc=document,docEl=doc.documentElement,host=doc.body||docEl;

/* ---- geometry: seven cells, one centre + six around it ---- */
var OX=120,OY=128,RL=30,STEP=Math.sqrt(3)*RL;            // layout radius → centre spacing
function hex(r){var p=[];for(var k=0;k<6;k++){var a=Math.PI/180*(60*k-30);
  p.push((r*Math.cos(a)).toFixed(2)+","+(r*Math.sin(a)).toFixed(2))}return"M"+p.join("L")+"Z"}
var cells=[{x:0,y:0}];
for(var k=0;k<6;k++){var a=Math.PI/180*(60*k);cells.push({x:STEP*Math.cos(a),y:STEP*Math.sin(a)})}

var cellSvg=cells.map(function(c,i){
  return '<g class="hvl-cell" style="--i:'+i+'" transform="translate('+(OX+c.x).toFixed(2)+' '+(OY+c.y).toFixed(2)+')">'
    +'<path class="hvl-ghost" d="'+hex(27)+'"/>'
    +'<g class="hvl-fill"><path class="hvl-wax" d="'+hex(27)+'"/><path class="hvl-pool" d="'+hex(16.5)+'"/>'
    +'<path class="hvl-shine" d="M-13,-8 L-6.5,-14"/></g>'
    +'<path class="hvl-ring" d="'+hex(27)+'"/></g>'}).join("");

var beeSvg=
  '<g class="hvl-bee" id="hvl-bee"><g class="hvl-beeinner">'
  +'<g class="hvl-wingA"><ellipse cx="-3" cy="-11" rx="4.4" ry="7.2"/></g>'
  +'<g class="hvl-wingB"><ellipse cx="3" cy="-11" rx="4" ry="6.6"/></g>'
  +'<path d="M-10.4,-1.5 L-16,0 L-10.4,1.5Z" fill="#1a1710"/>'                      /* stinger */
  +'<clipPath id="hvl-bclip"><ellipse cx="0" cy="0" rx="11" ry="7.6"/></clipPath>'
  +'<ellipse cx="0" cy="0" rx="11" ry="7.6" fill="#f5b301"/>'
  +'<g clip-path="url(#hvl-bclip)"><rect x="-7.2" y="-9" width="3.2" height="18" fill="#1a1710"/>'
  +'<rect x="-1.2" y="-9" width="3.2" height="18" fill="#1a1710"/>'
  +'<rect x="4.8" y="-9" width="3" height="18" fill="#1a1710"/></g>'
  +'<ellipse cx="-1.5" cy="-4.2" rx="6" ry="1.8" fill="#ffe08a" opacity=".55"/>'
  +'<circle cx="11" cy="0.4" r="5.2" fill="#1a1710"/>'
  +'<circle cx="12.6" cy="-1.3" r="1.7" fill="#fff"/><circle cx="13.1" cy="-1.2" r=".8" fill="#1a1710"/>'
  +'<path d="M13,-4.2 Q15.5,-8.5 19,-9" fill="none" stroke="#1a1710" stroke-width="1.1" stroke-linecap="round"/>'
  +'<circle cx="19.2" cy="-9" r="1.1" fill="#1a1710"/>'
  +'</g></g>';

var svg='<svg class="hvl-svg" viewBox="0 0 240 230" aria-hidden="true" focusable="false">'
  +'<defs><linearGradient id="hvl-honey" x1="0" y1="0" x2="0" y2="1">'
  +'<stop offset="0" stop-color="#ffd966"/><stop offset=".55" stop-color="#f5b301"/><stop offset="1" stop-color="#d28d00"/></linearGradient>'
  +'<radialGradient id="hvl-glow"><stop offset="0" stop-color="#f5b301" stop-opacity=".26"/><stop offset="1" stop-color="#f5b301" stop-opacity="0"/></radialGradient></defs>'
  +'<circle class="hvl-glow" cx="'+OX+'" cy="'+OY+'" r="112" fill="url(#hvl-glow)"/>'
  +cellSvg+beeSvg+'</svg>';

/* ---- styles ---- */
var css=
'.hvl{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;overscroll-behavior:contain;'
+'background:var(--bg,#0b0b0a);'
+'background:radial-gradient(60% 40% at 12% 0%,color-mix(in srgb,var(--ac,#f5b301) 13%,transparent),transparent 70%) var(--bg,#0b0b0a);'
+'color:var(--tx,#f2efe6);transition:opacity .45s ease}'
+'.hvl.out{opacity:0;pointer-events:none}'
+'.hvl-stage{display:flex;flex-direction:column;align-items:center;gap:6px;transition:transform .55s ease}'
+'.hvl.out .hvl-stage{transform:scale(1.05)}'
+'.hvl-svg{width:min(270px,66vw);height:auto;overflow:visible;display:block}'
+'.hvl-cap{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}'
+'.hvl-fig{font:11px ui-monospace,Menlo,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--mut,#8f8b7e)}'
+'.hvl-st{font:14px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--tx,#f2efe6);min-height:20px}'
+'.hvl-glow{opacity:.55;transition:opacity .6s}.hvl.done .hvl-glow{animation:hvl-pulse 2.2s ease-in-out infinite}'
+'@keyframes hvl-pulse{50%{opacity:1}}'
+'.hvl-ghost{fill:none;stroke:var(--line,#2a2a26);stroke-width:1.5;stroke-dasharray:3 4;transition:opacity .3s}'
+'.hvl-cell.on .hvl-ghost{opacity:0}'
+'.hvl-fill{opacity:0;transform:scale(.3);transform-box:fill-box;transform-origin:center;'
+'transition:transform .5s cubic-bezier(.2,1.6,.4,1),opacity .18s}'
+'.hvl-cell.on .hvl-fill{opacity:1;transform:scale(1)}'
+'.hvl-wax{fill:url(#hvl-honey);stroke:#b17c00;stroke-width:1.6;stroke-linejoin:round}'
+'.hvl-pool{fill:#ffe9a6;opacity:.32}'
+'.hvl-shine{fill:none;stroke:#fff;stroke-opacity:.55;stroke-width:2.2;stroke-linecap:round}'
+'.hvl-ring{fill:none;stroke:var(--ac,#f5b301);stroke-width:2;opacity:0;transform-box:fill-box;transform-origin:center}'
+'.hvl-cell.on .hvl-ring{animation:hvl-ring .6s ease-out}'
+'@keyframes hvl-ring{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(1.4)}}'
+'.hvl.done .hvl-wax{animation:hvl-shimmer 1.8s ease-in-out infinite;animation-delay:calc(var(--i,0)*.14s)}'
+'.hvl.done .hvl-cell{--i:0}'
+'@keyframes hvl-shimmer{50%{filter:brightness(1.16)}}'
+'.hvl-wingA ellipse,.hvl-wingB ellipse{fill:#eaf4ff;fill-opacity:.78;stroke:rgba(110,120,140,.65);stroke-width:.6}'
+'.hvl-wingA,.hvl-wingB{transform-box:fill-box;transform-origin:50% 100%;animation:hvl-flap .09s ease-in-out infinite alternate}'
+'.hvl-wingB{animation-delay:.045s}'
+'@keyframes hvl-flap{from{transform:rotate(-32deg)}to{transform:rotate(-2deg)}}'
+'@media (prefers-reduced-motion:reduce){.hvl-wingA,.hvl-wingB,.hvl-glow,.hvl-wax,.hvl-ring{animation:none!important}'
+'.hvl,.hvl-stage,.hvl-fill,.hvl-ghost{transition-duration:.01s!important}}';

var style=doc.createElement("style");style.textContent=css;(doc.head||docEl).appendChild(style);

var root=doc.createElement("div");
root.className="hvl";root.setAttribute("role","status");root.setAttribute("aria-live","polite");
root.innerHTML='<div class="hvl-stage">'+svg+'<div class="hvl-cap"><span class="hvl-fig">Loading Hive HRIS</span>'
  +'<span class="hvl-st">Building your workspace</span></div></div>';
host.appendChild(root);
var prevOverflow=docEl.style.overflow;docEl.style.overflow="hidden";

var cellEls=root.querySelectorAll(".hvl-cell"),bee=root.querySelector("#hvl-bee"),stEl=root.querySelector(".hvl-st");

/* ---- timeline ---- */
var T_ENTER=450/speed,T_FLY=210/speed,T_DWELL=110/speed,T_HOLD=350/speed;
var entry={x:-34,y:34};
var pts=cells.map(function(c){return{x:OX+c.x,y:OY+c.y-16}});
var segs=[],tt=0,prev=entry;
pts.forEach(function(p,i){
  var fd=i===0?T_ENTER:T_FLY;
  segs.push({f0:tt,f1:tt+fd,end:tt+fd+T_DWELL,from:prev,to:p,arc:i===0?16:9});
  tt+=fd+T_DWELL;prev=p});
var tEnd=tt,lastPt=pts[pts.length-1];

var ease=function(u){return u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2};
var built=[],doneFlag=false,closed=false,raf=0;

function setAll(){
  for(var i=0;i<cellEls.length;i++)cellEls[i].classList.add("on");
  root.classList.add("done");stEl.textContent="Ready";doneFlag=true}

function close(){
  if(closed)return;closed=true;cancelAnimationFrame(raf);
  root.classList.add("out");
  setTimeout(function(){
    if(root.parentNode)root.parentNode.removeChild(root);
    if(style.parentNode)style.parentNode.removeChild(style);
    docEl.style.overflow=prevOverflow},580)}

setTimeout(close,CFG.maxMs);

/* ---- reduced motion: show the finished comb, no flight ---- */
if(reduce){
  setAll();bee.setAttribute("transform","translate("+OX+" 44) scale(1.15)");
  var wait=function(){if(doc.readyState==="complete")setTimeout(close,500);else setTimeout(wait,60)};
  wait();return}

/* ---- animation loop ---- */
var t0=0,px=entry.x,py=entry.y,pt=0,dir=1,tilt=0,vxs=0,vys=0;
function frame(now){
  if(closed)return;
  if(!t0){t0=now;pt=now}
  var t=now-t0,x,y,i;

  if(t<tEnd){
    for(i=0;i<segs.length;i++)if(t<segs[i].end)break;
    var s=segs[i];
    if(t<s.f1){
      var u=(t-s.f0)/(s.f1-s.f0),e=ease(u);
      x=s.from.x+(s.to.x-s.from.x)*e;
      y=s.from.y+(s.to.y-s.from.y)*e-Math.sin(Math.PI*u)*s.arc;
    }else{
      x=s.to.x+Math.sin(t*.016)*1.3;y=s.to.y+Math.sin(t*.024)*1.8;
      if(!built[i]){built[i]=true;cellEls[i].classList.add("on")}
    }
  }else{
    if(!doneFlag){
      for(i=0;i<cellEls.length;i++)if(!built[i]){built[i]=true;cellEls[i].classList.add("on")}
      root.classList.add("done");stEl.textContent="Ready";doneFlag=true}
    var t2=t-tEnd,w=t2*.0042,
        lx=OX+Math.sin(w)*38,ly=44+Math.sin(w*2)*7,m=ease(Math.min(t2/350,1));
    x=lastPt.x+(lx-lastPt.x)*m;y=lastPt.y+(ly-lastPt.y)*m;
  }

  /* facing + tilt from the bee's own velocity */
  var dt=Math.max(now-pt,1);pt=now;
  vxs+=((x-px)/dt-vxs)*.3;vys+=((y-py)/dt-vys)*.3;px=x;py=y;
  if(Math.abs(vxs)>.03)dir=vxs>0?1:-1;
  var mag=Math.sqrt(vxs*vxs+vys*vys),
      goal=mag>.06?Math.max(-22,Math.min(22,Math.atan2(vys,Math.max(Math.abs(vxs),.05))*57.3*.4)):0;
  tilt+=(goal-tilt)*.25;
  bee.setAttribute("transform","translate("+x.toFixed(2)+" "+y.toFixed(2)+") rotate("+(dir*tilt).toFixed(1)+") scale("+(dir*1.15)+" 1.15)");

  if(doneFlag&&t>=tEnd+T_HOLD&&doc.readyState==="complete"){close();return}
  raf=requestAnimationFrame(frame);
}
raf=requestAnimationFrame(frame);
})();
