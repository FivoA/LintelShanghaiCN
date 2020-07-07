$(function () {
    getlocated();
    initSelect();
    initData();
    initTextBox();

    $("#houseRent_btn_submit").click(function () {
        //判断
        if ($.trim($("#txtSize").val()) == "") {
            jQuery.jGrowl((langid == "zh" ? "请输入建筑面积！" : "Please input size..."));
            $("#txtSize").focus();
            return false;
        }

        //计算租金
        var size = parseFloat($.trim($("#txtSize").val()));
        var money = size;
        if ($("#txtAddress").attr("data-value") == "-1") {
            money = money * parseFloat($("#houseRent_section_list input[type='radio']:checked").attr("data-value"));
        }
        else {
            money = money * parseFloat($("#txtAddress").attr("data-value"));
        }
        $(".multi input[type='radio']:checked").each(function () {
            money = money * parseFloat($(this).attr("data-value")) / 100;
        });

        $(".houseRent_result span").html(toDecimal2(money));
        $(".houseRent_result").show();
    });

    initIntellSeach();
})

function toDecimal2(x) {
    var x =parseInt(x * 100) / 100;
    var s = x.toString();
    
    var rs = s.indexOf('.');
    //1001.1
    if (x >= 1000) {
        var dotIndex = (rs == -1 ? s.length : rs);
        s = s.substring(0, dotIndex - 3) + "," + s.substring(dotIndex - 3,s.length) ;
    }
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    rs = s.indexOf('.');
    while (s.length <= rs + 2) {
        s += '0';
    }
    if (rs >= 0) {
        s = s.substring(0, rs + 3);
    }
    return s;
}

function initIntellSeach() {
    $("#txtAddress").intellSearch({
        url: "/my/data/data.ashx?action=searchRentType&t=" + Math.random(),
        property: (langid == "en" ? "RentName" : "RentNameCH"),
        itemNumber: 10,
        isEmptyRequest: false,
        defaultValue: "",
        width: $("#txtAddress").width() + 2,
        maxHeight: -1,
        ajax: {
            timeout: 5000,//超时时间
            cache: true//是否缓存
        },
        event: {
            setData: function (data) {
                return { "RentName": $("#txtAddress").val(), "RentNameCH": $("#txtAddress").val(), "lang": langid };
            },
            itemClick: function (data) {
                $("#txtAddress").attr("data-value", data.item.RentPrice);
                if (data.item.RentPrice == -1) {
                    $("#tedian").hide();
                    return true;
                }
                $("#tedian").show();
                $("#tedian .tedian3,#tedian .tedian2").hide();
                $("#tedian .tedian" + data.item.RentTypeID).show();
                return false;
            },
            enterKeydown: function (data) {
                console.log(data.item);
            }
        }
    });
}

function initTextBox() {
    $("input[type='text']").each(function () {
        var $this = $(this);
        if ($this.attr("isReg") != undefined && $this.attr("isReg") != "") {
            if ($this.attr("isReg") == "N") {
                $this.bind("keyup", function () {
                    $(this).val($(this).val().replace(/\D/g, ''));
                });
            }
            if ($this.attr("isReg") == "F") {
                $this.bind("keyup", function () {
                    $(this).val($(this).val().replace(/[^\d.]/g, ''));
                    $(this).val($(this).val().replace(".", "$#$").replace(/\./g, "").replace("$#$", "."));
                    if ($(this).val().indexOf(".") == 0 && this.value != "") {
                        $(this).val("0" + $(this).val());
                    }
                });
            }
        }
    });
}

function getlocated() {
    //var _html = "";

    //$.ajax({
    //    url: "/house/data/index.aspx?r=" + Math.random(),
    //    data: {
    //        type: "getlocated",
    //        housetype: 1
    //    },
    //    dataType: 'xml',
    //    type: 'Post',
    //    async: false,
    //    beforeSend: function (XMLHttpRequest) { },
    //    success: function (data, textStatus) {
    //        $(data).find("data").each(function (i) {
    //            if ($(this).children("NameCH").text() != "其他区域") {
    //                _html += "<label " + (i == 0 ? "class='selected'" : "")
    //                        + "><p class='zh'>" + $(this).children("NameCH").text()
    //                        + "</p><p class='en'>" + $(this).children("Name").text()
    //                        + "</p><input type='radio' name='rdLocation' " + (i == 0 ? "checked='checked'" : "")
    //                        + " data-name='" + $(this).children("NameCH").text() + "' /></label>";
    //            }
    //        });
    //    }
    //});
    //$("#houseRent_section_list").html(_html);
    //$(".en,.zh").hide();
    //$("." + langid).show();

    $.ajax({
        url: "/my/data/data.ashx?r=" + Math.random(),
        data: {
            action: "getRentType",
            typeid: "1"
        },
        dataType: 'json',
        type: 'Post',
        async: false,
        beforeSend: function (XMLHttpRequest) { },
        success: function (data, textStatus) {
            if (data.code == 1) {
                var _html = "";
                $(data.obj).each(function (i) {
                    _html += "<label " + (i == 0 ? "class='selected'" : "")
                             + "><p class='zh'>" + this.RentNameCH
                             + "</p><p class='en'>" + this.RentName
                             + "</p><input type='radio' name='rdLocation' " + (i == 0 ? "checked='checked'" : "")
                             + " data-value='" + this.RentPrice + "' /></label>";
                });

                $("#houseRent_section_list").html(_html);
                $(".en,.zh").hide();
                $("." + langid).show();
            }
            else {
                jQuery.jGrowl("数据初始化错误！");
            }
        }
    });
}

function initSelect() {
    $("div.houseRent_section_list label").click(function (e) {
        if ($(e.target).is("input")) return;
        if (!$(this).hasClass("selected")) {
            $(this).addClass("selected").siblings().removeClass("selected");
        }
        else {
            if($(this).parent().attr("id") != "houseRent_section_list")
                $(this).removeClass("selected");
        }
    })
}

function initData() {
    $.ajax({
        url: "/my/data/data.ashx?r=" + Math.random(),
        data: {
            action: "getRentOption"
        },
        dataType: 'json',
        type: 'Post',
        async: false,
        beforeSend: function (XMLHttpRequest) { },
        success: function (data, textStatus) {
            if (data.code == 1) {
                $(data.obj).each(function (i) {
                    $("input[type='radio'][data-name='" + this.OptionName + "']").attr("data-value", this.OptionPercent.toString());
                })
            }
            else {
                jQuery.jGrowl("数据初始化错误！");
            }
        }
    });

    
}

function ChangeLanguage() {
    window.location = "/rent.aspx";
}
