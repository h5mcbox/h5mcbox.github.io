/**/
var v="v4";
var core=(async e=>{
    var cache=await caches.open(v);
    var value=await cache.match(e);
    if(value===undefined){
        var f=await fetch(e)
        console.log(f,f.clone())
        cache.put(e,f.clone());
        return f.clone();
    }
    return value;
})
addEventListener("install",()=>{
    console.log("install");
})
addEventListener('fetch',function(e){
    console.log(core(e.request))
    e.respondWith(core(e.request));
})
