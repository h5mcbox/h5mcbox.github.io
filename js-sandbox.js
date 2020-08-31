function sandbox(code,sandboxParent=window){
    var context=Object.create(sandboxParent);
    var scontext={};
    var FakedWindow=new Proxy(context,{
        get(obj,prop){
            var t=prop;
            if(typeof t!=="string"){
                return undefined;
            }
            if(t==="self"||t==="window"||t==="this"||t==="top"||t==="parent"||t==="globalThis"||t==="frames"){
                return FakedWindow;
            }
            if(t.indexOf("_hidden_")==0){
                return undefined;
            }
            if(!scontext[prop]&&typeof context[prop]==="object"){
                scontext[prop]=Object.create(context[prop]);
            }
            return (typeof context[prop]==="object")?scontext[prop]:context[prop];
        },
        has(){
            return true;
        },
        ownKeys(obj){
            return Reflect.ownKeys(obj).filter(e=>e.indexOf("_hidden_")==0)
        }
    })
    FakedWindow._hidden_=Function("proxy",`with(proxy){;${code};}`);
    context._hidden_(FakedWindow);
    return [FakedWindow,context,scontext];
}
