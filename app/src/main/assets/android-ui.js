(function(){
'use strict';
if(window.__mtAndroidUI)return;window.__mtAndroidUI=true;
const $=id=>document.getElementById(id);
const current={tracks:[],index:-1,playing:false,ready:false,position:0,duration:0,shuffle:false,repeat:false,error:''};
let chosen='spotify',lastSignature='',pending=false;
function send(action){return prompt('mt-music:'+action,'')||''}
function esc(x){return String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function spotifyLogo(){return '<svg viewBox="0 0 100 100" width="69" height="69"><circle cx="50" cy="50" r="46" fill="#1ED760"/><path d="M22 38q32-11 65 8M27 52q26-9 53 6M32 65q22-6 41 5" stroke="#102010" stroke-width="7" stroke-linecap="round" fill="none"/></svg>'}
function youtubeLogo(){return '<svg viewBox="0 0 100 100" width="69" height="69"><circle cx="50" cy="50" r="46" fill="#FF0033"/><circle cx="50" cy="50" r="27" fill="none" stroke="#fff" stroke-width="4"/><path d="M43 34 68 50 43 66Z" fill="#fff"/></svg>'}
function mineLogo(){return '<svg viewBox="0 0 100 100" width="70" height="70" fill="none" aria-label="Minhas músicas"><circle cx="50" cy="50" r="44" stroke="#a6ff00" stroke-width="1.6" opacity=".8"/><path d="M51 30v31m0-31 20-5v31" stroke="#a6ff00" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="42" cy="64" rx="9" ry="6.4" stroke="#a6ff00" stroke-width="2.8" transform="rotate(-19 42 64)"/><ellipse cx="62" cy="58" rx="9" ry="6.4" stroke="#a6ff00" stroke-width="2.8" transform="rotate(-19 62 58)"/></svg>'}
function controlIcon(name){
 const paths={shuffle:'<path d="M3 7h3c5 0 6 10 12 10h3m-4-4 4 4-4 4M3 17h3c2 0 3-2 4-4m4-4c1-2 2-2 4-2h3m-4-4 4 4-4 4"/>',previous:'<path d="M5 5v14m14-14-11 7 11 7z"/>',play:'<path d="m8 5 11 7-11 7z"/>',pause:'<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',next:'<path d="m5 5 11 7-11 7zM19 5v14"/>',repeat:'<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h18M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3"/>'};
 return '<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.play)+'</svg>';
}
function musicScreen(){return $('header-text')?.textContent==='Music'}
function trackTitle(){return current.tracks[current.index]?.name||'Nenhuma música selecionada'}
function renderLibrary(){
const container=$('android-local-tracks');if(!container)return;
container.innerHTML=current.tracks?.length?current.tracks.map((t,i)=>'<div class="native-track '+(i===current.index?'active':'')+'"><button data-native-track="'+i+'">♫ '+esc(t.name)+'</button><button data-native-remove="'+i+'" aria-label="Excluir da lista">×</button></div>').join(''):'<p class="empty">Sua lista está vazia. Escolha algumas músicas do celular.</p>';
}
function localScreen(){
const screen=$('screen');if(!screen)return;
document.querySelectorAll('.music-hero,.music-playback-card,.music-tools,.music-queue,.music-external,.music-note').forEach(n=>n.style.display='none');
$('android-local-mode')?.remove();
const section=document.createElement('section');section.id='android-local-mode';
section.innerHTML='<div class="native-player"><div class="native-player-orb"><div class="native-player-orb-center">'+mineLogo()+'<strong>Minhas músicas</strong></div></div><p class="caption">Suas músicas acompanham o seu treino.</p><div class="native-current" id="android-native-title"></div><div class="native-transport"><button data-native-action="shuffle" id="android-shuffle" aria-label="Aleatório">'+controlIcon('shuffle')+'</button><button data-native-action="previous" aria-label="Anterior">'+controlIcon('previous')+'</button><button data-native-action="toggle" class="native-play" id="android-play" aria-label="Reproduzir">'+controlIcon('play')+'</button><button data-native-action="next" aria-label="Próxima">'+controlIcon('next')+'</button><button data-native-action="repeat" id="android-repeat" aria-label="Repetir">'+controlIcon('repeat')+'</button></div><div class="native-status" id="android-native-status"></div></div>'+
'<div class="native-library"><h3>Minha playlist</h3><button class="native-add" data-native-action="pick">+ Adicionar músicas do celular</button><div id="android-local-tracks"></div><p class="caption">Arquivos escolhidos por você ficam no celular. A reprodução pode continuar com a tela apagada.</p></div>';
screen.appendChild(section);
section.onclick=e=>{const b=e.target.closest('button');if(!b)return;
if(b.dataset.nativeTrack!==undefined)send('play:'+b.dataset.nativeTrack);
else if(b.dataset.nativeRemove!==undefined){send('remove:'+b.dataset.nativeRemove);setTimeout(refresh,250)}
else if(b.dataset.nativeAction)send(b.dataset.nativeAction);
setTimeout(refresh,250);
};
renderLibrary();update();
}
function update(){
if($('android-native-title'))$('android-native-title').textContent=trackTitle();
if($('android-play')){$('android-play').innerHTML=controlIcon(current.playing?'pause':'play');$('android-play').setAttribute('aria-label',current.playing?'Pausar':'Reproduzir')}
if($('android-shuffle'))$('android-shuffle').classList.toggle('selected',current.shuffle);
if($('android-repeat'))$('android-repeat').classList.toggle('selected',current.repeat);
if($('android-native-status'))$('android-native-status').textContent=current.error||(current.playing?'Reproduzindo inclusive com a tela apagada':current.tracks.length?'Toque em ▶ para começar':'Escolha as músicas que deseja ouvir.');
const signature=JSON.stringify({tracks:current.tracks,index:current.index});
if(lastSignature!==signature){lastSignature=signature;renderLibrary();}
const mini=$('android-native-mini');if(mini){mini.hidden=!current.playing||musicScreen();$('android-mini-title').textContent=trackTitle();$('android-mini-play').textContent=current.playing?'Ⅱ':'▶'}
if(typeof window.syncFloatingLock==='function')window.syncFloatingLock();
}
window.MTAndroidMusicUpdate=raw=>{try{Object.assign(current,typeof raw==='string'?JSON.parse(raw):raw);update()}catch(e){console.warn(e)}};
window.MTAndroidMusic={state:()=>current,playing:()=>current.playing};
function switchTo(ch){
if(!['spotify','youtube','local'].includes(ch))return;
chosen=ch;
if(ch==='local'){
 document.body.classList.add('mt-local-mode');
 if(window.MTAndroidSwitchProvider)window.MTAndroidSwitchProvider('local');
 localScreen();
}else{
 document.body.classList.remove('mt-local-mode');
 $('android-local-mode')?.remove();
 const btn=document.querySelector('[data-provider="'+ch+'"]');if(btn)btn.click();
 setTimeout(patch,30);
}
document.querySelectorAll('[data-native-provider]').forEach(b=>b.classList.toggle('active',b.dataset.nativeProvider===chosen));
}
function patch(){
if(!musicScreen()){document.body.classList.remove('mt-local-mode');return;}
let original=document.querySelector('.music-service-picker');
if(!original)return;
original.style.display='none';
if(!document.querySelector('.native-provider-tabs')){
const tabs=document.createElement('div');tabs.className='native-provider-tabs';
tabs.innerHTML='<button data-native-provider="spotify">'+spotifyLogo()+'Spotify</button><button data-native-provider="youtube">'+youtubeLogo()+'YouTube Music</button><button data-native-provider="local">'+mineLogo()+'Minhas músicas</button>';
original.after(tabs);
tabs.onclick=e=>{const b=e.target.closest('[data-native-provider]');if(b)switchTo(b.dataset.nativeProvider)};
}
document.querySelectorAll('[data-native-provider]').forEach(b=>b.classList.toggle('active',b.dataset.nativeProvider===chosen));
if(chosen==='local'){document.body.classList.add('mt-local-mode');if(!$('android-local-mode'))localScreen();}
else {document.body.classList.remove('mt-local-mode');
 $('android-local-mode')?.remove();
 const hero=document.querySelector('.spotify-inner>.icon,.yt-orb-inner>.icon');
 if(hero)hero.outerHTML=chosen==='spotify'?spotifyLogo():youtubeLogo();
}
}
const style=document.createElement('style');style.id='mt-android-style';style.textContent="body.home-view .home-quick{display:none!important}\nbody.home-view .metric-fire{color:#a6ff00!important}\nbody.home-view .metric-fire svg{stroke:#a6ff00!important}\nbody.home-view .home-hero{height:278px!important;min-height:278px!important}\nbody.home-view .progress-home{margin-top:-116px!important}\n#bottom-nav{bottom:0!important;padding-bottom:calc(10px + env(safe-area-inset-bottom))!important;z-index:35!important}\nmain{padding-bottom:calc(102px + env(safe-area-inset-bottom))!important}\n.native-provider-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:5px 0 12px}\n.native-provider-tabs button{min-height:46px;background:#191e17;border:1px solid #303d29;border-radius:13px;color:#c5d6b8;font-size:10px;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}\n.native-provider-tabs button.active{background:#a6ff00;color:#12220b;border-color:#b9ff50}\n.native-provider-tabs button svg{width:20px;height:20px}\n.native-player{padding:17px;border:1px solid #384c2d;border-radius:19px;text-align:center;background:radial-gradient(circle at 50% 28%,#335019,#101710 65%)}\n.native-player-orb{margin:0 auto 12px;width:190px;height:190px;display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle,#0d180e 47%,#adff19 50%,#192e11 59%,#0a100a 69%);box-shadow:0 0 35px #a6ff0059}\n.native-player-orb-center{height:132px;width:132px;background:#102010;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-size:12px}\n.native-player-orb-center svg{width:73px;height:73px}\n.native-transport{display:flex;align-items:center;justify-content:space-around;gap:8px;margin:17px 0 7px}\n.native-transport button{background:none;border:0;color:#eef9e8;font-size:23px;min-width:40px;min-height:40px}\n.native-transport button.native-play{background:#a6ff00;color:#17270e;border-radius:50%;width:59px;height:59px;box-shadow:0 0 20px #a6ff0044}\n.native-transport button.selected{color:#a6ff00}\n.native-current{font-size:12px;color:#e6f4db;margin:8px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.native-status{font-size:11px;color:#aec79e;margin:5px 0 0}\n.native-library{border-radius:17px;background:#151b14;border:1px solid #333f2d;padding:14px;margin:12px 0}\n.native-library h3{margin:0 0 10px;font-size:15px}\n.native-add{background:#a6ff00;border:0;border-radius:13px;padding:13px;width:100%;color:#17270e;font-size:12px;font-weight:900}\n.native-track{display:flex;align-items:center;gap:8px;padding:9px 1px;border-bottom:1px solid #2d3a26}\n.native-track button{color:#d5e7cc;background:none;border:0;font-size:12px}\n.native-track button:first-child{flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.native-track.active button:first-child{color:#a6ff00}\n.native-track button:last-child{font-size:18px;color:#b7c7af}\n.native-library .caption{line-height:1.5}\n.native-mini{position:fixed;z-index:60;bottom:calc(77px + env(safe-area-inset-bottom));left:14px;right:14px;background:#20351a;border:1px solid #84c249;border-radius:13px;height:50px;display:flex;gap:9px;align-items:center;padding:9px 12px;box-shadow:0 6px 20px #000c;color:#a6ff00}\n.native-mini[hidden]{display:none!important}\n.native-mini strong{color:#e4f3dc;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px}\n.native-mini button{background:none;border:0;color:#a6ff00;font-size:20px}\n.training-screen-locked .native-mini{display:none!important}\nbody:has(.native-mini:not([hidden])) .training-lock-bubble:not(.is-locked){bottom:calc(134px + env(safe-area-inset-bottom))!important}\n.anonymous-avatar{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;border:1px solid #475a45;color:#b5c6b0;background:linear-gradient(#374337,#202a20)}";document.head.appendChild(style);
const mini=document.createElement('div');mini.id='android-native-mini';mini.className='native-mini';mini.hidden=true;mini.innerHTML='♫ <strong id="android-mini-title">Música tocando</strong><button id="android-mini-play">Ⅱ</button><button id="android-mini-open">↗</button>';
document.body.appendChild(mini);
$('android-mini-play').onclick=()=>{send('toggle');setTimeout(refresh,250)};
$('android-mini-open').onclick=()=>{document.querySelector('[data-nav="music"]')?.click();chosen='local';setTimeout(patch,70)};
const originalObserver=new MutationObserver(()=>{if(!pending){pending=true;setTimeout(()=>{pending=false;patch();update()},80)}});
const main=$('screen');if(main)originalObserver.observe(main,{childList:true,subtree:false});
function refresh(){try{const raw=send('getState');if(raw)window.MTAndroidMusicUpdate(raw)}catch{}if(musicScreen())patch();update();}
setInterval(refresh,1800);
refresh();
})();