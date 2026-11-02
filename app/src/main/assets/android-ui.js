(function(){
'use strict';
if(window.__mtAndroidUI)return;window.__mtAndroidUI=true;
const $=id=>document.getElementById(id);
const current={tracks:[],index:-1,playing:false,ready:false,position:0,duration:0,shuffle:false,repeat:false,error:''};
let chosen='spotify',lastSignature='',pending=false;
function send(action){return prompt('mt-music:'+action,'')||''}
function esc(x){return String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function spotifyLogo(){return '<svg viewBox="0 0 24 24" width="69" height="69" aria-label="Spotify"><path fill="#1ED760" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>'}
function youtubeLogo(){return '<svg viewBox="0 0 24 24" width="69" height="69" aria-label="YouTube Music"><circle cx="12" cy="12" r="12" fill="#fff"/><path fill="#FF0033" fill-rule="evenodd" d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"/></svg>'}
function deezerLogo(){return '<svg viewBox="0 0 954.66669 948" width="69" height="69" aria-label="Deezer"><g transform="matrix(1.3333333,0,0,1.3333333,0,0)" fill="#A335FF"><path d="m 167.07,0 c 8.97,1.94 14.83,9.41 19.19,17.02 6.11,10.68 10.61,22.72 14.15,34.75 8.88,30.2 14.07,62.48 17.65,95.01 0.01,0.11 0.1,0.19 0.21,0.19 0.11,0.01 0.2,-0.07 0.22,-0.18 4.07,-27.87 9.3,-56.04 19.41,-81.14 1.45,-3.61 3.36,-7.36 5.75,-11.25 16.08,-26.24 29.97,1.62 35.06,15.37 4.57,12.35 8.43,26.26 11.57,41.73 5.29,26.08 9.31,54.2 12.06,84.35 0.95,10.43 1.95,23.11 2.99,38.06 0.01,0.12 0.1,0.21 0.22,0.22 0.12,0.01 0.23,-0.07 0.25,-0.19 4.42,-20.44 25.81,-105.16 60.92,-90.07 7.08,3.05 13.62,10.75 17.88,17.53 13.56,21.55 21.01,47.8 26.86,72.68 0.02,0.08 0.1,0.14 0.18,0.13 0.09,-0.01 0.15,-0.07 0.16,-0.16 2.82,-46.04 7.78,-92.34 18.21,-136.55 2.52,-10.68 14.83,-59.58 32.65,-53.37 6.42,2.23 11.22,10.04 14.1,16.14 3.94,8.35 7.18,17.18 9.72,26.49 5.35,19.63 9.39,39.64 12.12,60.01 0.02,0.12 0.12,0.21 0.24,0.21 0.12,0 0.22,-0.09 0.23,-0.21 3.6,-32.5 8.9,-65.06 17.78,-95.47 3.37,-11.53 7.84,-22.63 13.41,-33.29 1.71,-3.27 4.23,-6.83 7.56,-10.67 3.32,-3.82 7.39,-6.27 12.22,-7.34 h 3.27 c 5.26,1.22 9.65,4.06 13.17,8.53 5,6.35 8.97,13.13 11.92,20.34 10.27,25.06 16.17,51.79 20.57,78.82 0.01,0.09 0.09,0.15 0.18,0.15 0.09,0 0.17,-0.06 0.18,-0.15 1.96,-12.19 4.78,-24.17 8.47,-35.92 2.29,-7.33 5.99,-16.72 11.47,-22.16 11.96,-11.86 21.46,11.5 24.07,19.4 4.55,13.77 8,28.45 10.36,44.03 3.29,21.75 5.54,42.9 6.76,63.46 2.88,48.58 1.98,96.49 -2.7,143.74 -1.84,18.6 -4.78,36.93 -8.82,54.99 -1.51,6.77 -3.58,13.86 -6.21,21.25 -2.71,7.6 -11.99,29.6 -23.53,17.81 -2.2,-2.25 -3.95,-4.67 -5.25,-7.26 -4.19,-8.37 -7.31,-17.08 -9.36,-26.13 -0.03,-0.14 -0.16,-0.24 -0.3,-0.23 -0.15,0.01 -0.26,0.13 -0.28,0.27 -2.56,24.18 -6.37,47.62 -11.44,70.33 -3.45,15.45 -7.77,29.74 -12.94,42.85 -4.07,10.32 -12.9,28.81 -25.09,31.53 -27.83,6.21 -44.03,-73.63 -47.38,-90.95 -0.01,-0.05 -0.05,-0.09 -0.1,-0.08 -0.06,0 -0.1,0.04 -0.1,0.09 -2.99,43.87 -7.96,88.42 -18.26,130.77 -2.75,11.32 -13.94,53.27 -29.74,51.64 -19.72,-2.05 -31.33,-62.54 -34.14,-78.02 -0.02,-0.11 -0.11,-0.18 -0.22,-0.18 -0.11,0 -0.2,0.08 -0.21,0.19 -3.67,33.14 -9.22,67.1 -17.68,97.62 -5.59,20.17 -13.12,41.87 -25.45,58.99 -3.94,5.47 -8.51,9.58 -13.71,12.32 -13.39,7.06 -26.24,-3.84 -33.25,-14.33 -6.19,-9.27 -11.33,-19.53 -15.43,-30.78 -14.4,-39.48 -21.74,-82.01 -26.18,-123.96 0,-0.05 -0.04,-0.08 -0.09,-0.09 -0.05,0 -0.09,0.03 -0.1,0.08 -1.42,6.83 -3.2,14.83 -5.34,23.99 -2.46,10.53 -17.39,70.83 -38.54,49.85 -5.86,-5.81 -9.97,-15.09 -13.04,-23.6 -2.84,-7.9 -5.19,-15.64 -7.05,-23.21 -10.39,-42.33 -15.4,-87 -18.34,-131.24 0,-0.08 -0.07,-0.15 -0.15,-0.15 -0.08,-0.01 -0.16,0.05 -0.17,0.13 -3.84,20.52 -9.01,41.23 -16.96,60.72 -3.93,9.63 -9.66,20.75 -17.89,27.02 -18.14,13.81 -32.51,-15.71 -37.48,-28.24 -5.07,-12.77 -9.28,-26.51 -12.61,-41.21 -5.29,-23.38 -9.24,-47.42 -11.84,-72.11 -0.01,-0.13 -0.12,-0.23 -0.25,-0.24 -0.13,-0.01 -0.25,0.07 -0.28,0.2 -2.6,10.44 -6.15,21.33 -12.04,30.38 -1,1.53 -2.43,3.01 -4.28,4.45 C 83.14,425.88 73.29,394.26 71.26,386.99 63.86,360.54 60.18,333.02 57.95,305.26 54.07,256.74 54.04,208.32 57.85,160 59.52,138.93 62.09,119.26 65.56,101.01 68.22,87 71.49,73.33 77.08,60.81 79.2,56.07 82.62,49.93 87.29,47.36 c 18.23,-10.01 29.02,51.43 30.57,60.36 0.02,0.09 0.1,0.16 0.19,0.15 0.09,0 0.17,-0.07 0.18,-0.16 3.21,-21.53 7.99,-42.33 14.33,-62.4 3.26,-10.33 7.31,-19.77 12.15,-28.31 4.27,-7.54 10.13,-14.96 19.06,-17 z"/><path d="M 23.87,296.68 C 12.56,296.68 3.4,259.53 3.4,213.7 c 0,-45.83 9.16,-82.98 20.47,-82.98 11.31,0 20.47,37.15 20.47,82.98 0,45.83 -9.16,82.98 -20.47,82.98 z"/><path d="m 693.2,296.68 c -11.3,0 -20.46,-37.15 -20.46,-82.98 0,-45.83 9.16,-82.98 20.46,-82.98 11.3,0 20.46,37.15 20.46,82.98 0,45.83 -9.16,82.98 -20.46,82.98 z"/></g></svg>'}
function mineLogo(){return mineTabLogo().replace('width="24" height="24"','width="78" height="78"').replace('aria-label="Músicas locais"','aria-label="Minhas músicas"')}
function mineTabLogo(){return '<svg viewBox="0 0 48 48" width="24" height="24" fill="none" aria-label="Músicas locais"><circle cx="24" cy="24" r="21" fill="#172b10" stroke="#a6ff00" stroke-width="1.2"/><path d="M24 14v17m0-17 11-2.9v16.8" stroke="#a6ff00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="19" cy="32" rx="4.6" ry="2.9" stroke="#a6ff00" stroke-width="1.6" transform="rotate(-17 19 32)"/><ellipse cx="30" cy="28.7" rx="4.6" ry="2.9" stroke="#a6ff00" stroke-width="1.6" transform="rotate(-17 30 28.7)"/></svg>'}
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
tabs.innerHTML='<button data-native-provider="spotify">'+spotifyLogo()+'Spotify</button><button data-native-provider="youtube">'+youtubeLogo()+'YouTube Music</button><button data-native-provider="local">'+mineTabLogo()+'Minhas músicas</button>';
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