//var backgroundImg = chrome.extension.getURL("images/background_new.png");
//var debug = false;

function HistPriceDrawer(){
	var drawer = this;
	drawer.targets = [];	
	
	if(typeof HistPriceDrawer._initialized == 'undefined'){
		HistPriceDrawer.DRAW_ALL = 0;
		/**
		以后读写flot插件内部方法等操作，可在init函数里做
		by Sam
		*/
		$.plot.plugins.push({
			init:function(plot){
				/**
				plot.highlight = function(){...};
				*/
			}
		})
		HistPriceDrawer.prototype.remove = function($conObjs){
			if(!($conObjs instanceof jQuery)){
				$conObjs = $($conObjs);
			}
			if($conObjs.length==0){
//				console.log("无效选择器");
				return false;
			}
			var objArray = [];
			$conObjs.each(function(i,$obj){
				objArray.push($obj[0]);
			})
			
			drawer.targets = drawer.targets.reduce(function(prev,target){
				if($.inArray(target['obj'][0],objArray) < 0){
					prev.push(target);
				}else{
					for(var key in target){
						target[key] = null;
					}
				}
				return prev;
			},[]);
			$conObjs.remove();
		};
		/**
		 * 浮动价格曲线的数据请用这个函数来add（不需要做转化）
		 * @author  Sam
		 * @param {Object} qDate
		 * @param {Object} $conObjs
		 */
		HistPriceDrawer.prototype.addLocalCalculatedData = function(qDate,$conObjs){
			if(!($conObjs instanceof jQuery)){
				$conObjs = $($conObjs);
			}
			if($conObjs.length==0){
				console.log("无效选择器");
				return false;
			}
			var hpr = qDate.hpr,
				lpr = qDate.lpr,
				padData = [],
				diffArr = qDate.diffpr,
				searchArr = qDate.searchArr,
				findIndex = 1,
				ed = qDate.ed,
				st = qDate.bd;
			var tickWeight = qDate.tickWeight || 2;
			qDate.info.map(function(data){
				padData.push([data['dt'],getPrFix(data['pr'],2)]);
			});
			padData.push([ed+86400000,getPrFix(qDate.info[qDate.info.length-1]['pr'],2)]);
			var tick = [];
			var yaxisFix = (hpr-lpr)*0.2;
			var tickSize = 5 * tickWeight;
            for(var i=st;i<ed;i+=tickSize * 86400000){
                tick.push(i); 
            }
            tick[tick.length] = tick[tick.length - 1] + tickSize * 86400000;
            var configObj = {
                series: {
                    lines: {show: true, fillColor:"#f33e3e", lineWidth:2},
                    points: {
                    	show: false,
                    	fillColor:"#ffffff", 
                    	symbol:function(octx, x, y, radius){
                    		try{
                    			octx.arc(x, y, 2, 0, 2 * Math.PI);
                    		}catch(e){
                    			
                    		}
                    	}
                    },
                    bars: {lineWidth:5},
                    subline: true
                },
                xaxis: {
                    ticks : tick,
                    mode:"time",
                    tickSize : [ tickSize ,'day'],
                    timeformat:"%m-%d",
                    min:st,
					tickFormatter:function(v,axis){
						return "";
						if(v==axis.datamax){
                            v -= 86400000;
                        }
                        var d = new Date(v);
                        return (d.getMonth() + 1)+"-"+d.getDate();
                    }
                },
				yaxis:{
					max:hpr+yaxisFix,
					min:Math.max.apply(Math,[0,lpr-yaxisFix])
				},
                grid: {
                    hoverable: true,
                    clickable: true,
                    autoHighlight: false,
                    backgroundColor : '#ffffff',
                    borderColor: '#eeeeee',
                    minBorderMargin : 1,
                    markings: function(axes) {
                        var markings = [];
                        for(var x = Math.floor(axes.yaxis.min); x < axes.yaxis.max; x += (axes.yaxis.tickSize * 2))
                        markings.push({ yaxis: { from: x, to: x + axes.yaxis.tickSize }});
                        return markings;
                    }
                },
				haveCoordinate : true,
				haveMover : true,
				showLastPoint : false,
				showLowestPoint : false
            };
            if(diffArr.length < 2){
                configObj.yaxis = {
                    min : getPrFix( lpr*0.95),
                    max : getPrFix( hpr*1.05)
                }
            }
			var data = {
				data:padData,
				sArray:searchArr,
				hiPrice:hpr,
				loPrice:lpr,
				st:st,
				ed:ed,
				tick:tick,
				config:configObj
			};
			for(var i=0;i<$conObjs.length;++i){
				var $conObj = $conObjs.eq(i),
					searchResult = searchInTargets($conObj[0]),
					target = {obj:$conObj.empty(),data:data,redrawable:true,signList:[],sameFlag:null,plot:null};
				if(searchResult == null){
					drawer.targets.push(target);
				}else{
					searchResult = target;
				}
			}
		}
/**
Old addData Method
@To Be Deprcated In Future- By Sam
--has some bugs;
*/
//addData		
        HistPriceDrawer.prototype.addData = function(qDate,$conObjs){
            if(!$conObjs instanceof jQuery){
				$conObjs = $($conObjs);
			}
			if($conObjs.length==0){
				console.log("无效选择器");
				return false;
			}
			var SECONDS_MONTHLY = 30 * 86400;
			var hpr = qDate.hpr,
				lpr = qDate.lpr,
				padData = [],
				diffArr = [],
				searchArr = [],
				findIndex = 1,
				//ed = getDayTime(new Date())/1000,
				ed = getDayTime(new Date(qDate.ed))/1000, //降价直播需求，只画到最后数据的时间
				st,
				duration,
				tickWeight;
			try{
				st = new Date(qDate.info[0].dt).getTime()/1000;
				duration = ed - st;
			}catch(e){
				duration = 2*SECONDS_MONTHLY;
				st = ed - duration;
			}
			if(duration <= SECONDS_MONTHLY){
				tickWeight = 1;
			}else if(duration <= 2*SECONDS_MONTHLY){
				tickWeight = 2;
			}else if(duration <= 4*SECONDS_MONTHLY){
				tickWeight = 4;
			}else{
				tickWeight = 6;
			}
			st = ed - tickWeight * SECONDS_MONTHLY;
            for(var i = 0;i < qDate.info.length;++i){
                if(!qDate.info[i] || getDataTime(qDate.info[i]['dt'])<st*1000){
                    continue;
                }
				qDate.info[i]['pr'] = getPrFix(qDate.info[i]['pr'],2);
                if(diffArr.length === 0 || diffArr[diffArr.length - 1] != qDate.info[i]['pr']){
                    diffArr[diffArr.length] = qDate.info[i]['pr'];
                    if(searchArr.length > 0 ) {
                        searchArr[searchArr.length] = [getDataTime(qDate.info[i]['dt']),qDate.info[i-1]['pr'],getDataTime(qDate.info[i]['dt']),findIndex];
                        searchArr[searchArr.length] = [getDataTime(qDate.info[i]['dt']),qDate.info[i]['pr'],++findIndex];
                    }else{
                        searchArr[searchArr.length] = [getDataTime(qDate.info[i]['dt']),qDate.info[i]['pr'],getDataTime(qDate.info[i]['dt']),findIndex];
                    }
                }
                padData.push([getDataTime(qDate.info[i]['dt']),qDate.info[i]['pr']]);
                if(i == qDate.info.length - 1){
					var _tmpDate = getDataTime(qDate.info[i]['dt']);
					while( _tmpDate < ed*1000){
						_tmpDate += 86400000;
						padData.push([_tmpDate,qDate.info[i]['pr']]);
						if(searchArr.length > 0 ) {
							searchArr[searchArr.length] = [_tmpDate,qDate.info[i]['pr'],_tmpDate,findIndex];
							searchArr[searchArr.length] = [_tmpDate,qDate.info[i]['pr'],++findIndex];
						}else{
							searchArr[searchArr.length] = [getDataTime(qDate.info[i]['dt']),qDate.info[i]['pr'],getDataTime(qDate.info[i]['dt']),findIndex];
						}
					}
                    padData.push([( ed * 1000 + 86400000),qDate.info[i]['pr']]);
                    searchArr[searchArr.length] = [( ed * 1000 + 86400000),qDate.info[i]['pr'],findIndex];
                }
            }
	//		此处注释勿删除
	//		var MathMax = Math.max.apply(Math,diffArr);
    //     	var MathMin = Math.min.apply(Math,diffArr);
    //	    var tmpHr = MathMax > hpr ? MathMax : hpr ;
    //		var tmpLr = MathMin < lpr ? MathMin : lpr ;
			var tmpHr = Math.max.apply(Math,diffArr),
				tmpLr = Math.min.apply(Math,diffArr);
			var tick = [];
			var yaxisFix = (tmpHr-tmpLr)*0.2;
			var tickSize = 5 * tickWeight;
            for(var i=st;i<ed;i=(i +(86400 * tickSize))){
                tick.push(i*1000);
            }
            tick[tick.length] = tick[tick.length - 1] + ( 86400 * tickSize * 1000); 
			var configObj = {
                series: {
                    lines: {show: true, fillColor:"#f33e3e", lineWidth: 2},
                    points: {
                    	show: false,
                    	fillColor:"#f33e3e", 
                    	symbol:function(octx, x, y, radius){
                    		try{
                    			octx.arc(x, y, 3, 0, 2 * Math.PI);
                    		}catch(e){
                    			
                    		}
                    	}
                    },
                    bars: {lineWidth:5},
                    subline: true
                },
                xaxis: {
                    ticks : tick,
                    mode:"time",
                    tickSize : [tickSize ,'day'],
                    tickColor:'#eeeeee',
                    labelHeight: 36,
                    timeformat:"%m-%d",
                    min:st*1000,
					tickFormatter:function(v,axis){
                        if(v==axis.datamax){
                            v -= 86400000;
                        }
                        var d = new Date(v);
                        return (d.getMonth() + 1)+"-"+d.getDate();
                    }
                },
				yaxis:{
                    tickColor:'#eeeeee',
					max:tmpHr+yaxisFix,
					min:Math.max.apply(Math,[0,tmpLr-yaxisFix])
				},
                grid: {
                    hoverable: true,
                    clickable: true,
                    autoHighlight: false,
                    backgroundColor : '#ffffff',
                    borderColor: '#eeeeee',
                    color: '#929292',
                    minBorderMargin : 1,
                    markings: function(axes) {
                        var markings = [];
                        for(var x = Math.floor(axes.yaxis.min); x < axes.yaxis.max; x += (axes.yaxis.tickSize * 2))
                        markings.push({ yaxis: { from: x, to: x + axes.yaxis.tickSize }});
                        return markings;
                    }
                },
				haveCoordinate : true,
				haveMover : true,
				showLastPoint : true,
				showLowestPoint : false
            };
            if(diffArr.length < 2){
                configObj.yaxis = {
                    min : getPrFix( tmpLr*0.95),
                    max : getPrFix( tmpHr*1.05)
                }
            }
			var data = {
				data:padData,
				sArray:searchArr,
				hiPrice:tmpHr,
				loPrice:tmpLr,
				st:st,
				ed:ed,
				tick:tick,
				config:configObj
			};
			for(var i=0;i<$conObjs.length;++i){
				var $conObj = $conObjs.eq(i),
					searchResult = searchInTargets($conObj[0]),
					target = {obj:$conObj.empty(),data:data,redrawable:true,signList:[],sameFlag:null,plot:null};
				if(searchResult == null){
					drawer.targets.push(target);
				}else{
					searchResult = target;
				}
			}
			return data;
        };
        HistPriceDrawer.prototype.draw = function($conObjs,exConfObj){
			var targets,i;
			if($conObjs == HistPriceDrawer.DRAW_ALL){
				targets = drawer.targets;
			}else{
				targets = [];
				if(!($conObjs instanceof jQuery)){
					$conObjs = $($conObjs);
				}
				if($conObjs.length==0){
					console.log("无效选择器");
					return false;
				}
				for(i=0;i<$conObjs.length;++i){
					var $conObj = $conObjs.eq(i),
						searchResult = searchInTargets($conObj[0]);
					if(searchResult != null){
						targets.push(searchResult);
					}
				}
			}
			$.each(targets, function(i, target){
				var data = target.data;
				if(target.redrawable && data.data.length>0){
					var config = $.extend(true,{},data.config,exConfObj),
						container = target.obj,
						plot = $.plot(container,[{data:data.data, color:"#f33e3e"}],config);
					target.plot = plot;
					container.parent().find('#lastHeight').text('¥ ' + getPrFix(data.hiPrice));
					container.parent().find('#lastLow').text('¥ ' + getPrFix(data.loPrice));
					if(config.haveMover){
						initMoverDivs(container, plot.getPlotOffset());
						container.bind("plothover", function (event, pos, item) {
							//已隐藏时不触发
							if(!plot.getPlaceholder().is(':visible')){
								return false;
							}
							if(Math.round(pos.x1) < ((data.st*1000)) || pos.x1 >= (data.tick[data.tick.length-1] - 86400000/10)){
								return false;
							}
							if(item){
								moveDrow(target,item.datapoint[0], item.datapoint[1]);
							}else{
							   var index = findSarch(pos.x1,data.sArray);
							   if(index.length > 3){
									var _clientX = index[0];
									if(index[3] == 1){
										_clientX = Math.round(pos.x1);
										if(index[2] - index[0] == 86400000){
											_clientX = Math.round(pos.x1) - 60000000;
										}
									}
									if(pos.x1<index[0]){
										moveDrow(target, _clientX, -1);
									}else{
										moveDrow(target, _clientX,  index[1]);
									}
							   }else{
									moveDrow(target,Math.round(pos.x1), index[1]);
							   }
							}
						});
						container.mouseover(function (e){
							var id = $(e.target).attr('id');
							if(id==''){
								return false;
							}
							var clearPoint = setTimeout(function (){
								var xieInfo = container.find('#xieInfo');
								if(xieInfo.is(':visible')){
									xieInfo.hide();
									drawHight(plot,target.signList[1],false);
								}
							},300);
							return false;
						});
					}
					if(config.showLowestPoint){
						var datas = data.data,
							i = datas.length-2, 
							lowestDayData;
						while(i >= 0){
							if(Math.abs(datas[i][1] - data.loPrice) < 0.01){
								lowestDayData = datas[i];
								break;
							}
							--i;
						}
						moveDrow(target,lowestDayData[0], lowestDayData[1],true);
						insertLopriceHint(plot,lowestDayData,container);				
						if(config.haveMover){
							container.mouseover(function(e){
								removeLopriceHint(container);
								return false;
							});
						}
					}else if(config.showLastPoint){
						if(config.haveMover){
							var lastDayData = data.data[data.data.length-2];
							moveDrow(target,lastDayData[0],lastDayData[1]);							
						}else{
							drawHight(plot,data.data[data.data.length-2],true);
						}
					}
					target.redrawable = false;
				}
			});
            return false;
        };
		
		function getDayTime(date){
			return new Date(date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate()).getTime();
		}
		function pageX(elem){
			return elem.offsetParent?(elem.offsetLeft+pageX(elem.offsetParent)):elem.offsetLeft;
        }
		
        //初始化提示框
        function initMoverDivs(container, offset){
            var xieInfo = "<div id='xieInfo' class='hover-data' style='display: none;position:absolute;left:0;bottom:"+offset.bottom+"px;width:0px;height:0px;z-index: 100001;'>\
                                <div id='price' style='position:absolute;color:#fff;background-color:#f33e3e;font-size:12px;white-space:nowrap;height: 20px;padding:0 10px;line-height: 20px;-ms-transform:translateX(-50%);-webkit-transform:translateX(-50%);transform:translateX(-50%);'></div>\
                                <div id='arrowIcon' style='width:0px;height:0px;border-width:4px;border-color:#f33e3e transparent transparent;border-style:solid;position:absolute;left:-4px;'></div>\
                                <div id='dateTime' style='position:absolute;font-size:12px;top:-1px;display: block;white-space:nowrap;height: 20px;padding:0 6px;line-height: 20px;border:1px solid #f33e3e;background-color:rgba(255,255,255,0.8); color:#f33e3e;-ms-transform:translateX(-50%);-webkit-transform:translateX(-50%);transform:translateX(-50%);'></div>\
                            </div>";
            container.append(xieInfo);
        }
		
		//格式化价格数字
		function getPrFix(pri,precision){
			var _price = pri.toString();
			var _p = _price.indexOf('.');
			var pres = precision || 2;
			if(_p>-1){
				_p++;
				var fNums = [], end = Math.min(pres+_p,_price.length);
				while(_p<end){
					fNums.push(_price.substr(_p++,1));
				}
				while(fNums.length>0 && fNums[fNums.length-1]=="0"){
					fNums.pop();
				}
				if(fNums.length>0){
					_price = parseInt(_price) + '.' + fNums.join('');
				}else{
					_price = parseInt(_price) + '.0';
				}
			}
			return Number(_price);
		}

		function moveDrow(target,posX, price, noTip){
			signLists(target,Math.round(posX), price,  noTip);
			return false;
		};
		
		function signLists(target,clientX, price, noTip){
			var signList = target.signList,
				plot = target.plot;
			if(signList.length ==0){
				signList[0] = signList[1] = [clientX ,price];
				if(!noTip){
					moveTip(target, price, signList[1]);	
				}
				drawHight(plot,signList[1],true, noTip);
			}else{
				signList[1] = [clientX ,price];
				if(signList[0] && signList[1]){
					if(signList[0][0] !== signList[1][0]){
						moveTip(target,-1);
						drawHight(plot,signList[0],false, noTip);
						signList[0] = signList[1];
						moveTip(target, price, signList[1]);
						drawHight(plot,signList[1],true, noTip);
					}else{
						clearTimeout(target.sameFlag);
						target.sameFlag = setTimeout(function (){
							moveTip(target,-1);
							drawHight(plot,signList[1],false, noTip);
						},10000);
					}
				}else{
					signList[0] = signList[1];
					moveTip(target,-1);
					drawHight(plot,signList[1],false, noTip);
				}
			}
			return false;
		}
		
		function findSarch(x, searchAr){
			var _search = searchAr;
			var len = _search.length;
			if(len>1){
				var midd = Math.ceil(len/2);
				var middArr = _search[midd];
				if(x > middArr[0]){
					return findSarch(x, _search.slice(midd,len));
				}else{
					return findSarch(x, _search.slice(0,midd));
				}
			}else{
				 return _search[0];
			}
		}
		function drawHight(plot,dataPoint, flag, noSubline){
			var series = plot.getData()[0];
			series.color = "#f33e3e";
			if(flag){
				if(noSubline && series.subline){
					series.subline = false;
					plot.highlight(series, dataPoint);
					setTimeout(function(){
						series.subline = true;
					},300);
				}else{
					plot.highlight(series, dataPoint);
				}
			}else{
				plot.unhighlight(series, dataPoint);
			}
			return false;
		}
		function insertLopriceHint(plot,dataPoint,container){
			var s = plot.getData()[0],
				x = s.xaxis.p2c(dataPoint[0]),
				y = s.yaxis.p2c(dataPoint[1]),
				styleScript = $('#gwd_float_curve_lowest_price_hint'),
				hintDiv, hintWidth;
			if(styleScript.length == 0){
				$('body').append('<style id="gwd_float_curve_lowest_price_hint">\
									.mmz_placeholder #loprice_hint_holder {height:12px;line-height:12px;background-color:#f33e3e;padding:4px 8px;position:absolute;z-index:1000001;color:#ffffff; visibility:hidden;}\
									.mmz_placeholder #loprice_hint_holder .gwd_small_tail {width:0;height:0;position:absolute;top:20px;border-top:3px solid #f33e3e;}\
									.mmz_placeholder #loprice_hint_holder .gwd_small_tail.gwd_ns_left {left:0;border-right:5px solid transparent;}\
									.mmz_placeholder #loprice_hint_holder .gwd_small_tail.gwd_ns_right {right:0;border-left:5px solid transparent;}\
								</style>');
			}
			hintDiv = $('<div id="loprice_hint_holder"><div class="gwd_small_tail"></div>¥ '+getPrFix(dataPoint[1])+'</div>').appendTo(container);
			hintWidth = hintDiv[0].offsetWidth;
			if(x > plot.width() - hintWidth - 4){
				x = x - hintWidth + plot.getPlotOffset().left;
//				hintDiv.find('.gwd_small_tail').css('left',hintWidth-6);
				hintDiv.find('.gwd_small_tail').addClass('gwd_ns_right');
			}else{
				x += 2;
				hintDiv.find('.gwd_small_tail').addClass('gwd_ns_left');
			}
			hintDiv.css({'top':y - 28, 'left':x, 'visibility':'visible'});
		}
		function removeLopriceHint(container){
			container.find('#loprice_hint_holder').remove();
		}
		function moveTip(target,price, dataPoint){
			var container = target.obj;
			setTimeout(function (){
				if(price == -1){
					container.find('#xieInfo').hide();
				}else{
					var plot = target.plot;
					var hOffset = plot.height() - (((plot.getData()[0]).yaxis).p2c(dataPoint[1]));
					var date = new Date(dataPoint[0]);
					var xinif = container.find('#xieInfo');
					var priceCon = xinif.find('#price');
					var dateCon = xinif.find('#dateTime');
					var arrow = xinif.find('#arrowIcon');
					priceCon.text('¥ '+getPrFix(price));
					dateCon.text(date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate());
					priceCon.css('bottom',hOffset+10+'px');
					arrow.css('bottom',hOffset+1+'px');
					xinif.css('left',plot.pointOffset({x:dataPoint[0],y:dataPoint[1]}).left).show();
				}
			},50);
			return false;
		}
		function searchInTargets(node){
			var targets = drawer.targets,
				len = targets.length;
			for(var i=0;i<len;++i){
				var target = targets[i];
				if(target["obj"][0] ==  node){
					return target;
				}
			}
			return null;
		}
        HistPriceDrawer._initialized = true;
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
