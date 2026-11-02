(function(){
'use strict';
// Versões Android antigas não enviam "build" e recebem código 0.
// A trava só é ativada quando minimumVersionCode for maior que zero.
const query=new URLSearchParams(location.search);
if(query.get('native')!=='1')return;
const currentBuild=Math.max(0,Number(query.get('build'))||0);
async function checkForRequiredUpdate(){
 try{
  const response=await fetch('/android-update.json?check='+Date.now(),{cache:'no-store',credentials:'omit'});
  if(!response.ok)return;
  const data=await response.json();
  const minimum=Number(data.minimumVersionCode)||0;
  if(minimum<1||currentBuild>=minimum)return;
  const download=String(data.downloadUrl||'');
  const link=new URL(download,location.origin);
  if(link.protocol!=='https:'||!['github.com','marcador-de-treino-ckcg.hatchable.site'].includes(link.hostname))return;
  if(document.getElementById('mt-required-update'))return;
  const modal=document.createElement('div');
  modal.id='mt-required-update';
  modal.setAttribute('role','alertdialog');
  modal.setAttribute('aria-modal','true');
  modal.setAttribute('aria-label','Atualização obrigatória');
  modal.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#070c08;color:#f2ffe7;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif';
  const card=document.createElement('div');
  card.style.cssText='max-width:420px;width:100%;padding:27px 22px;background:#172517;border:1px solid #5b7a40;border-radius:22px;text-align:center;box-shadow:0 12px 45px #0009';
  const icon=document.createElement('div');icon.textContent='↻';icon.style.cssText='font-size:57px;line-height:1;color:#a6ff00';
  const title=document.createElement('h2');title.textContent='Atualização necessária';title.style.cssText='font-size:24px;margin:15px 0 8px';
  const message=document.createElement('p');message.textContent='Uma nova versão do Marcador de Treino está disponível. Para continuar usando o aplicativo, atualize para a versão '+String(data.versionName||'mais recente')+'.';message.style.cssText='font-size:14px;line-height:1.6;color:#d0dec9';
  const button=document.createElement('a');button.href=link.href;button.textContent='Atualizar agora';button.style.cssText='display:block;padding:15px 12px;margin-top:20px;background:#a6ff00;color:#14280a;text-decoration:none;font-size:16px;font-weight:900;border-radius:14px';
  const hint=document.createElement('p');hint.textContent='O download será aberto no navegador. O Android poderá pedir sua confirmação para instalar. Não desinstale a versão atual antes de salvar seus dados locais.';hint.style.cssText='font-size:11px;color:#b4c5a9;line-height:1.5;margin-top:18px';
  card.append(icon,title,message,button,hint);modal.append(card);
  document.body.appendChild(modal);
  button.focus();
  // Só é permitido sair quando a versão instalada atender ao mínimo.
  const protect=new MutationObserver(()=>{if(!modal.isConnected)document.body.append(modal)});
  protect.observe(document.body,{childList:true});
 }catch(error){console.warn('Verificação de atualização indisponível',error)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',checkForRequiredUpdate,{once:true});
else checkForRequiredUpdate();
})();