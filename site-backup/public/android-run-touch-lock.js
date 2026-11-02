(function(){
'use strict';
// Complemento para o WebView do aplicativo Android; o site público permanece normal.
let native=false;
try{native=new URLSearchParams(location.search).get('native')==='1'||sessionStorage.getItem('mt-native-session')==='1'}catch(e){}
if(!native||window.__mtRunningTouchLock)return;
window.__mtRunningTouchLock=true;
const css=document.createElement('style');
css.id='mt-running-touch-lock-css';
css.textContent=`
#mt-running-touch-button{position:fixed;z-index:12002;right:15px;bottom:calc(165px + env(safe-area-inset-bottom));width:50px;height:50px;border-radius:50%;border:1px solid #b8ff7b;background:linear-gradient(145deg,#345422,#192b13);color:#d0ffa5;box-shadow:0 5px 22px #000b,0 0 15px #a6ff0050;display:grid;place-items:center;font-size:24px;touch-action:none;user-select:none;-webkit-user-select:none}
#mt-running-touch-button[hidden],#mt-running-touch-shield[hidden]{display:none!important}
#mt-running-touch-button.locked{left:calc(50% - 34px);right:auto;bottom:calc(54px + env(safe-area-inset-bottom));height:68px;width:68px;background:linear-gradient(140deg,#c4ff64,#a6ff00);color:#182d0d;border:2px solid #ecffb5;box-shadow:0 0 30px #a6ff0070,0 5px 22px #0009}
#mt-running-touch-button.holding{outline:4px solid #a6ff006e;outline-offset:5px}
#mt-running-touch-shield{position:fixed;inset:0;z-index:12001;background:linear-gradient(165deg,#08180af8,#030703f9);color:#f2ffe9;display:flex;align-items:center;justify-content:center;padding:22px;text-align:center;touch-action:none;overscroll-behavior:none}
#mt-running-touch-shield article{width:min(100%,360px);padding:14px;margin-bottom:45px}
#mt-running-touch-shield .lock-mark{display:grid;place-items:center;width:84px;height:84px;margin:0 auto 16px;background:#24371d;border:1px solid #6b9149;border-radius:24px;box-shadow:0 0 20px #a6ff002a;font-size:41px}
#mt-running-touch-shield h2{font-size:25px;margin:0 0 9px;color:#f4ffe9}
#mt-running-touch-shield p{color:#bcd3b1;font-size:13px;line-height:1.6;margin:0 0 17px}
#mt-running-touch-shield .lock-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0 24px}
#mt-running-touch-shield .lock-stats>div{background:#142413;border:1px solid #45663a;border-radius:15px;padding:13px 6px}
#mt-running-touch-shield .lock-stats strong{display:block;color:#b9ff67;font-size:22px;line-height:1.2;font-variant-numeric:tabular-nums}
#mt-running-touch-shield .lock-stats small{font-size:10px;color:#aec2a6;display:block;margin-top:5px}
#mt-running-touch-shield .lock-instruction{font-size:12px;font-weight:800;color:#ceff9c}
`;
document.head.appendChild(css);
const $=id=>document.getElementById(id);
let button=null,shield=null,locked=false,hold=null,suppressClick=false,wrapped=null;
function active(){
 const overlay=$('mt-run-overlay'),run=window.MTRunning;
 return !!overlay&&!overlay.hidden&&overlay.dataset.view==='run'&&!!run?.isOpen?.()&&!!run?.state?.()?.active;
}
function protectBack(){
 const run=window.MTRunning;
 if(!run||typeof run.back!=='function'||run.back===wrapped)return;
 const original=run.back;
 wrapped=function(){if(locked)return true;return original.apply(run,arguments)};
 run.back=wrapped;
}
function install(){
 if(button)return;
 shield=document.createElement('div');shield.id='mt-running-touch-shield';shield.hidden=true;
 shield.setAttribute('role','dialog');shield.setAttribute('aria-label','Corrida protegida');
 shield.innerHTML='<article><div class="lock-mark">🔒</div><h2>Corrida protegida</h2><p>Toques bloqueados. Seu GPS, tempo e distância continuam sendo registrados normalmente.</p><div class="lock-stats"><div><strong id="mt-running-locked-time">00:00:00</strong><small>Tempo</small></div><div><strong id="mt-running-locked-km">0,00</strong><small>Distância (km)</small></div></div><span class="lock-instruction">Segure o cadeado por 1 segundo para destravar.</span></article>';
 shield.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
 shield.addEventListener('contextmenu',e=>e.preventDefault());
 document.body.appendChild(shield);
 button=document.createElement('button');button.id='mt-running-touch-button';button.hidden=true;button.type='button';button.textContent='🔓';
 button.addEventListener('click',()=>{
   if(suppressClick){suppressClick=false;return}
   if(!locked&&active()){locked=true;sync()}
 });
 button.addEventListener('pointerdown',e=>{
   if(!locked)return;
   e.preventDefault();
   if(hold!==null)clearTimeout(hold);
   button.classList.add('holding');
   hold=setTimeout(()=>{hold=null;locked=false;suppressClick=true;button.classList.remove('holding');sync()},1100);
 });
 for(const name of ['pointerup','pointercancel','pointerleave']){
   button.addEventListener(name,()=>{if(hold!==null){clearTimeout(hold);hold=null}button.classList.remove('holding')});
 }
 button.addEventListener('contextmenu',e=>e.preventDefault());
 document.body.appendChild(button);
}
function sync(){
 if(!window.MTRunning)return;
 protectBack();install();
 if(!active()){
   locked=false;suppressClick=false;
   if(hold!==null){clearTimeout(hold);hold=null}
   button.classList.remove('holding');
 }
 button.hidden=!active();
 button.classList.toggle('locked',locked);
 button.textContent=locked?'🔒':'🔓';
 button.setAttribute('aria-label',locked?'Segure para destravar a corrida':'Bloquear toques durante a corrida');
 shield.hidden=!locked;
 if(locked){
   const t=$('mt-run-time'),d=$('mt-run-distance');
   const time=$('mt-running-locked-time'),km=$('mt-running-locked-km');
   if(t&&time)time.textContent=t.textContent||'00:00:00';
   if(d&&km)km.textContent=d.textContent||'0,00';
 }
}
setInterval(()=>{if(!document.hidden)sync()},600);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
window.MTRunningTouchLock={isLocked:()=>locked,unlock:()=>{locked=false;sync()}};
sync();
})();