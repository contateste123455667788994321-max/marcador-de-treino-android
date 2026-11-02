(function(){
'use strict';
if(window.__mtNoticeBell)return;window.__mtNoticeBell=true;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const css=document.createElement('style');css.id='mt-bell-style';css.textContent="\n#mt-bell-overlay{position:fixed;inset:0;z-index:4050;background:#080e08fa;color:#e9ffdd;overflow-y:auto;padding:calc(13px + env(safe-area-inset-top)) 15px calc(110px + env(safe-area-inset-bottom))}\n#mt-bell-overlay[hidden]{display:none!important}\n#mt-bell-overlay .mt-bell-body{max-width:650px;margin:0 auto}\n#mt-bell-overlay h2{font-size:23px;margin:12px 0}\n#mt-bell-overlay p{font-size:12px;color:#b8cdb1;white-space:pre-wrap;line-height:1.6;overflow-wrap:anywhere}\n#mt-bell-overlay article{border:1px solid #455f35;border-radius:17px;background:#172518;padding:15px;margin:13px 0}\n#mt-bell-overlay article h3{font-size:16px;margin:0 0 8px}\n#mt-bell-overlay small{font-size:10px;color:#92a48a}\n#mt-bell-overlay button{background:#263d1e;border:1px solid #59833e;border-radius:11px;color:#ddffbb;padding:10px 12px;font-size:13px;font-weight:800}\n#mt-bell-overlay .mt-bell-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:13px 0 17px}\n#mt-bell-overlay .mt-bell-tabs button{font-size:12px;padding:12px 6px;background:#1b2b18;border:1px solid #456139}\n#mt-bell-overlay .mt-bell-tabs button.active{background:#a6ff00;color:#152608;border-color:#a6ff00}\n#mt-bell-overlay .mt-chat-hint{border:1px solid #567944;background:#1d311a;border-radius:14px;padding:12px;color:#c8e0b9;font-size:11px;line-height:1.6;margin:12px 0}\n#mt-bell-overlay .mt-chat-thread{border:1px solid #354e30;border-radius:18px;padding:12px;background:#0b140d;min-height:160px;max-height:52dvh;overflow-y:auto;display:flex;flex-direction:column;gap:10px}\n#mt-bell-overlay .mt-chat-bubble{max-width:85%;border-radius:17px 17px 17px 4px;background:#263c22;border:1px solid #4e6f42;color:#ebffe3;padding:11px 12px;align-self:flex-start;overflow-wrap:anywhere}\n#mt-bell-overlay .mt-chat-bubble.mine{align-self:flex-end;border-radius:17px 17px 4px 17px;background:#304e20;border-color:#779f42}\n#mt-bell-overlay .mt-chat-bubble p{margin:0 0 6px;font-size:13px;color:#eaffd9}\n#mt-bell-overlay .mt-chat-bubble small{font-size:9px;color:#bed6b0}\n#mt-bell-overlay .mt-chat-bubble img{display:block;width:100%;max-width:250px;max-height:270px;object-fit:contain;border-radius:11px;background:#111a12;margin:0 0 7px}\n#mt-bell-overlay .mt-chat-input-row{display:flex;align-items:flex-end;gap:8px;margin-top:11px}\n#mt-bell-overlay .mt-chat-input-row textarea{flex:1;min-width:0;min-height:43px;max-height:110px;resize:vertical;padding:11px;border-radius:14px;background:#172318;border:1px solid #537348;color:#f4ffec;font-family:inherit;font-size:13px}\n#mt-bell-overlay .mt-chat-input-row .mt-camera-button{flex:none;background:#172b18;border:1px solid #67964b;color:#a6ff00;min-height:43px;min-width:43px;border-radius:14px;display:grid;place-items:center}\n#mt-bell-overlay .mt-chat-input-row .mt-chat-send{flex:none;background:#a6ff00;color:#182b0b;border-color:#a6ff00;min-height:43px;border-radius:13px}\n#mt-bell-overlay .mt-chat-input-row button:disabled{opacity:.45}\n#mt-bell-overlay #mt-chat-image-preview{margin:9px 0 0;padding:9px 10px;background:#172818;border:1px solid #537348;border-radius:13px;display:flex;align-items:center;gap:9px;color:#d8f9c9;font-size:11px}\n#mt-bell-overlay #mt-chat-image-preview img{width:57px;height:57px;object-fit:cover;border-radius:9px}\n#mt-bell-overlay #mt-chat-image-preview button{margin-left:auto;white-space:nowrap}\n#mt-bell-overlay .mt-chat-status{min-height:14px;color:#bfff8c;font-size:11px;line-height:1.5;margin:8px 0}\n#mt-bell-overlay .mt-chat-login{background:#a6ff00;color:#12220b;border:0;width:100%;min-height:44px;border-radius:12px;margin-top:8px}\n#header-action.mt-unread-bell{position:relative!important}\n#header-action.mt-unread-bell:after{content:'';position:absolute;right:1px;top:1px;width:8px;height:8px;border-radius:50%;background:#a6ff00;border:2px solid #071008;box-shadow:0 0 7px #a6ff00}\n";document.head.append(css);
const cameraIcon='<svg viewBox="0 0 24 24" height="22" width="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h4l2-2h6l2 2h4v12H3z"/><circle cx="12" cy="13" r="3.5"/></svg>';
const account=()=>window.MTCloudRuns?.status?.()||{};
let notices=[],tab='notices',messages=[],chatBusy=false,attachment=null,attachmentUrl='',lastReply=null;
function readKey(){return 'mt-notice-read:'+(account().id||'visitor')}
function seenKey(){return 'mt-chat-reply-seen:'+(account().id||'visitor')}
function readIds(){try{return JSON.parse(localStorage.getItem(readKey())||'[]')}catch(e){return []}}
function markRead(){localStorage.setItem(readKey(),JSON.stringify(notices.map(n=>String(n.id)).slice(0,100)))}
function markChatRead(){if(account().loggedIn&&lastReply)localStorage.setItem(seenKey(),String(lastReply.id))}
function chatUnread(){return account().loggedIn&&lastReply&&String(lastReply.id)!==localStorage.getItem(seenKey())}
function updateDot(){
 const bell=$('header-action');if(!bell)return;
 const seen=readIds();
 bell.classList.toggle('mt-unread-bell',document.body.classList.contains('home-view')&&(notices.some(n=>!seen.includes(String(n.id)))||chatUnread()));
}
async function checkReply(){
 if(!account().loggedIn){lastReply=null;updateDot();return}
 try{
  const r=await fetch('/api/account/support-notifications',{credentials:'include',cache:'no-store'});
  if(!r.ok)return;
  const data=await r.json();lastReply=data.lastReply||null;
  updateDot();if(isOpen()&&tab==='notices'){const b=$('mt-chat-tab');if(b)b.textContent='Falar com criador'+(chatUnread()?' •':'')}
 }catch(e){}
}
async function reload(){
 try{
  const r=await fetch('/api/announcements',{credentials:'include',cache:'no-store'});if(!r.ok)throw Error();
  const data=await r.json();notices=Array.isArray(data.announcements)?data.announcements:[];
  localStorage.setItem('mt-notices-cached',JSON.stringify(notices));
 }catch(e){try{notices=JSON.parse(localStorage.getItem('mt-notices-cached')||'[]')}catch(e){}}
 updateDot();if(isOpen()&&tab==='notices')render();
}
function overlay(){
 let el=$('mt-bell-overlay');if(el)return el;
 el=document.createElement('section');el.id='mt-bell-overlay';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.append(el);return el;
}
function isOpen(){return !!$('mt-bell-overlay')&&!$('mt-bell-overlay').hidden}
function clearAttachment(){if(attachmentUrl)URL.revokeObjectURL(attachmentUrl);attachment=null;attachmentUrl=''}
function close(){const el=$('mt-bell-overlay');if(el)el.hidden=true;clearAttachment()}
function back(){if(!isOpen())return false;close();return true}
function header(){
 return '<div class="mt-bell-body"><button id="mt-notice-back" type="button" aria-label="Voltar">‹ Voltar</button>'+
 '<h2>Mensagens e avisos</h2><div class="mt-bell-tabs"><button id="mt-notices-tab" class="'+(tab==='notices'?'active':'')+'" type="button">Avisos oficiais</button>'+
 '<button id="mt-chat-tab" class="'+(tab==='chat'?'active':'')+'" type="button">Falar com criador'+(chatUnread()?' •':'')+'</button></div><div id="mt-bell-main"></div></div>';
}
function setupTabs(){
 $('mt-notice-back').onclick=close;
 $('mt-notices-tab').onclick=()=>{tab='notices';markRead();render()};
 $('mt-chat-tab').onclick=()=>{tab='chat';markChatRead();render();loadConversation()};
}
function renderNotices(){
 const list=notices.map(n=>'<article><h3>'+esc(n.title)+'</h3><p>'+esc(n.body)+'</p><small>'+new Date(n.createdAt).toLocaleString('pt-BR')+'</small></article>').join('');
 $('mt-bell-main').innerHTML='<p>Comunicados oficiais do Marcador de Treino.</p>'+(list||'<article><p>Ainda não há comunicados. 💚</p></article>');
}
function bubbles(){
 if(!messages.length)return '<p>A conversa começa aqui! Mande uma dúvida ou sugestão. 💚</p>';
 return messages.map(m=>'<div class="mt-chat-bubble '+(m.senderRole==='user'?'mine':'')+'">'+
 (m.hasImage?'<img alt="Foto enviada na conversa" loading="lazy" src="/api/account/support-image?id='+Number(m.id)+'">':'')+
 (m.body?'<p>'+esc(m.body)+'</p>':'')+
 '<small>'+(m.senderRole==='user'?'Você':'Equipe Marcador de Treino')+' · '+new Date(m.createdAt).toLocaleString('pt-BR')+'</small></div>').join('');
}
function chatForm(){
 return '<form id="mt-chat-form">'+
 '<div id="mt-chat-image-preview" hidden></div>'+
 '<div class="mt-chat-input-row">'+
 '<button id="mt-chat-photo-button" class="mt-camera-button" type="button" aria-label="Enviar uma foto" title="Adicionar foto">'+cameraIcon+'</button>'+
 '<input id="mt-chat-photo-input" type="file" accept="image/*" style="display:none" aria-label="Escolher foto">'+
 '<textarea id="mt-chat-input" maxlength="1500" placeholder="Escreva sua mensagem..." aria-label="Mensagem para o criador"></textarea>'+
 '<button id="mt-chat-send" class="mt-chat-send" type="submit">Enviar</button></div>'+
 '<p class="mt-chat-status" id="mt-chat-status" role="status" aria-live="polite"></p></form>';
}
function renderChat(){
 if(!account().loggedIn){
  $('mt-bell-main').innerHTML='<article><h3>Converse com o criador 💚</h3><p>Entre na sua conta para enviar uma mensagem e receber uma resposta privada.</p><button class="mt-chat-login" id="mt-chat-login">Entrar com e-mail</button></article>';
  $('mt-chat-login').onclick=()=>{close();window.MTCloudRuns?.show?.()};
  return;
 }
 $('mt-bell-main').innerHTML='<div class="mt-chat-hint"><strong>Atendimento do Marcador de Treino 💚</strong><div>As mensagens são privadas. O atendimento não é imediato, então a resposta pode levar algum tempo. Você poderá voltar aqui para ler a resposta.</div></div>'+
 '<div class="mt-chat-thread" id="mt-chat-thread" role="log" aria-label="Conversa com o criador">'+bubbles()+'</div>'+chatForm();
 const input=$('mt-chat-photo-input');
 $('mt-chat-photo-button').onclick=()=>input.click();
 input.onchange=()=>{const f=input.files?.[0];if(!f)return;if(!f.type.startsWith('image/')){$('mt-chat-status').textContent='Escolha um arquivo de imagem.';return}
  if(f.size>15*1024*1024){$('mt-chat-status').textContent='Foto muito grande. Escolha uma imagem menor.';return}
  clearAttachment();attachment=f;attachmentUrl=URL.createObjectURL(f);updatePreview();
 };
 $('mt-chat-form').onsubmit=sendMessage;
 const thread=$('mt-chat-thread');thread.scrollTop=thread.scrollHeight;
}
function updatePreview(){
 const target=$('mt-chat-image-preview');if(!target)return;
 if(!attachment){target.hidden=true;target.replaceChildren();return}
 target.hidden=false;target.innerHTML='<img alt="Foto escolhida" src="'+attachmentUrl+'"><span>Foto pronta para enviar</span><button type="button" id="mt-chat-remove">Remover</button>';
 $('mt-chat-remove').onclick=()=>{clearAttachment();updatePreview()};
}
async function optimizedPhoto(file){
 const bitmap=await createImageBitmap(file);
 const longest=Math.max(bitmap.width,bitmap.height);
 const scale=Math.min(1,1200/Math.max(1,longest));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
 const cx=canvas.getContext('2d');if(!cx){bitmap.close();throw Error('Não foi possível preparar a foto.')}
 cx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Falha ao compactar foto')),'image/jpeg',0.78));
}
async function sendMessage(e){
 e.preventDefault();if(chatBusy)return;
 const body=$('mt-chat-input')?.value.trim()||'';
 if(!attachment&&body.length<3){$('mt-chat-status').textContent='Escreva ao menos 3 caracteres ou adicione uma foto.';return}
 const btn=$('mt-chat-send'),status=$('mt-chat-status');
 chatBusy=true;btn.disabled=true;status.textContent=attachment?'Enviando foto...':'Enviando mensagem...';
 try{
  let r;
  if(attachment){
   const compressed=await optimizedPhoto(attachment);
   if(compressed.size>2*1024*1024)throw Error('A imagem ficou grande demais. Escolha uma foto menor.');
   const fd=new FormData();fd.append('file',compressed,'foto.jpg');fd.append('caption',body);
   r=await fetch('/api/account/support-image-upload',{method:'POST',credentials:'include',body:fd});
  }else{
   r=await fetch('/api/account/support',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:body})});
  }
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(data.error||'Não foi possível enviar agora.');
  clearAttachment();messages=[];await loadConversation();
  if($('mt-chat-status'))$('mt-chat-status').textContent='Enviado! O criador responderá assim que possível. 💚';
 }catch(error){if(status)status.textContent=error.message||'Erro de conexão';}
 finally{chatBusy=false;if($('mt-chat-send'))$('mt-chat-send').disabled=false}
}
async function loadConversation(){
 if(!account().loggedIn||!isOpen()||tab!=='chat')return;
 try{
  const r=await fetch('/api/account/support',{credentials:'include',cache:'no-store'});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(data.error||'Não foi possível carregar a conversa.');
  messages=Array.isArray(data.messages)?data.messages:[];
  if(isOpen()&&tab==='chat'){
   // Keep the draft if the user is typing; update only the chat bubbles.
   const thread=$('mt-chat-thread');if(thread){thread.innerHTML=bubbles();thread.scrollTop=thread.scrollHeight;}
   else renderChat();
  }
  await checkReply();markChatRead();updateDot();
 }catch(e){const node=$('mt-chat-status');if(node)node.textContent=e.message}
}
function render(){
 const el=overlay();el.innerHTML=header();setupTabs();
 if(tab==='notices')renderNotices();else renderChat();
}
function open(){tab='notices';render();overlay().hidden=false;markRead();updateDot();reload();checkReply()}
document.addEventListener('click',e=>{
 const bell=e.target.closest?.('#header-action');
 if(!bell||!document.body.classList.contains('home-view'))return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open();
},true);
const head=$('header-action');if(head)new MutationObserver(()=>setTimeout(updateDot,30)).observe(head,{childList:true,subtree:false});
function uuid(){
 let id=localStorage.getItem('mt-device-anonymous');
 if(id&&/^[0-9a-f-]{36}$/i.test(id))return id;
 if(crypto.randomUUID)id=crypto.randomUUID();
 else{const a=new Uint8Array(16);crypto.getRandomValues(a);a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;const s=[...a].map(x=>x.toString(16).padStart(2,'0')).join('');id=s.slice(0,8)+'-'+s.slice(8,12)+'-'+s.slice(12,16)+'-'+s.slice(16,20)+'-'+s.slice(20)}
 localStorage.setItem('mt-device-anonymous',id);return id;
}
async function heartbeat(){
 if(document.hidden)return;
 try{
  const endpoint=account().loggedIn?'/api/account/activity':'/api/usage-ping';
  await fetch(endpoint,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({deviceId:uuid()}),cache:'no-store'});
 }catch(e){}
}
let lastChatUser=String(account().id||'visitor');
if(window.MTCloudRuns?.listen)window.MTCloudRuns.listen(()=>{const next=String(account().id||'visitor');if(next===lastChatUser)return;lastChatUser=next;clearAttachment();lastReply=null;messages=[];checkReply();if(isOpen()&&tab==='chat')render()});
window.MTNoticeBell={reload,open,back,isOpen};
setTimeout(()=>{reload();heartbeat();checkReply()},1400);
setInterval(()=>{if(!document.hidden){heartbeat();updateDot()}},80000);
setInterval(()=>{if(!document.hidden){reload();checkReply()}},115000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){reload();heartbeat();checkReply()}});
})();