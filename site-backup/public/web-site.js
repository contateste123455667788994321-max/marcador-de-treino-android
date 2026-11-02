(function(){
'use strict';
let native=false;
try{native=new URLSearchParams(location.search).get('native')==='1'||sessionStorage.getItem('mt-native-session')==='1'||/;\s*wv\b/i.test(navigator.userAgent);if(new URLSearchParams(location.search).get('native')==='1')sessionStorage.setItem('mt-native-session','1')}catch(error){}
if(native)return;
document.documentElement.classList.add('mt-web');
const pageNames={home:'Início',workout:'Meu treino',exercises:'Exercícios',diet:'Minha dieta',progress:'Evolução',music:'Música',profile:'Minha conta','steps-history':'Passos e metas'};
const buttonNames={home:'home',workout:'workout',diet:'diet',music:'music'};
function visit(page){
 if(buttonNames[page]){document.querySelector('#bottom-nav [data-nav="'+page+'"]')?.click();return;}
 document.querySelector('#bottom-nav [data-nav="home"]')?.click();
 if(page==='profile')document.getElementById('header-profile')?.click();
 else document.querySelector('#screen [data-go="'+page+'"]')?.click();
}
function current(){
 const name=document.getElementById('header-text')?.textContent||'';
 const map={'Marcador de Treino':'home','Meu Treino':'workout','Meus Exercícios':'exercises','Executar Exercício':'workout','Dieta':'diet','Progresso':'progress','Music':'music','Perfil':'profile','Histórico de Passos':'steps-history'};
 return map[name]||'home';
}
function refreshNav(){
 const page=current();
 document.querySelectorAll('#mt-web-sidebar [data-web-page]').forEach(b=>{if(b.dataset.webPage===page)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
}
function shell(){
 if(document.getElementById('mt-web-topbar'))return;
 const top=document.createElement('div');top.id='mt-web-topbar';
 top.innerHTML='<a class="mt-site-brand" href="/" aria-label="Página inicial do Marcador de Treino"><span class="mt-site-brand-icon"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#a6ff00" stroke-width="2.5" stroke-linecap="round"><path d="M3 9v6m4-9v12m10-12v12m4-9v6M3 12h18"/></svg></span><span><span class="mt-site-brand-title">MARCADOR <strong>DE TREINO</strong></span><small class="mt-site-tagline">Seu espaço de treino, nutrição e evolução</small></span></a><div class="mt-site-actions"><a class="mt-site-android" target="_blank" rel="noopener" href="https://github.com/contateste123455667788994321-max/marcador-de-treino-android/releases/latest">⬇ Baixar aplicativo Android</a></div>';
 const sidebar=document.createElement('aside');sidebar.id='mt-web-sidebar';sidebar.setAttribute('aria-label','Menu do site');
 const items=[['home','⌂','Início'],['workout','▦','Meu treino'],['exercises','♢','Biblioteca de exercícios'],['diet','◉','Dieta'],['progress','▥','Evolução'],['music','♫','Música'],['steps-history','↟','Passos e metas'],['profile','♙','Minha conta']];
 sidebar.innerHTML='<div class="mt-web-caption">Navegação</div>'+items.map(([page,symbol,label])=>'<button type="button" data-web-page="'+page+'"><span class="mt-web-symbol" aria-hidden="true">'+symbol+'</span><span>'+label+'</span></button>').join('')+'<div class="mt-web-note">Marcador de Treino no navegador<br>Treinos e alimentação em qualquer tela. Contagem em segundo plano e sensores avançados disponíveis no Android.</div>';
 sidebar.querySelectorAll('[data-web-page]').forEach(b=>b.addEventListener('click',()=>{visit(b.dataset.webPage);refreshNav()}));
 top.querySelector('.mt-site-brand').addEventListener('click',e=>{e.preventDefault();visit('home')});
 document.body.insertBefore(top,document.getElementById('app'));
 document.body.insertBefore(sidebar,document.getElementById('app'));
 const label=document.getElementById('header-text');if(label)new MutationObserver(refreshNav).observe(label,{childList:true,characterData:true,subtree:true});
 refreshNav();
}
function loadFile(path){
 return new Promise(resolve=>{
  const element=document.createElement('script');element.src=path;element.async=false;
  element.onload=()=>resolve(true);element.onerror=()=>{console.warn('Recurso indisponível:',path);resolve(false)};
  document.body.appendChild(element);
 });
}
async function ready(){
 shell();
 const files=['/web-account-cloud.js?v=1','/web-account-profile.js?v=1','/web-profile-photo.js?v=1','/web-notices.js?v=1','/web-owner-panel.js?v=1','/web-owner-tools.js?v=1'];
 for(const file of files)await loadFile(file);
}
if(document.readyState==='complete')ready();
else window.addEventListener('load',ready,{once:true});
})();