(function(){
'use strict';
if(window.__mtOwnerTools)return;window.__mtOwnerTools=true;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const st=document.createElement('style');st.id='mt-owner-tools-css';st.textContent="\n#mt-owner-tools-overlay{position:fixed;inset:0;z-index:4150;background:#080e09fa;color:#e9ffe4;overflow-y:auto;padding:calc(14px + env(safe-area-inset-top)) 14px calc(100px + env(safe-area-inset-bottom))}\n#mt-owner-tools-overlay[hidden]{display:none!important}\n#mt-bell-overlay #mt-chat-image-preview[hidden]{display:none!important}\n#mt-owner-tools-overlay .mt-tools-inner{max-width:680px;margin:auto}\n#mt-owner-tools-overlay h2{font-size:22px;margin:0}\n#mt-owner-tools-overlay h3{font-size:16px;margin:0 0 8px}\n#mt-owner-tools-overlay .mt-tools-top{display:flex;align-items:center;gap:12px;margin-bottom:19px}\n#mt-owner-tools-overlay .mt-tools-top button{flex:none}\n#mt-owner-tools-overlay button{border:1px solid #587748;border-radius:11px;padding:11px 13px;background:#20391c;color:#ddffce;font-size:12px;font-weight:850}\n#mt-owner-tools-overlay button.primary{background:#a6ff00;color:#162b08;border-color:#a6ff00}\n#mt-owner-tools-overlay button.danger{background:#422521;color:#ffd8c9;border-color:#874f46}\n#mt-owner-tools-overlay button:disabled{opacity:.55}\n#mt-owner-tools-overlay .mt-tools-card{border-radius:17px;border:1px solid #49633c;background:#172517;padding:15px;margin:12px 0}\n#mt-owner-tools-overlay p{font-size:12px;color:#bbceb2;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}\n#mt-owner-tools-overlay small{font-size:10px;color:#98af8e}\n#mt-owner-tools-overlay input,#mt-owner-tools-overlay textarea{display:block;width:100%;border:1px solid #527248;border-radius:12px;background:#0b150c;color:#edffe7;padding:12px;box-sizing:border-box;font:inherit;font-size:13px;margin:9px 0}\n#mt-owner-tools-overlay textarea{min-height:90px;resize:vertical}\n#mt-owner-tools-overlay .mt-tools-row{display:flex;gap:9px;flex-wrap:wrap;align-items:center;margin-top:11px}\n#mt-owner-tools-overlay .mt-tools-msg{margin:8px 0;color:#b7ff7a;font-size:11px;min-height:18px}\n#mt-owner-tools-overlay .mt-admin-chat{border:1px solid #425d38;border-radius:16px;padding:10px;background:#0c150e;display:flex;flex-direction:column;gap:9px;max-height:54dvh;overflow-y:auto}\n#mt-owner-tools-overlay .mt-admin-bubble{align-self:flex-start;max-width:83%;border-radius:15px 15px 15px 4px;background:#284026;border:1px solid #4c6c43;padding:10px}\n#mt-owner-tools-overlay .mt-admin-bubble.mine{align-self:flex-end;border-radius:15px 15px 4px 15px;background:#355322;border-color:#70994a}\n#mt-owner-tools-overlay .mt-admin-bubble p{margin:0 0 4px;color:#efffe7}\n#mt-owner-tools-overlay .mt-admin-bubble img{max-width:270px;width:100%;max-height:270px;object-fit:contain;border-radius:10px;display:block;margin-bottom:8px}\n#mt-owner-tools-overlay .mt-tools-confirm{border-radius:13px;padding:13px;background:#38261c;border:1px solid #88583c;margin:12px 0}\n#mt-admin-overlay .mt-admin-stat[data-mt-list]{cursor:pointer;border-color:#618d43}\n#mt-admin-overlay .mt-admin-stat[data-mt-list]:after{content:'Toque para ver';display:block;font-size:10px;color:#a6ff00;margin-top:5px}\n#mt-admin-overlay #mt-owner-contact-btn,#mt-admin-overlay #mt-owner-users-btn{width:100%;border:1px solid #6d9547;background:linear-gradient(110deg,#30501e,#1c3018);color:#e1ffd2;border-radius:12px;padding:12px;font-size:12px;font-weight:900;margin-top:5px}\n#mt-admin-overlay .mt-admin-entry .mt-addon-buttons{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}\n#mt-admin-overlay .mt-admin-entry .mt-addon-buttons button{font-size:11px}\n#mt-admin-overlay .mt-owner-clear{background:#402522;color:#ffcfc4;border-color:#87453b;margin-top:10px}\n";document.head.append(st);
const owner=()=>!!window.MTOwnerPanel?.isOwner?.()&&!!window.MTCloudRuns?.status?.().loggedIn;
let working=false;
function overlay(){let el=$('mt-owner-tools-overlay');if(!el){el=document.createElement('section');el.id='mt-owner-tools-overlay';el.hidden=true;document.body.append(el)}return el}
function openFrame(title){
 const el=overlay();el.hidden=false;
 el.innerHTML='<div class="mt-tools-inner"><header class="mt-tools-top"><button id="mt-tools-back" type="button">‹ Voltar</button><h2>'+esc(title)+'</h2></header><div id="mt-tools-main"></div></div>';
 $('mt-tools-back').onclick=close;
 return $('mt-tools-main');
}
function close(){overlay().hidden=true}
function back(){if(overlay().hidden)return false;close();return true}
async function api(path,data){
 const r=await fetch(path,{method:data?'POST':'GET',credentials:'include',cache:'no-store',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined});
 const body=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(body.error||'Falha na conexão ('+r.status+')');
 return body;
}
function messageBox(text){return '<div class="mt-tools-card"><p>'+esc(text)+'</p></div>'}
async function inbox(){
 if(!owner())return;const el=openFrame('Mensagens dos alunos');
 el.innerHTML='<p>Carregando conversas privadas...</p>';
 try{
  const data=await api('/api/account/support-admin');
  if(!data.threads.length){el.innerHTML=messageBox('Ainda não chegou nenhuma mensagem de aluno. Elas aparecerão aqui quando alguém usar o sininho.');return}
  el.replaceChildren();
  for(const t of data.threads){
   const a=document.createElement('article');a.className='mt-tools-card';
   const h=document.createElement('h3');h.textContent=t.name||t.email;
   const p=document.createElement('p');p.textContent=t.preview||'Nenhuma mensagem';
   const small=document.createElement('small');small.textContent=(t.email||'')+' · '+new Date(t.updatedAt).toLocaleString('pt-BR')+' · '+(t.status==='closed'?'Encerrada':'Aberta');
   const button=document.createElement('button');button.textContent='Abrir conversa';button.className='primary';button.onclick=()=>conversation(Number(t.id));
   a.append(h,p,small,document.createElement('div'),button);el.append(a);
  }
 }catch(err){el.innerHTML=messageBox(err.message)}
}
async function conversation(threadId){
 if(!owner())return;const target=openFrame('Conversa privada');target.innerHTML='<p>Carregando mensagens...</p>';
 try{
  const data=await api('/api/account/support-admin?thread='+encodeURIComponent(threadId));
  target.replaceChildren();
  const title=document.createElement('h3');title.textContent=data.thread.name||data.thread.email;
  const contact=document.createElement('small');contact.textContent=(data.thread.email||'')+' · '+(data.thread.status==='closed'?'Atendimento encerrado':'Em atendimento');
  const history=document.createElement('div');history.className='mt-admin-chat';
  for(const m of data.messages){
   const msg=document.createElement('div');msg.className='mt-admin-bubble '+(m.senderRole==='owner'?'mine':'');
   if(m.hasImage){const picture=document.createElement('img');picture.src='/api/account/support-image?id='+Number(m.id);picture.alt='Foto enviada pelo aluno';picture.loading='lazy';msg.append(picture)}
   if(m.body){const p=document.createElement('p');p.textContent=m.body;msg.append(p)}
   const time=document.createElement('small');time.textContent=(m.senderRole==='owner'?'Você':'Aluno')+' · '+new Date(m.createdAt).toLocaleString('pt-BR');msg.append(time);history.append(msg);
  }
  const reply=document.createElement('form');reply.id='mt-tools-reply';reply.innerHTML='<label for="mt-tools-answer">Sua resposta</label><textarea id="mt-tools-answer" minlength="3" maxlength="1500" required placeholder="Escreva a resposta ao aluno..."></textarea><button type="submit" class="primary">Responder aluno</button><p id="mt-tools-feedback" class="mt-tools-msg" role="status"></p>';
  reply.onsubmit=async e=>{
   e.preventDefault();const text=$('mt-tools-answer').value.trim();if(text.length<3)return;
   const btn=reply.querySelector('button');btn.disabled=true;
   try{await api('/api/account/support-admin',{action:'reply',id:threadId,message:text});await conversation(threadId)}
   catch(err){$('mt-tools-feedback').textContent=err.message;btn.disabled=false}
  };
  const status=document.createElement('button');status.className='secondary';status.textContent=data.thread.status==='closed'?'Reabrir conversa':'Marcar como atendido';
  status.onclick=async()=>{status.disabled=true;try{await api('/api/account/support-admin',{action:data.thread.status==='closed'?'reopen':'close',id:threadId});await conversation(threadId)}catch(err){status.disabled=false;alert(err.message)}};
  const goBack=document.createElement('button');goBack.textContent='Voltar à caixa de entrada';goBack.onclick=inbox;
  const tools=document.createElement('div');tools.className='mt-tools-row';tools.append(status,goBack);
  target.append(title,contact,history,reply,tools);history.scrollTop=history.scrollHeight;
 }catch(err){target.innerHTML=messageBox(err.message)}
}
async function users(q='',onlyOnline=false){
 if(!owner())return;const target=openFrame(onlyOnline?'Online agora':'Buscar usuários');
 target.innerHTML='<form id="mt-tools-search"><input id="mt-tools-search-value" placeholder="Buscar por nome ou e-mail..." value="'+esc(q)+'" maxlength="120"><div class="mt-tools-row"><button type="submit" class="primary">Pesquisar</button><button type="button" id="mt-tools-all-users">Todas as contas</button><button type="button" id="mt-tools-active-users">Online</button></div></form><p id="mt-tools-user-status" class="mt-tools-msg"></p><div id="mt-tools-user-list"></div>';
 $('mt-tools-search').onsubmit=e=>{e.preventDefault();users($('mt-tools-search-value').value.trim(),onlyOnline)};
 $('mt-tools-all-users').onclick=()=>users('',false);
 $('mt-tools-active-users').onclick=()=>users('',true);
 try{
  const d=await api('/api/account/admin-users?q='+encodeURIComponent(q)+(onlyOnline?'&online=1':''));
  const list=$('mt-tools-user-list');if(!list)return;
  list.replaceChildren();
  $('mt-tools-user-status').textContent=d.users.length+' conta(s) encontradas. Online é uma estimativa dos últimos 3 minutos.';
  for(const u of d.users){
   const entry=document.createElement('article');entry.className='mt-tools-card';
   const name=document.createElement('h3');name.textContent=u.name||u.email;
   const detail=document.createElement('small');detail.textContent=(u.email||'')+' · '+(u.banned?'Interações bloqueadas':u.online?'Online recentemente':'Sem atividade recente');
   const action=document.createElement('button');action.textContent='Ver conta';action.onclick=()=>userDetails(u);
   entry.append(name,detail,document.createElement('br'),action);list.append(entry);
  }
 }catch(err){$('mt-tools-user-status').textContent=err.message}
}
function confirmation(target,text,onYes){
 const existing=$('mt-tools-confirm');if(existing)existing.remove();
 const box=document.createElement('div');box.id='mt-tools-confirm';box.className='mt-tools-confirm';
 const p=document.createElement('p');p.textContent=text;
 const row=document.createElement('div');row.className='mt-tools-row';
 const no=document.createElement('button');no.textContent='Cancelar';no.onclick=()=>box.remove();
 const yes=document.createElement('button');yes.className='danger';yes.textContent='Confirmar';yes.onclick=async()=>{yes.disabled=true;try{await onYes();box.remove()}catch(err){p.textContent=err.message;yes.disabled=false}};
 row.append(no,yes);box.append(p,row);target.append(box);
 box.scrollIntoView({block:'nearest'});
}
function userDetails(u){
 if(!owner())return;
 const target=openFrame('Dados da conta');
 const name=document.createElement('h3');name.textContent=u.name||u.email;
 const desc=document.createElement('p');desc.textContent='E-mail: '+(u.email||'Não disponível')+'\nAtividade: '+(u.lastSeen?new Date(u.lastSeen).toLocaleString('pt-BR'):'Não registrada')+'\nSituação: '+(u.banned?'Interações bloqueadas':'Ativa')+'\nO aplicativo não coleta IP para este painel.';
 const info=document.createElement('p');info.textContent='O bloqueio impede novas mensagens e sugestões. Não apaga treinos nem registros locais da pessoa.';
 const reason=document.createElement('textarea');reason.placeholder='Motivo do bloqueio (opcional)';reason.maxLength=200;
 const ban=document.createElement('button');ban.className=u.banned?'primary':'danger';ban.textContent=u.banned?'Desbloquear interações':'Bloquear interações';
 ban.onclick=()=>confirmation(target,(u.banned?'Desbloquear':'Bloquear')+' a conta '+u.email+'?',async()=>{
  await api('/api/account/admin-users',{action:u.banned?'unban':'ban',userId:u.id,reason:reason.value.trim()});
  await users(u.email||'',false);
 });
 const go=document.createElement('button');go.textContent='Voltar à lista';go.onclick=()=>users('',false);
 const row=document.createElement('div');row.className='mt-tools-row';row.append(ban,go);
 target.append(name,desc,info,reason,row);
}
async function suggestionDetails(id){
 if(!owner())return;
 const target=openFrame('Sugestão recebida');
 try{
  const data=await api('/api/account/admin-dashboard');
  const s=(data.suggestions||[]).find(a=>Number(a.id)===Number(id));
  if(!s){target.innerHTML=messageBox('Sugestão não encontrada ou já apagada.');return}
  const heading=document.createElement('h3');heading.textContent=s.exerciseName;
  const detail=document.createElement('p');detail.textContent=s.comment||'Sem comentário';
  const student=document.createElement('small');student.textContent=s.userEmail?'Enviado por: '+s.userEmail:'Sugestão antiga sem conta identificada';
  const actions=document.createElement('div');actions.className='mt-tools-row';
  if(s.userId){
   const lookup=document.createElement('button');lookup.textContent='Ver conta do autor';lookup.onclick=()=>users(s.userEmail||'',false);actions.append(lookup);
  }
  const remove=document.createElement('button');remove.textContent='Apagar sugestão';remove.className='danger';
  remove.onclick=()=>confirmation(target,'Apagar definitivamente esta sugestão?',async()=>{await api('/api/account/admin-dashboard',{action:'deleteSuggestion',id:Number(id)});close();window.MTOwnerPanel?.open?.()});
  const backbtn=document.createElement('button');backbtn.textContent='Voltar';backbtn.onclick=close;
  actions.append(remove,backbtn);target.append(heading,student,detail,actions);
 }catch(err){target.innerHTML=messageBox(err.message)}
}
function clearSuggestions(){
 if(!owner())return;
 const root=document.querySelector('#mt-admin-overlay .mt-admin-panel');if(!root)return;
 confirmation(root,'Apagar TODAS as sugestões de exercícios recebidas? Esta ação não pode ser desfeita.',async()=>{
  await api('/api/account/admin-dashboard',{action:'clearSuggestions'});window.MTOwnerPanel?.open?.();
 });
}
function decorate(){
 if(!owner()||!$('mt-admin-overlay')||$('mt-admin-overlay').hidden)return;
 const container=document.querySelector('#mt-admin-overlay .mt-admin-width');if(!container||$('mt-owner-contact-btn'))return;
 const title=[...container.querySelectorAll('h3')].find(e=>e.textContent==='Sugestões de exercícios');
 if(!title)return;
 const section=document.createElement('section');section.className='mt-admin-panel';
 section.innerHTML='<h3>Atendimento dos alunos</h3><p>Converse e responda às mensagens enviadas pelo sininho. As fotos ficam privadas.</p>'+
 '<button id="mt-owner-contact-btn" type="button">Mensagens dos alunos</button>'+
 '<h3 style="margin-top:16px">Contas e moderação</h3><p>Procure contas, veja atividade recente e bloqueie interações abusivas.</p>'+
 '<button id="mt-owner-users-btn" type="button">Procurar usuários</button>';
 title.closest('.mt-admin-panel')?.before(section);
 $('mt-owner-contact-btn').onclick=inbox;$('mt-owner-users-btn').onclick=()=>users('',false);
 const stats=[...container.querySelectorAll('.mt-admin-stat')];
 for(const stat of stats){
  const span=stat.querySelector('span');if(!span)continue;
  if(span.textContent.includes('online')){stat.dataset.mtList='online';stat.setAttribute('role','button');stat.tabIndex=0;stat.onclick=()=>users('',true)}
  else if(span.textContent.includes('Contas cadastradas')){stat.dataset.mtList='all';stat.setAttribute('role','button');stat.tabIndex=0;stat.onclick=()=>users('',false)}
  if(stat.dataset.mtList)stat.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();stat.click()}};
 }
 for(const firstButton of container.querySelectorAll('[data-suggest-id]')){
  const entry=firstButton.closest('.mt-admin-entry');if(!entry||entry.querySelector('.mt-addon-buttons'))continue;
  const div=document.createElement('div');div.className='mt-addon-buttons';
  const view=document.createElement('button');view.textContent='Ver comentário e autor';view.onclick=()=>suggestionDetails(Number(firstButton.dataset.suggestId));
  const del=document.createElement('button');del.textContent='Apagar';del.onclick=()=>suggestionDetails(Number(firstButton.dataset.suggestId));
  div.append(view,del);entry.append(div);
 }
 const suggestionsPanel=title.closest('.mt-admin-panel');
 if(suggestionsPanel&&!suggestionsPanel.querySelector('.mt-owner-clear')){
  const clear=document.createElement('button');clear.textContent='Limpar caixa de sugestões';clear.className='mt-owner-clear';clear.onclick=clearSuggestions;suggestionsPanel.append(clear);
 }
}
let timer=false;
const observer=new MutationObserver(()=>{if(timer)return;timer=true;setTimeout(()=>{timer=false;decorate()},70)});
observer.observe(document.body,{childList:true,subtree:true});
window.MTOwnerTools={back,inbox,users,close};
setInterval(()=>{if(!document.hidden&&!working)decorate()},2800);
})();