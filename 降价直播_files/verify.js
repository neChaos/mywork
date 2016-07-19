! function() {
    window.Verification = function() {
        //这个地方只是单纯的进行验证，和展示错误。
        var prototype = {
            showErr: function(regexName, errEle, code) {
                //每种验证有两种错误的状态使用，0,1表示。比如0表示为空，1表示为错误，非法。
                //由于错误都显示在一起的所以，只能特特殊处理下了。对于多种错误的，直接合并一下;
                if (regexName == null) {
                    errEle.text(" ");
                    return;
                }
                errEle.text(this.errMes[regexName][code]);

            },
            verify: function(str, regexName, errEle) {
                //按照道理说，应该是每个地方都有一个错误显示的地方啊。
                //所以这种就特殊处理吧。
                str = $.trim(str);
                if (str == "") {
                    this.showErr(regexName, errEle, 0);
                    return false;
                }

                if (this.regex[regexName].test(str)) {
                    this.showErr(null, errEle);
                    return true;

                } else {

                    this.showErr(regexName, errEle, 1);
                    return false;
                }


            },
            regex: {
                pho: new RegExp('^1[3-8][0-9]{9}$'),
                code: new RegExp('^[0-9]{6}$'),
                graph:new RegExp('^[a-zA-Z0-9]{4}$')
            },
            errMes: {
                pho: ["电话号码不能为空", "电话号码格式错误"],
                code: ["登录码不能为空", "登录码格式错误"],
                graph:["图形验证码不能为空","图形验证码格式错误"]
            }


        }

        return function(opptions) {
            var newVer = $.extend({}, prototype,opptions);
            var constraints = {};
            for (var name in opptions) {
                //此时进行根据依赖关系,绑定事件。
                //想法是如果这个在opptions中的属性名在regexp中能找到说明这里的ele的值需要验证.
                //这里搞出一个副本来.然后返回newVer,方便进行更改这个regex.有个默认的。
                (function(name) {
                    var temp = opptions[name];
                    var ele = temp.ele;
                    var regex = newVer.regex[name]
                    if (regex) {
                        //先往依赖表里添加可依赖的验证函数
                        constraints[name] = function() {
                            return newVer.verify(ele.val(), name, temp.errEle);
                        };
                    }
                    //我的理解是，把一个需要验证的单元拆分为3个部分
                    //首先，最终要的是触发的前提条件，就是一定要先验证通过的单元。如果有未完成的直接退出
                    //其次，是有没有precallback.比如发送验证码的有个时间限制。如果时间未到也要进行阻止触发
                    //然后才是callback的部分.这里为以后奇怪的需求留下了一定的空间，比如验证没有通过的情况下
                    //触发errorcallback.正确下触发rightcallback。
                    //如果不需要验证则触发普通的callback。

                    if (temp.eventName) {
                        ele.on(temp.eventName, function() {
                            if (temp.preCallback) {
                                if (!temp.preCallback.apply(this, arguments)) {
                                    return;
                                }
                            }
                            if (temp.constraints) {
                                for (var i = 0; i < temp.constraints.length; i++) {
                                    var _temp = constraints[temp.constraints[i]];
                                    if (_temp) {
                                        if (!_temp()) {
                                            return; //这里如果前提条件没有通过的话不触发回调。所以直接退出;
                                        }
                                    }

                                }
                            }

                            
                            if (regex) {
                                if (newVer.verify(ele.val(), name, temp.errEle)) {
                                    temp.rightCallback && temp.rightCallback.apply(this, arguments);
                                } else {

                                    temp.errorCallback && temp.errorCallback.apply(this, arguments);
                                }
                            } else {
                                temp.callback && temp.callback.apply(this, arguments);
                            }

                        })
                    }

                })(name);
            }
            return newVer;
        }
    }();
}($)
// var ver = new Verification({
//     errMes: [{
//         "pho": "电话号码不能为空",
//         "code": "验证码不能为空"
//     }, {
//         "code": "验证码格式错误",
//         "pho": "电话号码格式错误"
//     }],
//     regex: {
//         pho: new RegExp('^1[3-8][0-9]{9}$'),
//         code: new RegExp('^[0-9]{6}$')
//     },
//     errEle: [$(".login-errors")]
// });


