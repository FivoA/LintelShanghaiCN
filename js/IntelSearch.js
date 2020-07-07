; (function (w, $) {
    $.fn.intellSearch = function (options) {
        var jthis = this;
        var _dftOpts = {
            url: "",//请求地址或数组          
            property:  "",//要显示的json对象的属性
            itemNumber: 5,//显示的条数
            isEmptyRequest: false,//focus空白是否发起请求
            defaultValue: "",//默认值
            width: 0,//列表宽度
            aligner: jthis,//要对齐的元素
            maxHeight: -1,//最大高度          
            ajax: {
                timeout: 3000,//超时时间
                cache: true//是否缓存
            },
            event: {
                /*参数说明:parameter:{jthis:"jq input",jItem:"jq item",data:"json result",event:"event"}*/
                setData: null,//设置参数
                itemClick: null,//点击项触发
                enterKeydown: null,//按下enter键触发
                beforeRender: null,//所有项呈现前触发
                endRender: null,//所有项呈现后触发
                itemBeforeRender: null,//项呈现前触发
                itemAfterRender: null,//项呈现后触发
                beforeSend: null//发送请求前触发
            }
        };
        $.extend(_dftOpts, options);
        if (!_dftOpts.url) {
            throw Error("url不能为空！");
        }
        var jResult;
        var _value = "";
        var _ajax = _dftOpts.ajax;
        var _event = _dftOpts.event;
        var _cache = [];
        var _focusCount = 0;//防止focus触发多次(sogou)

        /*on window*/
        window.intellObj = window.intellObj || {}; /*for global event*/
        window.intellDocumentClick = window.intellDocumentClick || function (e) {
            if (!window.intellObj.jthis) {
                return;
            }
            if (e.target !== window.intellObj.jthis[0]) {
                setIntellObj(null);
            }
        }
        window.intellDocumentKeydown = window.intellDocumentKeydown || function (e) {
            var jthis = window.intellObj.jthis;
            if (!jthis) {
                return;
            }
            var code = e.keyCode;
            var value = window.intellObj.value;
            var jResult, jCurItem, keyword;
            if (code === 13 || code === 38 || code === 40) {
                jResult = window.intellObj.jResult;
                jItems = jResult.find("li");
                jCurItem = jResult.find("li.cur");
                if (code === 13) {
                    if (jCurItem.length > 0) {
                        jCurItem.click();
                    } else {
                        setIntellObj(null);
                        if (_event.enterKeydown) {
                            _event.enterKeydown({ "jthis": jthis, "event": e });
                        }
                    }
                    jthis.blur();
                } else if (jItems.length > 0) {
                    if (code === 38) {
                        if (jCurItem.length <= 0) {
                            jCurItem = jItems.last();
                            jCurItem.addClass("cur");
                            keyword = jCurItem.text();
                        } else {
                            var index = jCurItem.index();
                            jCurItem.removeClass("cur");
                            if (index <= 0) {
                                keyword = value;
                            } else {
                                jCurItem = jItems.eq(index - 1);
                                jCurItem.addClass("cur");
                                keyword = jCurItem.text();
                            }
                        }
                        jthis.val(keyword);
                    } else {
                        if (jCurItem.length <= 0) {
                            jCurItem = jItems.first();
                            jCurItem.addClass("cur");
                            keyword = jCurItem.text();
                        } else {
                            var index = jCurItem.index();
                            jCurItem.removeClass("cur");
                            if (index + 1 >= jItems.length) {
                                keyword = value;
                            } else {
                                jCurItem = jItems.eq(index + 1);
                                jCurItem.addClass("cur");
                                keyword = jCurItem.text();
                            }
                        }
                        jthis.val(keyword);
                    }
                }
            }
        }
        /*event handler*/
        $.fn.unintell = function () {
            remove();
        }
        $(document).unbind({ click: window.intellDocumentClick, keydown: window.intellDocumentKeydown })
              .bind({ click: window.intellDocumentClick, keydown: window.intellDocumentKeydown });
        jthis.focus(function () {
            _focusCount++;
            if (_focusCount > 1) {
                return;
            }
            if (window.intellObj.jthis && jthis !== window.intellObj.jthis) {
                setIntellObj(null);
            }
            var keyword = attrValue();
            if (keyword === _dftOpts.defaultValue) {
                keyword = "";
                attrValue(keyword);
            }
            if (keyword || _dftOpts.isEmptyRequest) {
                sendRequest();
            }
        })
        jthis.blur(function () {
            _focusCount = 0;
            if (!attrValue()) {
                attrValue(_dftOpts.defaultValue);
            }
        })
        jthis.keyup(function (e) {
            if (e.keyCode === 38 || e.keyCode === 40) {
                return;
            }
            var keyword = attrValue();
            if (!keyword) {
                remove();
                window.intellObj.value = _value = "";
                return;
            }
            if (keyword !== _value) {
                window.intellObj.value = _value = keyword;
                sendRequest();
            }
        });

        return initBox();

        /*function*/
        function initBox() {
            attrValue(_dftOpts.defaultValue);
            return jthis;
        }
        function initIntell() {
            generate();
            register();
            setIntellObj({ jthis: jthis, jResult: jResult });
        }
        function generate() {
            var offset = _dftOpts.aligner.offset();
            var width = _dftOpts.width ? _dftOpts.width : _dftOpts.aligner.width();
            jResult = $("<ul>", { "class": "intellResult" });
            jResult.width(width).css({ "position": "absolute", "left": offset.left, "top": offset.top + jthis.outerHeight() });
            $("body").append(jResult);
            if (_dftOpts.maxHeight > 0) {
                jResult.height(_dftOpts.maxHeight).css("overflowY", "scroll");
            }
        }
        function remove() {
            if (jResult) {
                jResult.remove();
                jResult = null;
            }
        }
        function register() {
            jResult.on("click", "li", function () {
                var jItem = $(this);
                var index = jItem.index();
                var keyword = jItem.text();
                var isReturn = false;
                if (_event.itemClick) {
                    isReturn =  _event.itemClick({ "jthis": jthis, "jItem": jItem, "item": _cache[index] });
                }
                if (!isReturn) {
                    attrValue(keyword);
                    _value = keyword;
                }
                else {
                    attrValue("");
                }
            }).on("mouseenter", "li", function () {
                $(this).siblings("li").removeClass("cur").end().addClass("cur");
            }).on("mouseleave", "li", function () {
                $(this).removeClass("cur");
            });
        }
        function setIntellObj(obj) {
            if (!obj) {
                if (window.intellObj.jResult) {
                    window.intellObj.jResult.remove();
                }
                window.intellObj.jthis = null;
                window.intellObj.jResult = null;
            } else {
                window.intellObj.jthis = obj.jthis;
                window.intellObj.jResult = obj.jResult;
            }
        }
        function sendRequest() {
            var data;
            if (_event.setData) {
                data = _event.setData({ "jthis": jthis });
            }
            $.ajax({
                url: _dftOpts.url,
                data: data,
                type : "Post",
                cache: _ajax.cache,
                timeout: _ajax.timeout,
                dataType: "json",
                beforeSend: function (xhr) {
                    if (_event.beforeSend) {
                        _event.beforeSend(xhr);
                    }
                },
                success: function (data) {
                    remove();
                    showData(data);
                },
                error: function (data) {
                    console.log(data);
                }
            });
        }
        function showData(data) {
            //data = $.trim(data) ? $.parseJSON(data) : data;
            if (_event.beforeRender) {
                var rs = _event.beforeRender({ "jthis": jthis, "data": data });
                if (rs === false) {
                    return;
                }
                if (rs !== undefined) {
                    data = rs;
                }
            }
            if (!data) {
                return;
            }
            var jItem, jA, jSpan, hasProp, item, text, otherTexts, isRender, index;
            var list = $.isArray(data) ? data : [data];
            var length = list.length;
            length = length > _dftOpts.itemNumber ? _dftOpts.itemNumber : list.length;
            if (length <= 0) {
                return;
            }
            initIntell();
            _cache.length = 0;
            hasProp = list[0][_dftOpts.property];
            for (var i = 0; i < length; i++) {
                item = list[i];
                if (item === null || item === undefined) {
                    continue;
                }
                text = hasProp ? item[_dftOpts.property] : item;
                text = $.trim(text.toString());
                if (text === "") {
                    continue;
                }
                jItem = $("<li>", { "class": "intellResult_item" });
                jA = $("<a>", { "title": text }).appendTo(jItem);
                jSpan = $("<span>").appendTo(jA);
                index = text.toLowerCase().indexOf(_value.toLowerCase());
                otherTexts = splitText(text, _value, index);
                if (otherTexts) {
                    jSpan.text(text.substr(index, _value.length));
                    if (otherTexts.length > 1) {
                        $("<b>", { "text": otherTexts[0] }).insertBefore(jSpan);
                        $("<b>", { "text": otherTexts[1] }).insertAfter(jSpan);
                    } else {
                        if (index === 0) {
                            $("<b>", { "text": otherTexts[0] }).insertAfter(jSpan);
                        } else {
                            $("<b>", { "text": otherTexts[0] }).insertBefore(jSpan);
                        }
                    }
                } else {
                    jSpan.text(text);
                }
                isRender = true;
                if (_event.itemBeforeRender) {
                    isRender = _event.itemBeforeRender({ "jthis": jthis, "jItem": jItem, "item": item });
                }
                if (isRender !== false) {
                    jResult.append(jItem);
                    if (_event.itemAfterRender) {
                        _event.itemAfterRender({ "jthis": jthis, "jItem": jItem, "item": item });
                    }
                }
                _cache.push(item);
            }
            if (_event.endRender) {
                _event.endRender({ "jthis": jthis });
            }
            jResult.show();
        }
        function attrValue(value) {
            if (!value && value != "") {
                return $.trim(jthis.val());
            }
            jthis.val(value);
        }
        function splitText(text, value, index) {
            var tlength = text.length;
            var vlength = value.length;
            if (index === -1) {
                return null;
            }
            if (index === 0) {
                if (index + vlength >= tlength) {
                    return null;
                }
                return [text.substr(index + vlength)];
            }
            if (index + vlength >= tlength) {
                return [text.substr(0, index)];
            }
            return [text.substr(0, index), text.substr(index + vlength)];
        }
    }
})(window, jQuery);