self.skipWaiting()
const STORAGE="Storage-version-1"
var getURL=(url)=>new URL(new Request(url).url);
const allowedHosts=["hello.ora.moe","fonts.googleapis.com","gstatic.com","loli.net"];
var core=async e=>{
  const cache=await caches.open(STORAGE);
  const CachedResponse=await cache.match(e.request)
  if(!allowedHosts.includes(getURL(e.request.url).host)){
    console.log(`403 Forbidden:${getURL(e.request.url).host}`);
    return new Response("<h1>403 Forbidden</h1><br><hr><br><span>For safe,this request is refused by Service Worker.</span>",{status:403,"statusText" : "HitServiceWorker."});
  }
  const NetworkResponsePromise=fetch(e.request).catch(()=>new Request("Error to fetch"),{status:500});
  e.waitUntil(
      (async ()=>{
          var NetworkResponse=await NetworkResponsePromise;
          if(NetworkResponse.ok)cache.put(e.request,NetworkResponse.clone());
      })()
  );
  return CachedResponse||NetworkResponsePromise;
}
var fileslist=[
  "404.html",
  "style.css"
];
var install=(async ()=>{
  var cache=await caches.open(STORAGE);
  await cache.addAll(fileslist);
});
self.addEventListener("install",event=>{
  event.waitUntil(install());
  console.log("install");
})
self.addEventListener('fetch',function(e){
  e.respondWith(core(e));
})
