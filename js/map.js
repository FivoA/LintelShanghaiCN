﻿$(function () {
    $(".search_checkbox label").click(function (e) {
        if (e.target.tagName != "INPUT") return;
        $(this).find("i").toggleClass("checked");

        initMap();
    });
    $("#btnSearch,#btnSearchzh").click(function () {
        initMap();
    });
    $("#btnSearch2,#btnSearchzh2").click(function () {
        initMap();
    });
    $("#.search_map_type li[data-id!='0']").each(function () {
        $(this).click(function () {
            $(this).toggleClass("selected");
            initSpot();
        });
    })
})
function initMap(isMordenChange) {
    if (isMordenChange == undefined) {
        isMordenChange = false;
    }
    if (isMordenChange) {
        $("#selbudget,#selbudgetzh,#selBedroom,#selBedroomzh,#selFeature,#selFeaturezh,#selSource,#selSourcezh").val("0");
        $("#sellocation,#sellocationzh").val("0");
        $("#selOrderzh,#selOrder,#selOrderzh2,#selOrder2").val("0");
        $("#txtkey,#txtkeyzh,#txtkey2,#txtkeyzh2").val("");
        $("#selhousetype2,#selhousetypezh2,#sellocation2,#sellocationzh2,#selAverage,#selAveragezh").val("0");
    }
    lrid = 0;
    srid = 0;
    var locationid;
    if (isModern) {
        locationid = langid == "en" ? $("#sellocation2").val() : $("#sellocationzh2").val();
        initMapData2();
        getinfo2(1, langid);
    }
    else {
        locationid = langid == "en" ? $("#sellocation").val() : $("#sellocationzh").val();
        initMapData();
        getinfo(1, langid);
    }

    initScrollbar();
    clear();
    initSpot();

    if (locationid == "0") {
        var divFirst = $(".search_map_con_list>div")[0];
        if (typeof (divFirst) == "undefined" || divFirst == null || isMordenChange) {
            var newCenter = new Microsoft.Maps.Location(shLat, shLng);
            map.setView({
                zoom: zoomDefault,
                center: newCenter,
            });
            LocatedRegionShow();

        }
        else {
            var defaultType = $(divFirst).attr("data-type");
            var defaultId = $(divFirst).attr("data-id");

            var defaultLat, defaultLng;
            if (defaultType == "region") {
                for (var i in courtdata) {
                    if (courtdata[i].SubRegionID == defaultId) {
                        defaultLat = courtdata[i].lat;
                        defaultLng = courtdata[i].lng;
                    }
                }
            } else {
                for (var i in housedata) {
                    if (housedata[i].idx == defaultId) {
                        defaultLat = housedata[i].lat;
                        defaultLng = housedata[i].lng;
                    }
                }
            }
            var newCenter = new Microsoft.Maps.Location(defaultLat, defaultLng);
            map.setView({
                zoom: zoomChange,
                center: newCenter,
            });
        }
    }
    else {
        var lat, lng;
        for (var i = 0; i < countydata.length; i++) {
            if (countydata[i].areaid == locationid) {
                lng = countydata[i].lng;
                lat = countydata[i].lat;
            }
        }
        var newCenter = new Microsoft.Maps.Location(lat, lng);
        map.setView({
            zoom: zoomCourt,
            center: newCenter,
        });
    }
}
function initSpot() {
    //地图放大到14后，才改变呈现
    if (map.getZoom() >= zoomChange) {
        ViewSpotCreate();
    }
}
var map;
var overlay;
var maxX, maxY, maxY, minY;
var zoomDefault = 12;//起始默认放大级数
var zoomChange = 14; //地图缩放到该级数切换行政区和小区
var zoomCourt = 14; //点击进入到小区，放大到该级数
var shLat = 31.22, shLng = 121.48;//上海市政府经纬度
function initialize() {
    $("#divAllScreen").show();
    $("#divModern").show();
    //加载地图
    var myLatLng = new Microsoft.Maps.Location(shLat, shLng);//默认中心点坐标
    var myOptions = {
        zoom: zoomDefault,//放大级数
        center: myLatLng,
        //mapTypeId: Microsoft.Maps.MapTypeId.Road,    //地图类型
        enableClickableLogo: false,
        enableInertia: false,
        disableStreetside: false,
        showTrafficButton:false,
        showTermsLink: false,
        supportedMapTypes: [Microsoft.Maps.MapTypeId.road, Microsoft.Maps.MapTypeId.aerial],

        showLocateMeButton:false,
        allowHidingLabelsOfRoad: true,
        disableMapTypeSelectorMouseOver: true,
        customMapStyle: {
            elements: {
                //tollRoad: {
                //    fillColor: '#fcf7d2',
                //    strokeColor: '#ecd4a2',
                //},
                //arterialRoad: {
                //    fillColor: '#fcf7d2',
                //    strokeColor: '#ecd4a2'
                //},
                unpavedStreet: {
                    visible:false,
                },
                //road: {
                //    fillColor: '#fcf7d2',
                //    strokeColor: '#ecd4a2'
                //},
                trail: {
                    visible: false,
                    labelVisible:false,
                },
                walkway: {
                    visible: false,
                    labelVisible:false,
                },
                walkingRoute: {
                    visible: false,
                    labelVisible: false,
                },
                //arterialRoad: {
                //    visible: false,
                //    labelVisible: false,
                //},
                neighborhood: {
                    visible:false,
                    labelVisible:false,
                },
                business: {
                    visible: false,
                    labelVisible:false,
                },
                political: {
                    visible: false,
                    labelVisible:false,
                },
                medical: {
                    visible: false,
                    labelVisible:false,
                },
                populatedPlace: {
                    visible: false,
                    labelVisible:false,
                },
                structure: {
                    visible: false,
                    labelVisible:false,
                },
               
                education: {
                    visible: false,
                    labelVisible:false,
                },
                military: {
                    visible: false,
                    labelVisible:false,
                },
            }
        }
    };
    map = new Microsoft.Maps.Map(document.getElementById("map_canvas"), myOptions);
    //countyBtnShow();
    InitLocatedRegion();

    Microsoft.Maps.Events.addHandler(map, 'viewchangeend', function () {
        var zoomLevel = map.getZoom();
        if (zoomLevel < zoomChange && zoomLevel > 10) {
            courtHide();
            houseHide();
            ViewSpotHide();
            LocatedRegionShow();
            LocatedRegionLineHide();
        }
        else if (zoomLevel <= 10) {
            LocatedRegionHide();
        }
        else {
            LocatedRegionLineHide();
            LocatedRegionHide();
            //courtShow();
            //houseShow();
            //initSpot();

            setTimeout(function () {
                InitLocatedRegionLine();
                getMapBounds();
                courtCreate();
                houseCreate();
                ViewSpotCreate();
            }, 200);
        }
    });
    
}
String.prototype.colorRgb = function () {
    // 16进制颜色值的正则
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 把颜色值变成小写
    var color = this.toLowerCase();
    if (reg.test(color)) {
        // 如果只有三位的值，需变成六位，如：#fff => #ffffff
        if (color.length === 4) {
            var colorNew = "#";
            for (var i = 1; i < 4; i += 1) {
                colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
            }
            color = colorNew;
        }
        // 处理六位的颜色值，转为RGB
        var colorChange = [];
        for (var i = 1; i < 7; i += 2) {
            colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
        }
        colorChange.push('0.8');
        return "RGB(" + colorChange.join(",") + ")";
    } else {
        return color;
    }
    //return "#CC" + color.substring(1, 7);
}

//-------------------行政区域 begin-------------------------
var polyonExArray = new Array();
function InitLocatedRegion() {
    for (var i = 0; i < countydata.length; i++) {
        if (countydata[i].AreaVal != null && countydata[i].AreaVal.length > 0) {
            polyonExArray.push(new PolygonEx(countydata[i]));
        }
    }
}
function PolygonEx(house) {
    this.house = house;

    var triangleCoords = [];
    for (j in house.AreaVal) {
        var lat = parseFloat(house.AreaVal[j].lat);//经度
        var lng = parseFloat(house.AreaVal[j].lng);//纬度
        //加入经纬度
        triangleCoords.push(new Microsoft.Maps.Location(lng, lat));
    }
    var color = house.AreaColor.colorRgb();
    var browserType = BrowserType();
    if (browserType != "Chrome") {
        color = house.AreaColor;
    }
    var polygon = new Microsoft.Maps.Polygon(triangleCoords,
        {
            fillColor: color,
            strokeColor: color,
            strokeThickness: 0,
        });
    map.entities.push(polygon);
    this.polygon = polygon;

    //为多边形添加说明文字
    var labelPin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(house.lat, house.lng), {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
        title: langid == "en" ? house.name : house.namezh
    });
    polygon.metadata = {
        label: labelPin
    };
    map.entities.push(labelPin);
    this.labelPin = labelPin;

    Microsoft.Maps.Events.addHandler(polygon, 'click', function () {
        //右边显示对应的小区列表，地图定位到点击区域设定的坐标
        if (isModern) {
            $("#sellocation2,#sellocationzh2").val(house.areaid);
            initMapData2();
        }
        else {
            $("#sellocation,#sellocationzh").val(house.areaid);
            initMapData();
        }
        //clear();
        getCourtList(house.areaid);
        var newCenter = new Microsoft.Maps.Location(house.lat, house.lng);
        map.setView({
            center: newCenter,
            zoom: zoomCourt
        });
    });
    Microsoft.Maps.Events.addHandler(labelPin, 'click', function () {
        //右边显示对应的小区列表，地图定位到点击区域设定的坐标
        if (isModern) {
            $("#sellocation2,#sellocationzh2").val(house.areaid);
            initMapData2();
        }
        else {
            $("#sellocation,#sellocationzh").val(house.areaid);
            initMapData();
        }
        //clear();
        getCourtList(house.areaid);
        var newCenter = new Microsoft.Maps.Location(house.lat, house.lng);
        map.setView({
            center: newCenter,
            zoom: zoomCourt
        });
    });

    this.hide = function () {
        polygon.setOptions({
            visible: false,
        });
        labelPin.setOptions({
            visible: false,
        });
    };
    this.show = function () {
        polygon.setOptions({
            visible: true,
        });
        labelPin.setOptions({
            visible: true,
        });
    };
}
//隐藏行政区域 
function LocatedRegionHide() {
    for (var i = 0; i < polyonExArray.length; i++) {
        polyonExArray[i].hide();
    }
}
//显示行政区域
function LocatedRegionShow() {
    for (var i = 0; i < polyonExArray.length; i++) {
        polyonExArray[i].show();
    }
}
//-------------------行政区域 end---------------------------

//-------------------行政区域边框线 begin-------------------
var polygonLineArray = new Array();
function InitLocatedRegionLine() {
    var location = getLocatedRegion();
    if (location != "0") {
        var polygonLine;
        for (var i in polygonLineArray) {
            if (polygonLineArray[i].id == location) {
                polygonLine = polygonLineArray[i];
                break;
            }
        }

        if (polygonLine == null) {
            var AreaVal;
            for (var i in countydata) {
                if (countydata[i].areaid == location) {
                    AreaVal = countydata[i].AreaVal;
                    break;
                }
            }
            var triangleCoords = [];
            for (var j in AreaVal) {
                var lat = parseFloat(AreaVal[j].lat);//经度
                var lng = parseFloat(AreaVal[j].lng);//纬度
                //加入经纬度
                triangleCoords.push(new Microsoft.Maps.Location(lng, lat));
            }
            polyonLine = new Microsoft.Maps.Polyline(triangleCoords, {
                strokeColor: "#ff0000",
                strokeThickness: 5
            });
            map.entities.push(polyonLine);
            polygonLineArray.push(polyonLine);
        }
        else {
            polyonLine.setOptions({
                visible: true,
            });
        }
    }
}
function PolygonLineEx(id,polygon) {
    this.id = id;
    this.polygon = polygon;
}
function getLocatedRegion() {
    var locationid;
    if (isModern) {
        locationid = langid == "en" ? $("#sellocation2").val() : $("#sellocationzh2").val();
    }
    else {
        locationid = langid == "en" ? $("#sellocation").val() : $("#sellocationzh").val();
    }
    return locationid;
}
function getCourt(name, areaid) {
    
}
//隐藏行政区域 
function LocatedRegionLineHide() {
    for (var i = 0; i < polygonLineArray.length; i++) {
        polygonLineArray[i].setOptions({
            visible: false,
        });
    }
}

//获取小区列表的前8个，显示在右边
function getCourtList(areaid) {
    lrid = areaid;
    srid = 0;
    if (isModern)
        getinfo2(1, langid);
    else
        getinfo(1, langid);
}
//-------------------行政区域边框线 end---------------------

//获得地图的当前面积，右上角和左下角的坐标
function getMapBounds() {
    var mapLatLngBounds = map.getBounds();
    minX = mapLatLngBounds.getNorthwest().longitude;
    maxY = mapLatLngBounds.getNorthwest().latitude;
    maxX = mapLatLngBounds.getSoutheast().longitude;
    minY = mapLatLngBounds.getSoutheast().latitude;
}

//------------------House Begin--------------------
var houseExArr = new Array();
var houseIdxArr = new Array();
var zhouseIndex = 2;
//自定义house图标
//参数houseIdx：右边列表鼠标移动上去，在地图上着重显示该房子
function houseCreate(houseIdx) {
    var currentIndex = -1;
    for (var i = 0; i < housedata.length; i++) {
        if (housedata[i].lng > minX && housedata[i].lng < maxX && housedata[i].lat < maxY && housedata[i].lat > minY) {
            var idx = housedata[i].idx;
            var index = $.inArray(idx, houseIdxArr);
            
            if (index < 0) {
                var houseLatLng = new Microsoft.Maps.Location(housedata[i].lat, housedata[i].lng);
                var icon = '';
                if (isModern) {
                    icon = 'http://www.lintel-shanghai.com//images/compoud_control.png';
                }
                else {
                    icon = 'http://www.lintel-shanghai.com//images/icon/house_' + housedata[i].houseType + '.png';
                }
                var pushpin = new Microsoft.Maps.Pushpin(houseLatLng, {
                    icon: icon,
                    anchor: new Microsoft.Maps.Point(9, 26)
                });
                map.entities.push(pushpin);
                houseIdxArr.push(idx);
                houseExArr.push(new HouseEx(housedata[i], pushpin));
                currentIndex = courtExArr.length - 1;
            }
            else {
                if (houseIdx == idx) {
                    currentIndex = index;
                }
                houseExArr[index].obj.setOptions({
                    visible: true
                });
            }
        }
    }
    if (currentIndex > -1) {
        houseExArr[currentIndex].mouseover();
    }
}
var mouseOverBox;
var clickBox;
function HouseEx(house, obj) {
    this.house = house;
    this.obj = obj;
    this.mouseover = function () {
        mouseover()
    };
    var mouseover = function () {
        var center = new Microsoft.Maps.Location(house.lat, house.lng);
        var url = "";
        switch (house.houseType) {
            case "2":
                url = "http://www.lintel-shanghai.com//house/RenovatedOldApartment.aspx?HouseID=" + house.idx;
                break;
            case "4":
                url = "http://www.lintel-shanghai.com//house/Lanehouse.aspx?HouseID=" + house.idx;
                break;
            case "5":
                url = "http://www.lintel-shanghai.com//house/Gardenhouse.aspx?HouseID=" + house.idx;
                break;
            case "6":
                url = "http://www.lintel-shanghai.com//house/CreativeOffice.aspx?HouseID=" + house.idx;
                break;
        }
        var info = '<div class="house_btn"><span>';
        info += '<a href="' + url + '" target="_blank"/><img src="' + house.PicUrl + '" /></a><ul>';
        if (house.houseType == "2" || house.houseType == "4" || house.houseType == "5") {
            info += '<li><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>RMB ' + toThousands(house.price) + '/月</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>RMB ' + toThousands(house.price) + '/mo</font></li>';
            info += '<li>' + house.BedroomNum + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>卧</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '> bd</font> ' + house.BathroomNum + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>卫</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '> ba</font></li>';
            info += '<li>' + house.HouseSize + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>平方米</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '> sqm</font></li>';
        } else {
            info += '<li class="rows2"><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + ">" + house.HouseNameCH + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + ">" + house.HouseName + '</font></li>';
            info += '<li class="rows2">RMB ' + toThousands(house.price) + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>+/月</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>+/mo</font></li>';
        }
        info += '</ul></span></div>';
        if (mouseOverBox == null) {
            mouseOverBox = new Microsoft.Maps.Infobox(center, {
                htmlContent: info,
                offset: new Microsoft.Maps.Point(9, 26)
            });
            mouseOverBox.setMap(map);
        } else {
            mouseOverBox.setLocation(center);
            mouseOverBox.setOptions({
                htmlContent: info,
                offset: new Microsoft.Maps.Point(9, 26)
            });
        }
    }

    Microsoft.Maps.Events.addHandler(obj, 'click', function () {
        var center = new Microsoft.Maps.Location(house.lat, house.lng);
        var url = "";
        switch (house.houseType) {
            case "2":
                url = "http://www.lintel-shanghai.com//house/RenovatedOldApartment.aspx?HouseID=" + house.idx;
                break;
            case "4":
                url = "http://www.lintel-shanghai.com//house/Lanehouse.aspx?HouseID=" + house.idx;
                break;
            case "5":
                url = "http://www.lintel-shanghai.com//house/Gardenhouse.aspx?HouseID=" + house.idx;
                break;
            case "6":
                url = "http://www.lintel-shanghai.com//house/CreativeOffice.aspx?HouseID=" + house.idx;
                break;
        }
        var info = '<div class="house_btn"><span>';
        info += '<a href="' + url + '" target="_blank"/><img src="' + house.PicUrl + '" /></a><ul>';
        if (house.houseType == "2" || house.houseType == "4" || house.houseType == "5") {
            info += '<li><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>RMB ' + toThousands(house.price) + '/月</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>RMB ' + toThousands(house.price) + '/mo</font></li>';
            info += '<li>' + house.BedroomNum + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>卧</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '> bd</font> ' + house.BathroomNum + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>卫</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '> ba</font></li>';
            info += '<li>' + house.HouseSize + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>平方米</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '> sqm</font></li>';
        } else {
            info += '<li class="rows2"><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + ">" + house.HouseNameCH + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + ">" + house.HouseName + '</font></li>';
            info += '<li class="rows2">RMB ' + toThousands(house.price) + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>+/月</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>+/mo</font></li>';
        }
        info += '</ul></span></div>';
        if (clickBox == null) {
            clickBox = new Microsoft.Maps.Infobox(center, {
                htmlContent: info,
                offset: new Microsoft.Maps.Point(9, 26)
            });
            clickBox.setMap(map);
        } else {
            if (clickBox.getHtmlContent() == info) {
                clickBox.setMap(null);
                clickBox = null;
            }
            else {
                clickBox.setLocation(center);
                clickBox.setOptions({
                    htmlContent: info,
                    offset: new Microsoft.Maps.Point(9, 26)
                });
            }
        }
    });

    Microsoft.Maps.Events.addHandler(obj, 'mouseover', function () {
        mouseover();
    });
    Microsoft.Maps.Events.addHandler(obj, 'mouseout', function () {
        if (mouseOverBox != null) {
            mouseOverBox.setMap(null);
            mouseOverBox = null;
        }
    });
}

//隐藏二级图标数据  
function houseHide() {
    for (var i = 0; i < houseExArr.length; i++) {
        houseExArr[i].obj.setOptions({
            visible:false
        });
    }
    if (mouseOverBox != null) {
        mouseOverBox.setMap(null);
        mouseOverBox = null;
    }
    if (clickBox != null) {
        clickBox.setMap(null);
        clickBox = null;
    }
}
//显示二级图标数据  
function houseShow() {
    
}
//------------------House End--------------------

//------------------小区 Begin--------------------
var courtExArr = new Array();
var courtIdxArr = new Array();
var zhouseIndex = 2;
function courtCreate(regionIdx) {
    var currentIndex = -1;
    for (var i = 0; i < courtdata.length; i++) {
        if (courtdata[i].lng > minX && courtdata[i].lng < maxX && courtdata[i].lat < maxY && courtdata[i].lat > minY) {
            var idx = courtdata[i].SubRegionID;
            var index = $.inArray(idx, courtIdxArr);

            if (index < 0) {
                var courtLatLng = new Microsoft.Maps.Location(courtdata[i].lat, courtdata[i].lng);
                var icon = '';
                if (isModern) {
                    icon = 'http://www.lintel-shanghai.com//images/compoud_control.png';
                }
                else {
                    icon = 'http://www.lintel-shanghai.com//images/icon/house_' + courtdata[i].houseType + '.png';
                }
                var pushpin = new Microsoft.Maps.Pushpin(courtLatLng, {
                    icon: icon,
                    anchor: new Microsoft.Maps.Point(9, 26)
                });
                map.entities.push(pushpin);
                courtIdxArr.push(idx);
                courtExArr.push(new CourtEx(courtdata[i], pushpin));

                currentIndex = courtExArr.length - 1;
            }
            else {
                if (regionIdx == idx) {
                    currentIndex = index;
                }
                courtExArr[index].obj.setOptions({
                    visible: true
                });
            }
        }
    }
    if (currentIndex > -1) {
        courtExArr[currentIndex].mouseover();
    }
}
function CourtEx(house, obj) {
    this.house = house;
    this.obj = obj;
    this.mouseover = function () {
        mouseover();
    };
    var mouseover = function () {
        var center = new Microsoft.Maps.Location(house.lat, house.lng);
        var info = '<div class="court_btn"><span>';
        info += '<a href="http://www.lintel-shanghai.com//house/SubRegion.aspx?SubRegionID=' + house.SubRegionID + '" target="_blank"/><img src="' + house.PicUrl + '" /></a><ul>';
        if (!isModern) {
            info += '<li class="rows2"><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>' + decodeURIComponent(decodeURIComponent(house.namezh)) + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>' + decodeURIComponent(decodeURIComponent(house.name)) + '</font></li>';
            info += '<li class="rows2"><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>' + house.num + '套房源</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>' + house.num + ' Unit' + (parseInt(house.num) > 1 ? 's' : '') + '</font></li>';
        }
        else {
            info += '<li ><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>' + decodeURIComponent(decodeURIComponent(house.namezh)) + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>' + decodeURIComponent(decodeURIComponent(house.name)) + '</font></li>';
            info += '<li ><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>' + house.num + '套房源</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>' + house.num + ' Unit' + (parseInt(house.num) > 1 ? 's' : '') + '</font></li>';
            info += '<li ><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>RMB' + toThousands(house.price) + '/平米/月</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>RMB ' + toThousands(house.price) + '/sqm/mo</font></li>';
        }
        info += '</ul></span></div>';
        if (mouseOverBox == null) {
            mouseOverBox = new Microsoft.Maps.Infobox(center, {
                htmlContent: info,
                offset: new Microsoft.Maps.Point(9, 26)
            });
            mouseOverBox.setMap(map);
        } else {
            mouseOverBox.setLocation(center);
            mouseOverBox.setOptions({
                htmlContent: info,
            });
        }
    };

    Microsoft.Maps.Events.addHandler(obj, 'click', function () {
        var center = new Microsoft.Maps.Location(house.lat, house.lng);
        var info = '<div class="court_btn"><span>';
        info += '<a href="http://www.lintel-shanghai.com//house/SubRegion.aspx?SubRegionID=' + house.SubRegionID + '" target="_blank"/><img src="' + house.PicUrl + '" /></a><ul>';
        if (!isModern) {
            info += '<li class="rows2"><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>' + decodeURIComponent(decodeURIComponent(house.namezh)) + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>' + decodeURIComponent(decodeURIComponent(house.name)) + '</font></li>';
            info += '<li class="rows2"><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>' + house.num + '套房源</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>' + house.num + ' Unit' + (parseInt(house.num) > 1 ? 's' : '') + '</font></li>';
        }
        else {
            info += '<li ><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>' + decodeURIComponent(decodeURIComponent(house.namezh)) + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>' + decodeURIComponent(decodeURIComponent(house.name)) + '</font></li>';
            info += '<li ><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>' + house.num + '套房源</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>' + house.num + ' Unit' + (parseInt(house.num) > 1 ? 's' : '') + '</font></li>';
            info += '<li ><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>RMB' + toThousands(house.price) + '/平米/月</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>RMB ' + toThousands(house.price) + '/sqm/mo</font></li>';
        }
        info += '</ul></span></div>';
        if (clickBox == null) {
            clickBox = new Microsoft.Maps.Infobox(center, {
                htmlContent: info,
                offset: new Microsoft.Maps.Point(9, 26)
            });
            clickBox.setMap(map);
        } else {
            if (clickBox.getHtmlContent() == info) {
                clickBox.setMap(null);
                clickBox = null;
            }
            else {
                clickBox.setLocation(center);
                clickBox.setOptions({
                    htmlContent: info,
                });
            }
        }
        getCourtInfo(house.areaid, house.SubRegionID);
    });

    Microsoft.Maps.Events.addHandler(obj, 'mouseover', function () {
        mouseover();
    });
    Microsoft.Maps.Events.addHandler(obj, 'mouseout', function () {
        if (mouseOverBox != null) {
            mouseOverBox.setMap(null);
            mouseOverBox = null;
        }
    });

}

//隐藏二级图标数据  
function courtHide() {
    for (var i = 0; i < courtExArr.length; i++) {
        courtExArr[i].obj.setOptions({
            visible: false
        });
    }
    if (mouseOverBox != null) {
        mouseOverBox.setMap(null);
        mouseOverBox = null;
    }
    if (clickBox != null) {
        clickBox.setMap(null);
        clickBox = null;
    }
}
//显示二级图标数据  
function courtShow() {

}
//------------------小区 End--------------------

//------------------景点 Begin--------------------
var ViewSpotArr = new Array();
var ViewSpotIdxArr = new Array();
var zViewSpoteIndex = 3;

function ViewSpotCreate() {
    ViewSpotHide();
    var currentIndex = 0;
    var selectedids = "";
    $(".search_map_type li.selected").each(function () {
        selectedids += "," + $(this).attr("data-id");
    });
    for (var i = 0; i < viewdata.length; i++) {
        if (viewdata[i].lng > minX && viewdata[i].lng < maxX && viewdata[i].lat < maxY && viewdata[i].lat > minY && selectedids.indexOf(viewdata[i].ViewType) > 0) {
            var idx = viewdata[i].idx;
            var index = $.inArray(idx, ViewSpotIdxArr);

            if (index < 0) {
                var spotLatLng = new Microsoft.Maps.Location(viewdata[i].lat, viewdata[i].lng);
                var icon = '/images/icon/spot_' + viewdata[i].ViewType + '.png';
                var width = 0,height = 0;
                switch (viewdata[i].ViewType) {
                    case "1":
                        width: 12;
                        height: 16;
                        break;
                    case "2":
                        width: 12;
                        height: 22;
                        break;
                    case "3":
                        width: 11;
                        height: 24;
                        break;
                    case "4":
                        width: 12;
                        height: 24;
                        break;
                    case "5":
                        width: 13;
                        height: 24;
                        break;
                    case "6":
                        width: 12;
                        height: 25;
                        break;
                    case "7":
                        width: 10;
                        height: 19;
                        break;
                    case "8":
                        width: 11;
                        height: 22;
                        break;
                }
                var pushpin = new Microsoft.Maps.Pushpin(spotLatLng, {
                    icon: icon,
                    anchor: new Microsoft.Maps.Point(width, height),
                });
                map.entities.push(pushpin);
                ViewSpotIdxArr.push(idx);
                ViewSpotArr.push(new ViewSpotEx(viewdata[i], pushpin));
            }
            else {
                ViewSpotArr[index].obj.setOptions({
                    visible: true
                });
            }
        }
    }
}

function ViewSpotEx(spot, obj) {
    this.spot = spot;
    this.obj = obj;
    this.mouseover = function () {
        mouseover();
    };
    var mouseover = function () {
        var center = new Microsoft.Maps.Location(spot.lat, spot.lng);
        var info = '<div class="spot_btn"><span>';
        var spot_url = '';
        if (spot.url)
            spot_url = spot.url;
        if (spot_url.toLowerCase() == "n/a") {
            spot_url = '';
        }
        if ((spot_url.length >= 7 && spot_url.substring(0, 7) != "http://") || (spot_url.length >= 8 && spot_url.substring(0, 8) != "https://")) {
            spot_url = "http://" + spot_url;
        }
        info += '<a ' + (spot_url != '' && spot_url != null ? 'href="' + spot_url + '" target="_blank"' : '') + '><img src="' + spot.PicUrl + '" /></a><ul>';
        if (spot.tel == '' || spot.tel == null) {
            info += '<li><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + ">" + spot.TypeNameCH + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + ">" + spot.TypeName + '</font></li>';

        }
        info += '<li><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + ">" + spot.namezh + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + ">" + spot.name + '</font></li>';
        info += '<li><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + ">" + spot.LocationCH + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + ">" + spot.Location + '</font></li>';

        if (spot.tel != '' && spot.tel != null)
            info += '<li><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + ">" + spot.tel + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + ">" + spot.tel + '</font></li>';
        info += "</ul></span></div>";
        if (mouseOverBox == null) {
            mouseOverBox = new Microsoft.Maps.Infobox(center, {
                htmlContent: info,
                offset: new Microsoft.Maps.Point(9, 26)
            });
            mouseOverBox.setMap(map);
        } else {
            mouseOverBox.setLocation(center);
            mouseOverBox.setOptions({
                htmlContent: info,
            });
        }
    };

    Microsoft.Maps.Events.addHandler(obj, 'click', function () {
        var center = new Microsoft.Maps.Location(spot.lat, spot.lng);
        var info = '<div class="spot_btn"><span>';
        var spot_url = '';
        if (spot.url)
            spot_url = spot.url;
        if (spot_url.toLowerCase() == "n/a") {
            spot_url = '';
        }
        if ((spot_url.length >= 7 && spot_url.substring(0, 7) != "http://") || (spot_url.length >= 8 && spot_url.substring(0, 8) != "https://")) {
            spot_url = "http://" + spot_url;
        }
        info += '<a ' + (spot_url != '' && spot_url != null ? 'href="' + spot_url + '" target="_blank"' : '') + '><img src="' + spot.PicUrl + '" /></a><ul>';
        if (spot.tel == '' || spot.tel == null) {
            info += '<li><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + ">" + spot.TypeNameCH + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + ">" + spot.TypeName + '</font></li>';

        }
        info += '<li><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + ">" + spot.namezh + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + ">" + spot.name + '</font></li>';
        info += '<li><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + ">" + spot.LocationCH + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + ">" + spot.Location + '</font></li>';

        if (spot.tel != '' && spot.tel != null)
            info += '<li><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + ">" + spot.tel + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + ">" + spot.tel + '</font></li>';
        info += "</ul></span></div>";
        if (clickBox == null) {
            clickBox = new Microsoft.Maps.Infobox(center, {
                htmlContent: info,
                offset: new Microsoft.Maps.Point(9, 26)
            });
            clickBox.setMap(map);
        } else {
            if (clickBox.getHtmlContent() == info) {
                clickBox.setMap(null);
                clickBox = null;
            }
            else {
                clickBox.setLocation(center);
                clickBox.setOptions({
                    htmlContent: info,
                });
            }
        }
    });

    Microsoft.Maps.Events.addHandler(obj, 'mouseover', function () {
        mouseover();
    });
    Microsoft.Maps.Events.addHandler(obj, 'mouseout', function () {
        if (mouseOverBox != null) {
            mouseOverBox.setMap(null);
            mouseOverBox = null;
        }
    });

}

//隐藏二级图标数据  
function ViewSpotHide() {
    for (var i = 0; i < ViewSpotArr.length; i++) {
        ViewSpotArr[i].obj.setOptions({
            visible: false
        });
    }
    if (mouseOverBox != null) {
        mouseOverBox.setMap(null);
        mouseOverBox = null;
    }
    if (clickBox != null) {
        clickBox.setMap(null);
        clickBox = null;
    }
}
//------------------景点 End--------------------

//获取小区列表的前8个，显示在右边
function getCourtList(areaid) {
    lrid = areaid;
    srid = 0;
    if (isModern)
        getinfo2(1, langid);
    else
        getinfo(1, langid);
    //$("#court_list").show();
}

//获取小区信息
var getCourtInfo = function (areaid, subid) {

    lrid = areaid;
    srid = subid;
    if (!isModern)
        getinfo(1, langid);
    // $("#house_info").html(courtId);
}

function getHouseInfo(houseid) {
    getdetail(houseid, langid);
}
function listMouseOver(houseType, houseIdx) {
    var zoomLevel = map.getZoom();
    if (zoomLevel >= zoomChange) {
        if (clickBox != null) {
            clickBox.setMap(null);
            clickBox = null;
        }
        if (houseType == "region") {
            for (var i = 0; i < courtdata.length; i++) {
                if (courtdata[i].SubRegionID == houseIdx) {
                    var courtLatLng = new Microsoft.Maps.Location(courtdata[i].lat, courtdata[i].lng);
                    map.setView({
                        center: courtLatLng,
                    });

                    getMapBounds();
                    courtCreate(houseIdx);
                    houseCreate();
                }
            }
        }
        else if (houseType == "house") {
            for (var i = 0; i < housedata.length; i++) {
                if (housedata[i].idx == houseIdx) {
                    var houseLatLng = new Microsoft.Maps.Location(housedata[i].lat, housedata[i].lng);
                    map.setView({
                        center: houseLatLng,
                    });

                    getMapBounds();
                    courtCreate();
                    houseCreate(houseIdx);
                }
            }
        }
    }
}
function listMouseOut() {
   
    if (mouseOverBox != null) {
        mouseOverBox.setMap(null);
        mouseOverBox = null;
    }
}
function clear() {
    courtExArr.length = 0;
    courtIdxArr.length = 0;
    houseExArr.length = 0;
    houseIdxArr.length = 0;
    ViewSpotArr.length = 0;
    ViewSpotIdxArr.length = 0;
    polyonExArray.length = 0;

    for (var i = map.entities.getLength() - 1; i >= 0; i--) {
        var pushpin = map.entities.get(i);
        if (pushpin instanceof Microsoft.Maps.Pushpin || pushpin instanceof Microsoft.Maps.Polygon || pushpin instanceof Microsoft.Maps.Infobox) {
            map.entities.removeAt(i);
        }
    }
    InitLocatedRegion();
}

function ChangeLanguage() {
    var title = (langid == "en" ? "Modern Compoud Review" : "现代小区预览");
    $("#divModern").attr("title", title);
    $("#txtSpotKey").attr("placeholder", $("#txtSpotKey").attr("placeholder" + langid));

    //initIntellSeach();
    window.location = 'map.aspx';
}

function toThousands(num) {
    var num = (num || 0).toString(), result = '';
    while (num.length > 3) {
        result = ',' + num.slice(-3) + result;
        num = num.slice(0, num.length - 3);
    }
    if (num) { result = num + result; }
    return result;
}