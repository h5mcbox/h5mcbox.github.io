console.log("Custom Script in Wikipedia");
window.sleep=function(e){return new Promise(function(resolve,reject){setTimeout(resolve,e)})};
window.AutoLeave=async function(){
    console.log("AutoLeave Version 0.1")
    await sleep(900000)
    LeaveNow()
}
window["LeaveNow"]=function(){
    LeaveWindow=window.open("https://zh.wikipedia.org/wiki/Special:%E7%94%A8%E6%88%B7%E9%80%80%E5%87%BA")
    LeaveWindow.onload=async function(){try{LeaveWindow.document.querySelector(".oo-ui-inputWidget-input.oo-ui-buttonElement-button").click()}catch(e){};await sleep(3000);LeaveWindow.close();localStorage["Refresh"]="";delete localStorage["Refresh"];window.location.reload()}
}
window["localStorageRefresh"]=function(e){
    if(e.key=="Refresh"){window.location.reload()}
}
addEventListener("storage",localStorageRefresh)
document.querySelector("#pt-logout a").onclick=LeaveNow
