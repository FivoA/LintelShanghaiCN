var lrid = 0, srid = 0;
$(function () {
    initialize();
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

    $("#.search_map_type li").each(function () {
        $(this).click(function () {

            $(this).toggleClass("selected");
            initSpot();
        });
    })
});
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
            map.setZoom(zoomDefault);
            var newCenter = new google.maps.LatLng(shLat, shLng);
            map.setCenter(newCenter);
            countyBtnShow();
            getBoundary();
        }
        else {
            map.setZoom(zoomChange);
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
            var newCenter = new google.maps.LatLng(defaultLat, defaultLng);
            map.setCenter(newCenter);
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
        var newCenter = new google.maps.LatLng(lat, lng);
        map.setCenter(newCenter);
        map.setZoom(zoomCourt);
    }
}
function initSpot() {
        //地图放大到14后，才改变呈现
    if (map.getZoom() >= zoomChange) {
        ViewSpotHide();
        var selectedids = "";
        $(".search_map_type li.selected").each(function () {
            selectedids += "," + $(this).attr("data-id");
        });
        for (var i = 0; i < viewdata.length; i++) {
            if (viewdata[i].lng > minX && viewdata[i].lng < maxX && viewdata[i].lat < maxY && viewdata[i].lat > minY && selectedids.indexOf(viewdata[i].ViewType) > 0) {
                var idx = viewdata[i].idx;
                var index = $.inArray(idx, ViewSpotIdxArr);

                if (index < 0) {
                    var ViewSpotLatLng = new google.maps.LatLng(viewdata[i].lat, viewdata[i].lng);
                    ViewSpotArr.push(new ViewSpotMarker(ViewSpotLatLng, map, viewdata[i]));
                    ViewSpotIdxArr.push(idx);
                }
            }
        }
        $(".search_map_type li.selected").each(function () {
            ViewSpotShow($(this).attr("data-id"));
        });
    }
}
var map;
var polygonArray = new Array();
var polygonLineArray = new Array();
var overlay;
var maxX, maxY, minX, minY;
var zoomDefault = 12;//起始默认放大级数
var zoomChange = 14; //地图缩放到该级数切换行政区和小区
var zoomCourt = 14; //点击进入到小区，放大到该级数
var shLat = 31.22, shLng = 121.48;//上海市政府经纬度
function initialize() {
    //加载地图
    var myLatLng = new google.maps.LatLng(shLat, shLng);//默认中心点坐标
    var MY_MAPTYPE_ID = 'custom_style';
    var myOptions = {
        zoom: zoomDefault,//放大级数
        center: myLatLng,
        clickableIcons: false,
        zoomControl: true,
        streetViewControl: false,
        scaleControl:true,
        gestureHandling: 'greedy',
        mapTypeControlOptions: {
            stylers: [
              { visibility: 'off' }
            ]
        },
        //mapTypeId: MY_MAPTYPE_ID
        mapTypeId: google.maps.MapTypeId.ROADMAP,    //地图类型
        //stylers: [{ visibility: 'off' }]
    };
    var bermudaTriangle;
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    map.setOptions({
        styles: [
            {
                featureType: 'administrative.land_parcel',
                stylers: [{ visibility: 'off' }]
            },
            {
                featureType: 'administrative.locality',
                stylers: [{ visibility: 'off' }]
            },
            {
                featureType: 'administrative.neighborhood',
                stylers: [{ visibility: 'off' }]
            },

          {
              featureType: 'landscape',
              stylers: [{ visibility: 'off' }]
          },
          {
              featureType: 'poi.attraction',
              stylers: [{ visibility: 'off' }]
          },
          {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }]
          },
          {
              featureType: 'poi.government',
              stylers: [{ visibility: 'off' }]
          },
          {
              featureType: 'poi.medical',
              stylers: [{ visibility: 'off' }]
          },
          {
              featureType: 'poi.place_of_worship',
              stylers: [{ visibility: 'off' }]
          },
          {
              featureType: 'poi.school',
              stylers: [{ visibility: 'off' }]
          },
          {
              featureType: 'poi.sports_complex',
              stylers: [{ visibility: 'off' }]
          },

          //{
          //    featureType: 'transit.line',
          //    stylers: [{ visibility: 'off' }]
          //},
          //{
          //    featureType: 'transit.station',
          //    stylers: [{ visibility: 'off' }]
          //},
          {
              featureType: 'transit.station.bus',
              stylers: [{ visibility: 'off' }]
          }
        ]
    });
    //var featureOpts = [
    //{
    //    featureType: 'poi',
    //    stylers: [
    //      { visibility: 'off' }
    //    ]
    //}
    //];
    //var styledMapOptions = {
    //    name: 'Custom Style'
    //};

    //var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);

    //map.mapTypes.set(MY_MAPTYPE_ID, customMapType);
    

    countyBtnShow();
    getBoundary();

    //当点击自定义区域的时候，也会触发zoom_changed事件
    google.maps.event.addListener(map, 'zoom_changed', function () {
        //console.log("当前放大层数：" + map.zoom);
        var zoomLevel = map.getZoom();
        if (zoomLevel < zoomChange && zoomLevel > 11) {
            courtHide();
            houseHide();
            countyShow();
            ViewSpotHide();
            if (polygonArray.length == 0)
                getBoundary();
            boundaryLineRemove();
        }
        else if (zoomLevel <= 11) {
            countyHide();
        }
        else {
            boundaryRemove();
            countyHide();
            courtShow();
            houseShow();
            initSpot();

            setTimeout(function () {
                getBoundaryLine();
                getMapBounds();
                courtCreate();
                houseCreate();
                ViewSpotCreate();
            }, 200);
        }
    }); 
    google.maps.event.addListener(map, 'dragend', function () {
        var zoomLevel = map.getZoom();
        if (zoomLevel >= zoomChange) {
            getMapBounds();
            courtCreate();
            houseCreate();
            initSpot();
        }
    });
    google.maps.event.addListener(map, 'mousemove', function (e) {
        if (isMove) {
            moveMarker.setPosition(e.latLng);
        }
        if (isLog)
            console.log(e.latLng.lat() + "," + e.latLng.lng());

    });
    google.maps.event.addListener(map, 'click', function (e) {
        if (isMove) {
            isMove = false;
            moveMarker = null;
        }
        isLog = !isLog;
    });

    var homeControlDiv = document.createElement('div');
    var homeControl = new HomeControl(homeControlDiv, map);
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(homeControlDiv);

    var compoundControlDiv = document.createElement('div');
    var compoundControl = new CompoundControl(compoundControlDiv, map);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(compoundControlDiv);
}

//是否输出当前位置
var isLog = true;
var isMove = false;
var moveMarker = null;
//自定义位置控件
function HomeControl(controlDiv, map) {
    controlDiv.style.zIndex = 1;
    controlDiv.style.paddingRight = "10px";

    var controlUI = document.createElement('div'); //控件容器  
    controlUI.style.backgroundColor = 'white';
    controlUI.style.cursor = 'pointer';
    controlUI.style.textAlign = 'left';
    controlUI.style.borderRadius = "2px";
    controlDiv.appendChild(controlUI);

    var controlText = document.createElement('div'); //控件容器内容  
    controlText.className = 'customer_mark';
    controlUI.appendChild(controlText);

    google.maps.event.addDomListener(controlUI, 'click', function (e) {//绑定该控件Click单击事件  
        
        isMove = true;
        if (moveMarker == null) {
            //var _latLng = new google.maps.LatLng(shLat, shLng);//默认中心点坐标
            var _latLng = new google.maps.LatLng(0,0);
            moveMarker = new positionMarker(_latLng, map);
            //positionMarskArr.push(moveMarker);
        }
    });
}

//是否现代小区预览
var isModern = false;
//自定义现代小区控件
function CompoundControl(controlDiv, map) {
    controlDiv.style.zIndex = 1;
    controlDiv.style.paddingRight = "14px";

    var controlUI = document.createElement('div'); //控件容器  
    controlUI.style.backgroundColor = 'white';
    controlUI.style.cursor = 'pointer';
    controlUI.style.textAlign = 'left';
    controlUI.style.borderRadius = "2px";
    controlDiv.appendChild(controlUI);

    var controlText = document.createElement('div'); //控件容器内容  
    controlText.id = "divModernControl";
    controlText.className = 'modern_mark';
    controlText.title = (langid == "en" ? "Modern Compoud Review" : "现代小区预览");
    controlUI.appendChild(controlText);

    google.maps.event.addDomListener(controlUI, 'click', function (e) {//绑定该控件Click单击事件  
        if (!isModern) {
            $("#divNav1").hide();
            $("#divNav2").show();

            $("#divOrder").hide();
            $("#divOrder2").show();

        }
        else {
            $("#divNav1").show();
            $("#divNav2").hide();

            $("#divOrder").show();
            $("#divOrder2").hide();
        }

        isModern = !isModern;
        initMap(true);
    });
}

//获得地图的当前面积，右上角和左下角的坐标
function getMapBounds() {
    var mapLatLngBounds = map.getBounds();
    maxX = mapLatLngBounds.getNorthEast().lng();
    maxY = mapLatLngBounds.getNorthEast().lat();
    minX = mapLatLngBounds.getSouthWest().lng();
    minY = mapLatLngBounds.getSouthWest().lat();
}

//根据行政区域的点集合绘制多边形区域
function getBoundary() {
    for (var i in countyArr) {
        var triangleCoords = [];
        for (var j in countyArr[i].AreaVal) {
            var lat = parseFloat(countyArr[i].AreaVal[j].lat);//经度
            var lng = parseFloat(countyArr[i].AreaVal[j].lng);//纬度
            //加入经纬度
            triangleCoords.push(new google.maps.LatLng(lng, lat));
        }
        bermudaTriangle = new google.maps.Polygon({
            paths: triangleCoords,
            strokeWeight: 0,
            fillColor: countyArr[i].AreaColor,
            fillOpacity: 0.6
        });
        bermudaTriangle.setMap(map);
        polygonArray.push(bermudaTriangle);
    }
}
function getBoundaryLine() {
    if (polygonLineArray.length == 0) {
        var location = getLocation();
        if (location != "0") {
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
                triangleCoords.push(new google.maps.LatLng(lng, lat));
            }
            bermudaTriangle = new google.maps.Polyline({
                path: triangleCoords,
                strokeColor: "#ff0000",
                strokeOpacity: 0.8,
                strokeWeight: 5
            });
            bermudaTriangle.setMap(map);
            polygonLineArray.push(bermudaTriangle);
        }
    }
}
function boundaryRemove() {
    if (polygonArray) {
        for (i in polygonArray) {
            polygonArray[i].setMap(null);
        }
        polygonArray.length = 0;
    }
}
function boundaryLineRemove() {
    if (polygonLineArray) {
        for (i in polygonLineArray) {
            polygonLineArray[i].setMap(null);
        }
        polygonLineArray.length = 0;
    }
}
function getLocation() {
    var locationid;
    if (isModern) {
        locationid = langid == "en" ? $("#sellocation2").val() : $("#sellocationzh2").val();
    }
    else {
        locationid = langid == "en" ? $("#sellocation").val() : $("#sellocationzh").val();
    }
    return locationid;
}
//绘制行政区域标示
var countyArr = new Array();
//行政区div列表
var countyDivArr = new Array();
//点击过的行政区div列表
//var countyClickDiv = new Array();
var countyZindex = 2;

//查看区域
var courtArr = new Array();
var courtlatlng = new Array();

//小区div列表
var courtDivArr = new Array();
//点击过的小区div列表
//var courtClickDiv = new Array();
var zIndex = 2;

function countyBtnShow() {
    for (var i = 0; i < countydata.length; i++) {
        //decodeURIComponent( countydata[i].name )+ '<br />'
        var info = "<font class='en' " + (langid == "en" ? "style='display:inline;'" : "") + ">" + decodeURIComponent(countydata[i].name)
            + "</font><font class='zh' " + (langid == "zh" ? "style='display:inline;'" : "") + ">" + decodeURIComponent(countydata[i].namezh) + "</font>"
        ;
        //console.log(countydata[i].namezh + ":" + countydata[i].num);
        var countyLatLng = new google.maps.LatLng(countydata[i].lat, countydata[i].lng);
        var name = countydata[i].name;
        var areaid = countydata[i].areaid;
        countyArr[i] = new CustomMarker(countyLatLng, map, info, name, areaid, countydata[i].AreaVal, countydata[i].AreaColor);
    }
}

//------------------行政区域 Begin--------------------
//自定义行政区域图标
function CustomMarker(latlng, map, content, name, areaid, AreaVal, AreaColor) {
    this.latlng_ = latlng;
    this.content = content;
    this.name = name;
    this.setMap(map);
    this.areaid = areaid;
    this.AreaVal = AreaVal;
    this.AreaColor = AreaColor;
}

CustomMarker.prototype = new google.maps.OverlayView();
CustomMarker.prototype.draw = function () {
    var me = this;
    var div = this.div_;
    if (!div) {
        div = this.div_ = document.createElement('DIV');
        div.className = "county_btn" ;
        div.innerHTML = this.content;
        countyDivArr.push(div);

        google.maps.event.addDomListener(div, "mouseover", function (event) {
            countyZindex++;
            className = div.className;
            div.style.zIndex = countyZindex;
            div.className = "county_btn_hover";
            
        });
        google.maps.event.addDomListener(div, "mouseout", function (event) {
            div.style.zIndex = 1;
            div.className = className;
        });
        google.maps.event.addDomListener(div, "click", function (event) {
            //右边显示对应的小区列表，地图定位到点击区域设定的坐标
            if (isModern) {
                $("#sellocation2,#sellocationzh2").val(me.areaid);
                initMapData2();
            }
            else {
                $("#sellocation,#sellocationzh").val(me.areaid);
                initMapData();
            }
            clear();
            getCourt(me.name, me.areaid);
            div.className = "county_btn_click";
            className = "county_btn_click";
        });
        var panes = this.getPanes();
        panes.overlayImage.appendChild(div);
    }

    var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (point) {
        div.style.left = point.x + 'px';
        div.style.top = point.y + 'px';
    }
};

CustomMarker.prototype.remove = function () {
    // Check if the overlay was on the map and needs to be removed.
    if (this.div_) {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    }
};

CustomMarker.prototype.getPosition = function () {
    return this.latlng_;
};

//隐藏一级图标数据  
function countyHide() {
    for (var i = 0; i < countyDivArr.length; i++) {
        countyDivArr[i].style.display = "none";
    }
}
//显示一级图标数据  
function countyShow() {
    for (var i = 0; i < countyDivArr.length; i++) {
        countyDivArr[i].style.display = "block";
    }
}
//------------------行政区域 End--------------------

//------------------小区（包含小区预览） Begin--------------------
function getCourt(name, areaid) {

    getCourtList(areaid);
    var lat, lng;
    for (var i = 0; i < countydata.length; i++) {
        if (countydata[i].name == name) {
            lng = countydata[i].lng;
            lat = countydata[i].lat;
        }
    }
    var newCenter = new google.maps.LatLng(lat, lng);
    map.setCenter(newCenter);
    map.setZoom(zoomCourt);

    countyHide();
    boundaryRemove();
}

//根据地图的当前区域，查找符合条件的房源，显示上去
//参数regionIdx：右边列表鼠标移动上去，在地图上着重显示该小区
function courtCreate(regionIdx) {
    var currentIndex = -1;

    for (var i = 0; i < courtdata.length; i++) {
        if (courtdata[i].lng > minX && courtdata[i].lng < maxX && courtdata[i].lat < maxY && courtdata[i].lat > minY)
        {
            var latlng = courtdata[i].lat + "," + courtdata[i].lng;
            var index = $.inArray(latlng, courtlatlng);
            
            if (index < 0) {
                //var info = '<i class="house_map house_map' + courtdata[i].houseType + '" ></i><span>'
                //    + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>' + decodeURIComponent(decodeURIComponent(courtdata[i].namezh)) + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>' + decodeURIComponent(decodeURIComponent(courtdata[i].name)) + '</font>'
                //        + '&nbsp;' + courtdata[i].price + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>元</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>RMB</font> <a target="_blank" href="/house/SubRegion.aspx?SubRegionID=' + courtdata[i].SubRegionID
                //        + '"><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>查看详情</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>View Detail</font></a></span>';
                var info = '';
                if (!isModern) {
                    info += '<i class="house_map house_map' + courtdata[i].houseType + '" ></i><span>';
                    info += '<a href="/house/SubRegion.aspx?SubRegionID=' + courtdata[i].SubRegionID + '" target="_blank"/><img src="' + courtdata[i].PicUrl + '" /></a><ul>';
                    info += '<li class="rows2"><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>' + decodeURIComponent(decodeURIComponent(courtdata[i].namezh)) + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>' + decodeURIComponent(decodeURIComponent(courtdata[i].name)) + '</font></li>';
                    info += '<li class="rows2"><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>' + courtdata[i].num + '套房源</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>' + courtdata[i].num + ' Units</font></li>';
                    info += '</ul></span>';
                }
                else {
                    info += '<i class="house_map_region2 house_map_region" ></i><span>';
                    info += '<a href="/house/SubRegion.aspx?SubRegionID=' + courtdata[i].SubRegionID + '" target="_blank"/><img src="' + courtdata[i].PicUrl + '" /></a><ul>';
                    info += '<li ><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>' + decodeURIComponent(decodeURIComponent(courtdata[i].namezh)) + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>' + decodeURIComponent(decodeURIComponent(courtdata[i].name)) + '</font></li>';
                    info += '<li ><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>' + courtdata[i].num + '套房源</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>' + courtdata[i].num + ' Units</font></li>';
                    info += '<li ><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>RMB' + toThousands(courtdata[i].price) + '/平米/月</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>RMB ' + toThousands(courtdata[i].price) + '/sqm/mo</font></li>';
                    info += '</ul></span>';
                }
                var courtLatLng = new google.maps.LatLng(courtdata[i].lat, courtdata[i].lng);
                courtArr.push(new courtMarker(courtLatLng, map, info, courtdata[i].SubRegionID, courtdata[i].areaid,regionIdx));
                courtlatlng.push(latlng);
            }
            else {
                if (regionIdx == courtdata[i].SubRegionID) {
                    currentIndex = index;
                }
            }
        }
    }

    if (currentIndex > -1) {
            currentCourtDiv = courtArr[currentIndex].div_;
            currentCourtDiv.className = "court_btn_hover";
            currentCourtZ = currentCourtDiv.zIndex;
            currentCourtDiv.style.zIndex = 9999;
    }
}

//自定义小区图标
//currentIdx-当前选中的div，需要设置hover
function courtMarker(latlng, map, content, SubRegionID, areaid,currentIdx) {
    this.latlng_ = latlng;
    this.content = content;
    this.SubRegionID = SubRegionID;
    this.setMap(map);
    this.className;
    this.areaid = areaid;
    this.currentIdx = currentIdx;
}

courtMarker.prototype = new google.maps.OverlayView();
courtMarker.prototype.draw = function () {
    var me = this;
    var div = this.div_;
    if (!div) {
        div = this.div_ = document.createElement('DIV');
        if (this.currentIdx == this.SubRegionID) {
            div.className = "court_btn_hover";
            currentCourtDiv = div;
            currentCourtZ = div.style.zIndex;
            div.style.zIndex = 9999;
        }
        else {
            div.className = "court_btn";
        }
        div.innerHTML = this.content;
        courtDivArr.push(div);

        google.maps.event.addDomListener(div, "mouseover", function (event) {
            zIndex++;
            className = div.className;
            div.style.zIndex = zIndex;
            $(".court_btn_hover").attr("z-index", zIndex);
            div.className = "court_btn_hover";
        });
        google.maps.event.addDomListener(div, "mouseout", function (event) {
            if (className == "court_btn") {
                div.style.zIndex = 1;
            }
            div.className = className;
        });
        google.maps.event.addDomListener(div, "click", function (event) {
            getCourtInfo(me.areaid, me.SubRegionID);
            //courtClickDiv.push(div);
            div.className = "court_btn_click";
            className = "court_btn_click";
        });

        var panes = this.getPanes();
        panes.overlayImage.appendChild(div);
    }

    var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (point) {
        div.style.left = point.x -16 + 'px';
        div.style.top = point.y - 28 + 'px';
    }
};

courtMarker.prototype.remove = function () {
    // Check if the overlay was on the map and needs to be removed.
    if (this.div_) {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    }
};

courtMarker.prototype.getPosition = function () {
    return this.latlng_;
};

//隐藏二级图标数据  
function courtHide() {
    for (var i = 0; i < courtDivArr.length; i++) {
        courtDivArr[i].style.display = "none";
    }
}
//显示二级图标数据  
function courtShow() {
    for (var i = 0; i < courtDivArr.length; i++) {
        courtDivArr[i].style.display = "block";
    }
}
//------------------小区 End--------------------

//------------------House Begin--------------------
//自定义house图标
//参数houseIdx：右边列表鼠标移动上去，在地图上着重显示该房子
function houseCreate(houseIdx) {
    var currentIndex = -1;
    for (var i = 0; i < housedata.length; i++) {
        if (housedata[i].lng > minX && housedata[i].lng < maxX && housedata[i].lat < maxY && housedata[i].lat > minY)
        {
            var idx = housedata[i].idx;
            var index = $.inArray(idx, houseIdxArr);
            
            if (index < 0) {
                var courtLatLng = new google.maps.LatLng(housedata[i].lat, housedata[i].lng);
                houseArr.push(new houseMarker(courtLatLng, map, housedata[i], houseIdx));
                houseIdxArr.push(idx);
            }
            else {
                if (houseIdx == idx) {
                    currentIndex = index;
                }

            }
        }
    }
    if (currentIndex > -1) {
            currentHouseDiv = houseArr[currentIndex].div_;
            currentHouseDiv.className = "house_btn_hover";
            currentHouseZ = currentHouseDiv.zIndex;
            currentHouseDiv.style.zIndex = 9999;
    }
}
var houseArr = new Array();
var houseDivArr = new Array();
var houseIdxArr = new Array();
var zhouseIndex = 2;

function houseMarker(latlng, map, house, currentIdx) {
    this.latlng_ = latlng;
    this.className;
    this.house = house;
    this.setMap(map);
    this.currentIdx = currentIdx;
}

houseMarker.prototype = new google.maps.OverlayView();
houseMarker.prototype.draw = function () {
    var me = this;
    var div = this.div_;
    if (!div) {
        div = this.div_ = document.createElement('DIV');
        if (this.currentIdx == this.house.idx) {
            div.className = "house_btn_hover";
            currentHouseDiv = div;
            currentHouseZ = div.style.zIndex;
            div.style.zIndex = 9999;
        }
        else {
            div.className = "house_btn";
        }
        var url = "";
        switch (this.house.houseType) {
            case "2":
                url = "/house/RenovatedOldApartment.aspx?HouseID=" + this.house.idx;
                break;
            case "4":
                url = "/house/Lanehouse.aspx?HouseID=" + this.house.idx;
                break;
            case "5":
                url = "/house/Gardenhouse.aspx?HouseID=" + this.house.idx;
                break;
            case "6":
                url = "/house/CreativeOffice.aspx?HouseID=" + this.house.idx;
                break;
        }
        //var info = '<i class="house_map house_map' + this.house.houseType + '" ></i><span><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>' + this.house.namezh + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>' + this.house.name + '</font>&nbsp;' + this.house.price
        //    + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>元</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>RMB</font> <a target="_blank" href="' + url + '"><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>查看详情</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>View Detail</font></a></span>';
        var info = '<i class="house_map house_map' + this.house.houseType + '" ></i><span>';
        info += '<a href="' + url + '" target="_blank"/><img src="' + this.house.PicUrl + '" /></a><ul>';
        if (this.house.houseType == "2" || this.house.houseType == "4" || this.house.houseType == "5") {
            info += '<li><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>RMB ' + toThousands(this.house.price) + '/月</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>RMB ' + toThousands(this.house.price) + '/mo</font></li>';
            info += '<li>' + this.house.BedroomNum + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>卧</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '> bd</font> ' + this.house.BathroomNum + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>卫</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '> ba</font></li>';
            info += '<li>' + this.house.HouseSize + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>平方米</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '> sqm</font></li>';
        } else {
            info += '<li class="rows2"><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + ">" + this.house.HouseNameCH + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + ">" + this.house.HouseName + '</font></li>';
            info += '<li class="rows2">RMB ' + toThousands(this.house.price) + '<font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + '>+/月</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + '>+/mo</font></li>';
        }
        info += '</ul></span>';
        div.innerHTML = info;
        houseDivArr.push(div);

        google.maps.event.addDomListener(div, "mouseover", function (event) {
            zhouseIndex++;
            className = div.className;
            div.style.zIndex = zhouseIndex;
            $(".house_btn_hover").attr("z-index", zhouseIndex);
            div.className = "house_btn_hover";
        });
        google.maps.event.addDomListener(div, "mouseout", function (event) {
            if (className == "house_btn") {
                div.style.zhouseIndex = 1;
            }
            div.className = className;
        });
        google.maps.event.addDomListener(div, "click", function (event) {
            getHouseInfo(me.house.idx);
            div.className = "house_btn_click";
            className = "house_btn_click";
        });

        var panes = this.getPanes();
        panes.overlayImage.appendChild(div);
    }

    var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (point) {
        div.style.left = point.x -18 + 'px';
        div.style.top = point.y -26 + 'px';
    }
};

houseMarker.prototype.remove = function () {
    // Check if the overlay was on the map and needs to be removed.
    if (this.div_) {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    }
};

houseMarker.prototype.getPosition = function () {
    return this.latlng_;
};

//隐藏二级图标数据  
function houseHide() {
    for (var i = 0; i < houseDivArr.length; i++) {
        houseDivArr[i].style.display = "none";
    }
}
//显示二级图标数据  
function houseShow() {
    for (var i = 0; i < houseDivArr.length; i++) {
        houseDivArr[i].style.display = "block";
    }
}
//------------------House End--------------------

//------------------景点 Begin--------------------
function ViewSpotCreate() {
    var currentIndex = 0;
    var selectedids = "";
    $(".search_map_type li.selected").each(function () {
        selectedids += "," + $(this).attr("data-id");
    });
    for (var i = 0; i < viewdata.length; i++) {
        if (viewdata[i].lng > minX && viewdata[i].lng < maxX && viewdata[i].lat < maxY && viewdata[i].lat > minY && selectedids.indexOf(viewdata[i].idx) > 0) {
            var idx = viewdata[i].idx;
            var index = $.inArray(idx, ViewSpotIdxArr);

            if (index < 0) {
                var ViewSpotLatLng = new google.maps.LatLng(viewdata[i].lat, viewdata[i].lng);
                ViewSpotArr.push(new ViewSpotMarker(ViewSpotLatLng, map, viewdata[i]));
                ViewSpotIdxArr.push(idx);
            }
        }
    }
}
var ViewSpotArr = new Array();
var ViewSpotDivArr = new Array();
var ViewSpotIdxArr = new Array();
var zViewSpoteIndex = 3;
//自定义景点图标
function ViewSpotMarker(latlng, map, spot) {
    this.latlng_ = latlng;
    this.className;
    this.spot = spot;
    this.setMap(map);
}

ViewSpotMarker.prototype = new google.maps.OverlayView();
ViewSpotMarker.prototype.draw = function () {
    var me = this;
    var div = this.div_;
    if (!div) {
        div = this.div_ = document.createElement('DIV');
        div.className = "spot_btn";
        var info = '<i class="spot_map spot_map' + this.spot.ViewType + '" ></i><span>';
        info += '<a ><img src="' + this.spot.PicUrl + '" /></a><ul>';
        info += '<li class="rows2"><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + ">" + this.spot.TypeNameCH + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + ">" + this.spot.TypeName + '</font></li>';
        info += '<li class="rows2"><font class="zh" ' + (langid == 'zh' ? 'style="display:inline;"' : '') + ">" + this.spot.namezh + '</font><font class="en" ' + (langid == 'en' ? 'style="display:inline;"' : '') + ">" + this.spot.name + '</font></li>';
        info += "</ul></span>";
        div.innerHTML = info;
        var objSpot = new Object();
        objSpot.type = this.spot.ViewType;
        objSpot.div = div;
        ViewSpotDivArr.push(objSpot);

        google.maps.event.addDomListener(div, "mouseover", function (event) {
            zhouseIndex++;
            className = div.className;
            div.style.zIndex = zhouseIndex;
            $(".spot_btn_hover").attr("z-index", zhouseIndex);
            div.className = "spot_btn_hover";
        });
        google.maps.event.addDomListener(div, "mouseout", function (event) {
            if (className == "spot_btn") {
                div.style.zhouseIndex = 1;
            }
            div.className = className;
        });

        var panes = this.getPanes();
        panes.overlayImage.appendChild(div);
    }

    var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (point) {
        div.style.left = point.x - 18 + 'px';
        div.style.top = point.y - 26 + 'px';
    }
};

ViewSpotMarker.prototype.remove = function () {
    // Check if the overlay was on the map and needs to be removed.
    if (this.div_) {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    }
};

ViewSpotMarker.prototype.getPosition = function () {
    return this.latlng_;
};

//隐藏二级图标数据  
function ViewSpotHide() {
    for (var i = 0; i < ViewSpotDivArr.length; i++) {
        ViewSpotDivArr[i].div.style.display = "none";
    }
}
//显示二级图标数据  
function ViewSpotShow(type) {
    for (var i = 0; i < ViewSpotDivArr.length; i++) {
        if(typeof(type) == "undefined" || type == null)
            ViewSpotDivArr[i].div.style.display = "block";
        else {
            if (ViewSpotDivArr[i].type == type) {
                ViewSpotDivArr[i].div.style.display = "block";
            }
        }
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

    //console.log(courtId)
    lrid = areaid;
    srid = subid;
    if(!isModern)
        getinfo(1, langid);
    // $("#house_info").html(courtId);
}

function getHouseInfo(houseid) {
    getdetail(houseid, langid);
}

var currentCourtDiv;
var currentHouseDiv;
var currentCourtZ;
var currentHouseZ;

function listMouseOver(houseType, houseIdx) {
    var zoomLevel = map.getZoom();
    if (zoomLevel >= zoomChange) {

        if (houseType == "region") {
            for (var i = 0; i < courtdata.length; i++) {
                if (courtdata[i].SubRegionID == houseIdx) {
                    var courtLatLng = new google.maps.LatLng(courtdata[i].lat, courtdata[i].lng);
                    map.setCenter(courtLatLng);

                    getMapBounds();
                    courtCreate(houseIdx);
                    houseCreate();
                }
            }
        }
        else if (houseType == "house") {
            for (var i = 0; i < housedata.length; i++) {
                if (housedata[i].idx == houseIdx) {
                    var houseLatLng = new google.maps.LatLng(housedata[i].lat, housedata[i].lng);
                    map.setCenter(houseLatLng);

                    getMapBounds();
                    courtCreate();
                    houseCreate(houseIdx);
                }
            }
        }
    }
}
function listMouseOut() {
        if (currentCourtDiv) {
            currentCourtDiv.className = "court_btn";
            currentCourtDiv.style.zIndex = currentCourtZ;
        }
        if (currentHouseDiv) {
            currentHouseDiv.className = "house_btn";
            currentHouseDiv.style.zIndex = currentHouseZ;
        }
}

function clear() {
    //countyDivArr.length = 0;
    //countyClickDiv.length = 0;
    courtlatlng.length = 0;
    courtDivArr.length = 0;
    //courtClickDiv.length = 0;
    houseDivArr.length = 0;
    houseIdxArr.length = 0;

    countyHide();
    if (courtArr) {
        for (i in courtArr) {
            courtArr[i].setMap(null);
        }
    }
    if (houseArr) {
        for (i in houseArr) {
            houseArr[i].setMap(null);
        }
    }
    courtArr.length = 0;
    houseArr.length = 0;

    positionMarskArr.length = 0;

    boundaryRemove();
    boundaryLineRemove();
}

//------------------自定义位置 Begin--------------------
function positionMarker(latlng, map) {
    this.latlng_ = latlng;
    this.setMap(map);
}

positionMarker.prototype = new google.maps.OverlayView();
positionMarker.prototype.draw = function () {
    var me = this;
    var div = this.div_;
    if (!div) {
        div = this.div_ = document.createElement('DIV');
        div.className = "position_mark";
        div.style.zIndex = 9999;
        
        var info = "<img src='/images/position.png' class='customer_point'/><br/><span class='customer_input'><input class='zh' " + (langid == "zh" ? "style='display:inline;'" : "") + " type='text' placeholder='我的标记'/><input class='en' " + (langid == "en" ? "style='display:inline;'" : "") + " type='text' placeholder='my point'/></span><a class='customer_btn'><img onclick='clearCustomer(" + positionMarskArr.length + ");' src='images/delete.png'/></a>";
        div.innerHTML = info;
        positionMarskArr.push(div);

        google.maps.event.addDomListener(div, "mouseover", function (event) {
                div.className = "position_mark_hover";
        });
        google.maps.event.addDomListener(div, "mouseout", function (event) {
            div.className = "position_mark";
        });
        
        var panes = this.getPanes();
        panes.overlayImage.appendChild(div);
    }

    var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (point) {
        div.style.left = point.x - 35 + 'px';
        div.style.top = point.y - 28 + 'px';
    }
};

positionMarker.prototype.remove = function () {
    // Check if the overlay was on the map and needs to be removed.
    if (this.div_) {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    }
};

positionMarker.prototype.getPosition = function () {
    return this.latlng_;
};

positionMarker.prototype.setPosition = function (latlng) {
    //这段话必须有，因为在地图拖动或缩放的时候，点会重绘
    this.latlng_ = latlng;
    var point = this.getProjection().fromLatLngToDivPixel(latlng);
    if (point) {
        //console.log(latlng.lat() + "," + latlng.lng());
        this.div_.style.left = point.x - 35 + 'px';
        this.div_.style.top = point.y - 28 + 'px';
    }
}

function clearCustomer(index) {
    positionMarskArr[index].style.display = "none";
}
var positionMarskArr = new Array();
//------------------自定义位置 End--------------------

function ChangeLanguage() {
    var title = (langid == "en" ? "Modern Compoud Review" : "现代小区预览");
    $("#divModernControl").attr("title", title);
    $("#txtSpotKey").attr("placeholder", $("#txtSpotKey").attr("placeholder" + langid));

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