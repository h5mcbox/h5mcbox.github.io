self.skipWaiting()
const STORAGE="Storage-version-1"
var core=async e=>{
    const cache=await caches.open(STORAGE);
    const CachedResponse=await cache.match(e.request)
    const NetworkResponsePromise=fetch(e.request).catch(()=>new Request("Error to fetch"),{status:500});
    e.waitUntil(
        (async ()=>{
            var NetworkResponse=await NetworkResponsePromise;
            if(NetworkResponse.ok)cache.put(e.request,NetworkResponse.clone())
        })()
    );
    return  CachedResponse||NetworkResponsePromise
}
var fileslist=[
    "error.html",
    "style.css"
    ];
var install=(async ()=>{
    var cache=await caches.open(v);
    await cache.addAll(fileslist);
})
self.addEventListener("install",event=>{
    event.waitUntil(install())
    console.log("install");
})
self.addEventListener('fetch',function(e){
    e.respondWith(core(e));
})
