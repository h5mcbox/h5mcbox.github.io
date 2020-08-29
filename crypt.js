crypt={
    encrypt:function(a,b,c){
        var p=2
        var c=c<=36?c:c%36;
        var o=a.split("")
        var r=[]
        o.forEach(e=>{
            p=p*7
            p=p<64?p:p%64
            var t=e.charCodeAt(0)
            r.push((t^(b+p)).toString(c))
        })
        return r.join("_")
    },
    decrypt:function(a,b,c){
        var p=2
        var c=c<=36?c:c%36;
        var o=a.split("_")
        var r=[]
        o.forEach(e=>{
            p=p*7
            p=p<64?p:p%64
            var t=parseInt(e,c)
            r.push(String.fromCharCode(t^(b+p)))
        })
        return r.join("")
    }
}
