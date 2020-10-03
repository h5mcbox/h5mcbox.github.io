/**/
var v="v5";
var core=(async e=>{
    var cache=await caches.open(v);
    var value=await cache.match(e);
    if(value===undefined){
        try{
            var f=await fetch(e)
        }catch(t){
            var f=await cache.match("/error.html");
        }
        cache.put(e,f.clone());
        return f.clone();
    }
    return value;
})
var fileslist=[
    "error.html",
    "style.css"
    ];
var install=(async ()=>{
    var cache=await caches.open(v);
    await cache.addAll(fileslist);
})
addEventListener("install",event=>{
    event.waitUntil(install())
    console.log("install");
})
addEventListener('fetch',function(e){
    e.respondWith(core(e.request));
})
