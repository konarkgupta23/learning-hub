// Offline support. Bump VERSION on every release so phones pick up the new files.
const VERSION='hub-v2';
const SHELL=['./','index.html','kannada/','kannada/index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// Serve from cache at once, refresh the cache in the background when online.
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
  e.respondWith(caches.open(VERSION).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(e.request,r.clone());return r}).catch(()=>hit);
    return hit||net}))});
