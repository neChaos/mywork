;(function(){
		var loadPricetrend = function(option){
			var options = {
				pcinfo : '',
				wrap : '.pricetrend',
				confObj : {
					haveCoordinate:true,
					haveMover : true,
					showLastPoint : true,
					showLowestPoint :false
				}
			}
			$.extend(true,options,option);

			if(!options.pcinfo) return false;
			var placeholder = $(options.wrap);
			placeholder.html('');
			placeholder.append('\
				<div class="chrome-price gwd_toolbar_assist_popbox">\
				<div class="content-pane">\
				<div class="chart placeholder"></div>\
				<div class="rightWord">\
				<div class="high">\
				<div>最高价</div>\
				<div id="lastHeight"></div>\
				</div>\
				<div class="low">\
				<div>最低价</div>\
				<div id="lastLow"></div>\
				</div>\
				</div>\
				</div>\
				</div>');

			var histPriceDrawer = new HistPriceDrawer();
			var drawtarget = placeholder.find('.placeholder');
			histPriceDrawer.addData(options.pcinfo,drawtarget);
			histPriceDrawer.draw(drawtarget,options.confObj);
		}
		
		//加载商品列表
		var loadLiveGoods = {
			api : '/api/pricelive_list?',
			jumpUrl : 'http://www.henzanapp.com/jump/?',
			offset : 0,
			limit : 10,
			mid : 0,
			cid : 0,
			data : [],
			loading : $('#goodsListLoading'),
			isLoading : true,
			cacheData : {},
			lastData : false,
			mallList : {
				3 : '京东',
				17532 : '苏宁',
				81 : '当当',
				4 : '亚马逊',
				133 : '一号店',
				17533 : '国美',
				138 : '银泰'
			},
			init : function(){
				this.loadData();
				this.scrollEvent();
				this.filterEvent();
			},
			loadData : function(isClear){
				var api = this.api+'offset='+this.offset+'&limit='+this.limit+'&mid='+this.mid+'&cid='+this.cid;
				var that = this;
				var cacheData = this.cacheData;
				this.loading.show();
				this.isLoading = true;
				this.date = [];
				if(!cacheData[api]){
					$.get(api,function(data){
						if(data.length < 1) that.lastData = true;
						that.data = data;
						that.setHtml(isClear);
						cacheData[api] = data;
					},'json');
				}else{
					this.data = cacheData[api];
					that.setHtml(isClear);
				}
			},
			setHtml : function(isClear){
				var data = this.data;
				var len = data.length;
				var html = '';
				var mall = this.mallList;
				var t = '',pcinfo;
				var areaStr1,areaStr2;
				if(isClear) $('#goodsList').html('');
				if(len > 0){
					for(var i=0;i<len;i++){
						var curData = $('#goodsList').find('[lid='+data[i].id+']');
						var titleLen =  data[i].prod_name.length;
						var isPicUrl = /http(s)?:\/\//.test(data[i].prod_pic);
						if(curData.length == 0 && data[i].data && data[i].data.pcinfo && titleLen >= 10 && isPicUrl){
							pcinfo = {};
							t = this.formatTime(data[i].update_time);
							url = this.jumpUrl + 'gid='+data[i].prod_id + '&url=' + data[i].prod_url;
							areaStr1 = areaStr2 = '';
							if(data[i].area_limit){
								areaStr1 = '限地区：';
								areaStr2 = '<p class="area">限'+data[i].area_limit+'地区</p>';
							}
							html = '<li class="item cl" lid="'+data[i].id+'" ut="'+data[i].update_time+'">\
								   <span class="time fl">'+t+'</span>\
								   <div class="desc fl">\
								   <p class="title"><a href="'+url+'" target="_blank">'+areaStr1+data[i].prod_name+'</a></p>\
								   <div class="price">\
								   <span class="low">'+data[i].prod_price_txt+'</span>\
								   <span class="tag">'+data[i].prod_price_txt1+'</span>\
								   <span class="high">'+data[i].prod_price_txt2+'</span>\
								   </div>'
								   +areaStr2+
								   '<div class="pricetrend" id="pricetrend'+data[i].id+'"></div>\
								   </div>\
								   <div class="info fr">\
								   <a href="'+url+'" target="_blank" class="pic"><img src="'+data[i].prod_pic+'" alt="" /></a>\
								   <a href="'+url+'" target="_blank" class="btn">\
								   <span>'+mall[data[i].shop_id]+'</span>\
								   <span>立即购买</span>\
								   </a>\
								   </div>\
								   </li>';
							$('#goodsList').append(html);
							pcinfo = this.filterPcinfo(data[i].data.pcinfo,data[i].update_time,data[i].prod_price);
							loadPricetrend({pcinfo :data[i].data.pcinfo, wrap:'#pricetrend'+data[i].id})
						}
					}
				}else{
					if($('#goodsList .nodata').length < 1){
						html = '<li class="item nodata">没有找到更多降价的商品～</li>';
						$('#goodsList').append(html);
					}
				}
				this.loading.hide();
				this.isLoading = false;
				this.checkNotice();
			},
			scrollEvent : function(){
				var that = this;
				var scrollTop;
				var docHeight;
				var winHeight;
				$(window).scroll(function(){
					scrollTop = $(window).scrollTop();
					docHeight = $(document).height();
					winHeight = $(window).height();
					if(scrollTop == docHeight - winHeight && !that.isLoading && !that.lastData){
						that.offset += that.limit;
						that.loadData();
					}
				});
			},
			filterEvent : function(){
				var that = this;
				$('#filterCate').on('click','a',function(){
					that.cid = $(this).attr('cid');
					that.mid = that.offset = 0;
					$(this).addClass('cur').siblings().removeClass('cur');
					that.loadData(true);
					that.lastData = false;
					return false;
				});
				$('#filterMall').on('click','a',function(){
					that.mid = $(this).attr('mid');
					that.cid = that.offset =  0;
					$(this).addClass('cur').siblings().removeClass('cur');
					that.loadData(true);
					that.lastData = false;
					return false;
				});

				$('#filterTab').on('click','span',function(){
					var ty = $(this).attr('ty');
					$(this).addClass('cur').siblings().removeClass('cur');
					$('#filterWrap .filter').hide();
					if(ty == 'cate'){
						$('#filterCate').show();
					}else if(ty == 'mall'){
						$('#filterMall').show();
					}
					$('#filterWrap .cur').removeClass('cur');
					that.cid = that.mid = that.offset = 0;
					that.loadData(true);
					that.lastData = false;
				});

			},
			checkNotice : function(){
				var that = this;
				setTimeout(function(){
					//var ts = Date.parse(new Date()) / 1000;
					var ts = $('#goodsList').find('.item').eq(0).attr('ut');
					ts = ts.replace(/-/g,'/');
					var api = '/api/pricelive_count/?ts='+new Date(ts).getTime();
					$.get(api,function(data){
						if(data && data.count > 0){
							$('#liveNotice #goodsCount').text(data.count);
							$('#liveNotice').slideDown();
						}
						that.checkNotice();
					},'json');
				},120*1000);
			},
			formatTime : function(t){
				var time = (new Date(t.replace(/-/g,'/'))).getTime() / 1000;
				var date = new Date(serviceTime);
				var now = date.getTime() / 1000;
				var year = date.getFullYear();
				var month = date.getMonth() + 1;
				var day = date.getDate();
				var today = (new Date(year + '/'+month + '/' + day)).getTime() / 1000;
				var t = 0;
				var timeStr = '';
				if(time >= today ){//今天
					t = now - time;
					if(t>0 && t<60){ //小于1分钟
						timeStr = t + '秒前';
					}else if(t>=60 && t<60*60){//大于等于1分钟，小于1小时
						timeStr = Math.floor(t/60) + '分钟前';
					}else if(t>=60*60 && t<60*60*24){//大于等于1小时，小于1天
						var h = Math.floor(t/(60*60)); 
						//var m = Math.floor((t - h*60*60)/60);
						//m = m < 10 ? '0' + m : m;
						//timeStr = h + ':'+m;
						timeStr = h + '小时前';
					}else{
						timeStr = '刚刚';
					}
				}else{
					t = Math.floor((today - time) / 86400);
					switch(t){
						case 0 :
							timeStr = '昨天';
							break;
						case 1 :
							timeStr = '前天';
							break;
						default :
							timeStr = '3天前';
					}
				}
				return timeStr;
			},
			filterPcinfo : function(pcinfo,t,lastPrice){
				var info = pcinfo.info;
				var newInfo = [];
				var len = info.length;
				var dt = '';
				if(len > 0){
					for(var i=0;i<len;i++){
						dt = new Date(info[i].dt).getTime();
						t = t.replace(/-/g,'/');
						if(dt <= new Date(t).getTime()){
							newInfo.push(info[i]);
						}
					}

					pcinfo.ed = t;
					newInfo.pop();
					newInfo.push({dt:pcinfo.ed,pr:lastPrice});
					pcinfo.info = newInfo;
				}
				return pcinfo;
			}
		}
		loadLiveGoods.init();

})();

//go top
$(function(){
	var st = $(window).scrollTop();
	var wh = $(window).height();
	$(window).scroll(function(){
		st = $(window).scrollTop();
		if(st > wh){
			$('#priceLiveGoTop').show();
		}else{
			$('#priceLiveGoTop').hide();
		}
	});	

	$('#priceLiveGoTop').on('click',function(){
		$(window).scrollTop(0);
	});
});
