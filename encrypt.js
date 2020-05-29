function encrypt(mode,e,password){
if(typeof password !== "number"){throw "";}
var arr=e.split("")
var result=[]
if(mode ==="encrypt"){arr.forEach(e=>result.push(String.fromCharCode(e.charCodeAt()+password)))}else if(mode ==="decrypt"){arr.forEach(e=>result.push(String.fromCharCode(e.charCodeAt()-password)))}
return result.join("")
}
