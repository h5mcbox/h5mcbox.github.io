function subs(){
    var env={};
    env.list=[];
    env.add=function(f){
        if(typeof f==="function"){
            env.list.push(f);
            return undefined;
        }
        throw "Not a function.";
    }
    env.toggle=function(...e){
        env.list.forEach(o=>{
            o.apply(window,e);
        })
    }
    env.del=function(func){
        if(env.list.includes(func)){
            return delete env.list[env.list.indexOf(func)]
        }
        return false;
    }
    env.clear=function(){
        env.list.length=0
    }
    return {add:env.add,push:env.toggle,del:env.del,clear:env.clear};
}
