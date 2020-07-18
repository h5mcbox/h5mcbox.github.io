function SafeXss(){
    var w=window
    addEventListener("message",e=>{
        var w=window
        if(typeof e.data==="object"){
            if("xssctrl" in e.data){
                if(e["data"]["xssctrl"]["xsscode"]===w.xsscode){
                    try{
                        eval(e["data"]["xssctrl"]["xss"])
                    }catch(e){
                        console.warn("Catched a SafeXss error.\n",e.name,e.message)
                    }
                }
                w.xsscode=Math.floor(Math.random()*999999)+1
                console.log("XssCode is expired.New code is "+xsscode)
            }
        }
    })
    w.xsscode=Math.floor(Math.random()*999999)+1
    console.log("New XssCode is "+xsscode)
}
