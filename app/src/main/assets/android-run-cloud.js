(function(){
'use strict';
if(window.__mtRunCloudInstalled)return;window.__mtRunCloudInstalled=true;
const URL='/api/run-history', KEY='mt-run-cloud-opt-in-v1',$=id=>document.getElementById(id);
let opted=localStorage.getItem(KEY)==='yes', user=null,runs=[],online=true,busy=false,dialogOpen=false,codeSent=false,email='',lastError='',lastSync=0;
const listeners=new Set();
const auth=()=>window.hatchable?.auth||null;
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function status(){return {opted,loggedIn:!!user,email:user?.email||'',runs:runs.slice(),busy,online,error:lastError,lastSync}}
function tell(){listeners.forEach(cb=>{try{cb(status())}catch(e){console.warn(e)}})}
function listen(cb){listeners.add(cb);return()=>listeners.delete(cb)}
async function request(url,opt={}){
 const response=await fetch(url,{credentials:'include',cache:'no-store',...opt});
 const body=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(body.error||('Erro no backup ('+response.status+')'));
 return body;
}
async function load(){
 if(!user)return [];
 try{const data=await request(URL);runs=Array.isArray(data.runs)?data.runs:[];lastError='';online=true;}
 catch(e){lastError=e.message;online=false}
 tell();return runs;
}
async function refresh(){
 try{const a=auth();if(!a)throw Error('Contas indisponíveis');const session=await a.getSession();user=session?.user||null;if(!user)runs=[];else await load();lastError='';}
 catch(e){lastError='Não foi possível conectar à sua conta';}
 tell();return status();
}
async function uploadLocal(){
 if(!opted||!user||busy)return {uploaded:0};
 busy=true;lastError='';tell();let uploaded=0;
 try{
  await load();
  const raw=window.prompt('mt-run:history','');
  const hist=JSON.parse(raw||'{}').history||[];
  const has=new Set(runs.map(r=>String(r.startWall)));
  for(const run of hist){
   if(!run||!Array.isArray(run.route)||!Number(run.startWall)||has.has(String(run.startWall)))continue;
   await request(URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(run)});
   has.add(String(run.startWall));uploaded++;
  }
  lastSync=Date.now();await load();
 }catch(e){lastError=e.message||'Não foi possível sincronizar'}
 busy=false;tell();return {uploaded,error:lastError};
}
async function enable(){
 if(!user){await show();return}
 opted=true;localStorage.setItem(KEY,'yes');tell();await uploadLocal();renderDialog();
}
function disable(){opted=false;localStorage.removeItem(KEY);lastError='';tell();renderDialog()}
async function full(startWall){if(!user)return null;const data=await request(URL+'?startWall='+encodeURIComponent(String(startWall)));return data.run||null}
async function remove(startWall){if(!user)return false;await request(URL+'?startWall='+encodeURIComponent(String(startWall)),{method:'DELETE'});await load();return true}
async function signout(){opted=false;localStorage.removeItem(KEY);if(auth())await auth().signOut().catch(()=>{});user=null;runs=[];codeSent=false;lastError='';tell();renderDialog()}
function info(msg){if($('mt-cloud-info'))$('mt-cloud-info').textContent=msg}
function create(){
 if($('mt-cloud-dialog'))return $('mt-cloud-dialog');
 const style=document.createElement('style');style.id='mt-cloud-css';style.textContent="\n#mt-cloud-dialog{position:fixed;inset:0;background:#060b08f5;z-index:4001;overflow:auto;padding:12px;display:grid;place-items:center;color:#ecffe7}\n#mt-cloud-dialog[hidden]{display:none!important}\n#mt-cloud-dialog .cloud-card{background:linear-gradient(135deg,#20341b,#0f1a10);border:1px solid #588341;box-shadow:0 0 38px #a6ff0021;border-radius:20px;padding:20px;width:min(100%,415px)}\n#mt-cloud-dialog h2{font-size:20px;margin:0 0 9px}#mt-cloud-dialog p{font-size:12px;color:#c7dcbc;line-height:1.55}\n#mt-cloud-dialog label{font-size:11px;font-weight:800;color:#d6ffcc;display:block;margin:12px 0 6px}\n#mt-cloud-dialog input{border:1px solid #4d6640;background:#0c170d;border-radius:12px;padding:12px;color:#f6fff3;font-size:14px;width:100%;height:45px;box-sizing:border-box}\n#mt-cloud-dialog button{border:0;border-radius:12px;background:#a6ff00;color:#13220a;padding:11px 12px;font-weight:850;font-size:12px;min-height:42px;width:100%;margin:8px 0 0}\n#mt-cloud-dialog button.secondary{border:1px solid #506945;background:#192719;color:#dcffd5}#mt-cloud-dialog button.danger{background:#3c211d;color:#ffd4cf;border:1px solid #994f45}\n#mt-cloud-dialog button[disabled]{opacity:.5}\n#mt-cloud-dialog .cloud-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px}\n#mt-cloud-dialog .cloud-top button{width:36px;height:36px;border-radius:10px;background:#23341e;color:#dcffcb;margin:0;font-size:19px}\n#mt-cloud-dialog .cloud-status{background:#182a18;border:1px solid #385a2d;border-radius:12px;padding:11px;font-size:11px;color:#baff96}\n#mt-cloud-dialog .cloud-legal{font-size:10px;color:#a8baa2;line-height:1.5;margin:13px 0 0}\n#mt-cloud-info{min-height:15px;font-size:11px;color:#b5ff77}\n";document.head.appendChild(style);
 const el=document.createElement('section');el.id='mt-cloud-dialog';el.setAttribute('role','dialog');el.setAttribute('aria-label','Backup das corridas');el.hidden=true;document.body.appendChild(el);return el;
}
function html(){
 let inner='';
 if(!auth())inner='<p>Autenticação indisponível. Verifique a internet.</p>';
 else if(!user){
  if(!codeSent)inner='<p>Entre com seu e-mail para manter suas corridas privadas na nuvem.</p><label>E-mail</label><input type="email" id="mt-cloud-email" autocomplete="email" placeholder="seuemail@exemplo.com" value="'+esc(email)+'"><button id="mt-cloud-send">Receber código por e-mail</button>';
  else inner='<p>Código enviado para '+esc(email)+'.</p><label>Digite o código de 6 números</label><input id="mt-cloud-code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000"><button id="mt-cloud-verify">Entrar</button><button class="secondary" id="mt-cloud-edit-email">Alterar e-mail</button>';
 }else {
  inner='<div class="cloud-status">Conta: '+esc(user.email||'Atleta')+'</div>';
  if(!opted)inner+='<p>Ao ativar, os caminhos percorridos (coordenadas GPS), tempo, distância e calorias serão guardados na sua conta privada. Assim você recupera as corridas em outro aparelho.</p><button id="mt-cloud-enable">Autorizo e quero ativar o backup</button>';
  else inner+='<p>Backup ativado. Corridas concluídas sincronizam com internet.</p><div class="cloud-status">'+runs.length+' corrida(s) na nuvem</div><button id="mt-cloud-sync">Sincronizar agora</button><button class="secondary" id="mt-cloud-disable">Desativar backup automático</button><button class="danger" id="mt-cloud-delete">Apagar histórico da nuvem</button>';
  inner+='<button class="secondary" id="mt-cloud-signout">Sair desta conta</button>';
 }
 return '<div class="cloud-card"><div class="cloud-top"><h2>☁ Histórico na nuvem</h2><button id="mt-cloud-close" aria-label="Fechar">×</button></div>'+inner+'<p id="mt-cloud-info">'+esc(lastError)+'</p><p class="cloud-legal">Sem ativar o backup, seus trajetos ficam somente no celular. Eles nunca são públicos. O mapa usa OpenStreetMap e requer internet.</p></div>';
}
async function sendCode(){
 email=$('mt-cloud-email')?.value?.trim()||'';
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){info('Informe um e-mail válido.');return}
 $('mt-cloud-send').disabled=true;info('Enviando...');
 try{await auth().startLogin({email});codeSent=true;renderDialog();info('Código enviado! Confira seu e-mail.')}
 catch(e){info(e.message||'Falha no envio')}
}
async function verify(){
 const code=$('mt-cloud-code')?.value?.trim()||'';
 if(!/^\d{6}$/.test(code)){info('Digite os seis números do código.');return}
 $('mt-cloud-verify').disabled=true;
 try{const result=await auth().verifyCode({email,code});user=result?.user||null;codeSent=false;await load();renderDialog();info('Conta conectada! Ative o backup para sincronizar suas rotas.')}
 catch(e){info(e.message||'Código inválido');$('mt-cloud-verify').disabled=false}
}
function renderDialog(){
 const el=create();if(!dialogOpen)return;
 el.innerHTML=html();$('mt-cloud-close').onclick=hide;
 if($('mt-cloud-send'))$('mt-cloud-send').onclick=sendCode;
 if($('mt-cloud-verify'))$('mt-cloud-verify').onclick=verify;
 if($('mt-cloud-edit-email'))$('mt-cloud-edit-email').onclick=()=>{codeSent=false;renderDialog()};
 if($('mt-cloud-enable'))$('mt-cloud-enable').onclick=enable;
 if($('mt-cloud-disable'))$('mt-cloud-disable').onclick=disable;
 if($('mt-cloud-signout'))$('mt-cloud-signout').onclick=signout;
 if($('mt-cloud-sync'))$('mt-cloud-sync').onclick=async()=>{info('Sincronizando...');const result=await uploadLocal();renderDialog();info(result.error||'Backup atualizado!')};
 if($('mt-cloud-delete'))$('mt-cloud-delete').onclick=async()=>{
  if(!confirm('Apagar TODAS as corridas da nuvem? As corridas locais permanecem no celular.'))return;
  busy=true;tell();let failed=0;
  for(const r of runs.slice()){try{await remove(r.startWall)}catch(e){failed++}}
  busy=false;opted=false;localStorage.removeItem(KEY);await load();tell();renderDialog();info(failed?'Falha ao excluir algumas corridas.':'Histórico na nuvem apagado.');
 };
}
async function show(){dialogOpen=true;create().hidden=false;renderDialog();await refresh();renderDialog()}
function hide(){dialogOpen=false;const el=$('mt-cloud-dialog');if(el)el.hidden=true}
async function onFinished(){if(opted)await uploadLocal()}
window.MTCloudRuns={status,listen,refresh,load,full,remove,uploadLocal,show,hide,onFinished,enable};
setTimeout(async()=>{await refresh();if(opted&&user)await uploadLocal()},800);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&opted&&Date.now()-lastSync>180000)uploadLocal()});
})();