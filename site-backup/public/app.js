(() => {
'use strict';
const $=id=>document.getElementById(id);
const icons={
home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
dumbbell:'<path d="m6.5 6.5 11 11M3 8l5-5M2 11l9-9M13 22l9-9M16 21l5-5M3 8l5 5M11 16l5 5"/>',
shoe:'<path d="M2.5 14.5c1.5-2 4.5-2.7 6.2-5.7l1.3-4.4c1.7 2.5 3.6 3.4 6.3 4.4l4.3 1.5c1.2.5 1.8 1.6 1.8 3.2v3.1c0 1.7-1.1 2.8-3 2.8H5c-2.1 0-3-1.1-3-3v-1.4c0-.7.2-1.2.5-1.5zM2.5 15.3c5.8 2 13.3 1.4 19.5-.2M12 8.5l-2.2 2.6M15.2 10l-2 2.4"/>',
calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 4h3m3 0h3m-9 3h3"/>',
utensils:'<path d="M4 3v7m4-7v7M2 3v4a4 4 0 0 0 8 0V3M6 11v10M17 3c-4 4-4 9 0 11h4V3zM19 14v7"/>',
apple:'<path d="M12 7c-2.5-2.7-5.9-2.6-8.1.1-2.5 3-1.5 8.6 1.1 11.5 1.6 2 3.6 3 5.3 2.4 1.1-.4 1.5-.4 2.7 0 1.8.6 3.7-.4 5.3-2.4 2.6-2.9 3.6-8.5 1.1-11.5C18 4.4 14.5 4.3 12 7zM12 7c-.1-3 1.6-4.6 4-5"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9M10 21h4"/>',
back:'<path d="m15 18-6-6 6-6"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
check:'<path d="m4 12 5 5L20 6"/>',
chevron:'<path d="m9 18 6-6-6-6"/>',
play:'<path d="m8 5 11 7-11 7z"/>',
pause:'<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
skip:'<path d="m5 5 10 7-10 7zM19 5v14"/>',
previous:'<path d="m19 5-10 7 10 7zM5 5v14"/>',
shuffle:'<path d="M3 6h4c5 0 5 12 10 12h4m-3-3 3 3-3 3M3 18h4c2 0 3-2 4-4m2-4c1-2 2-4 4-4h4m-3-3 3 3-3 3"/>',
repeat:'<path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3"/>',
volume:'<path d="M3 9v6h4l5 4V5L7 9zM16 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/>',
music:'<path d="M9 18V5l12-2v13M9 9l12-2"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
flame:'<path d="M12 22c-5 0-8-4-8-8 0-4 4-7 4-11 3 2 4 5 4 7 1-1 2-3 2-5 4 3 6 6 6 10 0 4-3 7-8 7z"/>',
footprints:'<path d="M8 3c2 0 4 2 4 5s-2 4-4 4S5 10 5 8s1-5 3-5M17 12c2 0 3 2 3 4s-1 5-4 5-4-2-4-4 3-5 5-5"/>',
spotify:'<circle cx="12" cy="12" r="10"/><path d="M5 9c5-2 10-1 14 1M6 13c4-1 9-1 12 1M7 16c3-1 7 0 10 1"/>',
youtube:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
'youtube-music':'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5" /><path d="m10.4 9 4.5 3-4.5 3z" />',

lock:'<rect x="4" y="10" width="16" height="12" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
'lock-open':'<rect x="4" y="10" width="16" height="12" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0"/>',

edit:'<path d="m4 20 4-1 12-12-3-3L5 16zM15 6l3 3"/>',
trash:'<path d="M4 7h16M10 4h4M6 7l1 14h10l1-14M10 11v6m4-6v6"/>',
eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
save:'<path d="M4 3h14l3 3v15H3V3zm3 0v7h10V3M7 21v-8h10v8"/>',
chart:'<path d="M3 20V5m0 15h18M5 16l5-5 4 3 6-8"/>',
target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5"/>'
};
function icon(name,size=21){return '<span class="icon" style="width:'+size+'px;height:'+size+'px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'+(icons[name]||icons.home)+'</svg></span>'}
function anonymousAvatar(size=36){return '<span class="anonymous-avatar" aria-label="Avatar padrão" style="width:'+size+'px;height:'+size+'px">'+icon('user',Math.round(size*.55))+'</span>'}
const read=(key,fall)=>{try{const v=localStorage.getItem(key);return v===null?fall:JSON.parse(v)}catch{return fall}};
const save=(key,v)=>{try{localStorage.setItem(key,JSON.stringify(v))}catch{toast('Sem espaço para salvar no aparelho')}};
let exs=Array.isArray(window.EXERCISES)?window.EXERCISES:[];
const exerciseMedia=window.EXERCISE_MEDIA||{};
let workouts=read('mt-workout',[]);if(!Array.isArray(workouts))workouts=[];
let meals=read('mt-meals',[]);if(!Array.isArray(meals))meals=[];
let steps=window.MTSteps?.steps||0;
let goal=Number(read('mt-diet-goal',2500))||2500;
let dietDate=read('mt-diet-date','');
const today=()=>new Date().toLocaleDateString('pt-BR');
let currentDay=today();
// Dia e passos agora são gerenciados pelo pedômetro, sem incremento manual.
if(dietDate&&dietDate!==currentDay){meals=[];save('mt-meals',[])}save('mt-diet-date',currentDay);
let profile=read('mt-profile',{name:'Atleta',photo:'',goal:'Evoluir a cada treino'});
let sessions=read('mt-sessions',[]);
let spotifyAPI=null,spotifyController=null,spotifyIsPlaying=false,spotifyIsReady=false,spotifyDuration=0,spotifyPosition=0,spotifyShuffle=false,spotifyRepeat=false,spotifyQueue=read('mt-spotify-queue',[]),spotifyQueueIndex=0,spotifyPlayerShell=null,spotifyPlayerMount=null,spotifyActiveUri=null;
let musicProvider=read('mt-music-provider','spotify'),youtubeLink=read('mt-youtube-link','');
let youtubeQueue=read('mt-youtube-queue',[]),youtubeQueueIndex=0;
let youtubePlayer=null,youtubeShell=null,youtubeMount=null,youtubeReady=false,youtubeIsPlaying=false,youtubeState='idle';
let youtubeDuration=0,youtubePosition=0,youtubeFrameTimer=null,youtubeLastInput='';
let trainingLockEnabled=false,trainingLockBubble=null,trainingLockOverlay=null;
let trainingLockTimer=null,trainingLockHolding=false,trainingLockSavedOverflow='';

let deferredInstall=null,editingMealIndex=-1,tutorialOpen=false,restTimer=null,restRemaining=0,bodyHistory=read('mt-body-history',[]),bodyMeasures=read('mt-body-measures',[]),liveSession=read('mt-live-session',null),selectedMeasure='Cintura',spotifyLink=read('mt-spotify-link',''),mealEditMode=false;
let screen='home',activeFilter='Todos',query='',showAll=false,editingMeal=false,entryExercise=null,series=[],progressMode='carga',progressExercise=null,toastHandle=null;
const escapeHtml=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(msg){const box=$('toast');box.textContent=msg;box.classList.add('show');clearTimeout(toastHandle);toastHandle=setTimeout(()=>box.classList.remove('show'),2400)}
function fallbackImage(x){return ['Pernas','Glúteos','Panturrilhas'].includes(x.group)?'/exercise-legs.jpg':x.group==='Costas'?'/athlete-hero.jpg':'/exercise-chest.jpg'}
function itemImage(x){return exerciseMedia[x.id]?.photo||fallbackImage(x)}
function secondImage(x){return exerciseMedia[x.id]?.photo2||null}
function foodImage(m){const name=(m?.name||'').toLowerCase();return /café|manha|manhã|ovo|mingau|whey/i.test(name)?'/food-breakfast.jpg':/janta|noite|ceia/i.test(name)?'/food-dinner.jpg':'/food-lunch.jpg'}
function safelyImg(x,cls=''){return '<img class="'+cls+'" loading="lazy" src="'+escapeHtml(itemImage(x))+'" onerror="this.onerror=null;this.src=\''+fallbackImage(x)+'\'" alt="'+escapeHtml(x.name)+'">'}
function saveLive(){save('mt-live-session',liveSession)}

function findExercise(id){return exs.find(x=>x.id===Number(id))}
function getWorkout(id){return workouts.find(x=>Number(x.id)===Number(id))}
function persistWorkouts(){save('mt-workout',workouts)}
const fmt=n=>Number(n||0).toLocaleString('pt-BR');
const stepCalories=()=>window.MTSteps?.kcal||0;
const currentStepGoal=()=>window.MTSteps?.goal||10000;
const currentStepCount=()=>window.MTSteps?.steps||0;
const stepPct=()=>window.MTSteps?.percent||0;
function targetPct(){const completed=sessions.filter(x=>x.date===today()).length;return Math.min(100,Math.round((completed?1:0)*100))} 
function header(){
const labels={home:'Marcador de Treino',exercises:'Meus Exercícios',workout:'Meu Treino',execute:'Executar Exercício',progress:'Progresso','steps-history':'Histórico de Passos',diet:'Dieta',music:'Music',profile:'Perfil'};
$('header-glyph').innerHTML=screen==='home'?icon('dumbbell',21):['workout','execute'].includes(screen)?icon('calendar',20):screen==='diet'?icon('apple',20):screen==='music'?icon('music',20):['progress','steps-history'].includes(screen)?icon('chart',20):screen==='profile'?icon('user',20):'';
$('header-text').textContent=labels[screen]||labels.home;
const avatar=$('header-profile');if(avatar){avatar.style.display=screen==='home'?'inline-flex':'none';avatar.innerHTML=profile.photo?'<img src="'+escapeHtml(profile.photo)+'" alt="Perfil">':anonymousAvatar(30);avatar.onclick=()=>navigate('profile')}
$('header-action').innerHTML=screen==='home'?icon('bell',21):screen==='diet'?icon('plus',23):screen==='profile'?icon('settings',21):'';
$('header-action').style.visibility=['home','diet','profile'].includes(screen)?'visible':'hidden';
$('header-action').onclick=()=>{if(screen==='home')toast('Nenhum aviso novo por enquanto');else if(screen==='diet'){editingMeal=true;render()}else if(screen==='profile')toast('Seu perfil fica salvo neste aparelho')};
}
function nav(){
$('bottom-nav').innerHTML=[['home','home','Início'],['workout','calendar','Treino'],['diet','apple','Dieta'],['music','music','Music']].map(([id,glyph,label])=>'<button class="nav-btn '+(screen===id?'active':'')+'" data-nav="'+id+'">'+icon(glyph,23)+'<span>'+label+'</span></button>').join('');
}
function navigate(t,opts={}){screen=t;if(!opts.keepScroll)window.scrollTo(0,0);render()}
function render(){document.body.classList.toggle('home-view',screen==='home');header();nav();const map={home:renderHome,exercises:renderExercises,workout:renderWorkout,execute:renderExecute,progress:renderProgress,'steps-history':renderStepsHistory,diet:renderDiet,music:renderMusic,profile:renderProfile};const fn=map[screen]||renderHome;$('screen').innerHTML=fn();setActions();syncSpotifyView();syncYouTubeView()}
function progressRing(percent,cls='ring'){const p=Math.max(0,Math.min(100,percent));return '<div class="'+cls+' ring" style="--pct:'+p+'%;--arc:'+(p*.77)+'%"><span>'+p+'%</span></div>'}
function stepStatusDescription(){
const st=window.MTSteps?.status||'unsupported';
return {active:window.AndroidSteps?'Sensor nativo ativo • conta com a tela apagada':'Sensor ativo • contando passos',waiting:'Sensor ligado • aguardando caminhada',paused:'Contagem pausada em segundo plano',inactive:'Contador automático desligado','resume-needed':'Toque para reativar o sensor',unsupported:'Sensor não disponível neste aparelho',denied:'Permissão de movimento não concedida'}[st]||'Aguardando sensor';
}
function calendarWeekSteps(weekOffset=0){
 const p=window.MTSteps,history=p?.history(30)||[];
 const today=new Date();today.setHours(12,0,0,0);
 const weekday=(today.getDay()+6)%7;
 const monday=new Date(today);monday.setDate(today.getDate()-weekday-weekOffset*7);
 return Array.from({length:7},(_,i)=>{
  const d=new Date(monday);d.setDate(monday.getDate()+i);
  const key=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  const record=history.find(x=>x.date===key);
  return record||{date:key,steps:0,goal:p?.goal||10000,weight:p?.weight||70,kcal:0,reached:false};
 });
}
function stepBars(){
const records=calendarWeekSteps();
const max=Math.max(1,...records.map(r=>r.steps),currentStepGoal());
return records.map(r=>{
const label=new Date(r.date+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','');
const pct=Math.max(4,Math.round(r.steps/max*100));
return '<span class="step-bar-pair" title="'+fmt(r.steps)+' passos • '+r.date+'"><i style="height:'+pct+'%"></i><small>'+label.slice(0,3)+'</small></span>';
}).join('');
}
function miniPlayerMarkup(){
 const yt=musicProvider==='youtube',playing=yt?youtubeIsPlaying:spotifyIsPlaying;
 if(!playing)return '';
 return '<div class="home-mini-music"><div class="home-mini-music-icon">'+icon(yt?'youtube':'spotify',21)+'</div><div class="home-mini-music-label"><strong>Música tocando</strong><small>'+(yt?'YouTube Music':'Spotify')+' • Seu treino continua com música</small></div><button class="mini-music-open" data-go="music" aria-label="Abrir player">'+icon('music',21)+'</button></div>';
}
function renderHome(){
 const stepsNow=currentStepCount(),target=currentStepGoal(),percent=stepPct();
 const food=macros(),foodPct=Math.min(100,Math.round(food.k/Math.max(goal,1)*100));
 const next=liveSession?workouts.find(x=>!liveSession.completed.includes(x.id)):workouts[0];
 return '<div class="home-hero" aria-label="Atleta treinando na academia"></div>'+
 '<section class="progress-home"><div class="row between"><div><h2>Seu Progresso</h2><div class="progress-info">Meta diária de passos</div></div><button class="icon-btn" data-go="steps-history" aria-label="Ver histórico de passos">'+icon('chevron',21)+'</button></div>'+
 '<div class="progress-body">'+progressRing(percent,'progress-ring')+
 '<div class="progress-metrics"><div class="metric"><span class="metric-icon metric-fire">'+icon('flame',30)+'</span><div><b data-step-kcal>'+fmt(stepCalories())+'</b><small>Calorias estimadas</small></div></div>'+
 '<div class="metric"><span class="metric-icon metric-shoe">'+icon('shoe',29)+'</span><div><b data-step-total>'+fmt(stepsNow)+'</b><small>Passos</small></div></div></div></div></section>'+
 '<section class="home-primary-action"><div class="primary-action-top"><div><span class="eyebrow">PRONTO PARA EVOLUIR?</span><h2>'+((liveSession)?'Continue seu treino':'Treino de hoje')+'</h2><p>'+(workouts.length?workouts.length+' exercícios planejados para você':'Seu treino começa com um exercício')+'</p></div><div class="action-dumbbell">'+icon('dumbbell',30)+'</div></div>'+
 '<button class="btn btn-lime btn-full home-start-btn" data-action="home-start">'+icon('play',18)+' '+(liveSession?'Continuar treino':workouts.length?'Iniciar treino':'Montar meu treino')+'</button>'+
 (next?'<div class="home-next-exercise">'+safelyImg(next,'home-next-photo')+'<div><small>PRÓXIMO EXERCÍCIO</small><strong>'+escapeHtml(next.name)+'</strong><span>'+next.sets+' séries • '+next.reps+' repetições</span></div><button class="small-round" data-exercise="'+next.id+'" aria-label="Abrir exercício">'+icon('chevron',19)+'</button></div>':'<button class="home-discover" data-go="exercises">'+icon('plus',17)+' Escolher exercícios na biblioteca '+icon('chevron',16)+'</button>')+
 '</section>'+
 '<section class="steps-home home-steps"><div class="row between"><h3>'+icon('shoe',20)+' Passos Hoje</h3><button class="step-more-link" data-go="steps-history">Histórico '+icon('chevron',14)+'</button></div>'+
 '<div class="step-counter-row"><div><b class="steps-count" data-step-total>'+fmt(stepsNow)+'</b><div class="caption">meta de <span data-step-goal>'+fmt(target)+'</span></div></div><div class="step-bars-history">'+stepBars()+'</div></div>'+
 '<div class="progress-track" style="--pct:'+Math.min(100,stepsNow/target*100)+'%"><span></span></div>'+
 '<div class="step-home-bottom"><small id="step-status-home">'+escapeHtml(stepStatusDescription())+'</small></div></section>'+
 '<section class="home-diet"><div class="home-summary-head"><h3>'+icon('apple',20)+' Sua dieta</h3><span>'+fmt(food.k)+' / '+fmt(goal)+' kcal</span></div>'+
 '<div class="progress-track" style="--pct:'+foodPct+'%"><span></span></div><div class="home-diet-bottom"><span>'+fmt(food.p)+'g proteína • '+fmt(food.c)+'g carboidrato</span><button data-go="diet">Registrar refeição '+icon('chevron',15)+'</button></div></section>'+
 miniPlayerMarkup()+
 '<div class="home-secondary"><button data-go="exercises">'+icon('dumbbell',18)+' Biblioteca de exercícios '+icon('chevron',16)+'</button><button data-go="progress">'+icon('chart',18)+' Minha evolução '+icon('chevron',16)+'</button></div>';
}
function renderExercises(){
const filters=['Todos','Peito','Costas','Pernas','Ombros','Bíceps','Tríceps','Glúteos','Abdômen','Panturrilhas','Cardio'];
let found=exs.filter(x=>(activeFilter==='Todos'||x.group===activeFilter)&&x.name.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
if(activeFilter==='Todos'&&!query){const featured=[1,2,4,10,12,37];found=[...featured.map(id=>exs.find(e=>e.id===id)),...found.filter(e=>!featured.includes(e.id))].filter(Boolean)}
const items=found.slice(0,showAll?found.length:6);
return '<div class="subhead"><button class="icon-btn back" data-go="home" aria-label="Voltar">'+icon('back',23)+'</button><h1 class="section-title">Meus Exercícios</h1></div>'+
'<input id="ex-search" class="search" placeholder="⌕  Pesquisar exercício..." autocomplete="off" value="'+escapeHtml(query)+'">'+
'<div class="chip-row">'+filters.map(f=>'<button class="chip '+(activeFilter===f?'active':'')+'" data-filter="'+f+'">'+f+'</button>').join('')+'</div>'+
'<div class="exercise-grid">'+items.map(x=>'<article class="exercise-tile">'+
'<button class="tile-open" data-exercise="'+x.id+'" aria-label="Ver '+escapeHtml(x.name)+'">'+safelyImg(x,'tile-photo')+'<div class="tile-bottom"><strong>'+escapeHtml(x.name)+'</strong></div></button>'+
'<div class="tile-footer"><small>'+escapeHtml(x.group)+'</small><button class="plus-btn" data-add="'+x.id+'" aria-label="Adicionar '+escapeHtml(x.name)+'">'+(getWorkout(x.id)?'✓':'+')+'</button></div></article>').join('')+
(!items.length?'<div class="empty" style="grid-column:span 2">Nenhum exercício encontrado.</div>':'')+'</div>'+
(!showAll&&found.length>6?'<button class="view-more" data-action="showmore">Ver mais exercícios ↓</button>':'')+
'<p class="caption" style="text-align:center;margin:12px 0">Toque no + para adicionar ao treino. Toque na foto para ver como executar.</p>';
}
function renderWorkout(){
const done=liveSession?.completed?.length||0;
const total=workouts.length;
const progress=liveSession&&total?'<section class="session-progress"><div class="row between"><b>Treino em andamento</b><small>'+done+' de '+total+' concluídos</small></div><div class="progress-track" style="--pct:'+Math.min(100,done/total*100)+'%"><span></span></div></section>':
sessions.some(x=>x.date===today())?'<section class="session-progress session-complete">✓ Treino registrado hoje. Boa evolução! 💪</section>':'';
return '<div class="workout-banner"><div><div class="lime tiny" style="font-weight:800;letter-spacing:1px">SEU PLANEJAMENTO</div><h2>Treino de Hoje</h2><p>'+total+' exercício'+(total===1?'':'s')+' no seu treino</p></div></div>'+
progress+
'<button class="btn btn-lime btn-full" data-action="start" '+(!total?'disabled':'')+'>'+icon('play',18)+' '+(liveSession?'Continuar Treino':'Iniciar Treino')+'</button>'+
'<div class="workout-summary"><h3>Meus Exercícios</h3><button class="btn btn-dark btn-small" data-go="exercises">'+icon('plus',15)+' Adicionar</button></div>'+
(total?workouts.map(x=>'<button class="workout-item" data-exercise="'+x.id+'" style="width:100%;text-align:left;color:inherit">'+safelyImg(x,'workout-thumb')+'<span class="desc"><strong>'+escapeHtml(x.name)+'</strong><small>'+x.sets+' × '+x.reps+' • '+fmt(x.weight)+' kg</small></span>'+(liveSession?.completed?.includes(x.id)?'<span class="session-done">'+icon('check',19)+'</span>':icon('chevron',19))+'</button>').join(''):'<div class="empty panel">Seu treino está vazio. Adicione exercícios para começar.</div>')+
'<div class="row" style="margin-top:15px"><button class="btn btn-dark btn-full" data-go="progress">'+icon('chart',17)+' Ver meu progresso</button></div>';
}
function seriesFor(x){if(series.length&&Number(entryExercise)===Number(x.id))return;entryExercise=x.id;series=Array.from({length:Math.max(1,Math.min(12,Number(x.sets)||4))},()=>({reps:Number(x.reps)||10,weight:Number(x.weight)||0}));}
function renderExecute(){
const x=getWorkout(entryExercise)||findExercise(entryExercise)||workouts[0];if(!x)return '<div class="empty">Nenhum exercício selecionado.</div>';
const added=!!getWorkout(x.id),med=exerciseMedia[x.id]||{};
if(added)seriesFor(x);
const idx=workouts.findIndex(e=>e.id===x.id);
const footer=added?'<div class="detail-cta"><button class="btn btn-lime btn-full" data-action="saveexercise">'+icon('check',19)+' Salvar Registro</button></div>'+
'<button class="btn btn-dark btn-full" data-action="removeexercise" style="margin-top:12px">Remover do meu treino</button>':
'<button class="btn btn-lime btn-full" style="margin:15px 0" data-add="'+x.id+'">'+icon('plus',18)+' Adicionar ao Meu Treino</button>';
const tutorial=tutorialOpen?
'<section class="tutorial-panel"><h3>Como executar</h3>'+
(med.photo2?'<img class="detail-media-second" src="'+escapeHtml(med.photo2)+'" loading="lazy" alt="Segunda posição do '+escapeHtml(x.name)+'">':'')+
'<ol><li>Prepare o equipamento e estabilize sua postura antes de iniciar.</li><li>Faça o movimento com controle, sem balanços ou trancos.</li><li>Ajuste a carga para manter uma execução segura durante todas as repetições.</li></ol><button class="btn btn-dark btn-small" data-action="video-tutorial">'+icon('play',14)+' Buscar vídeo do exercício</button></section>':'';
return '<div class="subhead"><button class="icon-btn back" data-go="'+(added?'workout':'exercises')+'" aria-label="Voltar">'+icon('back',23)+'</button><h1 class="section-title">Executar Exercício</h1><button class="icon-btn" data-action="exercise-settings">'+icon('settings',20)+'</button></div>'+
'<img class="detail-img" src="'+escapeHtml(itemImage(x))+'" onerror="this.onerror=null;this.src=\''+fallbackImage(x)+'\'" alt="'+escapeHtml(x.name)+'">'+
'<h2 class="detail-title">'+escapeHtml(x.name)+'</h2><div class="detail-tag">'+escapeHtml(x.group)+'</div>'+
(liveSession&&idx>=0?'<div class="session-progress" style="margin:13px 0 4px"><div class="row between"><b>Exercício '+(idx+1)+' de '+workouts.length+'</b><small>'+liveSession.completed.length+' concluídos</small></div><div class="progress-track" style="--pct:'+Math.round(liveSession.completed.length/workouts.length*100)+'%"><span></span></div></div>':'')+
'<button class="tutorial" data-action="tutorial">'+icon('play',14)+' '+(tutorialOpen?'Fechar Tutorial':'Ver Tutorial')+'</button>'+tutorial+
(added?'<div class="compact-workout-controls">'+
'<div class="workout-step-row"><span>Registrar Séries</span><div class="workout-stepper"><button type="button" data-action="minusseries" aria-label="Menos séries">−</button><b>'+series.length+'</b><button type="button" data-action="plusseries" aria-label="Mais séries">+</button></div></div>'+
'<div class="workout-step-row"><span>Registrar Repetições</span><div class="workout-stepper"><button type="button" data-action="dec-reps" aria-label="Menos repetições">−</button><b>'+series[0].reps+'</b><button type="button" data-action="inc-reps" aria-label="Mais repetições">+</button></div></div>'+
'<div class="workout-step-row"><span>Registrar Carga (kg)</span><div class="workout-stepper"><button type="button" data-action="dec-weight" aria-label="Menos carga">−</button><b>'+fmt(series[0].weight)+'</b><button type="button" data-action="inc-weight" aria-label="Mais carga">+</button></div></div></div>'+
'<details class="series-details"><summary>Personalizar cada série '+icon('chevron',16)+'</summary><div class="series-header"><span></span><span>Repetições</span><span>Peso (kg)</span></div>'+
series.map((s,i)=>'<div class="series-line"><span>Série '+(i+1)+'</span><input type="number" min="0" max="999" inputmode="numeric" data-series="'+i+'" data-type="reps" value="'+s.reps+'" aria-label="Repetições série '+(i+1)+'"><input type="number" min="0" step="0.5" inputmode="decimal" data-series="'+i+'" data-type="weight" value="'+s.weight+'" aria-label="Peso série '+(i+1)+'"></div>').join('')+'</details>'+
'<button class="btn btn-dark btn-small" data-action="rest" style="margin:10px 0">⏱ '+(restRemaining?'Descanso: '+restRemaining+'s':'Cronômetro de descanso (60s)')+'</button>'+
'<div class="note-field"><label for="exercise-note">Observações</label><input id="exercise-note" value="'+escapeHtml(x.notes||'')+'" placeholder="Ex.: amplitude, execução, ajuste..."></div>':'')+
footer;
}
function chartSVG(values,unit){
const arr=values.slice(-8),h=168;
if(!arr.length)return '<div class="chart-line" style="display:grid;place-items:center;color:#9fb09b;font-size:12px;text-align:center">Registre os seus resultados para visualizar o gráfico.</div>';
const vals=arr.map(x=>Number(x.value)||0),min=Math.min(...vals),max=Math.max(...vals);const d=Math.max(1,max-min),n=vals.length;
const pts=vals.map((v,i)=>({x:22+(n===1?143:i*286/(n-1)),y:144-((v-min)/d)*104}));
const points=pts.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ');
const area=pts.length>1?'<polygon points="'+points+' '+pts[pts.length-1].x+',150 '+pts[0].x+',150" fill="url(#g-lime)" opacity=".9"/>':'';
const line=pts.length>1?'<polyline points="'+points+'" stroke="#a6ff00" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>':'';
return '<div class="chart-line"><svg viewBox="0 0 330 168" preserveAspectRatio="none" role="img" aria-label="Gráfico de evolução"><defs><linearGradient id="g-lime" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a6ff00" stop-opacity=".3"/><stop offset="1" stop-color="#a6ff00" stop-opacity="0"/></linearGradient></defs>'+
[35,72,109,146].map(y=>'<line x1="22" y1="'+y+'" x2="312" y2="'+y+'" stroke="#354032" stroke-dasharray="4 5"/>').join('')+
area+line+pts.map((p,i)=>'<circle cx="'+p.x+'" cy="'+p.y+'" r="4.5" fill="#a6ff00" stroke="#182818" stroke-width="2"><title>'+escapeHtml(arr[i].date||'')+': '+vals[i]+' '+unit+'</title></circle>').join('')+'</svg></div>'+
'<div class="chart-labels"><span>'+escapeHtml(arr[0].date||'Primeiro')+'</span><span>'+escapeHtml(arr[arr.length-1].date||'Último')+'</span></div>';
}
function renderProgress(){
const mode=progressMode,measures=['Cintura','Peito','Braço','Quadril'];
const exercise=getWorkout(progressExercise)||workouts[0];if(exercise&&!progressExercise)progressExercise=exercise.id;
const records=(exercise?.history||[]).map(r=>({...r,value:mode==='volume'?Number(r.series?.reduce((sum,s)=>sum+(s.weight||0)*(s.reps||0),0)??(r.weight*r.sets*r.reps)):Number(r.weight)||0}));
let values=mode==='peso'?bodyHistory.map(r=>({date:r.date,value:r.weight})):mode==='medidas'?bodyMeasures.map(r=>({date:r.date,value:Number(r[selectedMeasure]||0)})).filter(x=>x.value>0):records;
const demo=values.length===0&&(mode==='carga'||mode==='volume');const demoValues=[{date:'Sem 1',value:30},{date:'Sem 2',value:43},{date:'Sem 3',value:41},{date:'Sem 4',value:49},{date:'Sem 5',value:61}];
const measureMode=mode==='medidas',weightMode=mode==='peso',unit=weightMode?'kg':measureMode?'cm':'kg';
const best=values.length?Math.max(...values.map(r=>Number(r.value)||0)):0,last=values.length?Number(values[values.length-1].value)||0:0;
const opts=workouts.map(x=>'<option value="'+x.id+'" '+(Number(progressExercise)===Number(x.id)?'selected':'')+'>'+escapeHtml(x.name)+'</option>').join('');
const chooser=mode==='carga'||mode==='volume'?'<label class="caption">Exercício</label><select id="progress-exercise" style="margin:8px 0 12px">'+(opts||'<option>Adicione exercícios ao treino</option>')+'</select>':
measureMode?'<label class="caption">Medida corporal</label><select id="measure-select" style="margin:8px 0 12px">'+measures.map(m=>'<option '+(m===selectedMeasure?'selected':'')+'>'+m+'</option>').join('')+'</select>':'';
const addForm=weightMode?'<section class="panel panel-pad" style="margin-top:12px"><h3 style="margin:0 0 6px;font-size:15px">Registrar peso corporal</h3><p class="caption">Digite seu peso para acompanhar a evolução.</p><div class="row"><input id="body-weight" type="number" step=".1" min="20" max="500" placeholder="Ex.: 85.5" inputmode="decimal"><button class="btn btn-lime" data-action="saveweight">'+icon('plus',16)+' Salvar</button></div></section>':
measureMode?'<section class="panel panel-pad" style="margin-top:12px"><h3 style="margin:0 0 11px;font-size:15px">Registrar medidas (cm)</h3><div class="measures-grid">'+measures.map(x=>'<label>'+x+'<input type="number" step=".5" min="0" id="measure-'+x+'" placeholder="0"></label>').join('')+'</div><button class="btn btn-lime btn-full" style="margin-top:12px" data-action="savemeasures">'+icon('check',17)+' Salvar medidas</button></section>':'';
const history=values.length?values.slice(-7).reverse().map(x=>'<div class="record-row"><span class="caption">'+escapeHtml(x.date||'')+'</span><b>'+fmt(x.value)+' '+unit+'</b></div>').join(''):'<div class="empty">Ainda sem registros. Salve seus resultados para começar.</div>';
return '<div class="subhead"><button class="icon-btn back" data-go="home" aria-label="Voltar">'+icon('back',23)+'</button><h1 class="section-title">Progresso</h1></div>'+
'<div class="panel panel-pad"><h2 style="font-size:16px;margin:0">Sua evolução</h2><div class="chip-row" style="padding-bottom:12px">'+[['carga','Carga'],['volume','Volume'],['peso','Peso'],['medidas','Medidas']].map(([id,label])=>'<button class="chip '+(mode===id?'active':'')+'" data-pmode="'+id+'">'+label+'</button>').join('')+'</div>'+chooser+chartSVG(demo?demoValues:values,unit)+(demo?'<div class="progress-caption" style="padding:10px 0;color:#9faf9a">Gráfico ilustrativo — salve exercícios para ver sua evolução real.</div>':'')+
'<div class="progress-summary"><div><small>'+(mode==='volume'?'Maior volume':'Melhor marca')+'</small><b>'+fmt(best)+' <span style="font-size:12px">'+unit+'</span></b></div><div><small>Último registro</small><b>'+fmt(last)+' <span style="font-size:12px">'+unit+'</span></b></div></div></div>'+
addForm+
'<div class="panel panel-pad" style="margin-top:12px"><h3 style="font-size:15px;margin:0 0 8px">Seu Histórico</h3>'+history+'</div>';
}
function renderStepsHistory(){
const p=window.MTSteps;
const nativeMode=!!window.AndroidSteps;
const records=calendarWeekSteps();
const previous=calendarWeekSteps(1);
const total=records.reduce((n,x)=>n+Number(x.steps||0),0);
const prevTotal=previous.reduce((n,x)=>n+Number(x.steps||0),0);
const totalKcal=records.reduce((n,x)=>n+Number(x.kcal||0),0);
const elapsedDays=Math.min(7,(new Date().getDay()+6)%7+1);
const average=Math.round(total/elapsedDays),diff=total-prevTotal,diffPct=prevTotal?Math.round((total-prevTotal)/prevTotal*100):null;
const current=p?.steps||0,goal=p?.goal||10000,weight=p?.weight||70;
const max=Math.max(goal,1,...records.map(x=>x.steps));
const info=p?.status==='active'?'Sensor detectando movimentos':p?.status==='waiting'?'Sensor ativo, aguardando seus passos':p?.status==='unsupported'?'Sensor indisponível no navegador':p?.status==='denied'?'Permissão de movimento negada':'Contagem automática desligada';
const notification=p?.notificationPermission||'unsupported';
return '<div class="subhead"><button class="icon-btn back" data-go="home">'+icon('back',22)+'</button><h1 class="section-title">Histórico de Passos</h1></div>'+
'<section class="panel panel-pad step-history-hero"><div class="row between"><span class="caption">Passos de hoje</span><span class="lime">'+Math.min(100,Math.round(current/goal*100))+'% da meta</span></div>'+
'<div class="row between"><strong>'+fmt(current)+'</strong><span class="caption">Meta: '+fmt(goal)+'</span></div>'+
'<div class="progress-track" style="--pct:'+Math.min(100,current/goal*100)+'%"><span></span></div>'+
'<div class="row between step-calories"><span>🔥 Calorias da caminhada</span><b>'+fmt(p?.kcal||0)+' kcal</b></div></section>'+
'<div class="step-summary-grid"><div class="panel panel-pad"><small>Total da semana</small><b>'+fmt(total)+'</b><span>passos</span></div>'+
'<div class="panel panel-pad"><small>Média diária</small><b>'+fmt(average)+'</b><span>passos</span></div>'+
'<div class="panel panel-pad"><small>Calorias estimadas</small><b>'+fmt(totalKcal)+'</b><span>kcal nesta semana</span></div>'+
'<div class="panel panel-pad"><small>Comparado à semana anterior</small><b class="'+(diff>=0?'lime':'')+'">'+(diffPct===null?'—':(diffPct>0?'+':'')+diffPct+'%')+'</b><span>'+fmt(Math.abs(diff))+' passos '+(diff>=0?'a mais':'a menos')+'</span></div></div>'+
'<section class="panel panel-pad step-weekly"><div class="row between"><h3>Esta semana</h3><small>Últimos 7 dias</small></div>'+
'<div class="step-history-chart">'+records.map(rec=>{
 const label=new Date(rec.date+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','').slice(0,3);
 return '<div class="step-chart-col"><strong>'+fmt(rec.steps)+'</strong><div class="step-chart-bar"><span style="height:'+Math.max(3,Math.round(rec.steps/max*100))+'%" class="'+(rec.reached?'reached':'')+'"></span></div><small>'+label+'</small></div>';
}).join('')+'</div><div class="step-week-records">'+records.slice().reverse().map(rec=>
'<div class="record-row"><span>'+new Date(rec.date+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'})+'</span><span><b>'+fmt(rec.steps)+'</b> passos <small>• '+fmt(rec.kcal)+' kcal</small></span></div>').join('')+'</div></section>'+
'<section class="panel panel-pad step-settings"><h3>Configurações de passos</h3><label for="step-target">Meta diária de passos</label><div class="step-setting-row"><input id="step-target" type="number" min="100" max="100000" step="100" inputmode="numeric" value="'+goal+'"><button class="btn btn-lime btn-small" data-action="savestepgoal">Salvar</button></div>'+
'<label for="step-weight">Seu peso para estimar calorias (kg)</label><div class="step-setting-row"><input id="step-weight" type="number" min="30" max="300" step="0.5" inputmode="decimal" value="'+weight+'"><button class="btn btn-dark btn-small" data-action="savestepweight">Salvar</button></div>'+
'<p class="caption">Estimativa: cerca de 0,05 kcal por passo para 70 kg; ajustamos proporcionalmente ao peso. O gasto real depende do ritmo, terreno e de cada pessoa.</p></section>'+
'<section class="panel panel-pad step-sensor-panel"><h3>Contagem automática</h3><p id="step-sensor-status">'+escapeHtml(info)+'</p>'+
(nativeMode?'<p class="caption">Contador Android: serviço nativo pode continuar com a tela apagada enquanto estiver autorizado e ativo na notificação do celular.</p>':'<p class="caption">No navegador, o sensor só funciona enquanto a página está ativa. Para contar com a tela apagada, é preciso instalar o app nativo Android — autorizar o site não basta.</p>')+
(!p?.enabled?'<button class="btn btn-lime btn-full" data-action="startsteps">'+icon('footprints',18)+' Ativar sensor de passos</button>':
'<div class="stack"><button class="btn btn-dark btn-full" data-action="stopsteps">Pausar sensor</button><button class="btn btn-lime btn-full" data-action="startsteps">Reativar sensor</button></div>')+
'<button class="btn btn-dark btn-full" style="margin-top:8px" data-action="stepalerts">'+icon('bell',18)+' '+(notification==='granted'?'Notificações permitidas ✓':'Permitir aviso ao bater a meta')+'</button>'+
'<p class="caption">'+(nativeMode?'A notificação da meta vem do serviço Android, mesmo com o app fora da tela.':'No site, o aviso depende de o navegador continuar ativo. Para notificações confiáveis com a tela apagada, use a versão nativa Android.')+'</p></section>';
}

function macros(){return meals.reduce((o,m)=>({k:o.k+Number(m.kcal||0),p:o.p+Number(m.p||0),c:o.c+Number(m.c||0),f:o.f+Number(m.f||0)}),{k:0,p:0,c:0,f:0})}
function renderDiet(){
const m=macros(),pct=Math.min(100,Math.round(100*m.k/Math.max(goal,1))),editingObj=editingMealIndex>=0?meals[editingMealIndex]:null;
const macro=(glyph,val,label,cal,factor,target)=>'<div class="macro"><div class="macro-ring" style="--ring-color:'+cal+';--ring-pct:'+Math.min(100,Math.round(val*factor/Math.max(goal,1)*100))+'%">'+icon(glyph,18)+'</div><b>'+fmt(val)+'g</b><small>'+label+'</small></div>';
const dishes=meals.map((meal,i)=>'<div class="meal-row"><img class="meal-image" src="'+foodImage(meal)+'" alt="Imagem ilustrativa da refeição"><div style="flex:1;min-width:0"><b>'+escapeHtml(meal.name)+'</b><br><small>'+fmt(meal.kcal)+' kcal · '+fmt(meal.p)+'g proteínas</small></div>'+(mealEditMode?'<button data-delete-meal="'+i+'" aria-label="Excluir refeição">'+icon('trash',18)+'</button>':'<button data-edit-meal="'+i+'" aria-label="Editar refeição">'+icon('edit',15)+'</button>')+'</div>').join('');
return '<section class="panel diet-card"><h2>Sua Dieta de Hoje</h2><div class="row between"><span class="caption">Resumo diário</span><span class="diet-pct">'+pct+'%</span></div>'+
'<div class="diet-calories-overview">'+progressRing(pct,'diet-cal-ring')+'<div class="diet-calories-numbers"><strong>'+fmt(m.k)+'</strong><span> / '+fmt(goal)+' kcal</span><div class="progress-track" style="--pct:'+pct+'%"><span></span></div><small>'+fmt(Math.max(0,goal-m.k))+' kcal restantes</small></div></div>'+
'<div class="macro-grid">'+macro('target',m.p,'Proteínas','#63dea0',4)+macro('flame',m.c,'Carboidratos','#a6ff00',4)+macro('utensils',m.f,'Gorduras','#ffa94f',9)+'</div></section>'+
'<div class="row between" style="margin:17px 0 9px"><h3 style="font-size:16px;margin:0">Refeições</h3><div class="row"><button class="meal-edit-btn" data-action="editmeals">'+(mealEditMode?'Concluir':'Editar')+'</button><button class="meal-edit-btn" data-action="editgoal" title="Meta de calorias">'+icon('target',16)+'</button></div></div>'+
(dishes||'<div class="panel empty">Suas refeições aparecerão aqui depois de adicionadas.</div>')+
'<button class="btn btn-lime btn-full" style="margin-top:13px" data-action="openmeal">'+icon('plus',18)+' Adicionar Refeição +</button>'+
(editingMeal?'<div class="panel meal-form" id="meal-form"><label>Nome da refeição</label><input id="meal-name" placeholder="Ex.: Almoço, arroz e frango" autocomplete="off" value="'+escapeHtml(editingObj?.name??'')+'"><div class="form-grid">'+
'<div><label>Calorias (kcal)</label><input id="meal-kcal" type="number" min="0" inputmode="numeric" placeholder="0" value="'+escapeHtml(editingObj?.kcal??'')+'"></div>'+
'<div><label>Proteínas (g)</label><input id="meal-protein" type="number" min="0" inputmode="decimal" placeholder="0" value="'+escapeHtml(editingObj?.p??'')+'"></div>'+
'<div><label>Carboidratos (g)</label><input id="meal-carbs" type="number" min="0" inputmode="decimal" placeholder="0" value="'+escapeHtml(editingObj?.c??'')+'"></div>'+
'<div><label>Gorduras (g)</label><input id="meal-fat" type="number" min="0" inputmode="decimal" placeholder="0" value="'+escapeHtml(editingObj?.f??'')+'"></div></div>'+
'<button class="btn btn-lime btn-full" data-action="savemeal">Salvar Refeição</button></div>':'');
}
function currentSpotifyLink(){return spotifyLink||'https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP'}
function spotifyLinkToUri(url){try{const u=new URL(url);const m=u.pathname.match(/^\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)$/);return u.hostname==='open.spotify.com'&&m?'spotify:'+m[1]+':'+m[2]:null}catch{return null}}

function parseYouTubeMusicLink(input){
try{
const u=new URL(String(input||'').trim());
const host=u.hostname.toLowerCase().replace(/^www\./,'');
if(!['youtube.com','m.youtube.com','music.youtube.com','youtu.be','youtube-nocookie.com'].includes(host))return null;
const playlist=u.searchParams.get('list');
const video=host==='youtu.be'?u.pathname.slice(1):u.pathname.match(/^\/(shorts|embed|live)\/([\w-]+)/)?.[2]||u.searchParams.get('v');
if(video&&/^[A-Za-z0-9_-]{11}$/.test(video))return {kind:'video',id:video,url:u.href};
if(playlist&&/^[A-Za-z0-9_-]{8,150}$/.test(playlist))return {kind:'playlist',id:playlist,url:u.href};
return null;
}catch{return null;}
}
function switchMusicProvider(next){
if(!['spotify','youtube'].includes(next)||musicProvider===next)return;
if(next==='spotify'&&youtubePlayer&&youtubeReady){youtubePlayer.pauseVideo();youtubeIsPlaying=false;}
if(next==='youtube'&&spotifyController&&spotifyIsPlaying){spotifyController.pause();spotifyIsPlaying=false;}
musicProvider=next;save('mt-music-provider',next);render();
}
function ensureYouTubeAPI(){
if(window.YT?.Player){initializeYouTube();return;}
if(window.__mtYouTubeScriptAdded)return;
window.__mtYouTubeScriptAdded=true;
window.onYouTubeIframeAPIReady=()=>{initializeYouTube()};
const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;
script.onerror=()=>{youtubeState='error';refreshYouTubeControls();toast('Não foi possível carregar o YouTube')};
document.head.appendChild(script);
}
function ensureYouTubeShell(){
if(youtubeShell)return;
youtubeShell=document.createElement('div');youtubeShell.id='youtube-persistent-player';
youtubeShell.className='youtube-player-off';
youtubeMount=document.createElement('div');youtubeMount.id='youtube-player-mount';
youtubeShell.appendChild(youtubeMount);document.body.appendChild(youtubeShell);
window.addEventListener('resize',positionYouTubeDock);
window.addEventListener('scroll',positionYouTubeDock,{passive:true});
}
function initializeYouTube(){
if(youtubePlayer||!window.YT?.Player||!youtubeMount||!youtubeLink)return;
const source=parseYouTubeMusicLink(youtubeLink);if(!source)return;
youtubeState='loading';refreshYouTubeControls();
try{
const opts={width:'100%',height:'215',playerVars:{playsinline:1,controls:1,rel:0,origin:location.origin,enablejsapi:1},events:{
onReady:evt=>{youtubeReady=true;youtubeState='ready';if(source.kind==='playlist')evt.target.cuePlaylist({listType:'playlist',list:source.id});else evt.target.cueVideoById(source.id);refreshYouTubeControls();positionYouTubeDock();},
onStateChange:evt=>{youtubeIsPlaying=evt.data===window.YT.PlayerState.PLAYING;youtubeState=youtubeIsPlaying?'playing':evt.data===window.YT.PlayerState.PAUSED?'paused':evt.data===window.YT.PlayerState.ENDED?'ended':'ready';refreshYouTubeControls();syncFloatingLock();positionYouTubeDock();},
onError:evt=>{youtubeState='error';youtubeIsPlaying=false;refreshYouTubeControls();syncFloatingLock();toast('Essa faixa não pode ser reproduzida no player incorporado.');}
}};
youtubePlayer=new window.YT.Player(youtubeMount,opts);
youtubeFrameTimer=setInterval(()=>{if(!youtubeReady||!youtubePlayer)return;
try{youtubePosition=(youtubePlayer.getCurrentTime()||0)*1000;youtubeDuration=(youtubePlayer.getDuration()||0)*1000;refreshYouTubeControls()}catch{}},1500);
}catch(err){console.warn('YouTube IFrame API:',err);youtubeState='error';refreshYouTubeControls();}
}
function setYouTubeLink(url){
const source=parseYouTubeMusicLink(url);if(!source){toast('Cole um link válido de música ou playlist do YouTube Music.');return false;}
youtubeLink=url.trim();save('mt-youtube-link',youtubeLink);youtubeIsPlaying=false;
youtubePosition=0;youtubeDuration=0;youtubeState='loading';
ensureYouTubeShell();
if(youtubePlayer&&youtubeReady){
try{if(source.kind==='playlist')youtubePlayer.cuePlaylist({listType:'playlist',list:source.id});else youtubePlayer.cueVideoById(source.id);}catch(err){console.warn(err)}
}else{ensureYouTubeAPI();initializeYouTube();}
refreshYouTubeControls();positionYouTubeDock();return true;
}
function positionYouTubeDock(){
if(!youtubeShell)return;
const host=$('youtube-embed-host');
if(screen==='music'&&musicProvider==='youtube'&&host){
const rect=host.getBoundingClientRect();youtubeShell.className='youtube-player-onpage';
youtubeShell.style.left=Math.round(rect.left)+'px';youtubeShell.style.top=Math.round(rect.top)+'px';
youtubeShell.style.width=Math.max(200,Math.round(rect.width))+'px';youtubeShell.style.height='215px';
}else if(youtubeIsPlaying||trainingLockEnabled&&musicProvider==='youtube'){
youtubeShell.className='youtube-player-mini';
youtubeShell.style.left='';youtubeShell.style.top='';youtubeShell.style.width='';youtubeShell.style.height='';
}else{
youtubeShell.className='youtube-player-off';
youtubeShell.style.left='';youtubeShell.style.top='';youtubeShell.style.width='';youtubeShell.style.height='';
}
}
function syncYouTubeView(){
ensureYouTubeShell();
if(screen==='music'&&musicProvider==='youtube'&&youtubeLink){ensureYouTubeAPI();initializeYouTube();}
positionYouTubeDock();refreshYouTubeControls();
}
function refreshYouTubeControls(){
if(musicProvider==='youtube'){
const btn=document.querySelector('[data-action="ytplay"]');if(btn){btn.innerHTML=icon(youtubeIsPlaying?'pause':'play',25);btn.setAttribute('aria-label',youtubeIsPlaying?'Pausar música':'Tocar música')}
const status=$('youtube-status');if(status)status.textContent=!youtubeLink?'Cole uma música ou playlist para começar.':youtubeState==='error'?'Essa música não permite reprodução aqui.':youtubeIsPlaying?'Reproduzindo pelo YouTube':'Toque em ▶ no player do YouTube para começar.';
const slider=$('youtube-seek');if(slider){slider.value=youtubeDuration?Math.min(100,Math.round(100*youtubePosition/youtubeDuration)):0;slider.disabled=!youtubeReady||!youtubeDuration;}
if($('youtube-time'))$('youtube-time').textContent=mmss(youtubePosition);
if($('youtube-length'))$('youtube-length').textContent=mmss(youtubeDuration);
}
}
function seekYouTube(percent){if(youtubePlayer&&youtubeReady&&youtubeDuration)youtubePlayer.seekTo(youtubeDuration/1000*Number(percent)/100,true)}
function youtubeNext(direction){
if(!youtubePlayer||!youtubeReady){toast('Abra e inicie um vídeo ou playlist primeiro.');return}
try{if(direction>0)youtubePlayer.nextVideo();else youtubePlayer.previousVideo()}catch{toast('Esse vídeo não tem outra faixa na playlist.')}
}
function getSpotifyEmbed(url){const uri=spotifyLinkToUri(url);return uri?'https://open.spotify.com/embed/'+uri.split(':').slice(1).join('/')+'?theme=0':''}
function mmss(ms){let seconds=Math.max(0,Math.floor((ms||0)/1000));return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')}
function refreshMusicControls(){
const button=document.querySelector('[data-action="play"]');
if(button){button.innerHTML=icon(spotifyIsPlaying?'pause':'play',25);button.setAttribute('aria-label',spotifyIsPlaying?'Pausar música':'Tocar música')}
const status=document.getElementById('spotify-status');if(status)status.textContent=spotifyIsReady?(spotifyIsPlaying?'Tocando pelo Spotify':'Pronto para ouvir • toque em ▶'):'Preparando player Spotify...';
const seek=document.getElementById('music-seek');if(seek){seek.value=spotifyDuration?Math.min(100,Math.round(100*spotifyPosition/spotifyDuration)):0;seek.disabled=!spotifyIsReady||!spotifyDuration}
const elapsed=document.getElementById('music-elapsed');if(elapsed)elapsed.textContent=mmss(spotifyPosition);
const duration=document.getElementById('music-duration');if(duration)duration.textContent=mmss(spotifyDuration);
const shuffle=document.querySelector('[data-action="shuffle"]');if(shuffle){shuffle.classList.toggle('selected',spotifyShuffle);shuffle.setAttribute('aria-pressed',String(spotifyShuffle))}
const repeat=document.querySelector('[data-action="repeat"]');if(repeat){repeat.classList.toggle('selected',spotifyRepeat);repeat.setAttribute('aria-pressed',String(spotifyRepeat))}
syncFloatingLock();
}
function initializeSpotify(){
if(spotifyController||!spotifyAPI||!spotifyPlayerMount)return;
const url=currentSpotifyLink();spotifyActiveUri=url;spotifyIsReady=false;
try{spotifyAPI.createController(spotifyPlayerMount,{url,width:'100%',height:152},controller=>{
spotifyController=controller;
controller.addListener('ready',()=>{spotifyIsReady=true;refreshMusicControls()});
controller.addListener('playback_started',()=>{spotifyIsPlaying=true;refreshMusicControls()});
controller.addListener('playback_update',ev=>{spotifyIsReady=true;spotifyIsPlaying=!ev.data.isPaused;spotifyDuration=ev.data.duration||0;spotifyPosition=ev.data.position||0;refreshMusicControls()});
refreshMusicControls()
})}catch(err){console.warn('Spotify player:',err);const status=document.getElementById('spotify-status');if(status)status.textContent='Não foi possível carregar o Spotify no navegador';}
}
function ensureSpotifyAPI(){
if(window.__mtSpotifyScriptAdded)return;
window.__mtSpotifyScriptAdded=true;
window.onSpotifyIframeApiReady=api=>{spotifyAPI=api;initializeSpotify()};
const script=document.createElement('script');script.src='https://open.spotify.com/embed/iframe-api/v1';script.async=true;script.onerror=()=>{if(screen==='music')toast('Não foi possível conectar ao Spotify. Confira a internet.')};document.head.appendChild(script);
}
// Mantém o iframe no MESMO nó do DOM em todas as telas: mover um iframe
// entre containers recria a página interna e interrompe o áudio do Spotify.
let spotifyDockFrame=0;
function positionSpotifyDock(){
if(!spotifyPlayerShell)return;
const host=$('music-embed-host');
if(screen==='music'&&musicProvider==='spotify'&&host){
const rect=host.getBoundingClientRect();
spotifyPlayerShell.className='spotify-player-onpage';
spotifyPlayerShell.style.left=Math.round(rect.left)+'px';
spotifyPlayerShell.style.top=Math.round(rect.top)+'px';
spotifyPlayerShell.style.width=Math.max(240,Math.round(rect.width))+'px';
}else{
spotifyPlayerShell.className='spotify-persistent-background';
spotifyPlayerShell.style.left='';
spotifyPlayerShell.style.top='';
spotifyPlayerShell.style.width='';
}
}
function scheduleSpotifyDock(){
if(spotifyDockFrame)cancelAnimationFrame(spotifyDockFrame);
spotifyDockFrame=requestAnimationFrame(()=>{spotifyDockFrame=0;positionSpotifyDock()});
}

function lockIsTraining(){return screen==='workout'||screen==='execute'}
function ensureTrainingLockUI(){
if(trainingLockBubble)return;
trainingLockOverlay=document.createElement('div');
trainingLockOverlay.id='training-lock-overlay';
trainingLockOverlay.setAttribute('role','dialog');
trainingLockOverlay.setAttribute('aria-label','Tela do treino travada');
trainingLockOverlay.hidden=true;
trainingLockOverlay.innerHTML='<div class="training-lock-info"><div class="training-lock-info-icon">'+icon('lock',45)+'</div><h2>Treino protegido</h2><p>Toques na tela estão bloqueados.<br>A música continua tocando.</p><small>Segure o cadeado por 1 segundo para destravar.</small></div>';
trainingLockOverlay.addEventListener('click',e=>e.preventDefault());
trainingLockOverlay.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
document.body.appendChild(trainingLockOverlay);
trainingLockBubble=document.createElement('button');
trainingLockBubble.type='button';
trainingLockBubble.id='training-lock-bubble';
trainingLockBubble.className='training-lock-bubble';
trainingLockBubble.setAttribute('aria-label','Travar a tela do treino');
trainingLockBubble.innerHTML=icon('lock-open',23);
trainingLockBubble.hidden=true;
trainingLockBubble.addEventListener('click',e=>{
e.preventDefault();
if(!trainingLockEnabled)activateTrainingLock();
});
trainingLockBubble.addEventListener('pointerdown',e=>{
if(!trainingLockEnabled)return;
e.preventDefault();
clearTimeout(trainingLockTimer);
trainingLockHolding=true;
trainingLockBubble.classList.add('holding');
trainingLockTimer=setTimeout(()=>{
trainingLockTimer=null;
trainingLockHolding=false;
trainingLockBubble.classList.remove('holding');
deactivateTrainingLock();
},1100);
});
for(const event of ['pointerup','pointercancel','pointerleave']){
trainingLockBubble.addEventListener(event,()=>{
if(trainingLockTimer){clearTimeout(trainingLockTimer);trainingLockTimer=null}
trainingLockHolding=false;trainingLockBubble.classList.remove('holding');
});
}
trainingLockBubble.addEventListener('contextmenu',e=>e.preventDefault());
document.body.appendChild(trainingLockBubble);
}
function activateTrainingLock(){
if(trainingLockEnabled||!lockIsTraining())return;
trainingLockEnabled=true;
trainingLockSavedOverflow=document.body.style.overflow;
document.body.style.overflow='hidden';
syncFloatingLock();
toast('Tela travada! Segure o cadeado por 1 segundo para destravar.');
}
function deactivateTrainingLock(){
if(!trainingLockEnabled)return;
trainingLockEnabled=false;
document.body.style.overflow=trainingLockSavedOverflow;
syncFloatingLock();
toast('Tela destravada. Pode mexer no treino!');
}
function syncFloatingLock(){
ensureTrainingLockUI();
const visible=lockIsTraining()&&(spotifyIsPlaying||youtubeIsPlaying||trainingLockEnabled);
trainingLockBubble.hidden=!visible;
trainingLockOverlay.hidden=!trainingLockEnabled;
document.body.classList.toggle('training-screen-locked',trainingLockEnabled);
trainingLockBubble.classList.toggle('is-locked',trainingLockEnabled);
const state=trainingLockBubble.dataset.state||'';
const next=trainingLockEnabled?'locked':'unlocked';
if(state!==next){
trainingLockBubble.dataset.state=next;
trainingLockBubble.innerHTML=icon(trainingLockEnabled?'lock':'lock-open',24);
trainingLockBubble.setAttribute('aria-label',trainingLockEnabled?'Segure o cadeado para destravar':'Travar a tela do treino');
trainingLockBubble.setAttribute('title',trainingLockEnabled?'Segure por 1 segundo para destravar':'Toque para travar a tela');
}
}

function syncSpotifyView(){
if(!spotifyPlayerShell){
spotifyPlayerShell=document.createElement('div');
spotifyPlayerShell.id='spotify-persistent-player';
spotifyPlayerShell.className='spotify-persistent-background';
spotifyPlayerMount=document.createElement('div');
spotifyPlayerMount.id='spotify-embed-mount';
spotifyPlayerShell.appendChild(spotifyPlayerMount);
document.body.appendChild(spotifyPlayerShell);
window.addEventListener('scroll',scheduleSpotifyDock,{passive:true});
window.addEventListener('resize',scheduleSpotifyDock);
}
positionSpotifyDock();
if(screen==='music'&&musicProvider==='spotify'){ensureSpotifyAPI();initializeSpotify();refreshMusicControls()}
syncFloatingLock();
}
function changeSpotifyEntity(url){if(!spotifyLinkToUri(url)){toast('Cole um link válido do Spotify');return}
spotifyActiveUri=url;spotifyPosition=0;spotifyDuration=0;spotifyIsPlaying=false;
if(spotifyController){spotifyController.loadEntity(url)}else{initializeSpotify()}
refreshMusicControls();
}
function spotifyQueueMove(direction){
if(!spotifyQueue.length){toast('Para trocar de faixa, adicione músicas na fila ou use o player Spotify abaixo.');return}
if(spotifyShuffle&&spotifyQueue.length>1){spotifyQueueIndex=Math.floor(Math.random()*spotifyQueue.length)}
else{const candidate=spotifyQueueIndex+direction;if(candidate<0||candidate>=spotifyQueue.length){if(!spotifyRepeat){toast('Fim da sua fila. Ative repetir para voltar ao início.');return}spotifyQueueIndex=(candidate+spotifyQueue.length)%spotifyQueue.length}else spotifyQueueIndex=candidate}
const url=spotifyQueue[spotifyQueueIndex];spotifyLink=url;save('mt-spotify-link',spotifyLink);changeSpotifyEntity(url);toast('Música '+(spotifyQueueIndex+1)+' de '+spotifyQueue.length)
}

function renderMusic(){
const providerTabs='<div class="music-service-picker" role="group" aria-label="Escolher serviço de música">'+
'<button class="service-pill '+(musicProvider==='spotify'?'active':'')+'" data-provider="spotify">'+icon('spotify',18)+' Spotify</button>'+
'<button class="service-pill '+(musicProvider==='youtube'?'active youtube-active':'')+'" data-provider="youtube">'+icon('youtube',18)+' YouTube Music</button></div>';
if(musicProvider==='youtube'){
return providerTabs+
'<section class="music-hero youtube-music-hero"><div class="yt-orb"><div class="yt-orb-inner">'+icon('youtube-music',80)+'<b>YouTube Music</b></div></div>'+
'<p>Sua playlist. Seu ritmo. Seu treino.</p>'+
'<div class="player-controls"><button data-action="ytshuffle" aria-label="Ativar aleatório">'+icon('shuffle',22)+'</button>'+
'<button data-action="ytprevious" aria-label="Anterior">'+icon('previous',23)+'</button>'+
'<button class="play" data-action="ytplay" aria-label="Tocar">'+icon(youtubeIsPlaying?'pause':'play',24)+'</button>'+
'<button data-action="ytnext" aria-label="Próxima">'+icon('skip',23)+'</button>'+
'<button data-action="ytrepeat" aria-label="Repetir playlist">'+icon('repeat',22)+'</button></div>'+
'<div class="music-time-row"><small id="youtube-time">0:00</small><input type="range" id="youtube-seek" min="0" max="100" value="0" aria-label="Posição da música" disabled><small id="youtube-length">0:00</small></div>'+
'<p class="music-status" id="youtube-status">'+(youtubeLink?'Carregando player do YouTube...':'Cole o link de uma música ou playlist para começar.')+'</p></section>'+
'<section class="music-playback-card youtube-embed-card"><div class="row between"><h3>Ouvir YouTube Music</h3><span class="playing-badge youtube-badge">PLAYER DO YOUTUBE</span></div>'+
'<div id="youtube-embed-host">'+(!youtubeLink?'<div class="empty" style="min-height:215px;display:grid;place-items:center;padding:25px">Escolha uma música ou playlist para abrir o player.</div>':'')+'</div>'+
'<p class="caption">Use o ▶ do vídeo para começar. Durante o treino, o vídeo permanece visível em uma janelinha no canto.</p></section>'+
'<div class="music-tools"><button class="btn btn-lime btn-full" data-action="youtube-link">'+icon('plus',18)+' '+(youtubeLink?'Trocar música ou playlist':'Adicionar música ou playlist')+'</button></div>'+
'<p class="music-note">Aceita links compartilhados do YouTube Music e YouTube. Alguns conteúdos bloqueiam reprodução incorporada. Para ouvir com o celular bloqueado ou usando outros aplicativos, abra o YouTube Music.</p>'+
'<div class="music-external"><a href="https://music.youtube.com/" target="_blank" rel="noopener">Abrir YouTube Music ↗</a><a href="https://www.youtube.com/" target="_blank" rel="noopener">Abrir YouTube ↗</a></div>';
}
const queueCount=spotifyQueue.length;
return providerTabs+
'<div class="music-hero"><div class="spotify-orb"><div class="spotify-inner">'+icon('spotify',79)+'<b>Spotify</b></div></div><p>Sua música, seu treino.</p>'+
'<div class="player-controls"><button data-action="shuffle" aria-label="Aleatório" aria-pressed="'+spotifyShuffle+'">'+icon('shuffle',22)+'</button><button data-action="previous" aria-label="Música anterior">'+icon('previous',23)+'</button><button class="play" data-action="play" aria-label="Tocar música">'+icon(spotifyIsPlaying?'pause':'play',24)+'</button><button data-action="next" aria-label="Próxima música">'+icon('skip',23)+'</button><button data-action="repeat" aria-label="Repetir fila" aria-pressed="'+spotifyRepeat+'">'+icon('repeat',22)+'</button></div>'+
'<div class="music-time-row"><small id="music-elapsed">0:00</small><input type="range" id="music-seek" min="0" max="100" value="0" aria-label="Posição na música" disabled><small id="music-duration">0:00</small></div>'+
'<div class="music-volume-info">'+icon('volume',18)+'<span>Volume: use os botões do celular</span></div>'+
'<div class="music-status" id="spotify-status">Preparando player Spotify...</div></div>'+
'<div class="music-playback-card"><div class="row between"><h3>Ouvir aqui no app</h3><span class="playing-badge">'+icon('music',13)+' PLAYER OFICIAL</span></div>'+
'<div id="music-embed-host"></div><p class="caption">Aperte ▶ no player abaixo se o celular bloquear a reprodução pelo botão acima. A disponibilidade das faixas depende do Spotify.</p></div>'+
'<div class="music-tools"><button class="btn btn-lime btn-full" data-action="spotifyplaylist">'+icon('plus',18)+' '+(spotifyLink?'Trocar playlist ou música':'Escolher minha playlist')+'</button>'+
'<button class="btn btn-dark btn-full" data-action="spotifyaddtrack">'+icon('plus',17)+' Adicionar faixa à fila'+(queueCount?' ('+queueCount+')':'')+'</button></div>'+
(queueCount?'<div class="music-queue panel panel-pad"><div class="row between"><b>Minha fila</b><button class="btn btn-dark btn-small" data-action="spotifyclear">Limpar</button></div><div class="caption">Use ◀ e ▶ para navegar pelas faixas adicionadas.</div>'+spotifyQueue.slice(0,12).map((url,i)=>'<button class="queue-track '+(spotifyQueueIndex===i?'current':'')+'" data-track-index="'+i+'">'+icon('music',17)+'<span>Faixa '+(i+1)+'</span>'+(spotifyQueueIndex===i?'<small>Tocando</small>':icon('play',15))+'</button>').join('')+'</div>':'')+
'<div class="music-external"><a href="https://open.spotify.com/" target="_blank" rel="noopener">Spotify ↗</a><a href="https://music.youtube.com/" target="_blank" rel="noopener">YouTube Music ↗</a></div>';
}
function renderProfile(){
return '<div class="panel profile-header">'+(profile.photo?'<img class="profile-photo" src="'+escapeHtml(profile.photo)+'" alt="Foto de perfil">':'<div class="profile-photo avatar-large">'+anonymousAvatar(86)+'</div>')+
'<div><h2>'+escapeHtml(profile.name||'Atleta')+'</h2><span class="caption">'+escapeHtml(profile.goal||'Evoluir a cada treino')+'</span></div></div>'+
'<div class="panel panel-pad" style="margin-top:12px"><h3 style="margin-top:0">Meu Perfil</h3><label class="caption">Nome</label><input id="profile-name" value="'+escapeHtml(profile.name||'')+'" maxlength="60" style="margin:7px 0 13px"><label class="caption">Objetivo</label><input id="profile-goal" maxlength="100" value="'+escapeHtml(profile.goal||'')+'" style="margin:7px 0 13px"><label class="caption">Foto (do celular)</label><input id="profile-photo" type="file" accept="image/*" style="margin:7px 0 13px"><button class="btn btn-lime btn-full" data-action="saveprofile">'+icon('save',18)+' Salvar Perfil</button></div>'+
'<button class="panel profile-row" data-go="progress" style="width:100%;color:inherit;text-align:left">'+icon('chart',23)+'<span>Meu progresso</span>'+icon('chevron',18)+'</button>'+
'<button class="panel profile-row" data-go="steps-history" style="width:100%;color:inherit;text-align:left">'+icon('footprints',23)+'<span>Passos, metas e histórico</span>'+icon('chevron',18)+'</button>'+
(window.AndroidSteps&&window.MTRunning&&!window.__mtAccountProfileInstalled?'<button class="panel profile-row" data-action="runcloudmigration" style="width:100%;color:inherit;text-align:left">'+icon('upload',23)+'<span>Conta e backup das corridas</span>'+icon('chevron',18)+'</button>':'')+ '<button class="panel profile-row" data-go="music" style="width:100%;color:inherit;text-align:left">'+icon('music',23)+'<span>Music</span>'+icon('chevron',18)+'</button>'+ '<button class="panel profile-row" data-action="installapp" style="width:100%;color:inherit;text-align:left">'+icon('plus',23)+'<span>Instalar no celular</span>'+icon('chevron',18)+'</button>'+ '<button class="panel profile-row" data-action="exportdata" style="width:100%;color:inherit;text-align:left">'+icon('upload',23)+'<span>Fazer backup dos meus dados</span>'+icon('chevron',18)+'</button>'+
'<div class="panel panel-pad" style="margin-top:12px"><b>Sobre o aplicativo</b><p class="caption">Os treinos, refeições, medidas e perfil ficam salvos neste aparelho. Não há sincronização entre celulares nem conta com senha nesta versão. Imagens dos exercícios: Free Exercise DB (domínio público).</p></div>';
}
function addExercise(id){const x=findExercise(id);if(!x)return;if(getWorkout(id)){toast('Exercício já está no seu treino');return;}workouts.push({...x,sets:4,reps:10,weight:0,notes:'',link:'',history:[]});persistWorkouts();toast('Exercício adicionado!');render()}
function startWorkout(){if(!workouts.length)return;if(!liveSession){liveSession={startedAt:new Date().toISOString(),completed:[]};saveLive()}const next=workouts.find(x=>!liveSession.completed.includes(x.id))||workouts[0];entryExercise=next.id;series=[];tutorialOpen=false;navigate('execute')}
function setActions(){
document.querySelectorAll('[data-provider]').forEach(b=>b.addEventListener('click',()=>switchMusicProvider(b.dataset.provider)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.go==='music'){navigate('music')}else navigate(b.dataset.go)}));
document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.nav)));
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter;showAll=false;render()}));
const search=$('ex-search');if(search){search.addEventListener('input',e=>{query=e.target.value;const pos=e.target.selectionStart;render();const n=$('ex-search');n.focus();n.setSelectionRange(pos,pos)})}
document.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>addExercise(b.dataset.add)));
document.querySelectorAll('[data-exercise]').forEach(b=>b.addEventListener('click',()=>{entryExercise=Number(b.dataset.exercise);series=[];tutorialOpen=false;navigate('execute')}));
document.querySelectorAll('[data-series]').forEach(b=>b.addEventListener('change',e=>{const ix=Number(e.target.dataset.series),type=e.target.dataset.type;series[ix][type]=Math.max(0,Number(e.target.value)||0)}));
document.querySelectorAll('[data-delete-meal]').forEach(b=>b.addEventListener('click',()=>{meals.splice(Number(b.dataset.deleteMeal),1);save('mt-meals',meals);render()}));
document.querySelectorAll('[data-pmode]').forEach(b=>b.addEventListener('click',()=>{progressMode=b.dataset.pmode;render()}));
const seek=$('music-seek');if(seek)seek.addEventListener('change',e=>{if(spotifyController&&spotifyDuration)spotifyController.seek(Math.round((spotifyDuration/1000)*(Number(e.target.value)/100)))});
const ytSeek=$('youtube-seek');if(ytSeek)ytSeek.addEventListener('change',e=>seekYouTube(e.target.value));
document.querySelectorAll('[data-track-index]').forEach(b=>b.addEventListener('click',()=>{spotifyQueueIndex=Number(b.dataset.trackIndex);spotifyLink=spotifyQueue[spotifyQueueIndex];save('mt-spotify-link',spotifyLink);changeSpotifyEntity(spotifyLink);render()}));
const pr=$('progress-exercise');if(pr)pr.addEventListener('change',e=>{progressExercise=e.target.value;render()});const ms=$('measure-select');if(ms)ms.addEventListener('change',e=>{selectedMeasure=e.target.value;render()});document.querySelectorAll('[data-edit-meal]').forEach(b=>b.addEventListener('click',()=>{const ix=Number(b.dataset.editMeal);editingMealIndex=ix;editingMeal=true;render();setTimeout(()=>{$('meal-form')?.scrollIntoView({behavior:'smooth',block:'center'})},50)}));
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>handleAction(b.dataset.action)));
}
function collectSeries(){document.querySelectorAll('[data-series]').forEach(inp=>{const ix=Number(inp.dataset.series),type=inp.dataset.type;if(series[ix])series[ix][type]=Math.max(0,Number(inp.value)||0)})}
function finishWorkoutExercise(id){if(!liveSession)return;
if(!Array.isArray(liveSession.completed))liveSession.completed=[];if(!liveSession.completed.includes(id))liveSession.completed.push(id);
if(liveSession.completed.length>=workouts.length){sessions.unshift({date:today(),timestamp:new Date().toISOString(),count:workouts.length,ids:workouts.map(x=>x.id)});save('mt-sessions',sessions);liveSession=null;saveLive();navigate('workout');toast('Treino completo! Parabéns! 💪');return}
saveLive();const next=workouts.find(x=>!liveSession.completed.includes(x.id));if(next){entryExercise=next.id;series=[];tutorialOpen=false;clearInterval(restTimer);restRemaining=0;navigate('execute');toast('Série salva! Próximo exercício.')}else navigate('workout');
}
function handleAction(action){
if(action==='startsteps'){
const ok=awaitStepStart();return
}
if(action==='stopsteps'){window.MTSteps?.stop();render();toast('Sensor pausado');return}
if(action==='savestepgoal'){const n=Number($('step-target')?.value);if(!window.MTSteps?.setGoal(n)){toast('Informe uma meta entre 100 e 100.000 passos');return}render();toast('Meta diária atualizada!');return}
if(action==='savestepweight'){const n=Number($('step-weight')?.value);if(!window.MTSteps?.setWeight(n)){toast('Informe um peso entre 30 e 300 kg');return}render();toast('Peso atualizado para estimar calorias!');return}
if(action==='stepalerts'){window.MTSteps?.requestNotifications().then(result=>{toast(result==='granted'?'Aviso autorizado!':result==='unsupported'?'Avisos não disponíveis neste navegador':'Permissão de notificações não concedida');render()});return}

if(action==='youtube-link'){
const link=prompt('Cole o link da música ou playlist do YouTube Music:',youtubeLink||'');
if(link===null)return;
if(!setYouTubeLink(link.trim()))return;
render();toast('Link salvo! Toque em ▶ no player para ouvir.');return
}
if(action==='ytplay'){
if(!youtubeLink){handleAction('youtube-link');return}
if(!youtubePlayer||!youtubeReady){toast('Aguarde o player carregar e toque em ▶ no vídeo.');return}
if(youtubeIsPlaying)youtubePlayer.pauseVideo();else youtubePlayer.playVideo();
return
}
if(action==='ytnext'){youtubeNext(1);return}
if(action==='ytprevious'){youtubeNext(-1);return}
if(action==='ytshuffle'){if(youtubePlayer&&youtubeReady){youtubePlayer.setShuffle(true);toast('Playlist em modo aleatório')}else toast('Inicie uma playlist primeiro.');return}
if(action==='ytrepeat'){if(youtubePlayer&&youtubeReady){youtubePlayer.setLoop(true);toast('Repetição ativada')}else toast('Inicie uma playlist primeiro.');return}
if(action==='saveweight'){const n=Number($('body-weight')?.value);if(!Number.isFinite(n)||n<20||n>500){toast('Informe um peso válido');return}bodyHistory.push({date:today(),weight:n});save('mt-body-history',bodyHistory);toast('Peso registrado!');render();return}
if(action==='savemeasures'){const rec={date:today()};let count=0;['Cintura','Peito','Braço','Quadril'].forEach(m=>{const n=Number($('measure-'+m)?.value);if(n>0&&n<500){rec[m]=n;count++}});if(!count){toast('Digite ao menos uma medida');return}bodyMeasures.push(rec);save('mt-body-measures',bodyMeasures);toast('Medidas salvas!');render();return}
if(action==='editmeals'){mealEditMode=!mealEditMode;render();return}
if(action==='spotifyplaylist'){
const link=prompt('Cole o link da playlist, álbum ou música do Spotify:',spotifyLink||'');
if(link===null)return;if(!spotifyLinkToUri(link.trim())){toast('Cole um link válido do Spotify');return}
spotifyLink=link.trim();save('mt-spotify-link',spotifyLink);changeSpotifyEntity(spotifyLink);toast('Pronto! Agora você pode ouvir aqui.');return}
if(action==='spotifyaddtrack'){
const link=prompt('Cole o link de uma faixa do Spotify:');
if(link===null)return;
if(!spotifyLinkToUri(link.trim())||!spotifyLinkToUri(link.trim()).startsWith('spotify:track:')){toast('Cole o link de uma música do Spotify.');return}
spotifyQueue.push(link.trim());save('mt-spotify-queue',spotifyQueue);
spotifyQueueIndex=spotifyQueue.length-1;spotifyLink=link.trim();save('mt-spotify-link',spotifyLink);changeSpotifyEntity(spotifyLink);render();toast('Música adicionada à fila!');return}
if(action==='spotifyclear'){if(confirm('Limpar a fila de músicas?')){spotifyQueue=[];spotifyQueueIndex=0;save('mt-spotify-queue',[]);render()}return}
if(action==='installapp'){if(deferredInstall){deferredInstall.prompt();deferredInstall=null}else toast('No Chrome: menu ⋮ → Adicionar à tela inicial');return}
if(action==='runcloudmigration'){
 if(window.MTCloudRuns?.show){window.MTCloudRuns.show();return}
 const script=document.createElement('script');script.src='/run-cloud-migrate.js?v=20';
 script.onload=()=>{if(window.MTCloudRuns?.show)window.MTCloudRuns.show();else toast('Não foi possível iniciar o backup.')};
 script.onerror=()=>toast('Verifique a conexão com a internet.');
 document.head.appendChild(script);return
}
if(action==='exportdata'){
 let runHistory=[];
 if(window.AndroidSteps&&window.MTRunning){try{const response=JSON.parse(window.prompt('mt-run:history','')||'{}');if(Array.isArray(response.history))runHistory=response.history}catch(e){}}
 const payload={version:9,date:today(),workouts,meals,steps,goal,profile,sessions,bodyHistory,bodyMeasures,runHistory};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='marcador-de-treino-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('Cópia dos dados gerada');return}
if(action==='addsteps'){navigate('steps-history');return}
if(action==='resetsteps'){navigate('steps-history');return}
if(action==='showmore'){showAll=true;render();return}
if(action==='start'){startWorkout();return}
if(action==='home-start'){if(workouts.length){startWorkout()}else{navigate('exercises')}return}
if(action==='plusseries'){collectSeries();const x=series[series.length-1]||{reps:10,weight:0};series.push({...x});render();return}
if(action==='minusseries'){collectSeries();if(series.length>1){series.pop();render()}return}
if(['inc-reps','dec-reps','inc-weight','dec-weight'].includes(action)){collectSeries();const isRep=action.endsWith('reps'),step=isRep?1:2.5,sign=action.startsWith('inc')?1:-1;for(const s of series){if(isRep)s.reps=Math.max(1,Math.min(999,s.reps+sign*step));else s.weight=Math.max(0,Math.round((s.weight+sign*step)*10)/10)}render();return}
if(action==='tutorial'){collectSeries();tutorialOpen=!tutorialOpen;render();return}
if(action==='video-tutorial'){const x=getWorkout(entryExercise)||findExercise(entryExercise);if(x?.link)window.open(x.link,'_blank','noopener');else window.open('https://www.youtube.com/results?search_query='+encodeURIComponent('execução correta '+(x?.name||'exercício')+' academia'),'_blank','noopener');return}
if(action==='rest'){collectSeries();if(restTimer){clearInterval(restTimer);restTimer=null}restRemaining=60;render();restTimer=setInterval(()=>{restRemaining--;const b=document.querySelector('[data-action="rest"]');if(b)b.textContent=restRemaining?'⏱ Descanso: '+restRemaining+'s':'⏱ Iniciar descanso (60s)';if(restRemaining<=0){clearInterval(restTimer);restTimer=null;toast('Descanso terminado! Hora da próxima série 💪')}},1000);return}
if(action==='exercise-settings'){const x=getWorkout(entryExercise);if(!x){toast('Adicione este exercício antes de editar');return}const link=prompt('Link do tutorial (opcional):',x.link||'');if(link!==null){x.link=/^https?:\/\//i.test(link)?link:'';persistWorkouts();toast('Tutorial atualizado')}return}
if(action==='saveexercise'){
const x=getWorkout(entryExercise);if(!x){toast('Adicione o exercício primeiro para salvar');return}
document.querySelectorAll('[data-series]').forEach(inp=>{series[Number(inp.dataset.series)][inp.dataset.type]=Math.max(0,Number(inp.value)||0)});
const best=Math.max(0,...series.map(s=>s.weight));
x.weight=best;x.reps=series[0].reps;x.sets=series.length;x.notes=$('exercise-note')?.value||'';x.history=x.history||[];
x.history.push({date:today(),weight:best,sets:series.length,reps:series[0].reps,series:series.map(s=>({...s}))});
persistWorkouts();if(liveSession){finishWorkoutExercise(x.id)}else{navigate('workout');toast('Registro salvo! 💪')}return
}
if(action==='removeexercise'){if(confirm('Remover este exercício do seu treino?')){workouts=workouts.filter(x=>x.id!==entryExercise);persistWorkouts();navigate('workout')}return}
if(action==='openmeal'){editingMealIndex=-1;editingMeal=!editingMeal;render();return}
if(action==='savemeal'){
const name=$('meal-name')?.value.trim();if(!name){toast('Escreva o nome da refeição');return}
const m={name,kcal:Number($('meal-kcal').value)||0,p:Number($('meal-protein').value)||0,c:Number($('meal-carbs').value)||0,f:Number($('meal-fat').value)||0,emoji:/café|manha|manhã/i.test(name)?'🥚':/almoço|almoco/i.test(name)?'🥗':/janta/i.test(name)?'🍲':'🍽️'};
if(editingMealIndex>=0&&editingMealIndex<meals.length)meals[editingMealIndex]=m;else meals.push(m);save('mt-meals',meals);editingMeal=false;editingMealIndex=-1;toast('Refeição salva');render();return
}
if(action==='editgoal'){const n=prompt('Meta de calorias por dia:',String(goal));if(n!==null&&Number(n)>0&&Number(n)<20000){goal=Number(n);save('mt-diet-goal',goal);render()}return}
if(action==='saveprofile'){profile.name=$('profile-name')?.value.trim()||'Atleta';profile.goal=$('profile-goal')?.value.trim()||'Evoluir a cada treino';save('mt-profile',profile);render();toast('Perfil salvo!');return}
if(action==='play'){if(!spotifyController){toast('O player está carregando. Use o ▶ do Spotify abaixo.');return}if(spotifyIsPlaying){spotifyController.pause()}else{spotifyController.resume()}return}
if(action==='previous'){spotifyQueueMove(-1);return}
if(action==='next'){spotifyQueueMove(1);return}
if(action==='shuffle'){spotifyShuffle=!spotifyShuffle;refreshMusicControls();toast(spotifyShuffle?'Modo aleatório ativado para sua fila':'Modo aleatório desligado');return}
if(action==='repeat'){spotifyRepeat=!spotifyRepeat;refreshMusicControls();toast(spotifyRepeat?'Repetir fila ativado':'Repetir fila desligado');return}
}
async function awaitStepStart(){
const p=window.MTSteps;
if(!p){toast('Contagem indisponível');return}
const ok=await p.start();
if(!ok){toast(p.status==='denied'?'A permissão de movimento foi negada.':'Este celular ou navegador não liberou o sensor.');render();return}
toast('Sensor ativado! Caminhe com o aplicativo aberto.');render();
}
function syncStepCounters(){
if(!window.MTSteps)return;
const count=fmt(window.MTSteps.steps),kcal=fmt(window.MTSteps.kcal),goal=fmt(window.MTSteps.goal);
document.querySelectorAll('[data-step-total]').forEach(e=>{if(e.textContent!==count)e.textContent=count});
document.querySelectorAll('[data-step-kcal]').forEach(e=>{if(e.textContent!==kcal)e.textContent=kcal});
document.querySelectorAll('[data-step-goal]').forEach(e=>{if(e.textContent!==goal)e.textContent=goal});
const ring=$('home-step-pct')||document.querySelector('.home-hero~.progress-home .progress-ring');
if(ring){ring.style.setProperty('--pct',window.MTSteps.percent+'%');ring.style.setProperty('--arc',(window.MTSteps.percent*.77)+'%');if(ring.querySelector('span'))ring.querySelector('span').textContent=window.MTSteps.percent+'%'}
const track=document.querySelector('.steps-home .progress-track');if(track)track.style.setProperty('--pct',window.MTSteps.percent+'%');
const status=$('step-status-home');if(status)status.textContent=stepStatusDescription();
const bars=document.querySelector('.step-bars-history');if(bars)bars.innerHTML=stepBars();
if(screen==='steps-history'){const isTyping=!!document.activeElement&&['INPUT','TEXTAREA'].includes(document.activeElement.tagName);if(!isTyping)render()}
}
function initStepFeatures(){
if(!window.MTSteps)return;
window.MTSteps.subscribe(syncStepCounters);
window.addEventListener('mt-native-steps-active',()=>{window.MTSteps?.subscribe(syncStepCounters);render();toast('Sensor Android conectado! 💚')});
document.addEventListener('mt-goal-reached',evt=>{toast('🏆 Parabéns! Você atingiu sua meta de '+fmt(evt.detail.goal)+' passos!')});
}

function setupProfilePhoto(){document.addEventListener('change',e=>{if(e.target.id!=='profile-photo')return;const f=e.target.files?.[0];if(!f)return;if(f.size>3e6){toast('Escolha uma imagem menor que 3 MB');return}const reader=new FileReader();reader.onload=()=>{profile.photo=String(reader.result);save('mt-profile',profile);render();toast('Foto atualizada')};reader.readAsDataURL(f)})}
window.addEventListener('error',e=>{console.error('Erro na interface:',e.message)});
try{render();setupProfilePhoto();initStepFeatures();if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e});setTimeout(()=>document.body.classList.add('app-ready'),1650)}catch(e){console.error(e);$('screen').innerHTML='<div class="empty">Não foi possível abrir o aplicativo. Recarregue esta página.</div>';document.body.classList.add('app-ready')}
})();