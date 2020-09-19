crypt={
    default_key:55,
    encrypt:function(a,b=default_key,c=default_key,d=default_key){
        var p=d
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
    decrypt:function(a,b=default_key,c=default_key,d=default_key){
        var p=d
        var c=c<=36?c:c%36;
        var c=(c==1)?c+1:c
        var o=a.split(".")
        var r=[]
        o.forEach(e=>{
            p=p*7-4
            p=p<37?p:p%37
            var t=parseInt(e,c)
            r.push(String.fromCharCode(t^(b+p)))
        })
        return r.join("")
    },
    encryptObj:function(obj,b=default_key,c=default_key,d=default_key){
        return crypt.encrypt(JSON.stringify(obj),b,c,d);
    },
    decryptObj:function(text,b=default_key,c=default_key,d=default_key){
        return JSON.parse(crypt.decrypt(text,b,c,d));
    }
}
