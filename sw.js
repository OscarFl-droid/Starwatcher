const CACHE='starwatcher-v2-1';
const CORE=['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(u.pathname.endsWith('/data/starlink.json')){
   e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
   return;
 }
 e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{if(e.request.method==='GET'&&u.origin===location.origin){const cc=r.clone();caches.open(CACHE).then(x=>x.put(e.request,cc))}return r})));
});