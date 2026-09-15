<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sumi House — Home Assistant Mock</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@400;600;700&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet">
<style>
:root{
  --char:      #17130E;
  --char-2:    #211E1A;  /* cast concrete — deep */
  --char-3:    #292620;
  --seam:      #34302A;
  --washi:     #EFE7D7;
  --stone:     #99907F;
  --oak:       #C89F6E;
  --copper:    #C0754A;
  --copper-hi: #DE9163;
  --copper-lo: #8C4E2E;
  --moss:      #8B9678;
  --mizu:      #7E93A0;
  --faint:     #6B655A;
  --r-card: 6px;
  --r-chip: 4px;
  --font-display:"Zen Old Mincho",serif;
  --font-ui:"Zen Kaku Gothic New",sans-serif;
  --font-data:"IBM Plex Mono",monospace;
  --crack: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20600%2014'%20preserveAspectRatio='none'%3E%3Cdefs%3E%3ClinearGradient%20id='g'%20x1='0'%20x2='1'%3E%3Cstop%20offset='0'%20stop-color='%238C4E2E'/%3E%3Cstop%20offset='.45'%20stop-color='%23E8A56F'/%3E%3Cstop%20offset='1'%20stop-color='%238C4E2E'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath%20d='M0%2010%20L60%208%20120%2011%20180%207%20240%2010%20300%206%20360%2010%20420%207%20480%2011%20540%208%20600%2010'%20fill='none'%20stroke='%23DE9163'%20stroke-width='3.5'%20opacity='.16'/%3E%3Cpath%20d='M0%2010%20L60%208%20120%2011%20180%207%20240%2010%20300%206%20360%2010%20420%207%20480%2011%20540%208%20600%2010'%20fill='none'%20stroke='url(%23g)'%20stroke-width='1.2'/%3E%3Cpath%20d='M180%207%20L198%202%20M360%2010%20L376%2013.5%20M480%2011%20L494%205'%20fill='none'%20stroke='url(%23g)'%20stroke-width='.8'%20opacity='.85'/%3E%3C/svg%3E");
}
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%}
body{
  background:var(--char);color:var(--washi);
  font-family:var(--font-ui);font-weight:300;line-height:1.5;
  -webkit-font-smoothing:antialiased;
}
button{font-family:inherit;color:inherit;background:none;border:none;cursor:pointer}
.planks{
  background-image:
    repeating-linear-gradient(90deg, rgba(0,0,0,.28) 0px, rgba(0,0,0,.28) 1px, transparent 1px, transparent 96px),
    repeating-linear-gradient(90deg, rgba(255,255,255,.012) 0px, rgba(255,255,255,.012) 48px, transparent 48px, transparent 96px),
    linear-gradient(180deg,#1B1610 0%, #15110C 100%);
}
/* ---------- HA app chrome ---------- */
.app{max-width:1080px;margin:0 auto;min-height:100%;border-left:1px solid var(--seam);border-right:1px solid var(--seam)}
.appbar{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 22px 10px;
}
.appbar .brand{display:flex;align-items:baseline;gap:12px}
.appbar .brand .k{font-family:var(--font-display);font-size:12px;letter-spacing:.4em;color:var(--stone)}
.appbar .brand b{font-family:var(--font-display);font-weight:600;font-size:18px;letter-spacing:.02em}
.appbar .clockline{font-family:var(--font-data);font-size:13px;color:var(--stone)}
.appbar .clockline b{color:var(--washi);font-weight:400;font-size:15px}
.tabs{
  display:flex;gap:2px;padding:0 14px;overflow-x:auto;scrollbar-width:none;
  border-bottom:1px solid var(--seam);
}
.tabs::-webkit-scrollbar{display:none}
.tab{
  padding:10px 16px 12px;font-size:13px;font-weight:400;color:var(--stone);
  letter-spacing:.05em;position:relative;white-space:nowrap;transition:color .2s;
}
.tab .k{font-family:var(--font-display);margin-right:7px;font-size:12px;opacity:.7}
.tab:hover{color:var(--washi)}
.tab.active{color:var(--copper-hi)}
.tab.active::after{
  content:"";position:absolute;left:12px;right:12px;bottom:-1px;height:2px;
  background:linear-gradient(90deg,var(--copper-lo),var(--copper-hi),var(--copper-lo));
}
/* ---------- views ---------- */
.view{display:none;padding-bottom:40px;animation:vin .35s ease}
.view.on{display:block}
@keyframes vin{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.view{animation:none}}
.dash-head{padding:24px 26px 22px;position:relative;overflow:hidden;border-bottom:1px solid var(--seam)}
.dash-head::after{
  content:"";position:absolute;left:0;right:0;bottom:-2px;height:14px;pointer-events:none;
  background:var(--crack) center bottom / 100% 14px no-repeat;
}
.dh-row{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap}
.dh-kanji{font-family:var(--font-display);color:var(--stone);font-size:12px;letter-spacing:.55em;margin-bottom:6px}
.dh-title{font-family:var(--font-display);font-weight:600;font-size:28px;line-height:1.1}
.dh-sub{color:var(--stone);font-size:13px;margin-top:6px}
.dh-clock{text-align:right}
.dh-time{font-family:var(--font-data);font-weight:300;font-size:32px;letter-spacing:.02em}
.dh-wx{color:var(--stone);font-size:13px;margin-top:2px}
.dh-wx b{color:var(--oak);font-weight:500}
/* ---------- grid & cards ---------- */
.grid{display:grid;gap:10px;padding:18px 26px 0}
.g2{grid-template-columns:repeat(2,1fr)}
.g3{grid-template-columns:repeat(3,1fr)}
.g4{grid-template-columns:repeat(4,1fr)}
.span2{grid-column:span 2}
.card{
  background:
    url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='160'%20height='160'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.8'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='160'%20height='160'%20filter='url(%23n)'%20opacity='0.035'/%3E%3C/svg%3E"),
    radial-gradient(140% 120% at 12% -10%, #282520 0%, rgba(40,37,32,0) 55%),
    radial-gradient(130% 140% at 108% 118%, #1A1814 0%, rgba(26,24,20,0) 50%),
    var(--char-2);
  border:1px solid var(--seam);border-radius:var(--r-card);
  padding:14px 16px;position:relative;
  transition:filter .25s ease, transform .25s ease, border-color .3s ease;
}
.card:hover{filter:brightness(1.08)}
/* active card — a quiet copper trace on the frame, no crack */
.card.veined{border-color:rgba(140,78,46,.45)}
.label{font-family:var(--font-data);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--stone)}
.sect{padding:26px 26px 0;display:flex;align-items:baseline;gap:12px}
.sect h3{font-family:var(--font-display);font-weight:600;font-size:17px}
.sect .k{font-family:var(--font-display);color:var(--seam);font-size:13px;letter-spacing:.3em}
.sect::after{content:"";flex:1;height:1px;background:var(--seam);transform:translateY(-4px)}
/* ---------- energy ---------- */
.energy{grid-column:1 / -1;padding:18px 20px}
.en-row{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
.en-node{min-width:110px}
.en-node .v{font-family:var(--font-data);font-size:26px;font-weight:300;margin-top:2px}
.en-node .v small{font-size:13px;color:var(--stone)}
.en-node.solar .v{color:var(--copper-hi)}
.en-node.grid .v{color:var(--stone)}
.en-flow{height:46px;margin-top:14px}
.en-flow svg{width:100%;height:100%}
.flowline{stroke:var(--seam);stroke-width:1;fill:none}
.flowlive{stroke:url(#cu);stroke-width:1.5;fill:none;stroke-dasharray:6 10;animation:flow 2.6s linear infinite}
@keyframes flow{to{stroke-dashoffset:-64}}
@media (prefers-reduced-motion: reduce){.flowlive{animation:none}}
.en-meta{display:flex;gap:20px;margin-top:12px;color:var(--stone);font-size:12px;flex-wrap:wrap}
.en-meta b{color:var(--oak);font-family:var(--font-data);font-weight:400}
/* ---------- scenes ---------- */
.scenes{display:flex;gap:8px;padding:16px 26px 0;flex-wrap:wrap}
.scene{
  border:1px solid var(--seam);border-radius:var(--r-chip);color:var(--washi);
  font-weight:400;font-size:13px;padding:9px 16px;letter-spacing:.04em;transition:all .2s ease;
}
.scene .k{font-family:var(--font-display);color:var(--stone);margin-right:8px;font-size:12px}
.scene:hover{border-color:var(--copper-lo);color:var(--copper-hi)}
.scene.active{background:rgba(192,117,74,.12);border-color:var(--copper-lo);color:var(--copper-hi)}
.scene.active .k{color:var(--copper)}
/* ---------- rooms ---------- */
.room{min-height:96px;display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;text-align:left;width:100%}
.room:hover{transform:translateY(-1px)}
.room .k{font-family:var(--font-display);font-size:11px;color:var(--seam);letter-spacing:.35em;transition:color .25s}
.room:hover .k{color:var(--copper-lo)}
.room h4{font-weight:500;font-size:14px;margin-top:2px}
.room .stat{display:flex;gap:12px;align-items:baseline;margin-top:10px}
.room .t{font-family:var(--font-data);font-size:15px}
.room .t small{color:var(--stone);font-size:11px}
.room .devs{color:var(--stone);font-size:11px}
.dot{width:5px;height:5px;border-radius:50%;display:inline-block;background:var(--seam);vertical-align:middle}
.dot.on{background:var(--moss);box-shadow:0 0 6px rgba(139,150,120,.6)}
.dot.warm{background:var(--copper);box-shadow:0 0 6px rgba(192,117,74,.55)}
/* ---------- cameras ---------- */
.cams{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:16px 26px 0}
.cam{
  aspect-ratio:16/10;border:1px solid var(--seam);border-radius:var(--r-card);
  background:radial-gradient(120% 90% at 30% 20%, #241E16 0%, #14100B 70%);
  position:relative;overflow:hidden;
}
.cam .label{position:absolute;left:10px;bottom:8px}
.cam .rec{position:absolute;top:8px;right:10px;font-family:var(--font-data);font-size:9px;letter-spacing:.2em;color:var(--moss)}
.cam .rec::before{content:"●";margin-right:5px;font-size:7px}
.cam svg{position:absolute;inset:0;width:100%;height:100%;opacity:.5}
/* ---------- wellness tiles ---------- */
.well .v{font-family:var(--font-data);font-size:20px;margin-top:8px}
.well .v small{font-size:11px;color:var(--stone)}
.well .state{font-size:11px;color:var(--stone);margin-top:4px}
.well.hot .v{color:var(--copper-hi)}
.well.water .v{color:var(--mizu)}
.well.grass .v{color:var(--moss)}
.bar{height:2px;background:var(--seam);border-radius:1px;margin-top:12px;overflow:hidden}
.bar i{display:block;height:100%;background:linear-gradient(90deg,var(--copper-lo),var(--copper-hi));transition:width .4s ease}
.bar.w i{background:linear-gradient(90deg,#5C7280,var(--mizu))}
.bar.g i{background:linear-gradient(90deg,#66735A,var(--moss))}
/* ---------- lights & controls ---------- */
.light-row{display:flex;flex-direction:column;gap:6px;margin-top:12px}
.light{
  display:flex;align-items:center;gap:12px;padding:10px 12px;
  background:var(--char);border:1px solid var(--seam);border-radius:var(--r-chip);
}
.light .nm{font-size:13px;font-weight:400;flex:1;min-width:96px}
.light .pct{font-family:var(--font-data);font-size:12px;color:var(--stone);width:38px;text-align:right}
input[type=range]{
  -webkit-appearance:none;appearance:none;flex:1.6;min-width:80px;height:2px;border-radius:1px;outline:none;
  background:linear-gradient(90deg,var(--copper-lo) 0%,var(--oak) var(--v,50%),var(--seam) var(--v,50%));
}
input[type=range]::-webkit-slider-thumb{
  -webkit-appearance:none;width:12px;height:12px;border-radius:50%;
  background:var(--washi);box-shadow:0 0 0 3px var(--char);cursor:pointer;
}
input[type=range]::-moz-range-thumb{
  width:12px;height:12px;border:none;border-radius:50%;
  background:var(--washi);box-shadow:0 0 0 3px var(--char);cursor:pointer;
}
.toggle{
  width:40px;height:22px;border-radius:3px;border:1px solid var(--seam);
  position:relative;background:var(--char);flex:none;
}
.toggle i{position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:2px;background:var(--stone);transition:all .2s}
.toggle.on{border-color:var(--copper-lo);background:rgba(192,117,74,.14)}
.toggle.on i{left:21px;background:var(--copper)}
.rowline{display:flex;justify-content:space-between;align-items:center;margin-top:10px;gap:10px}
.rowline .st{font-weight:500;font-size:14px}
.rowline .sub{color:var(--stone);font-size:11px;margin-top:2px}
/* climate */
.climate .big{font-family:var(--font-data);font-size:34px;font-weight:300;margin-top:6px}
.climate .big small{font-size:14px;color:var(--stone)}
.climate .tgt{color:var(--stone);font-size:12px;margin-top:2px}
.climate .tgt b{color:var(--oak);font-family:var(--font-data);font-weight:400}
.steppers{display:flex;gap:6px;margin-top:12px;align-items:center}
.step{
  width:32px;height:28px;border:1px solid var(--seam);border-radius:3px;color:var(--stone);
  font-family:var(--font-data);font-size:15px;transition:all .2s;
}
.step:hover{color:var(--copper-hi);border-color:var(--copper-lo)}
.mchip{
  font-family:var(--font-data);font-size:10px;letter-spacing:.15em;text-transform:uppercase;
  border:1px solid var(--seam);border-radius:3px;padding:5px 10px;color:var(--stone);
}
.mchip.on{color:var(--copper-hi);border-color:var(--copper-lo);background:rgba(192,117,74,.13)}
/* media */
.media{display:flex;gap:14px;align-items:center;margin-top:10px}
.art{
  width:60px;height:60px;border-radius:var(--r-chip);flex:none;
  background:linear-gradient(135deg,#3B2E20,#1C150D);border:1px solid var(--seam);position:relative;overflow:hidden;
}
.art::after{content:"";position:absolute;inset:0;background:radial-gradient(60% 60% at 35% 30%,rgba(222,145,99,.35),transparent 70%)}
.media .tt{font-weight:500;font-size:14px}
.media .ar{color:var(--stone);font-size:12px;margin-top:2px}
.transport{display:flex;gap:16px;margin-top:6px;color:var(--stone);font-size:12px;font-family:var(--font-data);letter-spacing:.1em;align-items:center}
.transport button{color:var(--copper-hi);font-size:13px}
/* action button */
.act{
  margin-top:12px;border:1px solid var(--copper-lo);border-radius:3px;padding:8px 14px;
  color:var(--copper-hi);font-size:12px;letter-spacing:.08em;font-weight:400;transition:all .2s;
}
.act:hover{background:rgba(192,117,74,.12)}
.act.ghost{border-color:var(--seam);color:var(--stone)}
.act.ghost:hover{color:var(--washi)}
/* toast */
.toast{
  position:fixed;left:50%;bottom:26px;transform:translate(-50%,20px);opacity:0;
  background:var(--char-3);border:1px solid var(--seam);border-radius:4px;
  padding:10px 18px;font-size:13px;color:var(--washi);pointer-events:none;
  transition:all .3s ease;z-index:50;box-shadow:0 12px 40px rgba(0,0,0,.5);
}
.toast.show{opacity:1;transform:translate(-50%,0)}
.toast .k{font-family:var(--font-display);color:var(--copper);margin-right:8px}
@media(max-width:760px){
  .g4{grid-template-columns:repeat(2,1fr)}
  .g3{grid-template-columns:repeat(2,1fr)}
  .cams{grid-template-columns:repeat(2,1fr)}
  .grid,.sect,.scenes,.cams{padding-left:14px;padding-right:14px}
  .dash-head{padding:20px 14px 18px}
  .dh-time{font-size:25px}
  .appbar{padding:12px 14px 8px}
}
@media(max-width:430px){
  .g2{grid-template-columns:1fr}
  .span2{grid-column:span 1}
}
/* ============================================================
   GARDEN — Onsen (湯) & Maintenance (庭)
   Accent = identity (oak / mizu / moss). Copper = kintsugi only.
   ============================================================ */
.a-oak{--accent:var(--oak)}
.a-mizu{--accent:var(--mizu)}
.a-moss{--accent:var(--moss)}
.a-copper{--accent:var(--copper-hi)}
.span3{grid-column:span 3}
.spanall{grid-column:1/-1}
.sect.major{padding-top:32px}
.sect.major h3{font-size:19px}
.sect.major .k{color:var(--stone);opacity:.55}

/* --- kintsugi: a real seam, earned only by an active device --- */
.card.veined::after{
  content:"";position:absolute;left:-1px;right:-1px;top:-6px;height:14px;pointer-events:none;
  background:var(--crack) center center / 100% 14px no-repeat;
  animation:seamin var(--ease-in,.9s) ease;
}
@keyframes seamin{from{opacity:0;transform:scaleX(.6)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.card.veined::after{animation:none}}

/* --- vessel cards: sauna & hot tub. Same geometry, different form --- */
.vessel{display:flex;flex-direction:column;min-height:322px;padding:15px 17px 13px}
.vessel::before{
  content:"";position:absolute;left:0;top:12px;bottom:12px;width:2px;
  border-radius:0 2px 2px 0;background:var(--accent);opacity:.7;
}
.vhead{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.vhead .ttl{display:flex;align-items:baseline;gap:9px}
.vhead .k{font-family:var(--font-display);font-size:13px;letter-spacing:.3em;color:var(--accent);opacity:.85}
.pill{
  font-family:var(--font-data);font-size:9px;letter-spacing:.2em;text-transform:uppercase;
  color:var(--stone);border:1px solid var(--seam);border-radius:2px;padding:3px 7px;white-space:nowrap;
}
.pill.live{color:var(--copper-hi);border-color:var(--copper-lo);background:rgba(192,117,74,.11)}
.pill.cool{color:var(--mizu);border-color:rgba(126,147,160,.45)}
.pill.ok{color:var(--moss);border-color:rgba(139,150,120,.45)}

/* gauge — arc (dry heat, open) vs ring (water, closed) */
.gwrap{display:flex;align-items:center;justify-content:center;gap:12px;margin:12px 0 6px}
.gbtn{
  width:46px;height:46px;flex:none;border:1px solid var(--seam);border-radius:4px;
  color:var(--stone);font-family:var(--font-data);font-size:20px;line-height:1;transition:all .2s;
}
.gbtn:hover{color:var(--copper-hi);border-color:var(--copper-lo);background:rgba(192,117,74,.08)}
.gbtn:active{transform:scale(.94)}
.gauge{position:relative;width:158px;height:158px;flex:none;touch-action:none;cursor:pointer}
.gauge svg{width:100%;height:100%;display:block}
.gauge.arc svg{transform:rotate(135deg)}
.gauge.ring svg{transform:rotate(-90deg)}
.gtrack{fill:none;stroke:var(--seam);stroke-width:3}
.gfill{fill:none;stroke-width:3;stroke-linecap:round;stroke:var(--accent);transition:stroke-dashoffset .45s cubic-bezier(.22,1,.36,1),stroke .3s}
.card.veined .gfill{stroke:var(--copper-hi)}
.ghandle{fill:var(--washi);stroke:var(--char);stroke-width:3;transition:transform .45s cubic-bezier(.22,1,.36,1)}
.gcenter{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}
.gnum{font-family:var(--font-data);font-size:40px;font-weight:300;line-height:1;letter-spacing:-.01em}
.gnum small{font-size:15px;color:var(--stone);margin-left:1px}
.gtgt{font-family:var(--font-data);font-size:11px;color:var(--stone);letter-spacing:.14em;margin-top:7px}
.gtgt b{color:var(--accent);font-weight:400}
.geta{font-family:var(--font-data);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--faint);text-align:center;margin:0 0 12px}

/* rows inside a vessel / any stacked control card */
.vrow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;border-top:1px solid var(--seam)}
.vrow:first-of-type{border-top:none}
.vrow .nm{font-size:13px;font-weight:400}
.vrow .nm em{display:block;font-style:normal;color:var(--stone);font-size:11px;margin-top:2px;font-family:var(--font-data);letter-spacing:.04em}
.vrow .val{font-family:var(--font-data);font-size:13px;color:var(--washi)}

/* running cost footer */
.cost{display:flex;align-items:flex-end;gap:18px;margin-top:auto;padding-top:12px;border-top:1px solid var(--seam)}
.cost .c{flex:none}
.cost .c .l{font-family:var(--font-data);font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--faint)}
.cost .c .n{font-family:var(--font-data);font-size:16px;margin-top:4px;font-weight:300}
.cost .c .n span{font-size:10px;color:var(--stone);margin-left:3px}
.spark{flex:1;display:flex;align-items:flex-end;gap:2px;height:24px;min-width:56px}
.spark i{flex:1;background:var(--seam);border-radius:1px 1px 0 0;min-height:2px}
.spark i.cur{background:var(--accent);opacity:.85}

.chiprow{display:flex;gap:6px;align-items:center}

/* light colour swatches */
.swatches{display:flex;gap:6px;flex-wrap:wrap}
.sw{width:24px;height:24px;border-radius:3px;border:1px solid var(--seam);flex:none;transition:all .2s;position:relative}
.sw:hover{transform:translateY(-1px)}
.sw.on{border-color:var(--washi);box-shadow:0 0 0 1px var(--washi) inset,0 0 10px -2px currentColor}

/* service / maintenance countdowns */
.svc{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.svc.three{grid-template-columns:repeat(3,1fr)}
.svcitem{border:1px solid var(--seam);border-radius:var(--r-chip);padding:9px 10px;background:var(--char)}
.svcitem .l{font-family:var(--font-data);font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--stone)}
.svcitem .d{font-family:var(--font-data);font-size:15px;margin-top:5px;font-weight:300}
.svcitem .w{font-size:10px;color:var(--stone);margin-top:3px;font-family:var(--font-data)}
.svcitem.due{border-color:var(--copper-lo)}
.svcitem.due .d{color:var(--copper-hi)}

/* schedule rows */
.sched{margin-top:4px}
.srow{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--seam)}
.srow:first-child{border-top:none}
.srow .day{font-family:var(--font-data);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--stone);width:34px;flex:none}
.srow .tm{font-family:var(--font-data);font-size:13px;width:50px;flex:none}
.srow .dur{color:var(--stone);font-size:11px;flex:1;min-width:0;font-family:var(--font-data);letter-spacing:.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.srow .vd{
  font-family:var(--font-data);font-size:9px;letter-spacing:.16em;text-transform:uppercase;
  padding:3px 7px;border-radius:2px;border:1px solid var(--seam);color:var(--stone);flex:none;white-space:nowrap;
}
.srow .vd.run{color:var(--moss);border-color:rgba(139,150,120,.5)}
.srow .vd.skip{color:var(--stone);opacity:.55}
.srow.muted{opacity:.4}

/* sensor readings */
.readings{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:14px}
.rd{border-left:1px solid var(--seam);padding:0 14px}
.rd:first-child{border-left:none;padding-left:0}
.rd .l{font-family:var(--font-data);font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--stone)}
.rd .n{font-family:var(--font-data);font-size:25px;font-weight:300;margin-top:5px;line-height:1}
.rd .n small{font-size:11px;color:var(--stone);margin-left:2px}
.band{height:3px;background:var(--seam);border-radius:2px;margin-top:10px;position:relative}
.band .safe{position:absolute;top:0;bottom:0;background:rgba(139,150,120,.4);border-radius:2px}
.band .pin{position:absolute;top:-3px;width:2px;height:9px;background:var(--washi);border-radius:1px;transform:translateX(-1px)}
.rd .note{font-size:10px;margin-top:6px;font-family:var(--font-data);letter-spacing:.05em;color:var(--moss);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rd .note.warn{color:var(--oak)}

/* sprinkler zone tiles */
.zone{cursor:pointer;text-align:left;width:100%;display:block}
.ztop{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.zk{font-family:var(--font-display);font-size:12px;letter-spacing:.3em;color:var(--faint);transition:color .25s}
.zone.on .zk{color:var(--copper-lo)}
.zname{font-size:13px;font-weight:400;margin-top:5px}
.zmeta{color:var(--stone);font-size:11px;margin-top:7px;font-family:var(--font-data);letter-spacing:.03em}

/* run-history timeline */
.tl{margin-top:12px}
.tlrow{display:flex;align-items:center;gap:12px;padding:6px 0}
.tlname{font-size:12px;width:96px;flex:none;display:flex;align-items:baseline;gap:7px}
.tlname .k{font-family:var(--font-display);font-size:10px;letter-spacing:.2em;color:var(--faint)}
.tltrack{flex:1;height:14px;position:relative}
.tltrack::before{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:var(--seam)}
.tlrun{position:absolute;top:2px;height:10px;border-radius:1px;background:linear-gradient(180deg,rgba(126,147,160,.95),rgba(126,147,160,.4))}
.tlrun.skipped{background:none;border:1px dashed var(--faint);height:8px;top:3px;opacity:.7}
.tlaxis{display:flex;margin-top:6px;padding-left:108px;justify-content:space-between;font-family:var(--font-data);font-size:9px;letter-spacing:.16em;color:var(--faint);text-transform:uppercase}

/* AI forecast block */
#spr-card{display:flex;flex-direction:column}
.forecast{display:flex;gap:16px;align-items:stretch;margin-top:12px;flex:1}
.fverdict{flex:none;width:118px;border-right:1px solid var(--seam);padding-right:16px;display:flex;flex-direction:column;justify-content:center}
.fverdict .k{font-family:var(--font-display);font-size:26px;letter-spacing:.08em;color:var(--stone)}
.fverdict .vv{font-family:var(--font-data);font-size:10px;letter-spacing:.2em;text-transform:uppercase;margin-top:10px}
.fverdict.run .k{color:var(--moss)}
.fverdict.run .vv{color:var(--moss)}
.fverdict.skip .vv{color:var(--stone)}
.ftext{font-family:var(--font-display);font-size:14px;line-height:1.8;opacity:.93;flex:1}
.fmeta{font-family:var(--font-data);font-size:9px;letter-spacing:.18em;color:var(--faint);margin-top:auto;padding-top:12px;text-transform:uppercase}

/* mower */
.mow{display:flex;gap:16px;align-items:flex-start;margin-top:10px}
.mring{width:78px;height:78px;flex:none;position:relative}
.mring svg{width:100%;height:100%;transform:rotate(-90deg)}
.mring .t{fill:none;stroke:var(--seam);stroke-width:3}
.mring .f{fill:none;stroke:var(--moss);stroke-width:3;stroke-linecap:round;transition:stroke-dashoffset .5s ease}
.mring .c{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-data);font-size:15px;font-weight:300}
.mring .c span{font-size:9px;color:var(--stone)}
.mbody{flex:1;min-width:0}
.mstat{font-size:15px;font-weight:500}
.mlist{margin-top:9px}
.mline{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-top:1px solid var(--seam);font-size:11px;color:var(--stone)}
.mline:first-child{border-top:none}
.mline b{font-family:var(--font-data);font-weight:400;color:var(--washi);font-size:12px}
.wear{height:2px;background:var(--seam);border-radius:1px;margin-top:8px;overflow:hidden}
.wear i{display:block;height:100%;background:linear-gradient(90deg,var(--moss),var(--oak));transition:width .4s}
.wear i.hot{background:linear-gradient(90deg,var(--oak),var(--copper-hi))}
.errchip{
  font-family:var(--font-data);font-size:9px;letter-spacing:.16em;text-transform:uppercase;
  padding:3px 8px;border-radius:2px;border:1px solid var(--seam);color:var(--stone);
}
.errchip.clear{color:var(--moss);border-color:rgba(139,150,120,.4)}
.errchip.err{color:var(--copper-hi);border-color:var(--copper-lo);background:rgba(192,117,74,.1)}

/* music */
.plist{display:flex;gap:6px;margin-top:10px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.plist::-webkit-scrollbar{display:none}
.plist .mchip{white-space:nowrap;flex:none;cursor:pointer}
.spk{display:flex;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap}
.spk .mchip{cursor:pointer}

/* garden responsive */
@media(max-width:900px){
  .vessel{min-height:0}
  .readings{grid-template-columns:repeat(2,1fr);gap:14px 0}
  .rd:nth-child(3){border-left:none;padding-left:0}
  .forecast{flex-direction:column;gap:12px}
  .fverdict{width:auto;border-right:none;border-bottom:1px solid var(--seam);padding:0 0 12px;flex-direction:row;align-items:baseline;gap:14px}
  .fverdict .vv{margin-top:0}
  .tlname{width:74px}
  .tlaxis{padding-left:86px}
}

/* person accent edge (kids rooms, any identity-owned card) */
.person::before{
  content:"";position:absolute;left:0;top:12px;bottom:12px;width:2px;
  border-radius:0 2px 2px 0;background:var(--accent);opacity:.7;
}
/* non-interactive toggle indicator, for tiles that are themselves the button */
.tog-ind{
  width:40px;height:22px;border-radius:3px;border:1px solid var(--seam);
  position:relative;background:var(--char);flex:none;display:inline-block;transition:all .2s;
}
.tog-ind i{position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:2px;background:var(--stone);transition:all .2s}
.zone.on .tog-ind{border-color:var(--copper-lo);background:rgba(192,117,74,.14)}
.zone.on .tog-ind i{left:21px;background:var(--copper)}
</style>
</head>
<body>
<div class="app">

  <div class="appbar planks">
    <div class="brand"><span class="k">墨の家</span><b>Sumi House</b></div>
    <div class="clockline"><b id="clock">--:--</b> · <span id="dateline">—</span></div>
  </div>
  <nav class="tabs planks">
    <button class="tab active" data-view="home"><span class="k">家</span>Home</button>
    <button class="tab" data-view="living"><span class="k">居</span>Living room</button>
    <button class="tab" data-view="master"><span class="k">寝</span>Bedroom</button>
    <button class="tab" data-view="kids"><span class="k">子</span>Kids' rooms</button>
    <button class="tab" data-view="garden"><span class="k">庭</span>Garden</button>
  </nav>

  <!-- ============ VIEW: HOME ============ -->
  <section class="view on" id="v-home">
    <div class="dash-head planks">
      <div class="dh-row">
        <div>
          <div class="dh-kanji">墨 の 家</div>
          <div class="dh-title" id="greet">Good evening</div>
          <div class="dh-sub" id="home-sub">Everyone home · <span id="lights-count">4</span> lights on · <span id="sauna-note">Sauna idle</span></div>
        </div>
        <div class="dh-clock">
          <div class="dh-time" id="clock2">--:--</div>
          <div class="dh-wx"><b id="solar-hdr">6.2 kW</b> solar · Clear, 21°C · Sunset 20:14</div>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="card energy">
        <div class="label">Energy · now</div>
        <div class="en-row" style="margin-top:10px">
          <div class="en-node solar"><div class="label">Solar</div><div class="v"><span id="en-solar">6.2</span><small> kW</small></div></div>
          <div class="en-node"><div class="label">House</div><div class="v"><span id="en-house">2.8</span><small> kW</small></div></div>
          <div class="en-node grid"><div class="label">To grid</div><div class="v"><span id="en-grid">3.4</span><small> kW</small></div></div>
        </div>
        <div class="en-flow">
          <svg viewBox="0 0 600 46" preserveAspectRatio="none">
            <defs><linearGradient id="cu" x1="0" x2="1"><stop offset="0" stop-color="#8C4E2E"/><stop offset=".5" stop-color="#E8A56F"/><stop offset="1" stop-color="#8C4E2E"/></linearGradient></defs>
            <path class="flowline" d="M10 22 C 160 17, 340 27, 590 22"/>
            <path class="flowline" d="M250 24 C 285 34, 315 33, 350 36"/>
            <path class="flowlive" d="M10 22 C 160 17, 340 27, 590 22"/>
            <path class="flowlive" style="animation-duration:3.4s" d="M250 24 C 285 34, 315 33, 350 36"/>
          </svg>
        </div>
        <div class="en-meta">
          <span>Today <b>31.4 kWh</b> produced</span>
          <span><b>12.9 kWh</b> used</span>
          <span>Self-sufficiency <b>84%</b></span>
        </div>
      </div>
    </div>

    <div class="scenes" id="scenebar">
      <button class="scene active" data-scene="evening"><span class="k">夕</span>Evening</button>
      <button class="scene" data-scene="cinema"><span class="k">映</span>Cinema</button>
      <button class="scene" data-scene="sauna"><span class="k">湯</span>Sauna night</button>
      <button class="scene" data-scene="away"><span class="k">留</span>Away</button>
      <button class="scene" data-scene="goodnight"><span class="k">眠</span>Goodnight</button>
    </div>

    <div class="sect"><h3>Living</h3><span class="k">居</span></div>
    <div class="grid g4">
      <button class="card room" data-goto="living"><span class="k">居間</span><h4>Living room</h4>
        <div class="stat"><span class="t">22.5<small>°C</small></span><span class="devs" id="lr-devs"><i class="dot warm"></i> 3 lights · TV on</span></div></button>
      <button class="card room" data-goto="none"><span class="k">台所</span><h4>Kitchen</h4>
        <div class="stat"><span class="t">23.1<small>°C</small></span><span class="devs"><i class="dot on"></i> Bench light</span></div></button>
      <button class="card room" data-goto="none"><span class="k">食</span><h4>Dining</h4>
        <div class="stat"><span class="t">22.5<small>°C</small></span><span class="devs"><i class="dot"></i> All off</span></div></button>
      <button class="card room" data-goto="none"><span class="k">縁側</span><h4>Terrace</h4>
        <div class="stat"><span class="t">18.9<small>°C</small></span><span class="devs"><i class="dot warm"></i> String lights</span></div></button>
    </div>

    <div class="sect"><h3>Upstairs &amp; rooms</h3><span class="k">上</span></div>
    <div class="grid g4">
      <button class="card room" data-goto="none"><span class="k">中二階</span><h4>Mezzanine</h4>
        <div class="stat"><span class="t">22.8<small>°C</small></span><span class="devs"><i class="dot on"></i> Work desk</span></div></button>
      <button class="card room" data-goto="master"><span class="k">主寝室</span><h4>Master bedroom</h4>
        <div class="stat"><span class="t">20.4<small>°C</small></span><span class="devs"><i class="dot"></i> All off</span></div></button>
      <button class="card room" data-goto="kids"><span class="k">部屋</span><h4>Olaf's room</h4>
        <div class="stat"><span class="t">21.2<small>°C</small></span><span class="devs"><i class="dot warm"></i> Desk lamp</span></div></button>
      <button class="card room" data-goto="kids"><span class="k">部屋</span><h4>Zoja's room</h4>
        <div class="stat"><span class="t">21.0<small>°C</small></span><span class="devs"><i class="dot"></i> All off</span></div></button>
    </div>

    <div class="sect"><h3>Service &amp; guest</h3><span class="k">奥</span></div>
    <div class="grid g4">
      <button class="card room" data-goto="none"><span class="k">客間</span><h4>Guest suite</h4>
        <div class="stat"><span class="t">19.8<small>°C</small></span><span class="devs"><i class="dot"></i> Door locked</span></div></button>
      <button class="card room" data-goto="none"><span class="k">洗濯</span><h4>Laundry</h4>
        <div class="stat"><span class="t">—</span><span class="devs"><i class="dot on"></i> Dryer · <span id="dryer-left">0:34</span> left</span></div></button>
      <button class="card room" data-goto="none"><span class="k">車庫</span><h4>Garage</h4>
        <div class="stat"><span class="t">16.2<small>°C</small></span><span class="devs"><i class="dot"></i> Closed</span></div></button>
      <button class="card room" data-goto="none"><span class="k">屋根裏</span><h4>Attic</h4>
        <div class="stat"><span class="t">24.6<small>°C</small></span><span class="devs"><i class="dot"></i> Quiet</span></div></button>
    </div>

    <div class="sect"><h3>Garden &amp; wellness</h3><span class="k">庭</span></div>
    <div class="grid g4">
      <button class="card well hot" data-goto="garden" id="home-sauna">
        <div class="label">Sauna</div><div class="v" id="home-sauna-v">64<small>°C · idle</small></div>
        <div class="state" id="home-sauna-s">Tap to open controls</div>
        <div class="bar"><i id="home-sauna-bar" style="width:0%"></i></div></button>
      <button class="card well hot" data-goto="garden"><div class="label">Hot tub</div><div class="v">38.5<small>°C</small></div>
        <div class="state">Holding temperature</div><div class="bar"><i style="width:100%"></i></div></button>
      <button class="card well water" data-goto="garden"><div class="label">Pool</div><div class="v">26.1<small>°C</small></div>
        <div class="state">Filtration until 21:00</div><div class="bar w"><i style="width:55%"></i></div></button>
      <button class="card well water" data-goto="garden"><div class="label">Sprinklers</div><div class="v">05:30</div>
        <div class="state">Next cycle · soil 41%</div><div class="bar w"><i style="width:41%"></i></div></button>
    </div>

    <div class="sect"><h3>Cameras</h3><span class="k">目</span></div>
    <div class="cams">
      <div class="cam"><svg viewBox="0 0 160 100" preserveAspectRatio="none"><path d="M0 78 L60 40 L100 62 L160 30 L160 100 L0 100 Z" fill="#1E1811"/><path d="M60 40 L60 100" stroke="#2A2219" stroke-width="1"/></svg><span class="rec">LIVE</span><span class="label">Entrance</span></div>
      <div class="cam"><svg viewBox="0 0 160 100" preserveAspectRatio="none"><path d="M0 60 Q80 30 160 66 L160 100 L0 100 Z" fill="#1B1710"/></svg><span class="rec">LIVE</span><span class="label">Driveway</span></div>
      <div class="cam"><svg viewBox="0 0 160 100" preserveAspectRatio="none"><rect x="20" y="30" width="50" height="70" fill="#1E1811"/><rect x="90" y="50" width="70" height="50" fill="#191510"/></svg><span class="rec">LIVE</span><span class="label">Back garden</span></div>
      <div class="cam"><svg viewBox="0 0 160 100" preserveAspectRatio="none"><ellipse cx="80" cy="86" rx="70" ry="20" fill="#17222A" opacity=".8"/></svg><span class="rec">LIVE</span><span class="label">Pool</span></div>
    </div>
  </section>

  <!-- ============ VIEW: LIVING ROOM ============ -->
  <section class="view" id="v-living">
    <div class="dash-head planks">
      <div class="dh-row">
        <div>
          <div class="dh-kanji">居 間</div>
          <div class="dh-title">Living room</div>
          <div class="dh-sub" id="lr-sub">Evening scene · Terrace door closed</div>
        </div>
        <div class="dh-clock">
          <div class="dh-time">22.5°</div>
          <div class="dh-wx">Humidity <b>44%</b> · CO₂ <b>560 ppm</b></div>
        </div>
      </div>
    </div>

    <div class="grid g2">
      <div class="card">
        <div class="label">Lights</div>
        <div class="light-row" id="lr-lights">
          <div class="light"><span class="nm">Ceiling wash</span>
            <input type="range" min="0" max="100" value="35" data-light="0"><span class="pct">35%</span></div>
          <div class="light"><span class="nm">Copper pendant</span>
            <input type="range" min="0" max="100" value="60" data-light="1"><span class="pct">60%</span></div>
          <div class="light"><span class="nm">Shelf strip</span>
            <input type="range" min="0" max="100" value="20" data-light="2"><span class="pct">20%</span></div>
          <div class="light"><span class="nm">Reading lamp</span>
            <input type="range" min="0" max="100" value="0" data-light="3"><span class="pct">off</span></div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="card climate">
          <div class="label">Climate</div>
          <div class="big">22.5<small>°C</small></div>
          <div class="tgt">Target <b id="lr-target">22.0°</b> · floor heating</div>
          <div class="steppers">
            <button class="step" data-clim="-0.5">−</button>
            <button class="step" data-clim="0.5">+</button>
            <span style="width:10px"></span>
            <button class="mchip on">Auto</button><button class="mchip">Heat</button><button class="mchip">Eco</button><button class="mchip">Off</button>
          </div>
        </div>
        <div class="card" id="media-card">
          <div class="label">Media</div>
          <div class="media">
            <div class="art"></div>
            <div>
              <div class="tt">Ryuichi Sakamoto — async</div>
              <div class="ar" id="media-state">Living room speakers · paused</div>
              <div class="transport">
                <button data-med="prev">◁</button>
                <button data-med="play" id="playbtn">▷</button>
                <button data-med="next">▷|</button>
                <span>3:12 / 5:46</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid g3">
      <div class="card" id="vac-card">
        <div class="label">Vacuum</div>
        <div class="rowline">
          <div><div class="st" id="vac-state">Docked · charged</div>
          <div class="sub" id="vac-sub">Last clean 14:10 · 42 m²</div></div>
        </div>
        <button class="act" id="vac-btn">Clean living room</button>
      </div>
      <div class="card">
        <div class="label">Terrace door</div>
        <div class="rowline">
          <div><div class="st"><i class="dot on"></i>&nbsp; Closed</div>
          <div class="sub">Since 18:52</div></div>
        </div>
      </div>
      <div class="card">
        <div class="label">Blinds</div>
        <div class="rowline">
          <div><div class="st" id="blind-state">Lowered 80%</div>
          <div class="sub">Sunset automation</div></div>
          <button class="toggle on" id="blind-tog"><i></i></button>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ VIEW: MASTER BEDROOM ============ -->
  <section class="view" id="v-master">
    <div class="dash-head planks">
      <div class="dh-row">
        <div>
          <div class="dh-kanji">主 寝 室</div>
          <div class="dh-title">Master bedroom</div>
          <div class="dh-sub">All quiet · Wake at 06:45</div>
        </div>
        <div class="dh-clock">
          <div class="dh-time">20.4°</div>
          <div class="dh-wx">Humidity <b>48%</b> · Window <b>closed</b></div>
        </div>
      </div>
    </div>

    <div class="grid g2">
      <div class="card">
        <div class="label">Lights</div>
        <div class="light-row">
          <div class="light"><span class="nm">Ceiling</span>
            <input type="range" min="0" max="100" value="0"><span class="pct">off</span></div>
          <div class="light"><span class="nm">Bedside · his</span>
            <input type="range" min="0" max="100" value="0"><span class="pct">off</span></div>
          <div class="light"><span class="nm">Bedside · hers</span>
            <input type="range" min="0" max="100" value="0"><span class="pct">off</span></div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="card climate">
          <div class="label">Climate · night setback</div>
          <div class="big">20.4<small>°C</small></div>
          <div class="tgt">Target <b id="mb-target">19.5°</b> from 22:00</div>
          <div class="steppers">
            <button class="step" data-mbclim="-0.5">−</button>
            <button class="step" data-mbclim="0.5">+</button>
          </div>
        </div>
        <div class="card">
          <div class="label">En-suite bathroom</div>
          <div class="rowline">
            <div><div class="st">Floor heating · comfort</div>
            <div class="sub">Towel rail warms 06:15–07:30</div></div>
            <button class="toggle on"><i></i></button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid g3">
      <div class="card">
        <div class="label">Blinds</div>
        <div class="rowline">
          <div><div class="st">Closed</div><div class="sub">Opens with wake routine</div></div>
          <button class="toggle on"><i></i></button>
        </div>
      </div>
      <div class="card">
        <div class="label">Wake routine</div>
        <div class="rowline">
          <div><div class="st">06:45 weekdays</div><div class="sub">Light fade-in · 20 min</div></div>
          <button class="toggle on"><i></i></button>
        </div>
      </div>
      <div class="card">
        <div class="label">Do not disturb</div>
        <div class="rowline">
          <div><div class="st" id="dnd-state">Off</div><div class="sub">Silences doorbell &amp; announcements</div></div>
          <button class="toggle" id="dnd-tog"><i></i></button>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ VIEW: KIDS ROOMS ============ -->
  <section class="view" id="v-kids">
    <div class="dash-head planks">
      <div class="dh-row">
        <div>
          <div class="dh-kanji">子 供 部 屋</div>
          <div class="dh-title">Kids' rooms</div>
          <div class="dh-sub">Both windows closed · quiet hours from 20:30</div>
        </div>
        <div class="dh-clock">
          <div class="dh-time" id="clock4">--:--</div>
          <div class="dh-wx">Bedtime <b>20:30</b> · lights fade 15 min</div>
        </div>
      </div>
    </div>
    <div class="grid g2">
      <div class="card person a-moss climate">
        <div class="vhead"><div class="ttl"><span class="k">森</span><span class="label">Olaf</span></div><span class="pill">Awake</span></div>
        <div class="big">20.4<small>°C</small></div>
        <div class="tgt">Target <b id="ol-target">20.0°</b> · humidity 46%</div>
        <div class="steppers">
          <button class="step" data-kid="olaf" data-d="-0.5">−</button>
          <button class="step" data-kid="olaf" data-d="0.5">+</button>
        </div>
        <div class="vrow" style="margin-top:14px"><div class="nm">Ceiling light<em>Warm 2700K</em></div><button class="toggle" id="ol-ceil"><i></i></button></div>
        <div class="vrow"><div class="nm">Night light<em>Moss · 8%, off at 06:30</em></div><button class="toggle on" id="ol-night"><i></i></button></div>
        <div class="vrow"><div class="nm">Desk lamp<em>Off</em></div><button class="toggle" id="ol-desk"><i></i></button></div>
      </div>
      <div class="card person a-mizu climate">
        <div class="vhead"><div class="ttl"><span class="k">水</span><span class="label">Zoja</span></div><span class="pill">Awake</span></div>
        <div class="big">20.1<small>°C</small></div>
        <div class="tgt">Target <b id="zo-target">20.0°</b> · humidity 44%</div>
        <div class="steppers">
          <button class="step" data-kid="zoja" data-d="-0.5">−</button>
          <button class="step" data-kid="zoja" data-d="0.5">+</button>
        </div>
        <div class="vrow" style="margin-top:14px"><div class="nm">Ceiling light<em>Warm 2700K</em></div><button class="toggle" id="zo-ceil"><i></i></button></div>
        <div class="vrow"><div class="nm">Night light<em>Mizu · 8%, off at 06:30</em></div><button class="toggle on" id="zo-night"><i></i></button></div>
        <div class="vrow"><div class="nm">Reading lamp<em>Off</em></div><button class="toggle" id="zo-desk"><i></i></button></div>
      </div>
    </div>
  </section>

  <!-- ============ VIEW: GARDEN ============ -->
  <section class="view" id="v-garden">
    <div class="dash-head planks">
      <div class="dh-row">
        <div>
          <div class="dh-kanji">庭 と 湯</div>
          <div class="dh-title">Garden</div>
          <div class="dh-sub">Outside 18.9° · Soil 41% · Wind 6 km/h · 4 mm rain last 7 days</div>
        </div>
        <div class="dh-clock">
          <div class="dh-time" id="clock3">--:--</div>
          <div class="dh-wx">Sunset <b>20:14</b> · Rain <b>14 mm</b> overnight</div>
        </div>
      </div>
    </div>

    <!-- ══════════════════ 湯 · ONSEN ══════════════════ -->
    <div class="sect major"><span class="k">湯</span><h3>Onsen</h3></div>

    <div class="grid g2">

      <!-- ── SAUNA · open arc, dry heat ── -->
      <div class="card vessel a-oak" id="sauna-card">
        <div class="vhead">
          <div class="ttl"><span class="k">蒸</span><span class="label">Sauna</span></div>
          <span class="pill" id="sauna-pill">Idle</span>
        </div>
        <div class="gwrap">
          <button class="gbtn" data-sauna="-5">−</button>
          <div class="gauge arc" id="sauna-gauge">
            <svg viewBox="0 0 160 160">
              <circle class="gtrack" cx="80" cy="80" r="70" stroke-dasharray="329.9 439.8"/>
              <circle class="gfill" id="sauna-fill" cx="80" cy="80" r="70" stroke-dasharray="0 439.8"/>
              <circle class="ghandle" id="sauna-handle" cx="150" cy="80" r="5"/>
            </svg>
            <div class="gcenter">
              <div class="gnum"><span id="sauna-temp">64</span><small>°C</small></div>
              <div class="gtgt">TARGET <b id="sauna-target">85</b>°</div>
            </div>
          </div>
          <button class="gbtn" data-sauna="5">+</button>
        </div>
        <div class="geta" id="sauna-eta">Cold · 20 min to heat</div>
        <div class="vrow">
          <div class="nm">Heating<em id="sauna-runtime">Last session yesterday · 21:10 · 48 min</em></div>
          <button class="toggle" id="sauna-tog"><i></i></button>
        </div>
        <div class="vrow">
          <div class="nm">Session length<em>Heater cuts out after</em></div>
          <div class="steppers" style="margin-top:0">
            <span class="mchip" data-slen="60">60m</span>
            <span class="mchip on" data-slen="90">90m</span>
            <span class="mchip" data-slen="120">120m</span>
          </div>
        </div>
        <div class="cost">
          <div class="c"><div class="l">September</div><div class="n" id="sauna-cm">214<span>zł</span></div></div>
          <div class="c"><div class="l">Year to date</div><div class="n" id="sauna-cy">1 840<span>zł</span></div></div>
          <div class="spark" id="sauna-spark"></div>
        </div>
      </div>

      <!-- ── HOT TUB · closed ring, held water ── -->
      <div class="card vessel a-mizu veined" id="tub-card">
        <div class="vhead">
          <div class="ttl"><span class="k">湯</span><span class="label">Hot tub</span></div>
          <span class="pill live" id="tub-pill">Holding</span>
        </div>
        <div class="gwrap">
          <button class="gbtn" data-tub="-0.5">−</button>
          <div class="gauge ring" id="tub-gauge">
            <svg viewBox="0 0 160 160">
              <circle class="gtrack" cx="80" cy="80" r="70"/>
              <circle class="gfill" id="tub-fill" cx="80" cy="80" r="70" stroke-dasharray="0 439.8"/>
              <circle class="ghandle" id="tub-handle" cx="150" cy="80" r="5"/>
            </svg>
            <div class="gcenter">
              <div class="gnum"><span id="tub-temp">38.5</span><small>°C</small></div>
              <div class="gtgt">TARGET <b id="tub-target">38.5</b>°</div>
            </div>
          </div>
          <button class="gbtn" data-tub="0.5">+</button>
        </div>
        <div class="geta" id="tub-eta">At temperature</div>
        <div class="vrow">
          <div class="nm">Heater<em id="tub-heat-st">Holding 38.5° · 0.4 kW</em></div>
          <button class="toggle on" id="tub-heat"><i></i></button>
        </div>
        <div class="vrow">
          <div class="nm">Pump &amp; bubbles<em id="tub-jet-st">Circulation only</em></div>
          <div class="chiprow">
            <span class="mchip on" id="tub-pump">Pump</span>
            <span class="mchip" id="tub-bub">Bubbles</span>
          </div>
        </div>
        <div class="cost">
          <div class="c"><div class="l">September</div><div class="n" id="tub-cm">386<span>zł</span></div></div>
          <div class="c"><div class="l">Year to date</div><div class="n" id="tub-cy">4 120<span>zł</span></div></div>
          <div class="spark" id="tub-spark"></div>
        </div>
      </div>
    </div>

    <!-- ── mirrored second row: sauna ambience | hot tub schedule ── -->
    <div class="grid g2">

      <div class="card a-oak" id="sauna-amb">
        <div class="vhead">
          <div class="ttl"><span class="k">灯</span><span class="label">Sauna · light &amp; sound</span></div>
        </div>
        <div class="vrow" style="margin-top:4px">
          <div class="nm">Vestibule light<em>Warm white · 40%</em></div>
          <button class="toggle on" id="sa-vest"><i></i></button>
        </div>
        <div class="vrow">
          <div class="nm">Bench LED<em id="sa-led-st">Ember · solid</em></div>
          <button class="toggle on" id="sa-led"><i></i></button>
        </div>
        <div class="swatches" id="sa-sw" style="margin-top:12px">
          <button class="sw on" data-col="Ember" style="background:#C0754A;color:#C0754A"></button>
          <button class="sw" data-col="Oak" style="background:#C89F6E;color:#C89F6E"></button>
          <button class="sw" data-col="Washi" style="background:#EFE7D7;color:#EFE7D7"></button>
          <button class="sw" data-col="Moss" style="background:#8B9678;color:#8B9678"></button>
          <button class="sw" data-col="Mizu" style="background:#7E93A0;color:#7E93A0"></button>
          <button class="sw" data-col="Deep" style="background:#4A3A6B;color:#4A3A6B"></button>
          <button class="sw" data-col="Fade" style="background:linear-gradient(135deg,#C0754A,#4A3A6B)"></button>
        </div>
        <div class="media" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--seam)">
          <div class="art"></div>
          <div style="flex:1;min-width:0">
            <div class="tt" id="sa-track">Shakuhachi — Evening Rain</div>
            <div class="ar" id="sa-src">Media server · local library</div>
            <div class="transport">
              <button id="sa-prev">◁◁</button>
              <button id="sa-play">▷</button>
              <button id="sa-next">▷▷</button>
              <span id="sa-vol">28%</span>
            </div>
          </div>
        </div>
        <div class="plist" id="sa-plists">
          <span class="mchip on" data-pl="Onsen">Onsen</span>
          <span class="mchip" data-pl="Shakuhachi">Shakuhachi</span>
          <span class="mchip" data-pl="Rain">Rain</span>
          <span class="mchip" data-pl="Koto">Koto</span>
          <span class="mchip" data-pl="Ambient jazz">Ambient jazz</span>
        </div>
        <div class="spk" id="sa-spk">
          <span class="label" style="margin-right:2px">Cast to</span>
          <span class="mchip on" data-spk="Sauna">Sauna</span>
          <span class="mchip" data-spk="Terrace">Terrace</span>
          <span class="mchip" data-spk="Pool">Pool</span>
          <span class="mchip" data-spk="Onsen group">Onsen group</span>
        </div>
      </div>

      <div class="card a-mizu" id="tub-sched">
        <div class="vhead">
          <div class="ttl"><span class="k">暦</span><span class="label">Hot tub · schedule &amp; service</span></div>
          <div style="display:flex;align-items:center;gap:9px">
            <span class="pill ok" id="tub-auto-pill">Auto on</span>
            <button class="toggle on" id="tub-auto"><i></i></button>
          </div>
        </div>
        <div class="sched" id="tub-sched-list" style="margin-top:10px">
          <div class="srow"><div class="day">Mon–Thu</div><div class="tm">17:30</div><div class="dur">Heat to 38.5° by 19:00</div><span class="vd run">Auto</span></div>
          <div class="srow"><div class="day">Fri</div><div class="tm">16:00</div><div class="dur">Heat to 39.0° · bubbles 20:00</div><span class="vd run">Auto</span></div>
          <div class="srow"><div class="day">Sat</div><div class="tm">14:00</div><div class="dur">Heat to 39.0° · hold to 23:00</div><span class="vd run">Auto</span></div>
          <div class="srow"><div class="day">Sun</div><div class="tm">14:00</div><div class="dur">Heat to 38.0° · filter cycle 22:00</div><span class="vd run">Auto</span></div>
        </div>
        <div class="svc">
          <div class="svcitem"><div class="l">Chloride</div><div class="d">in 9 days</div><div class="w">24 Sep · every 4 weeks</div></div>
          <div class="svcitem due"><div class="l">Filter change</div><div class="d">in 2 days</div><div class="w">17 Sep · every 8 weeks</div></div>
          <div class="svcitem"><div class="l">Filter rinse</div><div class="d">in 4 days</div><div class="w">19 Sep · weekly</div></div>
          <div class="svcitem"><div class="l">Water change</div><div class="d">in 6 weeks</div><div class="w">27 Oct · every 6 months</div></div>
        </div>
      </div>
    </div>

    <!-- ── pool + onsen lighting ── -->
    <div class="grid g3">
      <div class="card span2 a-mizu veined" id="pool-card">
        <div class="vhead">
          <div class="ttl"><span class="k">泳</span><span class="label">Pool</span></div>
          <div style="display:flex;align-items:center;gap:9px">
            <span class="pill live" id="pool-pill">Filtering</span>
            <button class="toggle on" id="pool-auto"><i></i></button>
          </div>
        </div>
        <div class="readings">
          <div class="rd">
            <div class="l">Water</div>
            <div class="n">26.1<small>°C</small></div>
            <div class="band"><span class="safe" style="left:40%;right:15%"></span><span class="pin" style="left:57%"></span></div>
            <div class="note">In band · 24–28°</div>
          </div>
          <div class="rd">
            <div class="l">pH</div>
            <div class="n">7.2</div>
            <div class="band"><span class="safe" style="left:35%;right:30%"></span><span class="pin" style="left:48%"></span></div>
            <div class="note">In band · 7.0–7.4</div>
          </div>
          <div class="rd">
            <div class="l">Free chlorine</div>
            <div class="n">0.8<small>ppm</small></div>
            <div class="band"><span class="safe" style="left:30%;right:22%"></span><span class="pin" style="left:26%"></span></div>
            <div class="note warn">Low · dose 1–3 ppm</div>
          </div>
          <div class="rd">
            <div class="l">Filter pressure</div>
            <div class="n">0.9<small>bar</small></div>
            <div class="band"><span class="safe" style="left:20%;right:35%"></span><span class="pin" style="left:44%"></span></div>
            <div class="note">Normal · max 1.4</div>
          </div>
        </div>
        <div class="vrow" style="margin-top:16px">
          <div class="nm">Filtration<em id="pool-filt-st">Running · 09:00–13:00 and 18:00–21:00 · 7 h/day</em></div>
          <button class="toggle on" id="pool-filt"><i></i></button>
        </div>
        <div class="vrow">
          <div class="nm">Cleaning robot<em id="pool-bot-st">Docked · last run yesterday 22:00 · 2 h 10 min</em></div>
          <button class="act ghost" id="pool-bot-btn" style="margin-top:0">Clean now</button>
        </div>
        <div class="svc three">
          <div class="svcitem"><div class="l">Chloride dose</div><div class="d">tomorrow</div><div class="w">16 Sep · every 2 weeks</div></div>
          <div class="svcitem"><div class="l">Sand filter</div><div class="d">in 5 weeks</div><div class="w">20 Oct · every 6 months</div></div>
          <div class="svcitem due"><div class="l">Robot brushes</div><div class="d">overdue 3 d</div><div class="w">12 Sep · every 200 h</div></div>
        </div>
      </div>

      <div class="card a-oak" id="onsen-lights">
        <div class="vhead">
          <div class="ttl"><span class="k">行灯</span><span class="label">Onsen lighting</span></div>
        </div>
        <div class="vrow" style="margin-top:4px">
          <div class="nm">Path lanterns<em>Dusk → 23:00</em></div>
          <button class="toggle on" id="ol-path"><i></i></button>
        </div>
        <div class="vrow">
          <div class="nm">Deck wash<em>Grazing light, 25%</em></div>
          <button class="toggle" id="ol-deck"><i></i></button>
        </div>
        <div class="vrow">
          <div class="nm">Pool underwater<em>Mizu · static</em></div>
          <button class="toggle" id="ol-pool"><i></i></button>
        </div>
        <div class="vrow">
          <div class="nm">Hot tub rim<em>Ember · 15%</em></div>
          <button class="toggle on" id="ol-rim"><i></i></button>
        </div>
        <div class="vrow">
          <div class="nm">Sauna exterior<em>Door and step</em></div>
          <button class="toggle" id="ol-sauna"><i></i></button>
        </div>
        <button class="act ghost" id="ol-all" style="width:100%">All onsen lights off</button>
      </div>
    </div>

    <!-- ══════════════════ 庭 · MAINTENANCE ══════════════════ -->
    <div class="sect major"><span class="k">庭</span><h3>Maintenance</h3></div>

    <div class="grid g3">
      <div class="card span2 a-moss" id="spr-card">
        <div class="vhead">
          <div class="ttl"><span class="k">撒水</span><span class="label">Sprinklers</span></div>
          <div style="display:flex;align-items:center;gap:9px">
            <span class="pill" id="spr-pill">Schedule on</span>
            <button class="toggle on" id="spr-auto"><i></i></button>
          </div>
        </div>
        <div class="forecast">
          <div class="fverdict skip" id="spr-verdict">
            <div class="k" id="spr-verdict-k">雨</div>
            <div class="vv" id="spr-verdict-t">Mostly skipping</div>
          </div>
          <div style="flex:1;min-width:0">
            <div class="ftext" id="spr-forecast">Tomorrow's 05:30 cycle will largely stand down. Fourteen millimetres of rain is forecast between midnight and four, and soil sits at 41% — above the 35% threshold for Forest, Border and Terrace. Bamboo bed reads 28% under the eaves where the rain will not reach it, so that zone alone will run, for six minutes.</div>
            <div class="fmeta" id="spr-fmeta">AI task · evaluated 06:12 · next evaluation 04:00</div>
          </div>
        </div>
        <button class="act ghost" id="spr-run" style="width:100%">Override — run full cycle now · 25 min</button>
      </div>

      <div class="card a-moss" id="spr-sched">
        <div class="vhead">
          <div class="ttl"><span class="k">暦</span><span class="label">Next cycle</span></div>
          <span class="pill" id="spr-next">Wed 05:30</span>
        </div>
        <div class="sched" id="spr-sched-list" style="margin-top:10px">
          <div class="srow" data-zrow="forest"><div class="day">Wed</div><div class="tm">05:30</div><div class="dur">Forest · 8 min</div><span class="vd skip">Skip</span></div>
          <div class="srow" data-zrow="border"><div class="day">Wed</div><div class="tm">05:42</div><div class="dur">Border · 6 min</div><span class="vd skip">Skip</span></div>
          <div class="srow" data-zrow="terrace"><div class="day">Wed</div><div class="tm">05:52</div><div class="dur">Terrace · 5 min</div><span class="vd skip">Skip</span></div>
          <div class="srow" data-zrow="bamboo"><div class="day">Wed</div><div class="tm">06:00</div><div class="dur">Bamboo bed · 6 min</div><span class="vd run">Run</span></div>
          <div class="srow"><div class="day">Sat</div><div class="tm">05:30</div><div class="dur">Full cycle · 25 min</div><span class="vd run">Run</span></div>
        </div>
      </div>
    </div>

    <div class="grid g4" id="zone-grid">
      <button class="card zone a-moss" data-zone="forest">
        <div class="ztop"><span class="zk">森</span><span class="tog-ind"><i></i></span></div>
        <div class="zname">Forest</div>
        <div class="zmeta">Soil 44% · 8 min · Sun 05:30</div>
      </button>
      <button class="card zone a-moss" data-zone="border">
        <div class="ztop"><span class="zk">縁</span><span class="tog-ind"><i></i></span></div>
        <div class="zname">Border</div>
        <div class="zmeta">Soil 39% · 6 min · Sun 05:42</div>
      </button>
      <button class="card zone a-moss" data-zone="terrace">
        <div class="ztop"><span class="zk">縁側</span><span class="tog-ind"><i></i></span></div>
        <div class="zname">Terrace</div>
        <div class="zmeta">Soil 37% · 5 min · Sun 05:52</div>
      </button>
      <button class="card zone a-moss" data-zone="bamboo">
        <div class="ztop"><span class="zk">竹</span><span class="tog-ind"><i></i></span></div>
        <div class="zname">Bamboo bed</div>
        <div class="zmeta">Soil 28% · 6 min · Sun 06:00</div>
      </button>
    </div>

    <div class="grid">
      <div class="card a-mizu">
        <div class="vhead">
          <div class="ttl"><span class="k">歴</span><span class="label">Zone history · 14 days</span></div>
          <span class="pill">Bar width = minutes run</span>
        </div>
        <div class="tl" id="zone-tl"></div>
        <div class="tlaxis"><span>1 Sep</span><span>8 Sep</span><span>Today</span></div>
      </div>
    </div>

    <div class="grid g2">
      <div class="card a-moss" id="mow-b-card">
        <div class="vhead">
          <div class="ttl"><span class="k">刈</span><span class="label">Landroid · back garden</span></div>
          <span class="errchip clear" id="mb-err">No errors</span>
        </div>
        <div class="mow">
          <div class="mring">
            <svg viewBox="0 0 80 80"><circle class="t" cx="40" cy="40" r="33"/><circle class="f" id="mb-ring" cx="40" cy="40" r="33" stroke-dasharray="207.3 207.3" stroke-dashoffset="0"/></svg>
            <div class="c"><span id="mb-bat">100</span><span>%</span></div>
          </div>
          <div class="mbody">
            <div class="mstat" id="mow-b-v">Docked</div>
            <div class="mlist">
              <div class="mline"><span>Next run</span><b id="mb-next">Sat 09:00</b></div>
              <div class="mline"><span>Blade age</span><b>112 h · 56%</b></div>
              <div class="mline"><span>Mown this week</span><b>2 140 m²</b></div>
            </div>
            <div class="wear"><i style="width:56%"></i></div>
          </div>
        </div>
        <button class="act ghost" id="mow-b-btn" style="width:100%">Mow now</button>
      </div>

      <div class="card a-moss" id="mow-f-card">
        <div class="vhead">
          <div class="ttl"><span class="k">刈</span><span class="label">Landroid · front garden</span></div>
          <span class="errchip err" id="mf-err">E1 · blade jam</span>
        </div>
        <div class="mow">
          <div class="mring">
            <svg viewBox="0 0 80 80"><circle class="t" cx="40" cy="40" r="33"/><circle class="f" id="mf-ring" cx="40" cy="40" r="33" stroke-dasharray="207.3 207.3" stroke-dashoffset="70"/></svg>
            <div class="c"><span id="mf-bat">66</span><span>%</span></div>
          </div>
          <div class="mbody">
            <div class="mstat" id="mow-f-v">Stopped in garden</div>
            <div class="mlist">
              <div class="mline"><span>Next run</span><b id="mf-next">Held — clear fault</b></div>
              <div class="mline"><span>Blade age</span><b>186 h · 93%</b></div>
              <div class="mline"><span>Mown this week</span><b>780 m²</b></div>
            </div>
            <div class="wear"><i class="hot" style="width:93%"></i></div>
          </div>
        </div>
        <button class="act" id="mow-f-btn" style="width:100%">Clear fault &amp; resume</button>
      </div>
    </div>
  </section>

  <div class="toast" id="toast"><span class="k">墨</span><span id="toast-msg"></span></div>
</div>

<script>
(function(){
  var $=function(s){return document.querySelector(s)};
  var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};

  /* ---------- clock ---------- */
  function pad(n){return (n<10?"0":"")+n}
  function tick(){
    var d=new Date();
    var t=pad(d.getHours())+":"+pad(d.getMinutes());
    ["clock","clock2","clock3","clock4"].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=t});
    var days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    $("#dateline").textContent=days[d.getDay()]+" "+d.getDate()+"."+(d.getMonth()+1)+".";
    var h=d.getHours();
    $("#greet").textContent = h<5?"Good night":h<11?"Good morning":h<17?"Good afternoon":h<22?"Good evening":"Good night";
  }
  tick(); setInterval(tick,1000);

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg){
    $("#toast-msg").textContent=msg;
    $("#toast").classList.add("show");
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){$("#toast").classList.remove("show")},2200);
  }

  /* ---------- view switching ---------- */
  function showView(name){
    $$(".view").forEach(function(v){v.classList.remove("on")});
    var el=document.getElementById("v-"+name);
    if(el)el.classList.add("on");
    $$(".tab").forEach(function(t){t.classList.toggle("active",t.dataset.view===name)});
    window.scrollTo({top:0,behavior:"smooth"});
  }
  $$(".tab").forEach(function(t){t.addEventListener("click",function(){showView(t.dataset.view)})});
  $$("[data-goto]").forEach(function(c){
    c.addEventListener("click",function(){
      var g=c.dataset.goto;
      if(g==="none"){toast("This room view isn't in the mock yet — same template as Living room.");return}
      showView(g);
    });
  });

  /* ---------- sliders ---------- */
  function paintSlider(inp){
    var v=inp.value;
    inp.style.setProperty("--v",v+"%");
    var pct=inp.parentElement.querySelector(".pct");
    if(pct)pct.textContent=(v>0)?(v+"%"):"off";
  }
  function countLights(){
    var n=0;
    $$("#lr-lights input").forEach(function(i){if(+i.value>0)n++});
    var extra=2; /* kitchen bench + terrace strings, static in mock */
    $("#lights-count").textContent=n+extra;
    $("#lr-devs").innerHTML = n>0
      ? '<i class="dot warm"></i> '+n+(n===1?' light':' lights')+' · TV on'
      : '<i class="dot"></i> Lights off · TV on';
  }
  $$("input[type=range]").forEach(function(inp){
    paintSlider(inp);
    inp.addEventListener("input",function(){paintSlider(inp);countLights()});
  });

  /* ---------- scenes ---------- */
  var sceneLevels={
    evening:[35,60,20,0],
    cinema:[5,0,12,0],
    sauna:[20,40,10,0],
    away:[0,0,0,0],
    goodnight:[0,0,0,0]
  };
  var sceneNames={evening:"Evening",cinema:"Cinema",sauna:"Sauna night",away:"Away",goodnight:"Goodnight"};
  $$("#scenebar .scene").forEach(function(btn){
    btn.addEventListener("click",function(){
      $$("#scenebar .scene").forEach(function(b){b.classList.remove("active")});
      btn.classList.add("active");
      var lv=sceneLevels[btn.dataset.scene];
      $$("#lr-lights input").forEach(function(inp,i){inp.value=lv[i];paintSlider(inp)});
      countLights();
      $("#lr-sub").textContent=sceneNames[btn.dataset.scene]+" scene · Terrace door closed";
      toast("Scene: "+sceneNames[btn.dataset.scene]);
    });
  });

  /* ---------- energy jitter ---------- */
  function jitter(){
    var s=6.2+(Math.random()-0.5)*0.5;
    var h=2.8+(Math.random()-0.5)*0.4;
    var g=Math.max(0,s-h);
    $("#en-solar").textContent=s.toFixed(1);
    $("#en-house").textContent=h.toFixed(1);
    $("#en-grid").textContent=g.toFixed(1);
    $("#solar-hdr").textContent=s.toFixed(1)+" kW";
  }
  setInterval(jitter,3000);

  /* ---------- generic toggles ---------- */
  $$(".toggle").forEach(function(t){
    t.addEventListener("click",function(e){
      e.stopPropagation();
      t.classList.toggle("on");
    });
  });
  $("#blind-tog").addEventListener("click",function(){
    $("#blind-state").textContent=this.classList.contains("on")?"Lowered 80%":"Raised";
  });
  $("#dnd-tog").addEventListener("click",function(){
    $("#dnd-state").textContent=this.classList.contains("on")?"On until 06:45":"Off";
  });

  /* ---------- media ---------- */
  var playing=false;
  $("#playbtn").addEventListener("click",function(){
    playing=!playing;
    this.textContent=playing?"❚❚":"▷";
    $("#media-state").textContent="Living room speakers · "+(playing?"playing · 24%":"paused");
    $("#media-card").classList.toggle("veined",playing);
  });

  /* ---------- vacuum ---------- */
  var vacTimer=null;
  $("#vac-btn").addEventListener("click",function(){
    var card=$("#vac-card");
    if(vacTimer){ /* stop */
      clearInterval(vacTimer);vacTimer=null;
      card.classList.remove("veined");
      $("#vac-state").textContent="Returning to dock";
      $("#vac-btn").textContent="Clean living room";
      setTimeout(function(){$("#vac-state").textContent="Docked · charged";$("#vac-sub").textContent="Cleaned just now"},2500);
      return;
    }
    card.classList.add("veined");
    $("#vac-state").textContent="Cleaning · living room";
    $("#vac-btn").textContent="Send home";
    var area=0;
    vacTimer=setInterval(function(){
      area+=1;
      $("#vac-sub").textContent="In progress · "+area+" m² done";
    },900);
  });

  /* ---------- dryer countdown (ambient life) ---------- */
  var dry=34*60;
  setInterval(function(){
    dry=Math.max(0,dry-60);
    $("#dryer-left").textContent=Math.floor(dry/60)+":"+pad(dry%60===0?0:dry%60).slice(-2);
  },60000);

  /* ---------- climate steppers ---------- */
  var lrT=22.0, mbT=19.5;
  $$("[data-clim]").forEach(function(b){b.addEventListener("click",function(){
    lrT=Math.min(26,Math.max(16,lrT+parseFloat(b.dataset.clim)));
    $("#lr-target").textContent=lrT.toFixed(1)+"°";
  })});
  $$("[data-mbclim]").forEach(function(b){b.addEventListener("click",function(){
    mbT=Math.min(24,Math.max(15,mbT+parseFloat(b.dataset.mbclim)));
    $("#mb-target").textContent=mbT.toFixed(1)+"°";
  })});

  /* mchips exclusive */
  $$(".steppers .mchip").forEach(function(c){
    c.addEventListener("click",function(){
      c.parentElement.querySelectorAll(".mchip").forEach(function(x){x.classList.remove("on")});
      c.classList.add("on");
    });
  });


  /* ==========================================================
     GARDEN — Onsen & Maintenance
     Kintsugi contract: .veined is added ONLY while a device is
     actually heating, pumping, flowing or cutting.
     ========================================================== */
  var C_FULL = 439.82, C_ARC = 329.87;

  function seam(el, on){ if(el) el.classList.toggle("veined", !!on); }

  /* ---------- circular gauges ---------- */
  function Gauge(opts){
    var box=$(opts.box), fill=$(opts.fill), handle=$(opts.handle);
    var span = opts.arc ? 270 : 360, len = opts.arc ? C_ARC : C_FULL;
    var api={
      min:opts.min, max:opts.max, step:opts.step,
      paint:function(cur,tgt){
        var fc=Math.max(0,Math.min(1,(cur-api.min)/(api.max-api.min)));
        var ft=Math.max(0,Math.min(1,(tgt-api.min)/(api.max-api.min)));
        fill.setAttribute("stroke-dasharray",(fc*len).toFixed(1)+" "+C_FULL);
        handle.setAttribute("transform","rotate("+(ft*span).toFixed(1)+" 80 80)");
      }
    };
    function fromPointer(e){
      var r=box.getBoundingClientRect();
      var dx=(e.clientX!=null?e.clientX:e.touches[0].clientX)-(r.left+r.width/2);
      var dy=(e.clientY!=null?e.clientY:e.touches[0].clientY)-(r.top+r.height/2);
      var scr=Math.atan2(dy,dx)*180/Math.PI;
      var local=((scr-(opts.arc?135:-90))%360+360)%360;
      if(local>span) local = (local-span < 360-local) ? span : 0;
      var v=api.min+(local/span)*(api.max-api.min);
      return Math.round(v/api.step)*api.step;
    }
    var dragging=false;
    box.addEventListener("pointerdown",function(e){dragging=true;box.setPointerCapture(e.pointerId);opts.onset(fromPointer(e))});
    box.addEventListener("pointermove",function(e){if(dragging)opts.onset(fromPointer(e))});
    box.addEventListener("pointerup",function(){dragging=false});
    box.addEventListener("pointercancel",function(){dragging=false});
    return api;
  }

  /* ---------- cost sparklines ---------- */
  function spark(id,vals){
    var el=$(id); if(!el) return;
    var mx=Math.max.apply(null,vals), h="";
    for(var i=0;i<vals.length;i++){
      h+='<i class="'+(i===vals.length-1?"cur":"")+'" style="height:'+Math.max(6,Math.round(vals[i]/mx*100))+'%"></i>';
    }
    el.innerHTML=h;
  }
  spark("#sauna-spark",[268,241,196,142,98,71,64,69,214,0,0,0].slice(0,9));
  spark("#tub-spark",[512,470,398,321,264,206,188,198,386,0,0,0].slice(0,9));

  /* ---------- SAUNA ---------- */
  var sTemp=64, sTarget=85, sTimer=null, sElapsed=0, sLen=90;
  var sGauge=Gauge({box:"#sauna-gauge",fill:"#sauna-fill",handle:"#sauna-handle",
    min:20,max:110,step:1,arc:true,onset:function(v){sTarget=Math.max(40,Math.min(110,v));saunaPaint()}});

  function saunaPaint(){
    $("#sauna-temp").textContent=Math.round(sTemp);
    $("#sauna-target").textContent=Math.round(sTarget);
    sGauge.paint(sTemp,sTarget);
    var hb=$("#home-sauna-bar");
    if(hb) hb.style.width=Math.min(100,Math.round((sTemp-20)/(sTarget-20)*100))+"%";
  }
  function saunaIdleText(){
    $("#sauna-pill").textContent="Idle"; $("#sauna-pill").classList.remove("live");
    $("#sauna-eta").textContent = sTemp>40 ? "Cooling · "+Math.round(sTemp)+"°" : "Cold · 20 min to heat";
    $("#sauna-tog").classList.remove("on");
    seam($("#sauna-card"),false); seam($("#home-sauna"),false);
    var n=$("#sauna-note"); if(n) n.textContent="Sauna idle";
    var hv=$("#home-sauna-v"); if(hv) hv.innerHTML=Math.round(sTemp)+'<small>°C · idle</small>';
    var hs=$("#home-sauna-s"); if(hs) hs.textContent="Tap to open controls";
  }
  $$("[data-sauna]").forEach(function(b){
    b.addEventListener("click",function(){
      sTarget=Math.max(40,Math.min(110,sTarget+parseFloat(b.dataset.sauna)));
      saunaPaint();
      if(sTimer) $("#sauna-eta").textContent="Heating · ~"+Math.max(1,Math.round((sTarget-sTemp)/1.1))+" min";
    });
  });
  $$("[data-slen]").forEach(function(c){
    c.addEventListener("click",function(){
      $$("[data-slen]").forEach(function(x){x.classList.remove("on")});
      c.classList.add("on"); sLen=+c.dataset.slen;
      toast("Sauna session length "+sLen+" min");
    });
  });
  $("#sauna-tog").addEventListener("click",function(){
    if(sTimer){ clearInterval(sTimer); sTimer=null; sElapsed=0;
      $("#sauna-runtime").textContent="Last session today · "+$("#clock").textContent;
      saunaIdleText(); toast("Sauna off"); return;
    }
    seam($("#sauna-card"),true); seam($("#home-sauna"),true);
    $("#sauna-pill").textContent="Heating"; $("#sauna-pill").classList.add("live");
    var n=$("#sauna-note"); if(n) n.textContent="Sauna heating";
    toast("Sauna heating to "+Math.round(sTarget)+"° — ready in ~"+Math.max(1,Math.round((sTarget-sTemp)/1.1))+" min");
    sTimer=setInterval(function(){
      sElapsed+=1;
      if(sTemp<sTarget-0.2){
        sTemp=Math.min(sTarget,sTemp+0.4);
        $("#sauna-eta").textContent="Heating · ~"+Math.max(1,Math.round((sTarget-sTemp)/1.1))+" min";
        $("#sauna-runtime").textContent="Heating "+Math.floor(sElapsed/5)+" min · "+Math.round(sTarget-sTemp)+"° to go";
        var hv=$("#home-sauna-v"); if(hv) hv.innerHTML=Math.round(sTemp)+'<small>°C → '+Math.round(sTarget)+'°</small>';
        var hs=$("#home-sauna-s"); if(hs) hs.textContent="Heating";
      } else {
        sTemp=sTarget;
        $("#sauna-pill").textContent="Ready";
        $("#sauna-eta").textContent="Ready · auto-off in "+sLen+" min";
        $("#sauna-runtime").textContent="At temperature · session "+sLen+" min";
        var n2=$("#sauna-note"); if(n2) n2.textContent="Sauna ready";
        var hv2=$("#home-sauna-v"); if(hv2) hv2.innerHTML=Math.round(sTemp)+'<small>°C · ready</small>';
        var hs2=$("#home-sauna-s"); if(hs2) hs2.textContent="Ready — enjoy";
      }
      saunaPaint();
    },200);
  });
  saunaPaint(); saunaIdleText();

  /* ---------- SAUNA · light & sound ---------- */
  $("#sa-led").addEventListener("click",function(){
    $("#sa-led-st").textContent=this.classList.contains("on")?"Ember · solid":"Off";
  });
  $$("#sa-sw .sw").forEach(function(s){
    s.addEventListener("click",function(){
      $$("#sa-sw .sw").forEach(function(x){x.classList.remove("on")});
      s.classList.add("on");
      var c=s.dataset.col||"Fade";
      $("#sa-led-st").textContent=c+(c==="Fade"?" · slow cycle":" · solid");
      if(!$("#sa-led").classList.contains("on")) $("#sa-led").classList.add("on");
      toast("Bench LED — "+c);
    });
  });
  function exclusive(sel,attr,cb){
    $$(sel).forEach(function(c){
      c.addEventListener("click",function(){
        $$(sel).forEach(function(x){x.classList.remove("on")});
        c.classList.add("on"); cb(c.dataset[attr]);
      });
    });
  }
  exclusive("#sa-plists .mchip","pl",function(v){
    $("#sa-track").textContent = ({
      "Onsen":"Shakuhachi — Evening Rain","Shakuhachi":"Watazumi — Tadaima","Rain":"Rain on the cedar roof",
      "Koto":"Michio Miyagi — Haru no Umi","Ambient jazz":"Bonobo — Kiara"
    })[v];
    $("#sa-src").textContent="Media server · "+v+" playlist";
    toast("Playing "+v);
  });
  exclusive("#sa-spk .mchip","spk",function(v){ toast("Casting to "+v+" speaker"); });
  var saPlaying=false;
  $("#sa-play").addEventListener("click",function(){
    saPlaying=!saPlaying; this.textContent=saPlaying?"❚❚":"▷";
    toast(saPlaying?"Playing":"Paused");
  });

  /* ---------- HOT TUB ---------- */
  var tTemp=38.5, tTarget=38.5, tTimer=null;
  var tGauge=Gauge({box:"#tub-gauge",fill:"#tub-fill",handle:"#tub-handle",
    min:10,max:42,step:0.5,arc:false,onset:function(v){tTarget=Math.max(20,Math.min(40,v));tubPaint();tubEval()}});
  function tubPaint(){
    $("#tub-temp").textContent=tTemp.toFixed(1);
    $("#tub-target").textContent=tTarget.toFixed(1);
    tGauge.paint(tTemp,tTarget);
  }
  function tubEval(){
    var on=$("#tub-heat").classList.contains("on");
    var bub=$("#tub-bub").classList.contains("on");
    var pmp=$("#tub-pump").classList.contains("on");
    var heating = on && tTemp < tTarget-0.1;
    $("#tub-pill").textContent = !on?"Heater off" : heating?"Heating":"Holding";
    $("#tub-pill").classList.toggle("live", on);
    $("#tub-eta").textContent = !on ? "Heater off · drifting down"
      : heating ? "~"+Math.max(1,Math.round((tTarget-tTemp)*22))+" min to "+tTarget.toFixed(1)+"°"
      : "At temperature";
    $("#tub-heat-st").textContent = !on?"Off":(heating?"Heating · 3.0 kW":"Holding "+tTemp.toFixed(1)+"° · 0.4 kW");
    $("#tub-jet-st").textContent = bub?(pmp?"Bubbles and pump running":"Bubbles running"):(pmp?"Circulation only":"Idle");
    seam($("#tub-card"), on || bub);
  }
  $$("[data-tub]").forEach(function(b){
    b.addEventListener("click",function(){
      tTarget=Math.max(20,Math.min(40,tTarget+parseFloat(b.dataset.tub)));
      tubPaint(); tubEval(); startTub();
    });
  });
  function startTub(){
    if(tTimer) return;
    tTimer=setInterval(function(){
      var on=$("#tub-heat").classList.contains("on");
      if(on && tTemp<tTarget-0.05) tTemp=Math.min(tTarget,tTemp+0.1);
      else if(!on && tTemp>20) tTemp=Math.max(20,tTemp-0.05);
      else { clearInterval(tTimer); tTimer=null; }
      tubPaint(); tubEval();
    },400);
  }
  $("#tub-heat").addEventListener("click",function(){ tubEval(); startTub(); toast(this.classList.contains("on")?"Hot tub heater on":"Hot tub heater off"); });
  ["#tub-pump","#tub-bub"].forEach(function(id){
    $(id).addEventListener("click",function(){ this.classList.toggle("on"); tubEval(); });
  });
  $("#tub-auto").addEventListener("click",function(){
    var on=this.classList.contains("on");
    $("#tub-auto-pill").textContent=on?"Auto on":"Auto off";
    $("#tub-auto-pill").classList.toggle("ok",on);
    $$("#tub-sched-list .srow").forEach(function(r){
      r.classList.toggle("muted",!on);
      var v=r.querySelector(".vd");
      v.textContent=on?"Auto":"Paused"; v.classList.toggle("run",on);
    });
    toast(on?"Hot tub schedule resumed":"Hot tub schedule paused");
  });
  tubPaint(); tubEval();

  /* ---------- POOL ---------- */
  function poolEval(){
    var f=$("#pool-filt").classList.contains("on");
    $("#pool-pill").textContent=f?"Filtering":"Filter off";
    $("#pool-pill").classList.toggle("live",f);
    $("#pool-filt-st").textContent=f?"Running · 09:00–13:00 and 18:00–21:00 · 7 h/day":"Stopped · resumes 18:00";
    seam($("#pool-card"),f);
  }
  $("#pool-filt").addEventListener("click",function(){poolEval()});
  $("#pool-auto").addEventListener("click",function(){
    var on=this.classList.contains("on");
    toast(on?"Pool schedule resumed":"Pool schedule paused — manual control only");
  });
  var botTimer=null;
  $("#pool-bot-btn").addEventListener("click",function(){
    var b=this;
    if(botTimer){clearInterval(botTimer);botTimer=null;b.textContent="Clean now";
      $("#pool-bot-st").textContent="Returning to dock";return;}
    var m=0; b.textContent="Stop robot";
    botTimer=setInterval(function(){m++;$("#pool-bot-st").textContent="Cleaning · floor and walls · "+m+" min elapsed"},1000);
  });
  poolEval();

  /* ---------- ONSEN LIGHTING ---------- */
  $("#ol-all").addEventListener("click",function(){
    ["#ol-path","#ol-deck","#ol-pool","#ol-rim","#ol-sauna"].forEach(function(id){$(id).classList.remove("on")});
    toast("Onsen lighting off");
  });

  /* ---------- SPRINKLERS ---------- */
  var ZONES={forest:{n:"Forest",k:"森",m:8},border:{n:"Border",k:"縁",m:6},terrace:{n:"Terrace",k:"縁側",m:5},bamboo:{n:"Bamboo bed",k:"竹",m:6}};
  $("#spr-auto").addEventListener("click",function(){
    var on=this.classList.contains("on");
    $("#spr-pill").textContent=on?"Schedule on":"Schedule off";
    $("#spr-next").textContent=on?"Wed 05:30":"No runs";
    $$("#spr-sched-list .srow").forEach(function(r){
      r.classList.toggle("muted",!on);
      var v=r.querySelector(".vd");
      if(!on){v.textContent="Paused";v.classList.remove("run");v.classList.add("skip")}
      else{
        var z=r.dataset.zrow;
        var run = (z==="bamboo" || !z);
        v.textContent=run?"Run":"Skip";
        v.classList.toggle("run",run); v.classList.toggle("skip",!run);
      }
    });
    var fv=$("#spr-verdict");
    fv.classList.toggle("skip",on); fv.classList.toggle("run",false);
    $("#spr-verdict-k").textContent=on?"雨":"停";
    $("#spr-verdict-t").textContent=on?"Mostly skipping":"Schedule paused";
    $("#spr-forecast").style.opacity=on?"":"0.45";
    toast(on?"Sprinkler schedule resumed":"Sprinkler schedule paused");
  });

  var zTimers={};
  $$("#zone-grid .zone").forEach(function(tile){
    tile.addEventListener("click",function(){
      var key=tile.dataset.zone, z=ZONES[key], meta=tile.querySelector(".zmeta");
      if(zTimers[key]){
        clearInterval(zTimers[key]); zTimers[key]=null;
        tile.classList.remove("on"); seam(tile,false);
        meta.textContent="Soil "+(38+Math.floor(Math.random()*8))+"% · "+z.m+" min · just now";
        return;
      }
      tile.classList.add("on"); seam(tile,true);
      var left=z.m*60;
      zTimers[key]=setInterval(function(){
        left--;
        meta.textContent="Running · "+Math.floor(left/60)+":"+pad(left%60)+" remaining";
        if(left<=0){
          clearInterval(zTimers[key]); zTimers[key]=null;
          tile.classList.remove("on"); seam(tile,false);
          meta.textContent="Soil "+(46+Math.floor(Math.random()*5))+"% · "+z.m+" min · just now";
          toast(z.n+" finished");
        }
      },1000);
      toast(z.n+" running "+z.m+" min");
    });
  });

  $("#spr-run").addEventListener("click",function(){
    var tiles=$$("#zone-grid .zone");
    tiles[0].click();
    for(var i=1;i<tiles.length;i++) tiles[i].querySelector(".zmeta").textContent="Queued · position "+i;
    toast("Manual full cycle — 25 min across 4 zones");
  });

  /* ---------- zone run history ---------- */
  var ZHIST={
    forest: [8,0,8,0,0,8,0,8,0,0,8,0,-1,0],
    border: [6,0,6,0,6,0,6,0,6,0,6,0,-1,0],
    terrace:[5,5,0,5,5,0,5,5,0,5,5,0,-1,0],
    bamboo: [6,6,6,6,6,6,6,6,6,6,6,6,6,6]
  };
  (function(){
    var host=$("#zone-tl"), h="", slot=100/14;
    Object.keys(ZONES).forEach(function(k){
      h+='<div class="tlrow"><div class="tlname"><span class="k">'+ZONES[k].k+'</span>'+ZONES[k].n+'</div><div class="tltrack">';
      ZHIST[k].forEach(function(v,i){
        if(v===0) return;
        var left=(i*slot+slot*0.14).toFixed(2);
        if(v<0) h+='<span class="tlrun skipped" title="Skipped — rain" style="left:'+left+'%;width:'+(slot*0.7).toFixed(2)+'%"></span>';
        else h+='<span class="tlrun" title="'+v+' min" style="left:'+left+'%;width:'+(slot*0.72*(v/8)).toFixed(2)+'%"></span>';
      });
      h+='</div></div>';
    });
    host.innerHTML=h;
  })();

  /* ---------- MOWERS ---------- */
  var MC=207.34;
  function ring(id,pct){ $(id).setAttribute("stroke-dashoffset",(MC*(1-pct/100)).toFixed(1)); }
  var mbBat=100, mbTimer=null;
  ring("#mb-ring",mbBat); ring("#mf-ring",66);
  $("#mow-b-btn").addEventListener("click",function(){
    var card=$("#mow-b-card"), b=this;
    if(mbTimer){
      clearInterval(mbTimer); mbTimer=null; seam(card,false);
      $("#mow-b-v").textContent="Returning to dock"; b.textContent="Mow now";
      setTimeout(function(){ $("#mow-b-v").textContent="Docked · charging"; $("#mb-next").textContent="Sat 09:00"; },2200);
      return;
    }
    seam(card,true); $("#mow-b-v").textContent="Mowing · zone 2"; b.textContent="Send to dock";
    $("#mb-next").textContent="In progress";
    mbTimer=setInterval(function(){
      mbBat=Math.max(8,mbBat-0.6); $("#mb-bat").textContent=Math.round(mbBat); ring("#mb-ring",mbBat);
    },900);
    toast("Back garden mower started");
  });
  $("#mow-f-btn").addEventListener("click",function(){
    var card=$("#mow-f-card"), b=this;
    if($("#mf-err").classList.contains("err")){
      $("#mf-err").classList.remove("err"); $("#mf-err").classList.add("clear");
      $("#mf-err").textContent="No errors";
      $("#mow-f-v").textContent="Resuming · zone 1"; $("#mf-next").textContent="In progress";
      b.textContent="Send to dock"; b.classList.add("ghost"); seam(card,true);
      toast("Fault cleared — front mower resuming");
      return;
    }
    seam(card,false); $("#mow-f-v").textContent="Returning to dock";
    $("#mf-next").textContent="Sat 10:30"; b.textContent="Mow now";
  });

  /* ---------- kids' rooms climate ---------- */
  var kidT={olaf:20.0,zoja:20.0};
  $$("[data-kid]").forEach(function(b){
    b.addEventListener("click",function(){
      var k=b.dataset.kid;
      kidT[k]=Math.min(24,Math.max(16,kidT[k]+parseFloat(b.dataset.d)));
      $(k==="olaf"?"#ol-target":"#zo-target").textContent=kidT[k].toFixed(1)+"°";
    });
  });

  countLights();
})();
</script>
</body>
</html>
