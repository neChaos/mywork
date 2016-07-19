if($.browser.msie && $.browser.version < 9){
    if (!Array.prototype.reduce) {
        Array.prototype.map = function(){
            /**
            * Map对象，实现Map功能
            * 
            * 
            * size() 获取Map元素个数 
            * isEmpty() 判断Map是否为空 
            * clear() 删除Map所有元素 
            * put(key, value) 向Map中增加元素（key, value) 
            * remove(key) 删除指定key的元素，成功返回true，失败返回false 
            * get(key) 获取指定key的元素值value，失败返回null 
            * element(index) 获取指定索引的元素（使用element.key，element.value获取key和value），失败返回null 
            * containsKey(key) 判断Map中是否含有指定key的元素 
            * containsValue(value) 判断Map中是否含有指定value的元素 
            * keys() 获取Map中所有key的数组（array） 
            * values() 获取Map中所有value的数组（array）
            */
            this.elements = new Array();

            // 获取Map元素个数
            this.size = function() {
                return this.elements.length;
            },

            // 判断Map是否为空
            this.isEmpty = function() {
                return (this.elements.length < 1);
            },

            // 删除Map所有元素
            this.clear = function() {
                this.elements = new Array();
            },

            // 向Map中增加元素（key, value)
            this.put = function(_key, _value) {
                if (this.containsKey(_key) == true) {
                    if (this.containsValue(_value)) {
                        if (this.remove(_key) == true) {
                            this.elements.push( {
                                key : _key,
                                value : _value
                            });
                        }
                    } else {
                        this.elements.push( {
                            key : _key,
                            value : _value
                        });
                    }
                } else {
                    this.elements.push( {
                        key : _key,
                        value : _value
                    });
                }
            },

            // 删除指定key的元素，成功返回true，失败返回false
            this.remove = function(_key) {
                var bln = false;
                try {
                    for (i = 0; i < this.elements.length; i++) {
                        if (this.elements[i].key == _key) {
                            this.elements.splice(i, 1);
                            return true;
                        }
                    }
                } catch (e) {
                    bln = false;
                }
                return bln;
            },

            // 获取指定key的元素值value，失败返回null
            this.get = function(_key) {
                try {
                    for (i = 0; i < this.elements.length; i++) {
                        if (this.elements[i].key == _key) {
                            return this.elements[i].value;
                        }
                    }
                } catch (e) {
                    return null;
                }
            },

            // 获取指定索引的元素（使用element.key，element.value获取key和value），失败返回null
            this.element = function(_index) {
                if (_index < 0 || _index >= this.elements.length) {
                    return null;
                }
                return this.elements[_index];
            },

            // 判断Map中是否含有指定key的元素
            this.containsKey = function(_key) {
                var bln = false;
                try {
                    for (i = 0; i < this.elements.length; i++) {
                        if (this.elements[i].key == _key) {
                            bln = true;
                        }
                    }
                } catch (e) {
                    bln = false;
                }
                return bln;
            },

            // 判断Map中是否含有指定value的元素
            this.containsValue = function(_value) {
                var bln = false;
                try {
                    for (i = 0; i < this.elements.length; i++) {
                        if (this.elements[i].value == _value) {
                            bln = true;
                        }
                    }
                } catch (e) {
                    bln = false;
                }
                return bln;
            },

            // 获取Map中所有key的数组（array）
            this.keys = function() {
                var arr = new Array();
                for (i = 0; i < this.elements.length; i++) {
                    arr.push(this.elements[i].key);
                }
                return arr;
            },

            // 获取Map中所有value的数组（array）
            this.values = function() {
                var arr = new Array();
                for (i = 0; i < this.elements.length; i++) {
                    arr.push(this.elements[i].value);
                }
                return arr;
            };
        }
        Array.prototype.reduceRight = function reduce(accumulator){
            if (this===null || this===undefined) throw new TypeError("Object is null or undefined");
            var  l = this.length >> 0, curr;

            if(typeof accumulator !== "function") // ES5 : "If IsCallable(callbackfn) is false, throw a TypeError exception."
                throw new TypeError("First argument is not callable");

            if(arguments.length < 2) {
                if (l === 0) throw new TypeError("Array length is 0 and no second argument");
                curr = this[0];
                l = 1; // start accumulating at the second element
            }
            else
                curr = arguments[1];

            while (l-- > 0) {
                if(l in this) curr = accumulator.call(undefined, curr, this[l], l, this);
            }

            return curr;
        }
        Array.prototype.reduce = function reduce(accumulator){
            if (this===null || this===undefined) throw new TypeError("Object is null or undefined");
            var i = 0, l = this.length >> 0, curr;

            if(typeof accumulator !== "function") // ES5 : "If IsCallable(callbackfn) is false, throw a TypeError exception."
                throw new TypeError("First argument is not callable");

            if(arguments.length < 2) {
                if (l === 0) throw new TypeError("Array length is 0 and no second argument");
                curr = this[0];
                i = 1; // start accumulating at the second element
            }
            else
                curr = arguments[1];

            while (i < l) {
                if(i in this) curr = accumulator.call(undefined, curr, this[i], i, this);
                ++i;
            }

            return curr;
        };
    }

}
//格式化时间
function getDataTime(oldTime){
    var _time = typeof oldTime ==='string' ? oldTime : oldTime.toString();
    if(_time.indexOf('/') == -1){
        _time = _time.replace(/(\d{0,4})(\d{0,2})(\d{0,2})/i,function (a,b,c,d){ return b+'/'+c+'/'+d });
    }
    return (new Date(_time)).getTime();
}
    //获取日期
    window.getDayTime = function (date){
        date = date || new Date();
        return new Date(date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate()).getTime();
    }
    //格式化价格数字
    function getPrFix(pri){
        if(!pri || pri == ""){
            return "";
        }
        var _price = pri.toString();
        var _p = _price.indexOf('.');
        var toFix = '.';
        if(_p > -1){
            var p1 = _price.substr(++_p,1);
            var p2 = _price.substr(++_p,1);
            if ( p1 > 0 && p2 == 0 ) {
                toFix = toFix + p1;
            }else if( p1 > 0  && p2 > 0 || p2 > 0 && p1 == 0 ){
                toFix = toFix + p1 + p2;
            }else{
                toFix = 0;
            }
            _price = parseInt(_price) + toFix;
        }
        return Number(_price);
    }
    /**
    * 将 mhpc接口返回的历史价格数据按天数填充完整，并计算趋势、最高价、最低价等
    * @author  Sam
    * @param {Object} data
    */
    function calcOnlineData(data){
        var values = data.value && data.value.split('_'),
        d = new Date;
        var pcinfo_info = [],
        pcinfo_ed = getDayTime(d),
        pcinfo_bd = pcinfo_ed - 60*86400000,
        prices = [],
        sArray = [],
        findIndex = 1;
        var lastDayObj = values.reduce(function(prevObj,cur,index,values){
            var data = cur.split('|');
            var dt = getDayTime(new Date(getDataTime(data[0]))),
            pr = getPrFix(parseFloat(data[1]));
            var infoObj = {dt:dt,pr: pr,recorded:false};
            if(dt<pcinfo_bd){
                return null;
            }else{
                if(prevObj){
                    var _pdt = prevObj.dt + 86400000;
                    while(_pdt < dt){
                        if(_pdt>=pcinfo_bd){
                            if(!prevObj.recorded){
                                prices.push(prevObj.pr);
                                prevObj.recorded = true;
                            }
                            pcinfo_info.push({dt:_pdt,pr:prevObj.pr});
                        }
                        _pdt += 86400000;
                    }
                    sArray.push([dt,prevObj.pr,dt,findIndex]);prevObj
                    sArray.push([dt,pr,++findIndex]);
                }else{
                    sArray.push([dt,pr,dt,findIndex]);
                }
                prices.push(pr);
                infoObj.recorded = true;
                pcinfo_info.push(infoObj);
            }
            return infoObj;
        },null);
        if(lastDayObj != null){
            var _pdt = lastDayObj.dt + 86400000;
            while(_pdt < pcinfo_ed){
                if(_pdt>=pcinfo_bd){
                    if(!lastDayObj.recorded){
                        prices.push(lastDayObj.pr);
                        lastDayObj.recorded = true;
                    }
                    pcinfo_info.push({dt:_pdt,pr:lastDayObj.pr});
                }
                _pdt += 86400000;
            }
        }86400000
        //插入最后一天价格
        data.price = getPrFix(parseFloat(data.price));
        sArray.push([pcinfo_ed+86400000,data.price,findIndex]);
        if(data.price >= 0){
            prices.push(data.price);
            pcinfo_info.push({dt:pcinfo_ed,pr:data.price});
        }else if(lastDayObj != null){
            data.price = lastDayObj.pr;
            prices.push(data.price);
            pcinfo_info.push({dt:pcinfo_ed,pr:lastDayObj.pr});
        }
        var diffPrices = prices.reduceRight(function(arr,price){
            if($.inArray(price,arr)<0){
                arr.push(price);
            }
            return arr;
        },[]);
        //console.log(diffPrices);
        var pcinfo = {
            id : data.id,
            //shop : domain,
            bd : pcinfo_bd,
            ed : pcinfo_ed,
            info : pcinfo_info,
            diffpr : diffPrices,
            searchArr : sArray
        }
        if(diffPrices.length>0 && prices.length>1){
            var pcinfo_hpr = Math.max.apply(Math,diffPrices),
            pcinfo_lpr = Math.min.apply(Math,diffPrices);
            var pcinfo_trend = 0,
            pcinfo_discount = null;
            if(diffPrices.length < 2){
                pcinfo_trend = 4;
            }else{
                pcinfo_discount = parseInt(100*diffPrices[0]/diffPrices[1])/10;
                if(pcinfo_discount < 10){
                    if(data.price == pcinfo_lpr){
                        pcinfo_trend = 1;
                    }else{
                        pcinfo_trend = 2;
                    }
                }else{
                    pcinfo_trend = 3;
                }
            }
            pcinfo.hpr = pcinfo_hpr;
            pcinfo.lpr = pcinfo_lpr;
            pcinfo.discount = pcinfo_discount;
            pcinfo.trend = pcinfo_trend;
        }
        data.pcinfo = pcinfo;
        return data;
    }
