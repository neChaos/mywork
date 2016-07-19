;(function(){
		var category = 'buyfrommmz';
		$(document).on('click','a',function(e){
			var bk = $(this).parents('[bk]').attr('bk');
			ga('send', {
				hitType: 'event',
				eventCategory: category,
				eventAction: 'click',
				eventLabel: bk
			});
		});
})();
