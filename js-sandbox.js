function sandbox(code,sandboxParent=window){
    var context=Object.create(sandboxParent)
    var scontext={}
    var FakedWindow=new Proxy(context,{
        get(obj,prop){
            var t=prop
            if(t==="self"||t==="window"||t==="this"||t==="top"||t==="parent"||t==="globalThis"||t==="frames"){
                return FakedWindow
            }
            if(!scontext[prop]&&typeof context[prop]==="object"){
                scontext[prop]=Object.create(context[prop])
            }
            return (typeof context[prop]==="object")?scontext[prop]:context[prop]
        },
        has(){
            return true
        }
    })
    FakedWindow.runner=Function("proxy",`with(proxy){;${code};}`)
    FakedWindow.runner(FakedWindow)
    return [FakedWindow,context,scontext];
}
