crypt={
    encrypt:function(a,b,c){
        var c=c<=36?c:c%36;
        var o=a.split("")
        var r=[]
        o.forEach(e=>{
            var t=e.charCodeAt(0)
            r.push((t^b).toString(c))
        })
        return r.join(String.fromCharCode(c+97))
    },
    decrypt:function(a,b,c){
        var c=c<=36?c:c%36;
        var o=a.split(String.fromCharCode(c+97))
        var r=[]
        o.forEach(e=>{
            var t=parseInt(e,c)
            r.push(String.fromCharCode(t^b))
        })
        return r.join("")
    }
}
