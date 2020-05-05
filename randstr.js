randstr=e=>{var randstr="";if(typeof e!=="number"){return undefined};for(let i=0;i<e;i++){randstr+="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random()*52)]};return randstr;
}
