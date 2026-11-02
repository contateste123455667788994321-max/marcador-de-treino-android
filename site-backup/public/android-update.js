(function(){
'use strict';
const query=new URLSearchParams(location.search);
if(query.get('native')!=='1')return;
if(window.__mtAndroidUpdateChecker)return;
window.__mtAndroidUpdateChecker=true;
const VERSION_PATTERN=/^\d+\.\d+\.\d+$/;
const currentBuild=Math.max(0,Number.parseInt(query.get('build')||'0',10)||0);
let versionName=query.get('version')||'';
if(!VERSION_PATTERN.test(versionName))versionName='';
function versionParts(v){return VERSION_PATTERN.test(v)?v.split('.').map(x=>Number(x)):[0,0,0]}
function versionCompare(a,b){const x=versionParts(a),y=versionParts(b);for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]-y[i]}return 0}
const oldApk=currentBuild===0||!versionName;
const legacyBaseline='1.9.1'; // APKs anteriores não enviavam identificação.
let modal=null,checking=false,observer=null;
function safeOfficialUrl(url){
 try{
  const parsed=new URL(String(url||''));
  const prefix='/contateste123455667788994321-max/marcador-de-treino-android/releases/download/';
  return parsed.protocol==='https:'&&parsed.hostname==='github.com'&&parsed.pathname.startsWith(prefix)&&parsed.pathname.endsWith('.apk')?parsed.href:null;
 }catch(e){return null}
}
async function check(manual=false){
 if(checking)return;checking=true;
 let shown=false,feedback='Não foi possível consultar as novas versões. Verifique a conexão.';
 try{
  const [releaseResponse,policyResponse]=await Promise.all([
   fetch('/api/android/latest',{cache:'no-store',credentials:'omit'}),
   fetch('/android-update.json',{cache:'no-store',credentials:'omit'})
  ]);
  if(!releaseResponse.ok||!policyResponse.ok)return;
  const release=await releaseResponse.json(),policy=await policyResponse.json();
  if(!release.available||!VERSION_PATTERN.test(release.versionName))return;
  const installed=oldApk?legacyBaseline:versionName;
  if(versionCompare(release.versionName,installed)<=0){feedback='Nenhuma atualização nova disponível. A última versão publicada é '+release.versionName+'.';return;}
  const url=safeOfficialUrl(release.downloadUrl);if(!url)return;
  const min=Number(policy.minimumVersionCode)||0;
  // Versões sem metadados não podem ser bloqueadas: a assinatura dos antigos APKs de teste pode variar.
  const required=currentBuild>0&&min>0&&currentBuild<min;
  const reminderKey='mt-update-reminded-'+release.versionName;
  if(!required&&!manual&&Number(sessionStorage.getItem(reminderKey)||0)>Date.now()-12*60*60*1000)return;
  showUpdate(url,release.versionName,required,reminderKey);
  shown=true;
 }catch(err){console.warn('Verificação de atualização:',err)}
 finally{checking=false;if(manual&&!shown)alert(feedback)}
}
function showUpdate(url,newVersion,required,reminderKey){
 if(modal){modal.remove();modal=null}
 const el=document.createElement('section');modal=el;
 el.id='mt-required-update';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
 el.setAttribute('aria-label',required?'Atualização obrigatória':'Nova atualização disponível');
 el.style.cssText='position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:20px;background:#050b06ed;color:#f2ffe7;font-family:system-ui,-apple-system,sans-serif';
 const card=document.createElement('div');
 card.style.cssText='width:min(100%,420px);padding:26px 22px;border-radius:22px;border:1px solid #537c33;background:linear-gradient(150deg,#1b2d17,#0d160d);text-align:center;box-shadow:0 15px 55px #000a';
 const mark=document.createElement('div');mark.textContent='↻';mark.style.cssText='font-size:59px;color:#a6ff00;line-height:1';
 const h=document.createElement('h2');h.textContent=required?'Atualização obrigatória':'Nova atualização disponível';h.style.cssText='font-size:23px;line-height:1.25;margin:13px 0';
 const p=document.createElement('p');p.textContent='Marcador de Treino '+newVersion+' disponível. '+(required?'Atualize para continuar usando o aplicativo.':'Instale a versão mais recente com novidades e melhorias.');p.style.cssText='font-size:14px;line-height:1.6;color:#d5e8ce';
 const btn=document.createElement('a');btn.href=url;btn.textContent='Atualizar agora';btn.rel='noopener noreferrer';btn.style.cssText='display:block;background:#a6ff00;color:#132609;border-radius:13px;padding:15px 12px;font-weight:900;font-size:16px;text-decoration:none;margin-top:20px';
 const caution=document.createElement('p');caution.style.cssText='font-size:11px;line-height:1.6;color:#b6c9ae;margin:17px 0 0';
 caution.textContent=oldApk?'Esta instalação é de uma versão anterior de teste. Faça primeiro um backup dos seus dados no Perfil. Se o Android recusar instalar por cima, não desinstale antes de guardar esse backup.':'O Android abrirá o download e pedirá confirmação para instalar. Mantenha seus dados salvos e não desinstale o app para atualizar.';
 card.append(mark,h,p,btn,caution);
 if(!required){
  const later=document.createElement('button');later.type='button';later.textContent='Agora não';
  later.style.cssText='width:100%;padding:12px;background:transparent;border:1px solid #405d37;border-radius:12px;color:#deefd5;font-weight:700;margin-top:11px';
  later.onclick=()=>{sessionStorage.setItem(reminderKey,String(Date.now()));el.remove();modal=null;};
  card.append(later);
 }
 el.append(card);document.body.append(el);
 if(required){
  observer?.disconnect();
  observer=new MutationObserver(()=>{if(!el.isConnected)document.body.append(el)});
  observer.observe(document.body,{childList:true});
 }
}
function decorateProfile(){
 if(document.getElementById('header-text')?.textContent?.trim()!=='Perfil')return;
 const screen=document.getElementById('screen');if(!screen||document.getElementById('mt-profile-check-update'))return;
 const button=document.createElement('button');button.id='mt-profile-check-update';button.type='button';
 button.className='panel profile-row';button.style.cssText='width:100%;color:#dfffc8;text-align:left;border:1px solid #587c37';
 button.innerHTML='<span style="font-size:21px;color:#a6ff00">↻</span><span style="flex:1">Verificar atualizações</span><span style="font-size:17px;color:#a6ff00">›</span>';
 button.onclick=()=>check(true);
 const install=screen.querySelector('[data-action="installapp"]');
 if(install)install.before(button);
 else screen.append(button);
}
window.MTAndroidUpdateCheck=()=>check(true);
const screen=document.getElementById('screen');
if(screen)new MutationObserver(()=>setTimeout(decorateProfile,100)).observe(screen,{childList:true,subtree:false});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{check();decorateProfile()},900),{once:true});
else setTimeout(()=>{check();decorateProfile()},900);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
})();