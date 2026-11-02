(function(){
'use strict';
if(window.__mtAccountProfileInstalled)return;window.__mtAccountProfileInstalled=true;
const $=id=>document.getElementById(id),a=()=>window.MTCloudRuns;
const style=document.createElement('style');style.id='mt-account-css';style.textContent="\n#mt-account-profile{border:1px solid #466d2e!important;background:linear-gradient(145deg,#22331c,#101a11)!important;box-shadow:0 0 18px #a6ff000e!important;margin:13px 0!important;padding:15px!important;border-radius:16px}\n#mt-account-profile h3{font-size:16px;font-weight:900;margin:0 0 5px;display:flex;align-items:center;gap:7px}\n#mt-account-profile h3 svg{color:#a6ff00}\n#mt-account-profile p{color:#b0c2a9;font-size:11px;line-height:1.5;margin:7px 0 12px}\n#mt-account-profile .mt-account-status{font-size:12px;color:#c4ff98;display:flex;align-items:center;gap:7px;margin:9px 0}\n#mt-account-profile .mt-account-status img{width:30px;height:30px;border-radius:50%;object-fit:cover}\n#mt-account-profile .mt-account-btns{display:grid;gap:8px}\n#mt-account-profile button{padding:11px;border-radius:11px;font-size:12px;font-weight:850;border:1px solid #506b39;background:#1d3018;color:#e1ffd7;width:100%}\n#mt-account-profile button.main{background:#a6ff00;border-color:#a6ff00;color:#16230b}\n#mt-account-profile button.google{background:#eff4ed;color:#19221a;border-color:#d1dccb;display:flex;align-items:center;justify-content:center;gap:9px}\n#mt-account-profile button:disabled{opacity:.48}\n#mt-account-profile button .google-mark{font-weight:900;color:#4285f4;font-size:18px}\n#mt-account-profile small{color:#9daf93;display:block;line-height:1.4;font-size:10px;margin-top:7px}\n";document.head.appendChild(style);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photoUrl=s=>typeof s==='string'&&/^https:\/\//i.test(s)&&s.length<1000?s:'';
let providers=['email'],connectedId='',scheduled=false,lastAppliedId='';
function account(){
return a()?.status?.()||{loggedIn:false,photo:'',name:'',email:'',opted:false,runs:[]};
}
async function getProviders(){try{providers=await a()?.providers?.()||['email']}catch{providers=['email']}decorate();}
function importProfile(force=false){
 const s=account();if(!s.loggedIn)return false;
 const name=(s.name||'').trim().slice(0,60),photo=photoUrl(s.image);
 if(!name&&!photo)return false;
 let profile={};try{profile=JSON.parse(localStorage.getItem('mt-profile')||'{}')}catch{}
 const id=String(s.id||s.email||'');
 const importedKey='mt-import-account-profile:'+id;
 if(!force&&localStorage.getItem(importedKey)==='yes')return false;
 const old={name:profile.name||'Atleta',photo:profile.photo||'',goal:profile.goal||'Evoluir a cada treino'};
 let changed=false;
 if(name&&(force||old.name==='Atleta'||!old.name)){old.name=name;changed=true}
 if(photo&&(force||!old.photo)){old.photo=photo;changed=true}
 localStorage.setItem(importedKey,'yes');
 if(!changed)return false;
 localStorage.setItem('mt-profile',JSON.stringify(old));
 const img=$('header-profile');if(img&&photo)img.innerHTML='<img src="'+esc(photo)+'" alt="Foto de perfil">';
 if(force||!lastAppliedId){
  lastAppliedId=id;
  setTimeout(()=>location.reload(),180);
 }
 return true;
}
async function restoreBackup(file){
 if(!file)return;
 if(file.size>12*1024*1024){alert('O backup é grande demais. Limite: 12 MB.');return}
 let backup;
 try{backup=JSON.parse(await file.text())}catch(e){alert('Arquivo de backup inválido.');return}
 if(!backup||typeof backup!=='object'||(!Array.isArray(backup.workouts)&&!Array.isArray(backup.runHistory))){alert('Este arquivo não parece ser do Marcador de Treino.');return}
 if(!confirm('Restaurar os dados deste backup? Os treinos e refeições atuais serão substituídos.'))return;
 const mapping=[['workouts','mt-workout'],['meals','mt-meals'],['sessions','mt-sessions'],['bodyHistory','mt-body-history'],['bodyMeasures','mt-body-measures']];
 for(const [field,key] of mapping)if(Array.isArray(backup[field]))localStorage.setItem(key,JSON.stringify(backup[field]));
 if(backup.profile&&typeof backup.profile==='object'&&!Array.isArray(backup.profile))localStorage.setItem('mt-profile',JSON.stringify(backup.profile));
 if(Number.isFinite(Number(backup.goal))&&Number(backup.goal)>300&&Number(backup.goal)<20000)localStorage.setItem('mt-diet-goal',JSON.stringify(Number(backup.goal)));
 let restored=0;
 if(Array.isArray(backup.runHistory)){
  for(const run of backup.runHistory.slice(0,80)){
   if(!run||!Array.isArray(run.route))continue;
   try{const response=JSON.parse(window.prompt('mt-run:import:'+JSON.stringify(run),'')||'{}');restored+=Number(response.imported)||0}catch(e){console.warn('Importação da rota ignorada')}
  }
 }
 alert('Backup restaurado! '+restored+' corrida(s) recuperada(s). O aplicativo vai atualizar a tela.');
 location.reload();
}
function decorate(){
 if($('header-text')?.textContent?.trim()!=='Perfil')return;
 const screen=$('screen');if(!screen||$('mt-account-profile'))return;
 const s=account(),card=document.createElement('section');card.id='mt-account-profile';card.className='panel';
 const isGoogle=providers.includes('google');
 const image=photoUrl(s.image);
 card.innerHTML='<h3><svg viewBox="0 0 24 24" height="20" width="20" fill="none" stroke="currentColor" stroke-width="2.1"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg>Conta e nuvem</h3>'+
 (s.loggedIn?'<div class="mt-account-status">'+(image?'<img src="'+esc(image)+'" alt="Foto da conta Google">':'●')+'<span>'+esc(s.email)+'</span></div>':'<p>Entre com seu e-mail para acessar mensagens, avisos e seus dados da conta.</p>')+
 '<div class="mt-account-btns">'+
 (!s.loggedIn?'<button class="google" id="mt-account-google"'+(isGoogle?'':' disabled')+'><span class="google-mark">G</span> Continuar com Google</button>':'')+
 '<button class="main" id="mt-account-cloud">'+(s.loggedIn?'Ver minha conta':'Entrar com e-mail')+'</button>'+
 (s.loggedIn&&(s.name||image)?'<button id="mt-account-import">Usar nome e foto desta conta</button>':'')+
 '<button id="mt-account-restore">Restaurar backup do aplicativo</button><input type="file" id="mt-account-restore-file" accept="application/json,.json" style="display:none">'+
 '</div>'+
 (!isGoogle?'<small>Login Google: falta concluir a configuração de domínio próprio no painel do app. O acesso por e-mail já funciona.</small>':'<small>Seu histórico fica privado. Salvar na nuvem requer autorização.</small>');
 const profile=screen.querySelector('.profile-header');if(profile)profile.after(card);else screen.prepend(card);
 const open=$('mt-account-cloud');if(open)open.onclick=()=>a()?.show?.();
 const google=$('mt-account-google');if(google)google.onclick=async()=>{
  if(!isGoogle)return;
  const result=await a()?.signInGoogle?.();
  if(result?.message)alert(result.message);
 };
 const importButton=$('mt-account-import');if(importButton)importButton.onclick=()=>{
  if(!importProfile(true))alert('Esta conta não disponibilizou nome ou foto para importar.');
 };
 const restore=$('mt-account-restore'),file=$('mt-account-restore-file');
 if(restore&&file){restore.onclick=()=>file.click();file.onchange=()=>restoreBackup(file.files?.[0])}
}
function schedule(){if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;decorate()},85)}
const root=$('screen');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:false});
function updateUser(){
 const s=account();
 if(s.loggedIn){const id=String(s.id||s.email||'');if(id&&id!==connectedId){connectedId=id;importProfile(false)}}
 else connectedId='';
 const existing=$('mt-account-profile');if(existing){existing.remove();schedule()}
}
if(a()?.listen)a().listen(updateUser);
setTimeout(async()=>{await getProviders();updateUser();decorate()},1200);
})();