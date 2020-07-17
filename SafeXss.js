function SafeXss(){
    var w=window
    addEventListener("message",e=>{
        var w=window
        if("xssctrl" in e.data){
            if(e["data"]["xssctrl"]["xsscode"]===w.xsscode){
                eval(e["data"]["xssctrl"]["xss"])
            }
            w.xsscode=Math.floor(Math.random()*999999)+1
            console.log("XssCode is expired.New code is"+xsscode)
        }
    })
    w.xsscode=Math.floor(Math.random()*999999)+1
    console.log("New XssCode is "+xsscode)
}
