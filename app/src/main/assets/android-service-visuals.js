(function(){
'use strict';
if(window.__mtServiceVisualsInstalled)return;window.__mtServiceVisualsInstalled=true;
const st=document.createElement('style');st.id='mt-service-visual-finish';st.textContent="\n/* Android-only aesthetic refinements. The meal form, provider controls and music players remain untouched. */\nbody.mt-android-version #screen button[data-action=\"openmeal\"]>.icon{display:none!important}\nbody.mt-android-version #screen .music-hero:has(.spotify-orb){\n background:radial-gradient(ellipse at 50% 20%,#15391f 0%,#102217 40%,#101b13 70%,#0b130d 100%)!important;\n border:1px solid #37664a!important;box-shadow:inset 0 0 27px #1ed7600d,0 9px 26px #0009!important;\n}\nbody.mt-android-version #screen .music-hero:has(.yt-orb){\n background:radial-gradient(ellipse at 50% 20%,#41141f 0%,#27131a 40%,#1b1215 70%,#0f1010 100%)!important;\n border:1px solid #633640!important;box-shadow:inset 0 0 27px #ff17440c,0 9px 26px #0009!important;\n}\nbody.mt-android-version #screen .spotify-orb,\nbody.mt-android-version #screen .yt-orb{\n width:160px!important;height:160px!important;max-width:50vw!important;max-height:50vw!important;\n margin:8px auto 12px!important;display:grid!important;place-items:center!important;\n background:#09170f!important;border:1.5px solid #1ed760!important;\n box-shadow:0 0 15px #1ed7604a,0 0 36px #1ed76021,inset 0 0 24px #1ed76012!important;\n border-radius:50%!important;isolation:isolate!important;position:relative!important;\n}\nbody.mt-android-version #screen .yt-orb{\n background:#180c10!important;border-color:#ff1744!important;\n box-shadow:0 0 15px #ff17446b,0 0 36px #ff174428,inset 0 0 24px #ff174415!important;\n}\nbody.mt-android-version #screen .spotify-orb:before,\nbody.mt-android-version #screen .spotify-orb:after,\nbody.mt-android-version #screen .yt-orb:before,\nbody.mt-android-version #screen .yt-orb:after{content:none!important;display:none!important}\nbody.mt-android-version #screen .spotify-inner,\nbody.mt-android-version #screen .yt-orb-inner{\n background:transparent!important;box-shadow:none!important;border:0!important;\n width:140px!important;height:140px!important;max-width:100%!important;max-height:100%!important;\n display:flex!important;align-items:center!important;justify-content:center!important;\n border-radius:50%!important;gap:0!important;\n}\nbody.mt-android-version #screen .spotify-inner>b,\nbody.mt-android-version #screen .yt-orb-inner>b{display:none!important}\nbody.mt-android-version #screen .spotify-inner>svg,\nbody.mt-android-version #screen .yt-orb-inner>svg{\n width:90px!important;height:90px!important;max-width:90px!important;max-height:90px!important;\n object-fit:contain!important;filter:drop-shadow(0 0 14px #1ed76055)!important;margin:0!important;flex:none!important;\n}\nbody.mt-android-version #screen .yt-orb-inner>svg{filter:drop-shadow(0 0 13px #ff17446b)!important}\nbody.mt-android-version #screen .mt-stream-title{font-size:25px!important;font-weight:950!important;color:#f4ffe9!important;margin:5px 0 5px!important;text-align:center}\nbody.mt-android-version #screen .mt-stream-subtitle{font-size:12px!important;color:#c2d1c1!important;text-align:center;line-height:1.6;margin:7px 0 14px!important}\nbody.mt-android-version #screen .mt-stream-launch{display:grid!important;place-items:center!important;min-height:48px!important;border-radius:13px!important;background:#a6ff00!important;color:#17270a!important;font-size:13px!important;font-weight:900!important;text-decoration:none!important;box-shadow:0 0 18px #a6ff0031!important;margin:0 0 10px!important;padding:9px 14px!important}\nbody.mt-android-version #screen .mt-stream-note{display:block!important;color:#b8c3b5!important;font-size:10px!important;line-height:1.5!important;text-align:center;margin:0 0 12px!important}\nbody.mt-android-version #screen .music-hero:has(.mt-stream-title)>p:not(.music-status):not(.mt-stream-subtitle){display:none!important}\nbody.mt-android-version #screen .music-hero:has(.mt-stream-title) .player-controls{margin-top:15px!important}\n@media(max-width:360px){\n body.mt-android-version #screen .spotify-orb,body.mt-android-version #screen .yt-orb{width:145px!important;height:145px!important}\n body.mt-android-version #screen .spotify-inner,body.mt-android-version #screen .yt-orb-inner{width:128px!important;height:128px!important}\n}\n";document.head.append(st);
const $=id=>document.getElementById(id);
let pending=false;
function decorate(){
 pending=false;
 if($('header-text')?.textContent?.trim()==='Dieta'){
  // The original button already ends with "+". Hide only its leading SVG.
  const meal=$('screen')?.querySelector('button[data-action="openmeal"]');
  if(meal)meal.classList.add('mt-meal-single-plus');
 }
 if($('header-text')?.textContent?.trim()!=='Music')return;
 const screen=$('screen');
 if(!screen)return;
 const hero=screen.querySelector('.music-hero');
 if(!hero||hero.querySelector('.mt-stream-title'))return;
 let brand='';
 if(hero.querySelector('.spotify-orb'))brand='Spotify';
 else if(hero.querySelector('.yt-orb'))brand='YouTube Music';
 if(!brand)return;
 const orb=brand==='Spotify'?hero.querySelector('.spotify-orb'):hero.querySelector('.yt-orb');
 if(!orb)return;
 const title=document.createElement('h2');title.className='mt-stream-title';title.textContent=brand;
 const subtitle=document.createElement('p');subtitle.className='mt-stream-subtitle';subtitle.textContent='Escute suas músicas e playlists no '+brand+'.';
 const open=document.createElement('a');open.className='mt-stream-launch';open.textContent='Abrir '+brand;
 open.href=brand==='Spotify'?'https://open.spotify.com/':'https://music.youtube.com/';
 open.target='_blank';open.rel='noopener noreferrer';
 const note=document.createElement('small');note.className='mt-stream-note';note.textContent='Para ouvir músicas completas, use sua conta no aplicativo '+brand+'.';
 // Insert visual header only. Keep play/pause/seek/queue and the original embedded player.
 orb.after(title,subtitle,open,note);
}
function schedule(){if(pending)return;pending=true;setTimeout(decorate,140)}
const screen=$('screen');if(screen)new MutationObserver(schedule).observe(screen,{childList:true,subtree:false});
setInterval(()=>{if(!document.hidden)decorate()},2600);
decorate();
})();