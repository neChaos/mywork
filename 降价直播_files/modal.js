 ! function() {
     var $confirmModal = $('<div class="modal hide"><div class="modal-head fork"><h1>提示</h1><i class="icon"></i></div><div class="modal-body"><p>登录成功</p></div><div class="modal-foot"><div class="button-group cl"><button class="gray-button fl sure">确定</button><button class="gray-button fr concel">取消</button></div></div></div>');
     var $infoModal = $('<div class="modal hide"><div class = "modal-head fork" ><h1> 提示 </h1> <i class = "icon" > </i> </div> <div class = "modal-body" > <p> 登录成功 </p> </div > <div class = "modal-foot" ><button class = "red-button sure" > 确定 </button> </div > </div>');
     var $qrcode = $('<div class="modal hide" style="top:10%;" id="qrcode-modal"><div class = "modal-head fork" ><h1>分享到朋友圈</h1> <i class = "icon" > </i> </div> <div class = "modal-body" > <p id="qrcode">  </p> </div > <div class = "modal-foot" ><p>打开微信，点击底部的“发现”，使用 “扫一扫” 即可将网页分享到我的朋友圈</p></div > </div>');
     var $mask = $('<div class="modal-mask hide"></div>');
     var modals=$([$confirmModal,$infoModal,$qrcode,$mask]);
     modals.each(function(){
        $("body").append(this);
     })
     //在body上统一为所有的小叉监听事件，私下觉得这里小叉和取消是一个意思。
     $("body").on("click", ".modal i.icon", function() {
         var modal = $(this).closest(".modal");
         modal.find(".concel").trigger("click");
         hide.call(modal);
     })
     var hide = function() {
         this.hide();
         $mask.hide();
     }
     var show = function() {
         this.show();
         $mask.show();
     }
     var init = function(modal, obj) {
             //这里调用之前应该是让外面的函数把参数格式化想要的就ok了
             obj.h && modal.find(".modal-head h1").text(obj.h);
             obj.p && modal.find(".modal-body p").text(obj.p);
             obj.qrcode&&modal.find(".modal-body #qrcode").empty().qrcode({text:obj.qrcode,width:184,height:184});
             obj.sure && modal.find(".sure").text(obj.sure);
             obj.concel && modal.find(".concel").text(obj.concel);
             obj.sureCallback && modal.find(".sure").data("sure", obj.sureCallback);
             obj.concelCallback && modal.find(".concel").data("concel", obj.concelCallback);
             //弹出模态框.
             show.call(modal);
         }
    var clearCallback=function(){
        this.find(".sure").data("sure",null);
        this.find(".concel").data("concel",null);
    }
         //确定按钮
     $("body").on("click", ".modal .sure", function() {

         var $this = $(this);
         hide.call($this.closest(".modal"));
         var sureCallback = $this.data("sure");
         sureCallback && sureCallback();
         clearCallback.call($this.closest(".modal"));

     })
     $("body").on("click", ".modal .concel", function() {
         var $this = $(this);
         hide.call($this.closest(".modal"));
         var concelCallback = $this.data("concel");
         concelCallback && concelCallback();
         clearCallback.call($this.closest(".modal"));
     })

     //生成外部接口函数
     //obj{sureCallback:确定的回调函数,concelCallBack:取消的回调函数,p：正文内容,h：头部内容,sure：确定内容,concel：取消内容}
     window.Modal = {
         confirm: function(obj) {
             if ($.type(obj) == "string") {
                 obj = {
                     p: obj
                 };
             }
             init($confirmModal, obj);

         },
         info: function(obj) {
             if ($.type(obj) == "string") {
                 obj = {
                     p: obj
                 };
             }
             init($infoModal, obj);
         },
         qrcode:function(obj){
            if($.type(obj) == "string")
            {
                obj = {
                    qrcode:obj
                }
            }
            init($qrcode,obj);
         }
     }
 }();
