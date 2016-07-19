/* global $ */
/**
 * 全站通用js文件  @Sam
 */
$(function() {
        (function() {
            //登录区相关
            var $con = $('.islogin');
            var showMenuHandler = hideMenuHandler = null;
            $con.on('mouseenter', '.userinfo .pointer,.menu', function() {
                clearTimeout(hideMenuHandler);
                showMenuHandler = setTimeout(function() {
                    $con.addClass('trigger');
                }, 200);

            }).on('mouseleave', '.userinfo>div,.menu', function() {
                clearTimeout(showMenuHandler);
                hideMenuHandler = setTimeout(function() {
                    $con.removeClass('trigger');
                }, 200);
            });

            var banSetAvatarTip = $.cookie('no_avtip');
            if (!banSetAvatarTip) {
                var $tips = $con.find('.tips');
                // $tips.on('mouseenter mouseleave', function() {
                //     return false;
                // }).find('.cancel').click(function() {
                //     $.cookie('no_avtip', '1', {
                //         path: '/',
                //         expires: 9999
                //     });
                //     $tips.fadeOut(500);
                // });
                setTimeout(function() {
                    $tips.fadeIn(800);
                }, 1000);
            }
        })();

        (function() {
            //搜索相关
            var $search = $('.search');
            var $searchBox = $('.search .ipt');
            var $submit = $('.search .sub');
            var isSubmit = false;
            var suggestWord = "搜索商品真实使用体验";
            var defaultKeyword = $searchBox.val();
            $searchBox.on('focus', function() {
                // $(".search").removeClass("lock");
                var $parent = $(this).parent();
                $parent.addClass("focus");

                if ($(this).val() == suggestWord) {
                    $(this).val('');
                    showRecommend();
                } else if ($(this).val() == defaultKeyword) {
                    $(this).val("").val(defaultKeyword);
                    showSuggest();
                } else if($.trim($(this).val()).length==0) {
                    
                    showRecommend();
                }
                else{
                    showSuggest();
                }

            }).on('blur', function(event) {
                // console.log(event);
                // if(!$(".search").hasClass("lock"))
                // {
                //     $(".search .recommend").hide();
                //     $(".search .suggest").hide();
                // }
                $(".search").removeClass("lock");
                var $parent = $(this).parent();
                $parent.removeClass("focus");

                if ($(this).val() == '') {
                    $(this).val(defaultKeyword);
                }
            }).on('keyup', function(e) {

                if(e.which==38||e.which==40)
                {
                     keySelect(e.which);
                     return;
                }
                else if(e.which==39||e.which==37)
                {
                    return;
                }
                // else if(e.which==13)
                // {
                //     $submit.trigger("click");
                // }

                 // $(".search .ipt").data("curvalue",$(".search .ipt").val())
                 if (!$.trim($(".search .ipt").val())) {
                    $(".search .suggest").hide();
                    showRecommend();
                    return;

                }

                if(valueChange())
                {

                    showSuggest();
                    keySelect.index=0;
                    $(".search .recommend").hide();
                    return;
                }
                // if ($.trim($(".search .ipt").val())) {

                //     showSuggest();
                //     $(".search .recommend").hide();
                // } else {
                //     $(".search .suggest").hide();
                //     showRecommend();

                // }

                // if (e && e.keyCode == 13) {
                //     $(this).parent().find(".sub").trigger('click');
                // }
            }).on("keydown",function(e){
                if(e.which==13)
                {
                     $submit.trigger("click");
                }
            });

            $submit.on('click', function() {
                // if (!isSubmit) {
                    if(keySelect.index>0)
                    {
                        window.open($(".search .suggest .suggest-list a").eq(keySelect.index-1).attr("href"));
                        keySelect.index=0;
                        return;
                    }
                var value = $(this).closest(".search").find(".ipt").val();
                var keyword = $.trim(value);
                if (keyword && keyword != suggestWord && keyword != defaultKeyword) {
                    // isSubmit = true;
                    keyword = encodeURIComponent(keyword);
                    window.open('/search/' + keyword);
                } else {

                    $(this).closest(".search").find(".ipt").focus();
                }
                // }
            });

            

            $("body").on("mousedown", function(e) {
                if ($(e.toElement || e.target).closest(".suggest-lock").length) {
                    return;
                }
                keySelect.index=0;
                $(".search .recommend").hide();
                $(".search .suggest").hide();
            })
            $(".suggest p").on("click", function() {
                $(".search .suggest").hide();
            })
            $(".search .suggest").on("hover",".suggest-list a",function(){
                //找到是第几个，传递给keySelect去具体执行
                var $this=$(this);
                var num=$this.index(".search .suggest-list a")+1;
//                console.log(num);
                keySelect(38,num);
            });
            $search.on('click','.recommend a,.suggest a',function(){
            	$.get('/api/suglog?gid='+$(this).data('id'));
            });
            var cache = {};
            var showSuggest = ZTools.debounce(function() {

                    var value = $('.search .ipt').val();
                    var _html = "";
                    //有数据就使用之前的否则使用ajax获取
                    if (cache[value]) {
                        _html = rederVal(cache[value]);
                        $(".search .suggest .suggest-list").html(_html);
                        keySelect.list=[{name:$(".search .ipt").val()}].concat(cache[value]);
                        $(".search .suggest").show();
                        return;
                    }
                    if ($(".search .suggest").hasClass("request")) {
                        return;
                        //前面有一个请求没处理完，忽略
                    }
                    $(".search .suggest").addClass("request");
                    ZTools.request("GET", "/api/suggest/" + $.trim(value), null, function(res) {
                        if (res["data"] && res["data"].length) {
                            cache[value] = res["data"];
                            _html = rederVal(cache[value]);
                            keySelect.list=[{name:$(".search .ipt").val()}].concat(cache[value]);
                            $(".search .suggest .suggest-list").html(_html);
                            $(".search .suggest").show();
                        }

                    }, function() {
                        $(".search .suggest").removeClass("request");
                    }, function() {
                        //如果没搜到
                        $(".search .suggest .suggest-list").empty();
                        $(".search .suggest").hide();
                    })

                }, 100, true)
                //判定现在值是否和之前的值不一样，一样返回false，否则返回true
                var valueChange=function(){
                    var oldvalue=$(".search .ipt").data("oldvalue")||"";
                    var value=$(".search .ipt").data("curvalue");
                    if(oldvalue!=value)
                    {
                        $(".search .ipt").data("oldvalue",value);
                        return true;
                    }
                    else{
                        return false;
                    }
                }
                // function showSuggest(){
                var keySelect=function(code,num){

                    //上键
                    if(code==38)
                    {
                        keySelect.index--;
                        keySelect.index=(keySelect.index+keySelect.list.length)%keySelect.list.length;

                    }
                    else if(code==40){
                        keySelect.index++;
                        keySelect.index=keySelect.index%keySelect.list.length;
                    }
                    else{
                        return;
                    }
                    //这里的情况时hover改变的列值
                    if(num)
                    {
                        keySelect.index=num;
                    }
                    $(".search .ipt").val(keySelect.list[keySelect.index].name);
                    $(".suggest .suggest-list a").removeClass("selected");
                    if(keySelect.index>0)
                    {   

                        $(".suggest .suggest-list a").eq(keySelect.index-1).addClass("selected");
                    }

                }
            var showRecommend = ZTools.debounce(function() {
                $(".search .recommend").show();
                var _html = "";
                //有数据就使用之前的否则使用ajax获取
                if ($(".search .recommend").hasClass("request")) {
                    return;
                    //前面有一个请求没处理完，忽略
                }
                $(".search .recommend").addClass("request");
                //如果是空字符串，就不发请求了直接过
                if($(".search .ipt").val()){
                        return;
                }
                ZTools.request("GET", "/api/suggest/", null, function(res) {

                    _html = rederVal(res["data"]);
                    $(".search .recommend .list").html(_html);
                }, function() {
                    $(".search .recommend").removeClass("request");
                }, function() {
                    //如果没搜到
                    $(".search .recommend .list").empty();
                    $(".search .recommend").hide();
                })

            }, 100, true);

            function rederVal(data) {
                var _html = ""
                for (var i = 0; i < data.length; i++) {
                    var _temp = data[i];
                    _html += ZTools.replaceTemp(_temp, templistGlobal["suggest"]);
                }
                return _html;
            }
            // }
        })();
        //回到顶部
        (function() {
            //判断哪些页面需要初始化,经过测试，首页是/
            var patten = ["post", "item", "category", "search", ""];
            var flag = false;
            var path = location.pathname.split("/")[1];
            for (var i = 0; i < patten.length; i++) {
                if (path == patten[i]) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                return;
            }
            //计算是否需要出现回到顶部按钮
            //逻辑是右侧部分已经完全不可见
            var right_side = parseInt($(".side").css("height"), 10) + $(".side").offset().top;
            $(window).on("scroll", function(event) {
                if ($(this).scrollTop() > right_side) {
                    $("#gotop").show();
                } else {
                    $("#gotop").hide();
                }

            })
            $("#gotop .top").click(function() {
                $(window).scrollTop(0);
            })
        })();

        (function() {

            //分享链接模块
            var type = $.inArray(location.pathname.split("/")[1], ["post", "item"]);

            if (type === -1) {
                return;
            }
            var selector = [".article-detail", ".goods-detail"][type];
            if ($("#share").length === 0) {

                return;
            }
            var appkey = {
//              weibokey: "2992571369"
            	weibokey: "2887791756"	
            }
            var template = {
                weibo: "http://service.weibo.com/share/share.php?title=<%title%>&url=<%url%>&source=<%source%>&appkey=<%weibokey%>&pic=<%pic%>",
                qzone: "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=<%url%>&title=<%title%>&pics=<%pic%>&summary=<%summary%>"
            };
            //生成数据
            var data = (function() {
                    var $ele = $(selector);

                    var result = {};
                    result["title"] = $ele.find(".title").text();
                    result["url"] = encodeURIComponent(location.href);
                    return $.extend(result, appkey);

                })()
                //写入数据到href
            $("#share a").each(function() {
                var $this = $(this);
                if ($this.attr("href") != "javascript:void(0);") {
                    var href = ZTools.replaceTemp(data, template[$this.attr("href")]);
                    $this.attr("href", href);
                }


            });
            //这里解决问题微信二维码生成
            $("#share .wx").on("click", function() {
                Modal.qrcode(location.href);
            });
        })();
    })
    /*老浏览器的jsonpolifill*/

if (!window.JSON) {
    window.JSON = {
        parse: function(sJSON) {
            return eval('(' + sJSON + ')');
        },
        stringify: (function() {
            var toString = Object.prototype.toString;
            var isArray = Array.isArray || function(a) {
                return toString.call(a) === '[object Array]';
            };
            var escMap = {
                '"': '\\"',
                '\\': '\\\\',
                '\b': '\\b',
                '\f': '\\f',
                '\n': '\\n',
                '\r': '\\r',
                '\t': '\\t'
            };
            var escFunc = function(m) {
                return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1);
            };
            var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
            return function stringify(value) {
                if (value == null) {
                    return 'null';
                } else if (typeof value === 'number') {
                    return isFinite(value) ? value.toString() : 'null';
                } else if (typeof value === 'boolean') {
                    return value.toString();
                } else if (typeof value === 'object') {
                    if (typeof value.toJSON === 'function') {
                        return stringify(value.toJSON());
                    } else if (isArray(value)) {
                        var res = '[';
                        for (var i = 0; i < value.length; i++)
                            res += (i ? ', ' : '') + stringify(value[i]);
                        return res + ']';
                    } else if (toString.call(value) === '[object Object]') {
                        var tmp = [];
                        for (var k in value) {
                            if (value.hasOwnProperty(k))
                                tmp.push(stringify(k) + ': ' + stringify(value[k]));
                        }
                        return '{' + tmp.join(', ') + '}';
                    }
                }
                return '"' + value.toString().replace(escRE, escFunc) + '"';
            };
        })()
    };
}

/*
 **登录弹出框。
 */
(function() {
    var $modalLogin = $('<div class="login-wrap modal-login hide">\
            <div class="fork"><i class="icon"></i></div>\
            <div class="hd">很赞登录</div>\
            <div class="bd">\
              <p class="login-errors"></p>\
              <div class="login-item login-phone">\
                <input type="text" placeholder="手机号" class="ipt" />\
              </div>\
              <div class="login-item graph-code cl">\
              <input type="text" placeholder="验证码" class="ipt" />\
                <img src="" class="code">\
              </div>\
              <div class="login-item login-code cl">\
                <input type="text" placeholder="登录码" class="ipt" />\
                <button class="send">获取登录码</button>\
              </div>\
              <div class="rmb">\
                <label><input type="checkbox" checked="checked"/> 保持登录</label>\
              </div>\
              <div class="login-btn">\
                <input type="submit" value="登录" class="sub" />\
              </div>\
              <dl class="login-third">\
              <dt>您也可以使用以下账号登录</dt>\
              <dd>\
              <a href="javascript:void(0);" data-url="/oauth/v2conn/weibo" class="xl"><i class="icon"></i>新浪微博</a>\
              <a href="javascript:void(0);" data-url="/oauth/qihu_login" class="qh"><i class="icon"></i>360账号</a>\
              <a href="javascript:void(0);" data-url="/oauth/v2conn/weixin" class="wx"><i class="icon"></i>微信</a>\
              <a href="javascript:void(0);" data-url="/oauth/v2conn/qq" class="qq"><i class="icon"></i>腾讯QQ</a>\
              </dd>\
              </dl>\
            </div>\
            <div class="login-notice cl">\
            <i class="icon-notice fl"></i><p>通告:喵喵折是很赞旗下的购物助手插件，喵喵折账号可以在很赞登录，可享受更好的服务。</p>\
            </div>\
          </div> ');
    //调用表单验证部分的接口，捆绑上事件。
    var cdClass = 'is-cooling-down';
    //60s倒计时动画

    var playCooldownAnimation = (function() {
        var fn = function($target, cd, timeout) {
            var cooldown = cd == null ? 60 : cd;
            setTimeout(function() {
                if (cooldown > 0) {
                    $target.text('重新发送(' + cooldown + ')');
                    cooldown--;
                    fn($target, cooldown, 1000);
                } else {
                    $target.text('重新获取').removeClass(cdClass);
                }
            }, timeout || 0);
        };
        return fn;
    })();

    $("body").append($modalLogin);
    $(".modal-login .fork .icon").click(function() {
        $modalLogin.hide();
        $(".modal-mask").hide();
    })
    $(".modal-login .login-third dd a").on("click", function() {
        var $this = $(this);
        if ($this.hasClass("disable"))
            return;
        $this.parent().children().addClass("disable");
        ZTools.redirect($this.data("url") + "?destUrl=" + encodeURIComponent(location.href) || "");
    });
    var ver = window.Verification({
        pho: {
            ele: $(".modal-login .login-phone input"),
            eventName: "blur",
            callback: null,
            constraints: null,
            errEle: $(".modal-login .login-errors")
        },
        code: {
            ele: $(".modal-login .login-code input"),
            eventName: "blur",
            callback: null,
            constraints: null,
            errEle: $(".modal-login .login-errors")
        },
        graph: {
            ele: $(".modal-login .graph-code input"),
            eventName: "blur",
            constraints: null,
            errEle: $(".modal-login .login-errors")
        },
        graphGet: {
            ele: $(".modal-login .graph-code img"),
            eventName: "click",
            callback: function() {
                //调用获取验证码的接口
                var url = "/api/captcha?date="
                ver.graphGet.ele.attr("src", url + new Date);
            },
            constraints: null,
            errEle: $(".modal-login .login-errors")
        },
        send: {
            ele: $(".modal-login .send"),
            eventName: "click",
            preCallback: function() {
                var $this = $(this);
                if ($this.hasClass(cdClass) || $this.hasClass("request")) {
                    return false;
                } else {
                    if ($this.data("slideDown")) {
                        ver.graph.ele.val("").focus();
                        ver.graphGet.ele.trigger("click");
                        $(".modal-login .graph-code").slideDown(300);
                        $this.data("slideDown", false);
                        return false;
                    } else {
                        return true;
                    }
                }

            },
            callback: function() {
                var phone = ver.pho.ele.val();
                var graph = ver.graph.ele.val();
                var $this = $(this);

                $this.addClass("request");
                ZTools.request("POST", '/user/snd_code', {
                    phone: phone,
                    captcha: graph
                }, function() {
                    playCooldownAnimation($this);
                    $this.addClass(cdClass);
                    $(".modal-login .graph-code").slideUp(300);
                    $this.data("slideDown", true);
                }, function() {
                    ver.graph.ele.val("");
                    $this.removeClass("request");
                }, function(json) {
                    ver.graphGet.ele.trigger("click");
                    ver.pho.errEle.text(json.msg);
                    if (json.code == 10003) {
                        ver.pho.errEle.text("图形验证码输入错误");
                    } else if (json.code == 10004) {
                        playCooldownAnimation($this);
                        $this.addClass(cdClass);
                    } else if (json.code == 10005) {
                        ver.pho.errEle.text("您所在网络操作太过频繁，请稍后再试");
                        $this.prop('disabled', 'disabled');
                    }

                });
            },
            constraints: ["pho", "graph"]
        },
        submit: {
            constraints: ["pho", "code"],
            ele: $('.modal-login .sub'),
            eventName: "click",
            callback: function() {
                var phone = ver.pho.ele.val();
                var code = ver.code.ele.val();
                var remember = $('.rmb input').prop('checked') ? 1 : 0;
                var $this = $(this);
                if ($this.hasClass("disable")) {
                    return;
                }
                $this.addClass("disable");
                ZTools.request("POST", '/user/login_chk?uuid=' + ($('#uuid').val() || '') + '&destUrl=' + ($('#destUrl').val() || ''), {
                    'phone': phone,
                    'code': code,
                    'remember': remember
                }, function(json) {
                    if (json.redirect) {
                        ZTools.redirect(json.redirect);
                    } else {
                        ZTools.redirect('/');
                    }

                }, function() {
                    $this.removeClass("disable");
                }, function(json) {
                    // $(".modal-login .graph-code").slideDown(300);
                    ver.pho.errEle.text(json.msg);
                });
            }
        }
    });

    window.modalLogin = {
        show: function() {
            $modalLogin.show();
            var url = "/api/captcha?date="
            ver.graphGet.ele.attr("src", url + new Date().getTime());
            $(".modal-mask").show();
        },
        hide: function() {
            $modalLogin.hide();
            $(".modal-mask").hide();
        }
    };

    // modalLogin.show();

})();

/**
 * 工具 @Sam
 * ZTools
 */
(function() {
	var debug = 0;
	
	var log = function(){
		
	}
	
    /**
     * 跳转ie下带referer
     */
    var gotoUrl = function(url) {
        if ($.browser.ie) {
            var gotoLink = document.createElement('a');
            gotoLink.href = url;
            document.body.appendChild(gotoLink);
            gotoLink.click();
        } else {
            window.location.href = url;
        }
    };
    /**
    *post ajax的封装
    get ajax的封装
    感觉这样写下去会太蛋疼了，比如请求一个东西可能会有些必须做的。比如错误处理，所有的都需要去做。
    所以觉得需要封装一下
    */

    var request = function(type, url, data, successCallback, completeCallback, errorCallback) {
        $.ajax({
            'url': url,
            'type': type,
            'dataType': 'json',
            'data': data || "",
            "timeout": 5000,
            success: function(json) {
                if (json && json.RC == 1) {
                    successCallback && successCallback(json);
                } else if (json && json.RC == 2) {
                    if (json.code == 1) {
                        modalLogin.show();
                    } else if (json.code == 10001) {
                        Modal.info("不能回复自己哦");
                    }
                    errorCallback && errorCallback(json);
                }

            },
            error: function() {
                Modal.info("网络出现错误");
            },
            complete: function() {
                completeCallback && completeCallback();
            }
        });
    }
    /**
     * 字符串宽度计算（ascii 1 其他2）
     */
    var getStrLen = function(str, chkWideChar) {
        if (!chkWideChar) {
            return str.length;
        } else {
            var len = str.length;
            for (var i = 0; i < str.length; i++) {
                var iCode = str[i].charCodeAt();
                if (iCode > 128) {
                    len++;
                }
            }
            return len;
        }
    }
    
    var def = {
        defaultPic: "http://img.miaomiaoz.com/img/show/28732a1f53fc36f3db17ac28213be0f5",
        defaultAva: "http://img.miaomiaoz.com/img/show/20f34173b84a88eacee5bf5daa9b109b"
    };
    var replaceTemp = function(data, template) {

        //分解.获取对象的值
        function getProp(prop, data) {
            var attrs = prop.split(".");
            var temp = data;
            for (var i = 0; i < attrs.length; i++) {
                if (!temp[attrs[i]])
                    return '';
                temp = temp[attrs[i]];
            }
            return temp || '';
        }

        function rederVal(str, data) {
            return str.replace(/<%([\w.]+)%>/ig,
                function(a, b) {
                    return getProp(b, data);
                });
        }
        return template.replace(/<%\?([\w\W]+?)\?%>/ig, function(a, b) {
            var outPut = [];

            var echo = function(str) {
                outPut.push(rederVal(str, data));
            }
            var print = function(str) {
                outPut.push(str);
            }
            var statement = "with(obj){" + b + "}";
            new Function("obj", "echo", "def", "print", statement)(data, echo, def, print);
            return outPut.join("");

        }).replace(/<%([\w.]+)%>/ig,
            function(a, b) {
                return getProp(b, data);
            });
    }
    var imageUrlAdapter = function(url, w, h, type) {
        //var patten = url && url.match(/http:\/\/img\d{0,}.miaomiaoz.com\/img\/show\//) && url.match(/http:\/\/img\d{0,}.miaomiaoz.com\/img\/show\//)[0];
        var group = url && url.match(/http:\/\/img\d{0,}.miaomiaoz.com\/img\/show\//);
        var patten = group && group[0];
        if (patten) {
            url = url.slice(patten.length - 1);
            if(w > 0){
            	w *= 2;
            }else{
            	w = '';
            }
            if(h > 0){
            	h *= 2;
            }else{
            	h = '';
            }
            if (type) {
                return patten + w + "_" + h + "/1" + url;
            } else {
                return patten + w + "_" + h + url;
            }
        } else {
            return url;
        }
    };
    var lazyload = function(eles, text,fn) {
            var avaErrorImage = new Image();
            var picErrorImage = new Image();
            var type = picType(eles.eq(0));
            picErrorImage.src = def.defaultPic;
            avaErrorImage.src = def.defaultAva;
            eles.each(function() {
                var ele = $(this);
                var _image = $(new Image());
                //处理方式。文章页，整体加载。列表页直接加载.
                if (text) {
                    integral(ele, text,fn);
                } else {
                    ele.on("error", function() {
                        errorPic(ele);
                    });
                    ele.attr("src", ele.data("src"));
                }

                ele.data("src", null);
            })

            function integral(ele, type,fn) {
                var _image = $(new Image());
                _image.one("load", function() {
                    ele.attr("src", _image.attr("src"));
                    fn&&fn(ele);
                }).one("error", function() {
                    if (type) {
                        return;
                    }
                    errorPic(ele);

                });
                _image.attr("src", ele.data("src"));
            }

            function picType(ele) {
                if (ele.parent().hasClass("avatar")) {
                    return "ava";
                } else {
                    return "pic";
                }
            }

            function errorPic(ele) {
                if (picType(ele) == "ava") {
                    ele.attr("src", def.defaultAva);
                } else if (picType(ele) == "pic") {
                    ele.attr("src", def.defaultPic);
                }
            }


        }
        /*
         * 频率控制 返回函数连续调用时，fn 执行频率限定为每多少时间执行一次
         * @param fn {function}  需要调用的函数
         * @param delay  {number}    延迟时间，单位毫秒
         * @param immediate  {bool} 给 immediate参数传递false 绑定的函数先执行，而不是delay后后执行。
         * @return {function}实际调用函数
         */
    var throttle = function(fn, delay, immediate, debounce) {
        var curr = +new Date(), //当前事件
            last_call = 0,
            last_exec = 0,
            timer = null,
            diff, //时间差
            context, //上下文
            args,
            exec = function() {
                last_exec = curr;
                fn.apply(context, args);
            };
        return function() {
            curr = +new Date();
            context = this,
                args = arguments,
                diff = curr - (debounce ? last_call : last_exec) - delay;
            clearTimeout(timer);
            if (debounce) {
                if (immediate) {
                    timer = setTimeout(exec, delay);
                } else if (diff >= 0) {
                    exec();
                }
            } else {
                if (diff >= 0) {
                    exec();
                } else if (immediate) {
                    timer = setTimeout(exec, -diff);
                }
            }
            last_call = curr;
        }
    };

    /*
     * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 delay，fn 才会执行
     * @param fn {function}  要调用的函数
     * @param delay   {number}    空闲时间
     * @param immediate  {bool} 给 immediate参数传递false 绑定的函数先执行，而不是delay后后执行。
     * @return {function}实际调用函数
     */

    var debounce = function(fn, delay, immediate) {
        return throttle(fn, delay, immediate, true);
    };
    
    var getDiffDateStr = function (publishTime){
		//return publishTime;       
        var d_minutes,d_hours,d_days, d_half_days, result;       
        var timeNow = parseInt(new Date().getTime()/1000);       
        var d;       
        d = timeNow - publishTime;       
//        d_days = parseInt(d/86400);
        d_half_days = parseInt(d/43200);
        d_hours = parseInt(d/3600);       
        d_minutes = parseInt(d/60);       
//        if(d_days>0 && d_days<4){
//            return d_days+"天前";       
//        }
        
        if(d_half_days > 0){
        	var s = new Date(publishTime*1000);
        	var strs = [(s.getMonth()+1)+'', s.getDate() + ''];
        	for(var i in strs){
        		if(strs[i].length < 2){
        			strs[i] = '0' + strs[i];
        		}
        	}
        	result = s.getFullYear()+'-'+strs[0]+'-'+strs[1];
        }else if(d_hours>0){
        	result = d_hours+"小时前";
        }else if(d_minutes>0){
        	result = d_minutes+"分钟前";
        }else{
        	result = "刚刚";
		}
        return result;
	}
    
    /**
     * 宽字符文本截长 Sam
     * @param {Object} str
     * @param {Object} maxLen
     * @param {Object} showEllipsis
     */
    var subWideCharStr = function (str,maxLen, showEllipsis){
    	var wlen = 0;
    	var ellipsis = typeof showEllipsis == 'string' ? showEllipsis : showEllipsis ? '...' : '';
    	if(str.charCodeAt(0)>128 && maxLen<2 || str.charCodeAt(0)<=128 && maxLen<1){
    		return '';
    	}else{
    		for(var i = 0;i < str.length; i++) {
    			var iCode = str[i].charCodeAt();
    			if(iCode > 128){
    				wlen += 2;
    			}else{
    				wlen += 1;
    			}
    			if(wlen == maxLen && i<str.length-1){
    				return str.slice(0,i+1)+ellipsis;
    			}else if(wlen > maxLen){
    				return str.slice(0,i)+ellipsis;
    			}
    		}
    		return str;
    	}
    };
    /**
     * 提交json/application测试
     */
    var postJSON = function(opts) {
    	if((opts.data != null) && (typeof opts.data !== 'string')){
    		opts.data = JSON.stringify(opts.data);
    	}
    	opts.contentType = 'application/json';
    	return $.ajax(opts);
//    	
//        return $.ajax({
//            'type': 'POST',
//            'url': url,
//            'contentType': 'application/json',
//            'data': data,
//            'dataType': 'json',
//            'success': callback
//        });
    };
    
    /**
     * Sam
     * 本地存储工具，提供不同的tag_name以获得不同的存储空间
     */
    var getLocalStorage = (function(){
    	var localStorage = window.localStorage || { setItem : $.noop, getItem : $.noop, removeItem : $.noop };
    	var getStorage = function(tag){
    		var storage = localStorage.getItem(tag);
    		if(storage){
    			try{
        			storage = JSON.parse(storage);
    			}catch(e){
    				storage = {};
    			}
    		}else{
    			storage = {};
    		}
    		return storage;
    	};
    	var setStorage = function(tag, obj){
    		return localStorage.setItem(tag, JSON.stringify(obj));
    	};
    	
    	return function(tag){
        	var _tag = tag || '__UNDEFINED';
        	return {
        		get : function(key){
        			var storage = getStorage(_tag);
        			return storage[key];
        		},
        		set : function(key, value){
        			var storage = getStorage(_tag);
        			storage[key] = value;
        			return setStorage(_tag, storage);
        		},
        		remove : function(key){
        			var storage = getStorage(_tag);
        			delete storage[key];
        			return setStorage(_tag, storage);
        		}
        	};
        };
    })();
    
    /**
     * Sam
     * 获得东八区时间
     */
    var getEast8Time = function(){
    	var date = new Date();
    	var now = parseInt( date.getTime() / 1000 ), result;
    	try{
    		var offset = date.getTimezoneOffset();
    		result = now + ( offset + 480 ) * 60;
    	}catch(e){
    		result = now;
    	}
    	return result;
    }
    
    var isIE = (function(){
    	try{
        	return /msie/.test(navigator.userAgent.toLowerCase());
    	}catch(e){
    	}
    })();

    
    var tools = {};
    tools.debounce = debounce;
    tools.redirect = gotoUrl;
    tools.replaceTemp = replaceTemp;
    tools.request = request;
    tools.imageUrlAdapter = imageUrlAdapter;
    tools.getStrLen = getStrLen;
    tools.lazyload = lazyload;
    tools.getDiffDateStr = getDiffDateStr;
    tools.subWideCharStr = subWideCharStr;
    tools.postJSON = postJSON;
    tools.getLocalStorage = getLocalStorage;
    tools.getEast8Time = getEast8Time;
    tools.isIE = isIE;
    window.ZTools = tools;
})();


//懒加载
(function() {
    //判断是否是正文，是正文就跳过错误图片的处理。
    var text = location.pathname.split("/") && location.pathname.split("/")[1];
    if (text == "post") {
        text = true;
    }
    ZTools.lazyload($("img[data-src]"), text);
})();
