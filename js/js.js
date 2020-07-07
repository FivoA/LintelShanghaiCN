$(function(){
    
    $('input,textarea').placeholder();  

    $("#selidentityid,#selregionid").selectpick({
        height: 48,
        width: 368,
        container: '.selectbox1',
        onSelect: function(value,text){
            console.log("这是回调函数，选中的值："+value+" \n选中的下拉框文本："+text);
            if(value==1){
                $("#tipstype").html('').html('<h5>小业主</h5><p>以个人为单位的房屋产权者</p>');
            }else if(value==2){
                $("#tipstype").html('').html('<h5>大业主</h5><p>以公司为单位的房屋产权者，一般是房屋的建造单位，对房屋所在小区有实际管控权。</p>');
            }else if(value==3){
                $("#tipstype").html('').html('<h5>美房专家</h5><p>房屋的直接代理人，通常对房屋进行设计和改造再进行出租</p>');
            }else if(value==4){
                $("#tipstype").html('').html('<h5>资产管理员</h5><p>房屋的直接代理人，通常只对房屋进行软包装，并且有团队对房屋进行管理。</p>');
            }
        }
    });
    
    
    //$("#btn-submit").click(function(){
    //    popWindow(1);
    //});
    $("#pop_window1 .close").click(function(){
        popHide(1);
    });

    $(".btn-vfcode").click(function () {
        var email = $("#txtemail").val();
        var emailreg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        if (email.length < 1) {
            alert("请输入邮箱！");
            return false;
        }
        if (!emailreg.test(email)) {
            alert("请输入正确格式的邮箱！");
            return false;
        }
        $.ajax({
            type: "Post",
            url: "interface/reg.aspx?r=" + Math.random(),
            data: { type: "sendemail", email: email},
            dataType: "json",
            async: false,
            beforeSend: function (XMLHttpRequest) { },
            success: function (data, textStatus) {
                if (data.errcode == 1) {
                    alert("发送成功");
                } else {
                    alert(data.errmsg);
                }
            }
        });
    });
});

window.onresize = function(){
    fixPop(1);
};

//fixPop
function fixPop(num){
    var ww = $(window).width();
    var wh =  $(window).height();
    var popW = $("#pop_window"+num).width();
    var popH = $("#pop_window"+num).height();
    var pLeft = (ww - popW)/2;
    var pTop = (wh - popH)/2;
    if(wh > popH){
        $("#bggray").css({height:wh});
        $("#pop_window"+num).css({left:pLeft,top:pTop});
        $("#wrapper").css({height:wh});
    }else{
        $("#bggray").css({height:popH});
        $("#pop_window"+num).css({left:pLeft,top:0});
        $("#wrapper").css({height:popH});
    }
}

//popHide
function popHide(num){
    $("#bggray").hide();
    $("#pop_window"+num).hide();
    $("#wrapper").css({height:"100%"});
}
//popWindow
function popWindow(num){
    $("#bggray").show();
    $("#pop_window"+num).show();
    fixPop(num);
}

