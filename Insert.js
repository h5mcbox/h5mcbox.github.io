insert=function Insert(a,b,c=0n,d=BigInt(a.length)-1n){
    if(c>d){a.splice(parseInt(c),0,b);return c;}
    let m=~~((c+d)/2n)
    if(a[m]<b){
        return Insert(a,b,m+1n,d)
    }else if(a[m]>b){
        return Insert(a,b,c,m-1n)
    }else{return m}
}
