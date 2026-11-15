// Offline support. Bump VERSION on every release so phones pick up the new files.
const VERSION='hub-v4';
const SHELL=['./','index.html','kannada/','kannada/index.html','manifest.webmanifest','logo-192.png','logo-512.png','logo-maskable-512.png'];
// Always ask the server for a fresh copy (skip the browser's own 10-minute cache).
const fresh=req=>fetch(req,{cache:'no-cache'});
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>Promise.all(SHELL.map(u=>fresh(u).then(r=>{if(r.ok)return c.put(u,r)})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET')return;
  const own=new URL(q.url).origin===location.origin;
  e.respondWith(caches.open(VERSION).then(async c=>{
    const hit=await c.match(q,{ignoreSearch:true});
    if(own){
      // Our own pages: newest version when online (3 s limit), saved copy when offline or slow.
      const net=fresh(q).then(r=>{if(r.ok)c.put(q,r.clone());return r});
      if(!hit)return net;
      return Promise.race([net,new Promise((_,no)=>setTimeout(no,3000))]).catch(()=>hit);
    }
    // Fonts and other outside files: saved copy first, refresh in the background.
    const net=fetch(q).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(q,r.clone());return r}).catch(()=>hit);
    return hit||net}))});
