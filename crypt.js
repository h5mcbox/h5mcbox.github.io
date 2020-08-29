crypt={
    encrypt:function(a,b,c){
        var p=2
        var c=c<=36?c:c%36;
        var c=(c==1)?c+1:c
        var o=a.split("")
        var r=[]
        o.forEach(e=>{
            p=p*7-4
            p=p<37?p:p%37
            var t=e.charCodeAt(0)
            r.push((t^(b+p)).toString(c))
        })
        return r.join(".")
    },
    decrypt:function(a,b,c){
        var p=2
        var c=c<=36?c:c%36;
        var c=(c==1)?c+1:c
        var o=a.split("_")
        var r=[]
        o.forEach(e=>{
            p=p*7-4
            p=p<37?p:p%37
            var t=parseInt(e,c)
            r.push(String.fromCharCode(t^(b+p)))
        })
        return r.join("")
    }
}
