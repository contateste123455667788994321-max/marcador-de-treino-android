const CACHE='marcador-treino-v21';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const url=new URL(e.request.url);if(url.origin!==location.origin)return;
if(e.request.mode==='navigate'||url.pathname==='/'||url.pathname==='/index.html'){e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put('/',copy))}return r}).catch(()=>caches.match('/')));return}
e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>caches.match(e.request)))});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(opened=>{for(const c of opened){if(c.url.includes('marcador-de-treino-ckcg.hatchable.site'))return c.focus()}return clients.openWindow('/') }));});