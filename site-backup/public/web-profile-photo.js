(function(){
'use strict';
if(window.__mtProfilePhotoDialogInstalled)return;window.__mtProfilePhotoDialogInstalled=true;
const $=id=>document.getElementById(id);
const css=`
/* Keep the existing input for the native Android file-picker, but move it out of the interface. */
#screen #profile-photo,#screen label:has(+ #profile-photo){display:none!important}
#screen .profile-header .profile-photo{cursor:pointer;touch-action:manipulation}
#screen .profile-header .profile-photo:focus-visible{outline:3px solid #a6ff00;outline-offset:4px}
#mt-photo-dialog{position:fixed;inset:0;z-index:4200;display:grid;place-items:center;padding:20px;background:#030a04dd;backdrop-filter:blur(6px)}
#mt-photo-dialog[hidden]{display:none!important}
#mt-photo-dialog .mt-photo-panel{max-width:400px;width:100%;background:linear-gradient(145deg,#22351b,#101a11);border:1px solid #608242;box-shadow:0 12px 36px #000b,0 0 26px #a6ff0018;border-radius:23px;padding:24px 19px 20px;text-align:center;color:#f0ffe8}
#mt-photo-dialog .mt-photo-symbol{width:62px;height:62px;margin:0 auto 13px;border-radius:50%;display:grid;place-items:center;background:#263c20;color:#b6ff65;border:1px solid #719e4b}
#mt-photo-dialog h2{margin:0 0 9px;font-size:21px;font-weight:900}
#mt-photo-dialog p{margin:0 0 20px;font-size:13px;line-height:1.5;color:#b6cbb1}
#mt-photo-dialog .mt-photo-buttons{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#mt-photo-dialog button{min-height:48px;padding:9px 7px;border-radius:12px;font-size:12px;font-weight:850;border:1px solid #587548;background:#253b1e;color:#edffe5}
#mt-photo-dialog #mt-photo-select{background:#a6ff00;border-color:#a6ff00;color:#16270c}
`;
const style=document.createElement('style');style.id='mt-profile-photo-dialog-style';style.textContent=css;document.head.appendChild(style);
let open=false;
function onProfile(){return $('header-text')?.textContent?.trim()==='Perfil'}
function close(){const dialog=$('mt-photo-dialog');if(dialog)dialog.remove();open=false}
function show(){
 if(!onProfile()||open)return;
 const file=$('profile-photo');if(!file)return;
 const hasPhoto=!!document.querySelector('#screen .profile-header img.profile-photo');
 const dialog=document.createElement('div');dialog.id='mt-photo-dialog';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','mt-photo-title');
 const heading=hasPhoto?'Deseja trocar sua foto?':'Deseja adicionar uma foto?';
 dialog.innerHTML='<div class="mt-photo-panel"><div class="mt-photo-symbol"><svg viewBox="0 0 24 24" width="29" height="29" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h4l2-2h6l2 2h4v14H3z"/><circle cx="12" cy="13" r="4"/></svg></div>'+
 '<h2 id="mt-photo-title">'+heading+'</h2><p>Escolha uma imagem da galeria do seu celular para usar no perfil.</p>'+
 '<div class="mt-photo-buttons"><button id="mt-photo-cancel" type="button">Cancelar</button><button id="mt-photo-select" type="button">Escolher foto</button></div></div>';
 document.body.append(dialog);open=true;
 $('mt-photo-cancel').onclick=close;
 $('mt-photo-select').onclick=()=>{
  close();
  // Trigger the existing web app file-change handler; it saves the photo normally.
  file.click();
 };
 dialog.onclick=e=>{if(e.target===dialog)close()};
}
function decorate(){
 if(!onProfile())return;
 const photo=document.querySelector('#screen .profile-header .profile-photo');
 if(photo&&!photo.hasAttribute('data-mt-photo-action')){
  photo.setAttribute('data-mt-photo-action','true');
  photo.setAttribute('role','button');
  photo.setAttribute('tabindex','0');
  photo.setAttribute('aria-label','Adicionar ou trocar foto de perfil');
 }
}
document.addEventListener('click',e=>{
 if(!onProfile())return;
 const target=e.target.closest?.('#screen .profile-header .profile-photo');
 if(!target)return;
 e.preventDefault();show();
},true);
document.addEventListener('keydown',e=>{
 if(onProfile()&&e.target.matches?.('#screen .profile-header .profile-photo')&&(e.key==='Enter'||e.key===' ')){
  e.preventDefault();show();
 }
 if(e.key==='Escape'&&open){e.preventDefault();close()}
},true);
const screen=$('screen');if(screen)new MutationObserver(()=>setTimeout(decorate,30)).observe(screen,{childList:true,subtree:false});
window.MTProfilePhoto={show,hide:close,hideIfOpen:()=>{if(!open)return false;close();return true}};
decorate();
})();