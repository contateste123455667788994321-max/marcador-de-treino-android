(function(){
'use strict';
if(window.__mtExtras)return;window.__mtExtras=true;
const $=id=>document.getElementById(id);
const style=document.createElement('style');style.id='mt-extra-android';style.textContent="body.home-view .metric-fire{color:#a6ff00!important;background:radial-gradient(circle,#314d1d,#15231300 75%)!important}\nbody.home-view .metric-fire svg{stroke:#a6ff00!important;fill:none!important}\nbody.home-view .home-quick{display:none!important}\nbody.home-view .home-hero{height:280px!important;min-height:280px!important}\nbody.home-view .progress-home{margin-top:-112px!important}\n.native-home-action{padding:14px;margin:11px 0;border-radius:17px;background:linear-gradient(130deg,#26381d,#111911);border:1px solid #44612f}\n.native-home-action h2{margin:4px 0;font-size:19px}\n.native-home-action small{color:#a6ff00;font-size:9px;font-weight:900;letter-spacing:1px}\n.native-home-action p{font-size:11px;color:#b7c7af;margin:2px 0 10px}\n.native-home-action button{background:#a6ff00;color:#17240f;font-weight:900;border:0;border-radius:12px;padding:12px;width:100%;font-size:12px}\n.native-avatar{display:grid;place-items:center;background:#293528;border:1px solid #53664d;border-radius:50%;width:100%;height:100%}\n.profile-photo:has(.native-avatar){border-color:#52634d;background:#293528}\n#mt-local-lock{position:fixed;z-index:10005;right:15px;bottom:calc(134px + env(safe-area-inset-bottom));width:49px;height:49px;border-radius:50%;background:#234019;color:#a6ff00;border:1px solid #8ad539;box-shadow:0 0 15px #a6ff0059;font-size:22px;touch-action:none;user-select:none}\n#mt-local-lock[hidden],#mt-local-lock-overlay[hidden]{display:none!important}\n#mt-local-lock.locked{left:calc(50% - 32px);right:auto;bottom:calc(85px + env(safe-area-inset-bottom));width:64px;height:64px;background:#a6ff00;color:#132408}\n#mt-local-lock-overlay{position:fixed;inset:0;background:#000b;z-index:10004;display:grid;place-items:center;color:white;text-align:center;touch-action:none}\n#mt-local-lock-overlay article{padding:22px;max-width:300px}\n#mt-local-lock-overlay article h2{font-size:22px}\n#mt-local-lock-overlay article p{font-size:12px;line-height:1.6;color:#d6e6ce}\n#mt-local-lock-overlay article small{color:#a6ff00}\n";document.head.appendChild(style);
function dumbbellIcon(){return '<svg class="mt-neon-dumbbell" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#a6ff00" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-label="Treino"><path d="M6 12h12M4 9v6M7 7v10M17 7v10M20 9v6"/></svg>'}
function anonymousAvatar(size){
return '<span class="native-avatar"><svg viewBox="0 0 64 64" width="'+size+'" height="'+size+'"><circle cx="32" cy="23" r="12" fill="#b9c8b5"/><path d="M10 61c0-16 8-25 22-25s22 9 22 25" fill="#b9c8b5"/></svg></span>';
}
const polishAvatar=document.createElement('style');polishAvatar.textContent="body.home-view .home-primary-action{display:none!important} #mt-home-android-action h2{display:flex;align-items:center;gap:9px}#mt-home-android-action .mt-neon-dumbbell{filter:drop-shadow(0 0 5px #a6ff0060);flex-shrink:0}#header-profile{border:1px solid #6c9b3a!important;width:32px!important;height:32px!important;padding:0!important;display:grid!important;place-items:center!important;border-radius:50%!important;box-shadow:0 0 7px #a6ff0033!important;background:#1e291c!important}#header-profile .native-avatar,#header-profile .anonymous-avatar{width:100%!important;height:100%!important;border:0!important;background:none!important;border-radius:50%!important;box-shadow:none!important;padding:0!important;display:grid!important;place-items:center!important}#header-profile .native-avatar svg{height:20px!important;width:20px!important;display:block!important;margin:auto!important}#header-profile img{height:100%!important;width:100%!important;object-fit:cover;border-radius:50%}";document.head.appendChild(polishAvatar);
function decorate(){
const flame=document.querySelector('.metric-fire');
if(flame&&!flame.querySelector('svg'))flame.innerHTML='<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#a6ff00" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c-5 0-8-4-8-8 0-4 4-7 4-11 3 2 4 5 4 7 1-1 2-3 2-5 4 3 6 6 6 10 0 4-3 7-8 7z"/></svg>';
const profile=document.querySelector('.profile-photo');
if(profile&&!profile.querySelector('img')&&!profile.querySelector('.native-avatar')){profile.innerHTML=anonymousAvatar(68)}
const header=$('header-profile');
if(header&&!header.querySelector('img')&&!header.querySelector('.native-avatar'))header.innerHTML=anonymousAvatar(19);
const progress=document.querySelector('.progress-home');
if(progress&&document.querySelector('.home-hero')&&!$('mt-home-android-action')){
const data=localStorage.getItem('mt-workout');let count=0;
try{const arr=JSON.parse(data||'[]');if(Array.isArray(arr))count=arr.length}catch{}
const el=document.createElement('section');el.className='native-home-action';el.id='mt-home-android-action';
el.innerHTML='<small>FOCO • FORÇA • EVOLUÇÃO</small><h2>Treino de hoje '+dumbbellIcon()+'</h2><p>'+(count?count+' exercícios prontos para treinar':'Escolha seus exercícios e comece')+'</p><button>'+ (count?'▶ Iniciar treino':'＋ Montar meu treino')+'</button>';
progress.insertAdjacentElement('afterend',el);
el.querySelector('button').onclick=()=>{
if(count){document.querySelector('[data-nav="workout"]')?.click();setTimeout(()=>document.querySelector('[data-action="start"]')?.click(),130)}
else document.querySelector('[data-go="exercises"]')?.click();
};
}
}
let locked=false,hold=null;
window.MTAndroidUnlock=()=>{if(!locked)return false;locked=false;checkLock();return true};
function checkLock(){
let btn=$('mt-local-lock'),overlay=$('mt-local-lock-overlay');
if(!btn){
overlay=document.createElement('div');overlay.id='mt-local-lock-overlay';overlay.hidden=true;
overlay.innerHTML='<article><div style="font-size:55px">🔒</div><h2>Treino protegido</h2><p>Toques bloqueados, música continua.</p><small>Segure o cadeado por 1 segundo para destravar.</small></article>';
overlay.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});document.body.appendChild(overlay);
btn=document.createElement('button');btn.id='mt-local-lock';btn.hidden=true;btn.textContent='🔓';document.body.appendChild(btn);
btn.onclick=()=>{if(!locked){locked=true;checkLock()}};
btn.addEventListener('pointerdown',e=>{if(!locked)return;e.preventDefault();hold=setTimeout(()=>{hold=null;locked=false;checkLock()},1100)});
for(const event of ['pointerup','pointerleave','pointercancel'])btn.addEventListener(event,()=>{if(hold){clearTimeout(hold);hold=null}});
btn.addEventListener('contextmenu',e=>e.preventDefault());
}
const training=['Meu Treino','Executar Exercício'].includes($('header-text')?.textContent);
if(!training)locked=false;
const playing=!!window.MTAndroidMusic?.playing?.();
btn.hidden=!training||(!playing&&!locked);
btn.classList.toggle('locked',locked);btn.textContent=locked?'🔒':'🔓';
overlay.hidden=!locked;
document.body.style.overflow=locked?'hidden':'';
}
document.addEventListener('click',event=>{
const btn=event.target.closest('[data-native-provider]');if(!btn)return;
if(btn.dataset.nativeProvider==='local'){
const sp=document.querySelector('[data-action="play"]');if(sp?.getAttribute('aria-label')==='Pausar música')sp.click();
const yt=document.querySelector('[data-action="ytplay"]');if(yt?.getAttribute('aria-label')==='Pausar música')yt.click();
}else if(window.MTAndroidMusic?.playing?.()){try{prompt('mt-music:pause','')}catch{}}
},true);
const root=$('screen');let scheduled=false;
function update(){scheduled=false;decorate();checkLock()}
if(root)new MutationObserver(()=>{if(!scheduled){scheduled=true;setTimeout(update,75)}}).observe(root,{childList:true,subtree:false});
setInterval(()=>{if(!document.hidden)update()},1900);
update();
})();