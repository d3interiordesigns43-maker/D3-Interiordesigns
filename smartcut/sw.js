const CACHE="d3-smartcut-assets-v4";
const ASSETS=["./app.css","./app.js","./manifest.webmanifest","./icons/smartcut.svg"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("d3-smartcut-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  const req=event.request;
  const url=new URL(req.url);
  // Never cache navigation/document responses: Cloudflare Access must re-check access at the edge.
  if(req.method!=="GET"||url.origin!==self.location.origin||req.mode==="navigate"||req.destination==="document")return;
  if(!ASSETS.some(path=>url.pathname.endsWith(path.replace("./",""))))return;
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    if(res.ok&&res.type==="basic"){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}
    return res;
  })));
});