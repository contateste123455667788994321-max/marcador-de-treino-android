/* Marcador de Treino: pedômetro experimental em primeiro plano (v13).
   Os sensores não funcionam de forma confiável com navegador fechado/tela desligada. */
(function(){
'use strict';
// Ponte nativa: quando a versão Android está instalada, usa o sensor
// TYPE_STEP_COUNTER e o serviço em primeiro plano, inclusive com a tela apagada.
function installNativeSteps(){
if(window.AndroidSteps&&typeof window.AndroidSteps.getState==='function'){
 let nativeState={steps:0,goal:10000,weight:70,enabled:false,status:'inactive',history:[]};
 const listeners=new Set();
 const dayKey=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
 const fmtCal=(steps,weight)=>Math.round(Math.max(0,Number(steps)||0)*0.05*(Number(weight)||70)/70);
 function refreshNative(snapshot){
  try{
   const next=typeof snapshot==='string'?JSON.parse(snapshot):snapshot||JSON.parse(window.AndroidSteps.getState());
   if(next&&typeof next==='object'){nativeState={...nativeState,...next};listeners.forEach(fn=>{try{fn(api)}catch(e){console.warn(e)}})}
  }catch(e){console.warn('Estado nativo do pedômetro',e)}
 }
 function records(num=7){
  refreshNoEmit();
  const result=[];const hist=Array.isArray(nativeState.history)?nativeState.history:[];
  for(let i=Math.min(180,Math.max(1,num))-1;i>=0;i--){
   const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-i);
   const k=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
   const record=k===nativeState.day?{date:k,steps:nativeState.steps,goal:nativeState.goal,weight:nativeState.weight,kcal:fmtCal(nativeState.steps,nativeState.weight)}:hist.find(x=>x.date===k);
   result.push(record||{date:k,steps:0,goal:nativeState.goal,weight:nativeState.weight,kcal:0,reached:false});
  }
  return result;
 }
 function refreshNoEmit(){try{const data=JSON.parse(window.AndroidSteps.getState());if(data)nativeState={...nativeState,...data}}catch{}}
 const api={
  get today(){return nativeState.day||dayKey()},
  get steps(){return Number(nativeState.steps)||0},
  get goal(){return Number(nativeState.goal)||10000},
  get weight(){return Number(nativeState.weight)||70},
  get kcal(){return fmtCal(nativeState.steps,nativeState.weight)},
  get percent(){return Math.min(100,Math.round(100*api.steps/api.goal))},
  get enabled(){return !!nativeState.enabled},
  get status(){return nativeState.status||'inactive'},
  get notificationPermission(){return 'granted'},
  get goalReached(){return api.steps>=api.goal},
  history:records,
  subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},
  async start(){try{window.AndroidSteps.start();setTimeout(()=>refreshNative(),800);return true}catch{return false}},
  stop(){window.AndroidSteps.stop();refreshNative()},
  setGoal(val){const n=Math.round(Number(val));if(n<100||n>100000)return false;window.AndroidSteps.setGoal(n);refreshNative();return true},
  setWeight(val){const n=Number(val);if(n<30||n>300)return false;window.AndroidSteps.setWeight(n);refreshNative();return true},
  async requestNotifications(){window.AndroidSteps.requestNotifications();return 'granted'},
  stepCalories:fmtCal,
  flush(){},
  receiveNativeUpdate:refreshNative
 };
 window.MTSteps=api;
 window.MTStepsNativeUpdate=refreshNative;
 refreshNative();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshNative()});
 setInterval(()=>{if(!document.hidden)refreshNative()},3200);
 return true;
}
return false;
}
if(installNativeSteps())return;
window.addEventListener('mt-native-bridge-ready',()=>{
 if(installNativeSteps())window.dispatchEvent(new Event('mt-native-steps-active'));
});

const KEY='mt-pedometer-v1';
const localDay=()=>{
 const d=new Date();
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
function read(key,fallback){try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){console.warn('Falha ao salvar passos',e)}}
const today=localDay();
const existing=read(KEY,null);
const safeInt=(v,def,min,max)=>{const x=Math.round(Number(v));return Number.isFinite(x)?Math.max(min,Math.min(max,x)):def};
let state=existing && typeof existing==='object'?existing:{
 day:today,steps:0,goal:10000,weight:70,enabled:false,goalAlerted:false,history:[],
 migratedFromManual:true
};
state.day=typeof state.day==='string'?state.day:today;
state.steps=safeInt(state.steps,0,0,1000000);
state.goal=safeInt(state.goal,10000,100,100000);
state.weight=Number(state.weight)>=30&&Number(state.weight)<=300?Number(state.weight):70;
state.history=Array.isArray(state.history)?state.history:[];
state.enabled=Boolean(state.enabled);
state.goalAlerted=Boolean(state.goalAlerted);
if(!existing){
 const manual=read('mt-steps',0);
 if(Number(manual)>0)write('mt-manual-steps-archive',Number(manual));
 write('mt-steps',0);
 write('mt-steps-date',new Date().toLocaleDateString('pt-BR'));
}
const callbacks=new Set();
let status='inactive',sensorEvents=0,peakUp=false;
let gravity=null,filtered=0,lastPeak=0,pendingPeak=0,lastAccepted=0,streak=0;
let lastSave=0,emitHandle=0,silenceHandle=0;
const stepCalories=(count=state.steps,weight=state.weight)=>Math.round(Math.max(0,count)*0.05*(weight/70));
const pct=()=>Math.min(100,Math.round(state.steps/state.goal*100));
function persist(){write(KEY,state);lastSave=Date.now()}
function subscribe(fn){callbacks.add(fn);return()=>callbacks.delete(fn)}
function emit(force=false){if(force){clearTimeout(emitHandle);emitHandle=0;for(const fn of callbacks){try{fn(api)}catch(e){console.error(e)}}return}
 if(emitHandle)return;emitHandle=setTimeout(()=>{emitHandle=0;for(const fn of callbacks){try{fn(api)}catch(e){console.error(e)}}},180);
}
function persistEntry(day,steps,goal,weight,notified){
 const record={date:day,steps:safeInt(steps,0,0,1000000),goal:safeInt(goal,10000,100,100000),weight:Number(weight)||70,
 kcal:stepCalories(steps,weight),reached:steps>=goal,notified:!!notified};
 const ix=state.history.findIndex(x=>x.date===day);
 if(ix>=0)state.history[ix]=record;else state.history.push(record);
 state.history=state.history.sort((a,b)=>a.date.localeCompare(b.date)).slice(-180);
}
function checkDay(){
 const day=localDay();
 if(day===state.day)return;
 persistEntry(state.day,state.steps,state.goal,state.weight,state.goalAlerted);
 state.day=day;state.steps=0;state.goalAlerted=false;streak=0;pendingPeak=0;lastPeak=0;lastAccepted=0;
 status=state.enabled?'waiting':'inactive';
 persist();emit(true);
}
function allHistory(days=7){
 checkDay();
 const list=[];const count=Math.max(1,Math.min(180,Number(days)||7));
 for(let back=count-1;back>=0;back--){
  const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-back);
  const key=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  const rec=key===state.day?{date:key,steps:state.steps,goal:state.goal,weight:state.weight,kcal:stepCalories(),reached:state.steps>=state.goal}:state.history.find(x=>x.date===key);
  list.push(rec||{date:key,steps:0,goal:state.goal,weight:state.weight,kcal:0,reached:false});
 }
 return list;
}
function sendGoalAlert(){
 if(state.goalAlerted||state.steps<state.goal)return;
 state.goalAlerted=true;
 persist();
 const title='🏆 Meta de passos alcançada!';
 const message='Você fez '+state.steps.toLocaleString('pt-BR')+' passos hoje! Parabéns, continue evoluindo! 💚';
 if('vibrate' in navigator)try{navigator.vibrate([150,70,150])}catch{}
 if('Notification' in window&&Notification.permission==='granted'){
  try{
   if(navigator.serviceWorker?.controller&&navigator.serviceWorker.ready){
    navigator.serviceWorker.ready.then(reg=>reg.showNotification(title,{body:message,tag:'mt-step-goal-'+state.day,icon:'/icon.svg'})).catch(()=>{
     try{new Notification(title,{body:message})}catch{}
    });
   }else new Notification(title,{body:message});
  }catch(e){console.warn('Notificação indisponível',e)}
 }
 document.dispatchEvent(new CustomEvent('mt-goal-reached',{detail:{steps:state.steps,goal:state.goal,message}}));
 emit(true);
}
function commitSteps(n){
 checkDay();
 const number=safeInt(n,0,0,4);if(number<1)return;
 state.steps=Math.min(1000000,state.steps+number);
 if(Date.now()-lastSave>2200||state.steps%8===0)persist();
 emit();
 if(state.steps>=state.goal)sendGoalAlert();
}
function motionHandler(e){
 if(!state.enabled||document.hidden)return;
 checkDay();
 const a=e.accelerationIncludingGravity||e.acceleration;
 if(!a||![a.x,a.y,a.z].every(Number.isFinite))return;
 sensorEvents++;
 const gravityProvided=!!e.accelerationIncludingGravity;
 if(!gravity)gravity={x:a.x,y:a.y,z:a.z};
 const smoothing=gravityProvided?0.09:0.0;
 if(gravityProvided){
  gravity.x+=smoothing*(a.x-gravity.x);
  gravity.y+=smoothing*(a.y-gravity.y);
  gravity.z+=smoothing*(a.z-gravity.z);
 }else{gravity.x=0;gravity.y=0;gravity.z=0}
 const dx=a.x-gravity.x,dy=a.y-gravity.y,dz=a.z-gravity.z;
 const energy=Math.sqrt(dx*dx+dy*dy+dz*dz);
 if(!Number.isFinite(energy))return;
 filtered=.60*filtered+.40*energy;
 const now=performance.now();
 if(filtered<0.77)peakUp=false;
 if(filtered<1.25||peakUp)return;
 peakUp=true;
 if(now-lastPeak<310)return;
 const gap=now-lastPeak;lastPeak=now;
 if(gap>=300&&gap<=1250){
  streak+=1;
  if(streak===1&&pendingPeak){commitSteps(2);pendingPeak=0;}
  else if(streak>=2)commitSteps(1);
  else pendingPeak=1;
 }else{
  streak=0;pendingPeak=1;
 }
 lastAccepted=Date.now();
 if(status!=='active'){status='active';emit(true)}
}
function ensureEvents(){
 window.removeEventListener('devicemotion',motionHandler);
 window.addEventListener('devicemotion',motionHandler,{passive:true});
 if(silenceHandle)clearInterval(silenceHandle);
 silenceHandle=setInterval(()=>{
  checkDay();
  if(!state.enabled)return;
  let nextStatus=document.hidden?'paused':sensorEvents===0?'waiting':Date.now()-lastAccepted>12000?'waiting':'active';
  if(status!==nextStatus){status=nextStatus;emit(true)}
  if(Date.now()-lastSave>15000)persist();
 },6000);
}
async function start(){
 checkDay();
 if(!window.isSecureContext||typeof DeviceMotionEvent==='undefined'){
  status='unsupported';state.enabled=false;persist();emit(true);return false;
 }
 try{
  if(typeof DeviceMotionEvent.requestPermission==='function'){
   const result=await DeviceMotionEvent.requestPermission();
   if(result!=='granted'){status='denied';state.enabled=false;persist();emit(true);return false}
  }
  state.enabled=true;status='waiting';sensorEvents=0;gravity=null;filtered=0;peakUp=false;streak=0;pendingPeak=0;
  persist();ensureEvents();emit(true);return true;
 }catch(err){status='denied';state.enabled=false;persist();emit(true);return false}
}
function stop(){
 state.enabled=false;status='inactive';
 window.removeEventListener('devicemotion',motionHandler);
 persist();emit(true);
}
function setGoal(goal){
 const next=safeInt(goal,0,100,100000);
 if(next<100)return false;
 checkDay();state.goal=next;persist();emit(true);
 if(state.steps>=next)sendGoalAlert();
 return true;
}
function setWeight(weight){
 const next=Number(weight);
 if(!Number.isFinite(next)||next<30||next>300)return false;
 state.weight=Math.round(next*10)/10;persist();emit(true);return true;
}
async function requestNotifications(){
 if(!('Notification' in window))return 'unsupported';
 try{return await Notification.requestPermission()}catch{return 'denied'}
}
document.addEventListener('visibilitychange',()=>{checkDay();if(document.hidden){persist();status=state.enabled?'paused':'inactive'}else{status=state.enabled?'waiting':'inactive'}emit(true)});
window.addEventListener('pagehide',persist);
setInterval(checkDay,30000);
function dateStatus(){return status}
const api={
 get today(){checkDay();return state.day},
 get steps(){checkDay();return state.steps},
 get goal(){return state.goal},
 get weight(){return state.weight},
 get status(){return dateStatus()},
 get enabled(){return state.enabled},
 get notificationPermission(){return 'Notification' in window?Notification.permission:'unsupported'},
 get migratedFromManual(){return !!state.migratedFromManual},
 get sensorEvents(){return sensorEvents},
 get kcal(){checkDay();return stepCalories()},
 get goalReached(){return state.steps>=state.goal},
 get percent(){return pct()},
 history:allHistory,subscribe,start,stop,setGoal,setWeight,requestNotifications,stepCalories,flush:persist
};
window.MTSteps=api;
if(state.day!==today)checkDay();
if(state.enabled){
 if(typeof DeviceMotionEvent!=='undefined'&&typeof DeviceMotionEvent.requestPermission!=='function')ensureEvents();
 else status='resume-needed';
}
persist();
})();