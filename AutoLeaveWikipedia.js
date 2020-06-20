console.log("Custom Script in Wikipedia");
window.sleep=function(e){return new Promise(function(resolve,reject){setTimeout(resolve,e)})};
window.AutoLeave=async function(){
    console.log("AutoLeave Version 0.1")
    await sleep(900000)
    console.log("Leaving Wikipedia...")
    document.querySelector("#pt-logout a").click()
}
