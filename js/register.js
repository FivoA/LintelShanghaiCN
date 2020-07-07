$(function () {
    $("#btn-submit").click(function () {
       
        var email = $("#txtemail").val();
        var pwd = $("#txtpwd").val();
        var code = $("#txtcode").val();
        var emailreg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        var identityid=$("#selidentityid").val();

        if (ut == 2 && parseInt(identityid) < 1) {
            alert("请选择业主类型！");
            return false;
        } 
        if (email.length < 1) {
            alert("请输入邮箱！");
            return false;
        }
        if (!emailreg.test(email)) {
            alert("请输入正确格式的邮箱！");
            return false;
        }
        if (pwd.length < 6) {
            alert("请输入至少6位密码！");
            return false;
        }
        if (code.length < 4) {
            alert("请输入4位验证码！");
            return false;
        }
        var invitecode = $("#txtinvitecode").val();
        var regionid = $("#selregionid").val(); 
        var employdate = $("#txtemploydate").val(); 
        var company = $("#txtcompany").val(); 
        var linkman = $("#txtlinkman").val(); 
        var tel = $("#txttel").val(); 
        var summry = $("#txtsummry").val(); 
        if (ut == 2 || ut == 3) {
            if (ut == 3) {
                if (invitecode.length < 1) {
                    alert("请输入邀请码！");
                    return false;
                }
                if (regionid < 1) {
                    alert("请选择所管辖区域！");
                    return false;
                }
                if (employdate.length < 1) {
                    alert("请选择从业时间！");
                    return false;
                }
            }
            if (company.length < 1) {
                alert("请输入公司名称！");
                return false;
            }
            if (linkman.length < 1) {
                alert("请输入联系人！");
                return false;
            }
            if (tel.length < 1) {
                alert("请输入联系号码！");
                return false;
            }
        }

        if (!$('#ckis').is(':checked')) {
            alert("请先阅读Lintel的条款！");
            return false;
        }

        $.ajax({
            type: "Post",
            url: "interface/reg.aspx?r=" + Math.random(),
            data: {
                type: "reg", email: email, pwd: pwd, code: code, isreceive: $("input[name='em']:checked").val(), ut: ut
                , invitecode: invitecode, regionid: regionid, employdate: employdate, company: encodeURIComponent(company), linkman: encodeURIComponent(linkman)
                , tel: tel, summry: encodeURIComponent(summry), identityid: identityid
            },
            dataType: "json",
            async: false,
            beforeSend: function (XMLHttpRequest) { },
            success: function (data, textStatus) {
                if (data.errcode == 1) {
                    $(".wctxt1").html("欢迎您 " + email);
                    popWindow(1);

                    $("#txtemail").val("");
                    $("#txtpwd").val("");
                    $("#txtcode").val("");

                    if (ut == 2 || ut == 3) {
                        if (ut == 3) {
                           $("#txtinvitecode").val("");
                           $("#selregionid").val("0");
                           $("#txtemploydate").val("");
                        }
                        $("#txtcompany").val("");
                        $("#txtlinkman").val("");
                        $("#txttel").val("");
                        $("#txtsummry").val("");
                    }
                } else {
                    alert(data.errmsg);
                }
            }
        });
    });
});