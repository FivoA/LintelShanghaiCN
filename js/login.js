$(function () {
    $("#btn-confirm").click(function () {
        var username = $("#txtusername").val();
        if (username.length < 1) {
            alert("请输入账号！");
            return false;
        }
        var passwd = $("#txtpasswd").val();
        if (passwd.length < 1) {
            alert("请输入密码！");
            return false;
        }
        var isremember = $('#ckisremember').is(':checked') ? 1 : 0;

        $.ajax({
            type: "Post",
            url: "interface/login.aspx?r=" + Math.random(),
            data: { type: "login", username: username, passwd: passwd, isremember: isremember },
            dataType: "json",
            async: false,
            beforeSend: function (XMLHttpRequest) { },
            success: function (data, textStatus) {
                if (data.errcode == 1) {
                    window.location.href = "/";
                } else {
                    alert(data.errmsg);
                }
            }
        });
        
    });
});