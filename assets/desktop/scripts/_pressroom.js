// PRESS ROOM -> GALLERY

(function() {

	$('.view-gallery', '.pressroom-item').click(function (event) {

		initGallery({
			'data': pressroomJSON,
			'id': $(this).data('gallery-id')
		});

		event.preventDefault();
	});

	// PRESSROOM

	$('.pressroom').each(function(){

		var pressroom = $(this),
			pressroomItem = $('.pressroom-item', pressroom),
			categorySelector = $('button', pressroom);

		categorySelector.click(function() {

			var $this = $(this),
				categoryId = $this.data("category");

			pressroomItem.show();

			if(categoryId != 0){
				pressroomItem.not("[data-category*=" + categoryId + "]").hide();
			}
		});
	});

})();