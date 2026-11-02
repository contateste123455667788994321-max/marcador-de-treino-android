(function(){
'use strict';
const DB='marcador-treino-local-music',STORE='tracks';
let database=null,tracks=[],current=-1,player=new Audio(),shuffle=false,repeat=false,ready=false,objectURL=null;
const listeners=new Set();
player.preload='metadata';
player.controls=false;
player.playsInline=true;
player.style.display='none';
document.body.appendChild(player);
let loadPromise;
function announce(){for(const cb of listeners){try{cb(state())}catch(e){console.warn(e)}}}
function state(){return {tracks:tracks.map(x=>({id:x.id,name:x.name,size:x.size})),current,playing:!player.paused&&!player.ended,duration:Number.isFinite(player.duration)?player.duration:0,position:Number(player.currentTime)||0,shuffle,repeat,volume:player.volume,ready};}
function dbOpen(){
if(!('indexedDB' in window))return Promise.reject(new Error('Armazenamento de músicas indisponível'));
if(loadPromise)return loadPromise;
loadPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);
req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};
req.onsuccess=()=>{database=req.result;resolve(database)};
req.onerror=()=>reject(req.error||new Error('Falha ao abrir a biblioteca'))});
return loadPromise;
}
async function queryAll(){const db=await dbOpen();return new Promise((resolve,reject)=>{const req=db.transaction(STORE).objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error)})}
async function init(){try{tracks=(await queryAll()).sort((a,b)=>a.added-b.added);ready=true;announce()}catch(e){console.warn('Músicas locais:',e);ready=false;announce();}return state()}
async function addFiles(files){
const list=Array.from(files||[]).filter(f=>f.type.startsWith('audio/')||/\.(mp3|m4a|aac|ogg|opus|wav|flac)$/i.test(f.name));
if(!list.length)throw Error('Selecione arquivos de áudio (MP3, M4A, OGG ou WAV).');
const db=await dbOpen();let added=0;
for(const file of list){
if(file.size>120e6)continue;
const id=String(Date.now())+'-'+Math.random().toString(36).slice(2);
const record={id,name:file.name.replace(/\.[^.]+$/,''),size:file.size,blob:file,added:Date.now()+added};
await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(record);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
tracks.push(record);added++;
}
ready=true;announce();return added;
}
async function play(index){
if(index!==undefined&&index!==null){
const n=Number(index);if(!Number.isInteger(n)||n<0||n>=tracks.length)throw Error('Música indisponível');
if(current!==n||!player.src){current=n;if(objectURL)URL.revokeObjectURL(objectURL);objectURL=URL.createObjectURL(tracks[n].blob);player.src=objectURL;player.load();setMediaSession();}
}
if(current<0){if(!tracks.length)throw Error('Adicione uma música primeiro.');return play(0)}
await player.play();announce();
}
function pause(){player.pause();announce()}
function toggle(){if(player.paused)return play();pause();return Promise.resolve()}
function next(direction=1){if(!tracks.length)return Promise.reject(new Error('Sua lista está vazia.'));
if(shuffle&&tracks.length>1){let n;do{n=Math.floor(Math.random()*tracks.length)}while(n===current);return play(n)}
let n=current+direction;if(n>=tracks.length||n<0){if(!repeat){pause();return Promise.resolve()}n=(n+tracks.length)%tracks.length}
return play(n);
}
function seek(n){if(Number.isFinite(player.duration))player.currentTime=Math.max(0,Math.min(player.duration,Number(n)||0));announce()}
function volume(n){player.volume=Math.max(0,Math.min(1,Number(n)));announce()}
function setShuffle(){shuffle=!shuffle;announce();return shuffle}
function setRepeat(){repeat=!repeat;announce();return repeat}
async function remove(id){
const index=tracks.findIndex(x=>x.id===id);if(index<0)return;
const db=await dbOpen();
await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
if(index===current){pause();player.removeAttribute('src');player.load();if(objectURL)URL.revokeObjectURL(objectURL);objectURL=null;current=-1;}else if(index<current)current--;
tracks.splice(index,1);announce();
}
function subscribe(cb){listeners.add(cb);try{cb(state())}catch{}return()=>listeners.delete(cb)}
function setMediaSession(){
if(!('mediaSession' in navigator)||current<0)return;
try{
navigator.mediaSession.metadata=new MediaMetadata({title:tracks[current].name,artist:'Minhas músicas • Marcador de Treino',album:'Marcador de Treino'});
navigator.mediaSession.setActionHandler('play',()=>play().catch(()=>{}));
navigator.mediaSession.setActionHandler('pause',pause);
navigator.mediaSession.setActionHandler('previoustrack',()=>next(-1).catch(()=>{}));
navigator.mediaSession.setActionHandler('nexttrack',()=>next(1).catch(()=>{}));
navigator.mediaSession.setActionHandler('seekto',data=>seek(data.seekTime));
}catch(e){console.warn(e)}
}
for(const ev of ['play','pause','timeupdate','loadedmetadata','ended','error'])player.addEventListener(ev,()=>{
 if(ev==='ended')next(1).catch(()=>{});
 if('mediaSession' in navigator){try{navigator.mediaSession.playbackState=player.paused?'paused':'playing'}catch{}}
 announce();
});
const api={state,init,addFiles,play,toggle,pause,next,seek,volume,setShuffle,setRepeat,remove,subscribe};
window.MTLocalMusic=api;
init();
})();