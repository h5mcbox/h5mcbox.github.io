const EventListener=function(){
    'use strict';
    var root={},env=root,privenv={},EventListener={}
    var subs=function(){
        var env={};
        env.list=[];
        env.add=function(f){
            if(typeof f==="function"){
                env.list.push(f);
                return undefined;
            }
            throw "Not a function.";
        };
        env.toggle=function(...e){
            env.list.forEach(o=>{
                o.apply(window,e);
            })
        };
        env.del=function(func){
            if(env.list.includes(func)){
                return delete env.list[env.list.indexOf(func)];
            }
            return false;
        };
        env.clear=function(){
            env.list.length=0
        };
        return {add:env.add,push:env.toggle,del:env.del,clear:env.clear};
    };
    privenv.check=function(eventn){
        if(!EventListener[eventn]){
            EventListener[eventn]=subs();
        }
    };
    env.addEventListener=function(eventn,callback){
        privenv.check(eventn);
        EventListener[eventn].add(callback);
    };
    env.removeEventListener=function(eventn,callback){
        privenv.check(eventn);
        EventListener[eventn].del(callback);
    };
    env.trigEventListener=function(eventn,...rest){
        privenv.check(eventn);
        EventListener[eventn].push.apply(this,rest);
    }
    return env
};
