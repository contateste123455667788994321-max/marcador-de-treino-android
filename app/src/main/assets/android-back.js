(function(){
'use strict';
if(window.mtBackReady)return;window.mtBackReady=true;
const labels={'Marcador de Treino':'home','Meus Exercícios':'exercises','Meu Treino':'workout','Executar Exercício':'execute','Progresso':'progress','Histórico de Passos':'steps-history','Dieta':'diet','Music':'music','Perfil':'profile'};
const current=()=>document.body.classList.contains('home-view')?'home':labels[document.getElementById('header-text')?.textContent?.trim()]||'home';
let previous=current(),trail=[],moving=false;
function record(){
 const now=current();
 if(now===previous)return;
 if(!moving){trail.push(previous);if(trail.length>25)trail.shift();}
 previous=now;moving=false;
}
const screen=document.getElementById('screen');
if(screen)new MutationObserver(record).observe(screen,{childList:true,subtree:false});
const header=document.getElementById('header-text');
if(header)new MutationObserver(record).observe(header,{childList:true,subtree:true,characterData:true});
function clickSelector(selector){const e=document.querySelector(selector);if(!e)return false;e.click();return true;}
function navigate(name){
 if(['home','workout','diet','music'].includes(name))return clickSelector('[data-nav="'+name+'"]');
 if(clickSelector('[data-go="'+name+'"]'))return true;
 if(name==='profile')return clickSelector('#header-profile');
 return false;
}
window.MTAndroidBack=function(){
 if(window.MTOwnerTools?.back?.())return 'handled';
 if(window.MTOwnerPanel?.back?.())return 'handled';
 if(window.MTNoticeBell?.back?.())return 'handled';
 if(window.MTProfilePhoto?.hideIfOpen?.())return 'handled';
 if(window.MTCloudRuns?.hasPopup?.()){window.MTCloudRuns.hide();return 'handled';}
 if(window.MTRunning?.back?.())return 'handled';
 if(window.MTAndroidUnlock?.())return 'handled';
 const page=current();
 if(page==='home'){trail=[];return 'home';}
 let last=trail.pop();
 while(last===page&&trail.length)last=trail.pop();
 if(!last)last=page==='execute'?'workout':'home';
 moving=true;
 if(navigate(last))return 'handled';
 if(clickSelector('.subhead [data-go]'))return 'handled';
 if(navigate('home'))return 'handled';
 return 'home';
};
window.MTAndroidCurrentScreen=current;
})();