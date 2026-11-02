(function(){
'use strict';
if(window.__mtNoticeBell)return;window.__mtNoticeBell=true;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const style=document.createElement('style');style.id='mt-bell-style';style.textContent="\n#mt-bell-overlay{position:fixed;inset:0;z-index:4050;background:#080e08fa;color:#e9ffdd;overflow-y:auto;padding:calc(15px + env(safe-area-inset-top)) 15px calc(100px + env(safe-area-inset-bottom))}\n#mt-bell-overlay[hidden]{display:none!important}\n#mt-bell-overlay .mt-bell-body{max-width:650px;margin:0 auto}\n#mt-bell-overlay h2{font-size:23px;margin:12px 0}\n#mt-bell-overlay p{font-size:12px;color:#b8cdb1;white-space:pre-wrap;line-height:1.6;overflow-wrap:anywhere}\n#mt-bell-overlay article{border:1px solid #455f35;border-radius:17px;background:#172518;padding:15px;margin:13px 0}\n#mt-bell-overlay article h3{font-size:16px;margin:0 0 8px}\n#mt-bell-overlay small{font-size:10px;color:#92a48a}\n#mt-bell-overlay button{background:#263d1e;border:1px solid #59833e;border-radius:11px;color:#ddffbb;padding:10px 16px;font-size:16px}\n#header-action.mt-unread-bell{position:relative!important}\n#header-action.mt-unread-bell:after{content:'';position:absolute;right:1px;top:1px;width:8px;height:8px;border-radius:50%;background:#a6ff00;border:2px solid #071008;box-shadow:0 0 7px #a6ff00}\n";document.head.append(style);
let notices=[];
const account=()=>window.MTCloudRuns?.status?.()||{};
function readKey(){return 'mt-notice-read:'+(account().id||'visitor')}
function readIds(){try{return JSON.parse(localStorage.getItem(readKey())||'[]')}catch(e){return []}}
function markRead(){localStorage.setItem(readKey(),JSON.stringify(notices.map(n=>String(n.id)).slice(0,100)))}
function updateDot(){
 const bell=$('header-action');if(!bell)return;
 const seen=readIds();bell.classList.toggle('mt-unread-bell',document.body.classList.contains('home-view')&&notices.some(n=>!seen.includes(String(n.id))));
}
async function reload(){
 try{const r=await fetch('/api/announcements',{credentials:'include',cache:'no-store'});if(!r.ok)throw Error();
 const data=await r.json();notices=Array.isArray(data.announcements)?data.announcements:[];localStorage.setItem('mt-notices-cached',JSON.stringify(notices))}
 catch(e){try{notices=JSON.parse(localStorage.getItem('mt-notices-cached')||'[]')}catch(e){}}
 updateDot();if(isOpen())render();
}
function overlay(){
 let el=$('mt-bell-overlay');if(el)return el;
 el=document.createElement('section');el.id='mt-bell-overlay';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.append(el);return el;
}
function isOpen(){return !!$('mt-bell-overlay')&&!$('mt-bell-overlay').hidden}
function close(){const el=$('mt-bell-overlay');if(el)el.hidden=true}
function back(){if(!isOpen())return false;close();return true}
function render(){
 const list=notices.map(n=>'<article><h3>'+esc(n.title)+'</h3><p>'+esc(n.body)+'</p><small>'+new Date(n.createdAt).toLocaleString('pt-BR')+'</small></article>').join('');
 const el=overlay();
 el.innerHTML='<div class="mt-bell-body"><button id="mt-notice-back" type="button" aria-label="Voltar">‹ Voltar</button><h2>Avisos</h2><p>Comunicados oficiais do Marcador de Treino.</p>'+(list||'<article><p>Ainda não há comunicados. 💚</p></article>')+'</div>';
 $('mt-notice-back').onclick=close;
}
function open(){render();overlay().hidden=false;markRead();updateDot();reload()}
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
 try{await fetch('/api/usage-ping',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({deviceId:uuid()}),cache:'no-store'})}catch(e){}
}
window.MTNoticeBell={reload,open,back,isOpen};
setTimeout(()=>{reload();heartbeat()},1200);
setInterval(()=>{if(!document.hidden){heartbeat();updateDot()}},80000);
setInterval(()=>{if(!document.hidden)reload()},145000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){reload();heartbeat()}});
})();