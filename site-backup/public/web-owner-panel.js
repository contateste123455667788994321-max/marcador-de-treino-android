(function(){
'use strict';
if(window.__mtOwnerPanel)return;window.__mtOwnerPanel=true;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const style=document.createElement('style');style.id='mt-admin-css';style.textContent="\n#mt-admin-overlay{position:fixed;inset:0;z-index:4100;background:#070d08fa;color:#eaffdf;overflow-y:auto;padding:calc(13px + env(safe-area-inset-top)) 15px calc(110px + env(safe-area-inset-bottom))}\n#mt-admin-overlay[hidden]{display:none!important}\n.mt-admin-width{max-width:700px;margin:0 auto}\n.mt-admin-head{display:flex;align-items:center;gap:12px;margin-bottom:17px}\n.mt-admin-head h2{font-size:21px;margin:0}\n.mt-admin-head small{color:#aec3a3;font-size:11px}\n.mt-admin-head button{border:1px solid #49683a;background:#253c20;color:#e6ffd9;padding:10px;border-radius:12px;font-weight:800}\n.mt-admin-head .mt-admin-close{font-size:23px;padding:5px 15px}\n.mt-admin-head .mt-admin-reload{margin-left:auto}\n.mt-admin-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}\n.mt-admin-stat,.mt-admin-panel{border:1px solid #3e5b30;background:linear-gradient(140deg,#1e301c,#101a11);border-radius:16px;padding:15px}\n.mt-admin-stat b{font-size:29px;font-weight:900;color:#a6ff00;display:block;font-variant-numeric:tabular-nums}\n.mt-admin-stat span{display:block;font-size:11px;color:#c2d6b9;margin-top:5px;line-height:1.4}\n.mt-admin-panel{margin:12px 0}\n.mt-admin-panel h3{font-size:17px;margin:0 0 11px}\n.mt-admin-panel p{font-size:12px;color:#c0d1b8;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}\n.mt-admin-panel label{font-size:12px;font-weight:800;display:block;margin:10px 0 5px}\n.mt-admin-panel input,.mt-admin-panel textarea{width:100%;background:#0b150b;color:#fff;border:1px solid #536b45;padding:11px;border-radius:11px;box-sizing:border-box;font:inherit;font-size:13px}\n.mt-admin-panel textarea{min-height:90px;resize:vertical}\n.mt-admin-panel button{border-radius:10px;padding:10px;border:1px solid #5a763c;background:#263b20;color:#e4ffcf;font-weight:800;font-size:12px}\n.mt-admin-panel .mt-admin-primary{background:#a6ff00;color:#1b2b0e;width:100%;margin-top:12px}\n.mt-admin-entry{padding:12px 0;border-top:1px solid #324c2a}\n.mt-admin-entry strong{display:block;font-size:13px}\n.mt-admin-entry small{display:block;color:#95a891;font-size:10px;margin-top:3px}\n.mt-admin-entry .mt-admin-actions{display:flex;gap:7px;flex-wrap:wrap}\n#mt-owner-button{width:100%;background:linear-gradient(130deg,#27441e,#162916);border:1px solid #769e50;border-radius:12px;color:#e6ffd8;padding:12px;font-size:12px;font-weight:900;margin:10px 0 4px}\n";document.head.append(style);
let isOwner=false,lastId='',checking=false,openedOnce=false;
const session=()=>window.MTCloudRuns?.status?.()||{};
const ownerUrl='/api/account/admin-dashboard';
async function role(){
 const user=session();const id=user.loggedIn?String(user.id||''):'';
 if(!id){lastId='';isOwner=false;openedOnce=false;$('mt-owner-button')?.remove();close();return}
 if(checking||id===lastId)return;
 checking=true;
 try{
  const res=await fetch('/api/account/owner',{credentials:'include',cache:'no-store'});
  if(res.ok){
   const data=await res.json();
   if(session().loggedIn&&String(session().id)===id){
    isOwner=!!data.owner;lastId=id;if(!isOwner){$('mt-owner-button')?.remove();close()}
    if(isOwner){
     decorate();
     if(!openedOnce){openedOnce=true;setTimeout(()=>{if(isOwner&&session().loggedIn)open()},450)}
    }
   }
  }else if(res.status===403){isOwner=false;lastId=id;$('mt-owner-button')?.remove();close()}
 }catch(e){}finally{checking=false}
}
async function call(body){
 const r=await fetch(ownerUrl,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,credentials:'include',cache:'no-store'});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(data.error||'Não foi possível abrir o painel.');
 return data;
}
function decorate(){
 if(!isOwner||$('header-text')?.textContent?.trim()!=='Perfil')return;
 const card=$('mt-account-profile');if(!card||$('mt-owner-button'))return;
 const btn=document.createElement('button');btn.id='mt-owner-button';btn.type='button';btn.textContent='🛡️ Administração';btn.onclick=open;card.append(btn);
}
function overlay(){
 let el=$('mt-admin-overlay');
 if(el)return el;
 el=document.createElement('section');el.id='mt-admin-overlay';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.append(el);return el;
}
function close(){const el=$('mt-admin-overlay');if(el)el.hidden=true}
function isOpen(){return !!$('mt-admin-overlay')&&!$('mt-admin-overlay').hidden}
function back(){if(!isOpen())return false;close();return true}
function stat(label,value){return '<div class="mt-admin-stat"><b>'+esc(value||0)+'</b><span>'+esc(label)+'</span></div>'}
function notice(n){return '<div class="mt-admin-entry"><strong>'+esc(n.title)+'</strong><small>'+new Date(n.createdAt).toLocaleString('pt-BR')+(n.active?' · Visível':' · Oculto')+'</small><p>'+esc(n.body)+'</p><div class="mt-admin-actions"><button data-notice-id="'+Number(n.id)+'" data-notice-action="'+(n.active?'hide':'show')+'">'+(n.active?'Ocultar':'Mostrar')+'</button></div></div>'}
function suggestion(s){return '<div class="mt-admin-entry"><strong>'+esc(s.exerciseName)+'</strong><small>'+esc(s.status)+' · '+new Date(s.createdAt).toLocaleString('pt-BR')+'</small><p>'+esc(s.comment||'Sem observações')+'</p><div class="mt-admin-actions"><button data-suggest-id="'+Number(s.id)+'" data-suggest-status="reviewed">Revisado</button><button data-suggest-id="'+Number(s.id)+'" data-suggest-status="added">Adicionado</button></div></div>'}
function render(data){
 const el=overlay(),v=data.stats||{};
 const body='<div class="mt-admin-width"><header class="mt-admin-head"><button class="mt-admin-close" data-admin-close>‹</button><div><h2>Administração</h2><small>Somente a conta do proprietário</small></div><button class="mt-admin-reload" data-admin-refresh>Atualizar</button></header>'+
 '<div class="mt-admin-stats">'+stat('Aparelhos online (últimos 3 min)',v.online)+stat('Aparelhos ativos hoje',v.today)+stat('Contas cadastradas',v.registered)+stat('Corridas salvas na nuvem',v.runs)+stat('Sugestões pendentes',v.pending)+stat('Avisos ativos',v.notices)+'</div>'+
 '<section class="mt-admin-panel"><h3>Comunicados</h3><p>Escreva um aviso para aparecer no sininho dos usuários.</p><form id="mt-admin-compose"><label>Título</label><input name="title" minlength="3" maxlength="100" required placeholder="Atualização disponível"><label>Mensagem</label><textarea name="message" minlength="3" maxlength="1500" required placeholder="Escreva o aviso..."></textarea><button class="mt-admin-primary" type="submit">Publicar aviso</button></form><p id="mt-admin-feedback"></p></section>'+
 '<section class="mt-admin-panel"><h3>Sugestões de exercícios</h3>'+(data.suggestions||[]).map(suggestion).join('')+(data.suggestions?.length?'':'<p>Sem sugestões por enquanto.</p>')+'</section>'+
 '<section class="mt-admin-panel"><h3>Avisos publicados</h3>'+(data.announcements||[]).map(notice).join('')+(data.announcements?.length?'':'<p>Sem avisos publicados.</p>')+'</section>'+
 '<p style="font-size:11px;color:#a5baa0">Os números online representam aparelhos Android ativos recentemente, não pessoas identificadas.</p></div>';
 el.innerHTML=body;
 el.querySelector('[data-admin-close]').onclick=close;
 el.querySelector('[data-admin-refresh]').onclick=()=>open();
 el.querySelector('#mt-admin-compose').onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget,btn=form.querySelector('button'),feedback=$('mt-admin-feedback');
  btn.disabled=true;feedback.textContent='Publicando...';
  try{const formData=new FormData(form);await call({action:'publish',title:String(formData.get('title')||''),message:String(formData.get('message')||'')});feedback.textContent='Aviso publicado!';form.reset();window.MTNoticeBell?.reload?.();setTimeout(open,500)}
  catch(err){feedback.textContent=err.message}finally{btn.disabled=false}
 };
 el.querySelectorAll('[data-suggest-id]').forEach(btn=>btn.onclick=async()=>{
  btn.disabled=true;try{await call({action:'suggestion',id:Number(btn.dataset.suggestId),status:btn.dataset.suggestStatus});await open()}catch(err){btn.disabled=false;alert(err.message)}
 });
 el.querySelectorAll('[data-notice-id]').forEach(btn=>btn.onclick=async()=>{
  btn.disabled=true;try{await call({action:btn.dataset.noticeAction,id:Number(btn.dataset.noticeId)});await open();window.MTNoticeBell?.reload?.()}catch(err){btn.disabled=false;alert(err.message)}
 });
}
async function open(){
 if(!isOwner||!session().loggedIn)return;
 const el=overlay();el.hidden=false;
 el.innerHTML='<div class="mt-admin-width"><header class="mt-admin-head"><button class="mt-admin-close" data-admin-close>‹</button><h2>Administração</h2></header><p>Carregando informações...</p></div>';
 el.querySelector('[data-admin-close]').onclick=close;
 try{const data=await call();if(isOpen()&&isOwner)render(data)}
 catch(e){el.innerHTML='<div class="mt-admin-width"><button data-admin-close class="mt-admin-close">‹ Voltar</button><p>'+esc(e.message)+'</p></div>';el.querySelector('[data-admin-close]').onclick=close}
}
const screen=$('screen');
if(screen)new MutationObserver(()=>setTimeout(decorate,80)).observe(screen,{childList:true,subtree:false});
window.MTOwnerPanel={back,open,role,isOwner:()=>isOwner};
if(window.MTCloudRuns?.listen)window.MTCloudRuns.listen(role);
setTimeout(role,1400);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)role()});
})();