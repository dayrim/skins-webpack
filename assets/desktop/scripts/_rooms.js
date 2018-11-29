// ROOMS SCRIPTS

(function(window, $) {

	'use strict';

	// TEMPLATE 1

	$('.rooms').each(function(){

		var roomsWidget = $(this),
			roomsCategories = $('.category-selector', roomsWidget),
			roomsCategory = $('button', roomsCategories),
			roomsDescriptions = $('.categories-descr', roomsWidget),
			roomsDescription = $('.category-descr', roomsDescriptions),
			roomsEntry = $('.rooms-entry', roomsWidget);

		roomsEntry.each(function(){

			var thisRoom = $(this);

			roomsCategory.click(function(){

				var thisCategory = $(this),
					thisCategoryId = thisCategory.data('category');

				var currentDescription = roomsDescription.filter(function( index ) {
					return $(this).data('category') === thisCategoryId;
				});

				roomsDescription.removeClass('active');
				currentDescription.addClass('active');

				if( thisCategoryId == "0" ){
					roomsEntry.removeClass('hide');
				} else {
					$.each( roomsEntry, function(){
						$(this).toggleClass('hide', ($(this).data('category')+"").split(',').indexOf(thisCategoryId + "") < 0);
					});
				}

				return false;
			});

			$('.toggle', thisRoom).click(function() {
				$('.amenities', thisRoom).toggleClass('expand');
				return false;
			});

			$(window).on("load resize",function(){

				$.each($('.rooms .amenities'), function(){
					$(this).toggleClass("multiline", $('.main-list .rooms-icon', this).length * $('.main-list .rooms-icon', this).width() > $(this).width());
				});
			});

			$(".rooms-item-gallery", thisRoom).click(function() {
				initGallery({
					'data': roomsJSON,
					'id': $(this).data('gallery-id'),
					'categories': false,
					'startingImage': $(this).data('image-index') ? $(this).data('image-index') : 0
				});

				return false;
			});
		});

	});

	// TEMPLATE 2

	//if($('.rooms').length > 0){
	//
	//	$('.rooms .expand-collapse, .rooms .full-description .close').click(function(e){
	//		e.preventDefault();
	//
	//		$(this).parents('.rooms-entry').find('.expand-collapse').toggleClass('expand collapse');
	//
	//		$(this).parents('.rooms-entry').find('.full-description').toggleClass('show');
	//	});
	//
	//	$('.rooms .categories-list').click(function(){
	//		$(this).toggleClass('active');
	//	});
	//
	//	$('.rooms .categories-list button').click(function(){
	//		$('.rooms .categories-list button').removeClass('active');
	//		$(this).addClass('active');
	//		$('.rooms .categories-list').removeClass('active');
	//	});
	//
	//	if (typeof roomsJSON != 'undefined' && !$.isEmptyObject(roomsJSON)) {
	//		$.each(roomsJSON, function() {
	//			for (var length = this.images.length, index = 0; index < length; index++) {
	//				this.images[index].image = this.images[index].full;
	//				this.images[index].description = this.images[index].caption;
	//			}
	//		});
	//
	//		$(".rooms-item-gallery").click(function() {
	//			initGallery({
	//				'data': roomsJSON,
	//				'id': $(this).data('gallery-id'),
	//				'categories': false,
	//				'startingImage': $(this).data('image-index') ? $(this).data('image-index') : 0
	//			});
	//
	//			return false;
	//		});
	//	}
	//
	//	$('.rooms').each(function( index ) {
	//
	//		var widget = $(this),
	//			widgetCategories = $('.categories-list', widget),
	//			widgetCategory = $('button', widgetCategories),
	//			widgetListEntry = $('.rooms-entry', widget);
	//
	//		widgetCategory.click(function(){
	//
	//			var $this = $(this);
	//
	//			widgetCategory.removeClass('active');
	//			$this.addClass('active');
	//
	//			if( $this.data('category') == "0" ){
	//				widgetListEntry.removeClass('hide');
	//			} else {
	//				var currentCategory = $this.data('category');
	//				$.each( widgetListEntry, function(){
	//					$(this).toggleClass('hide', ($(this).data('category')+"").split(',').indexOf(currentCategory + "") < 0);
	//				});
	//			}
	//
	//			return false;
	//		});
	//	});
	//
	//}

})(window, jQuery);