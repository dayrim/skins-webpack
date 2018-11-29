// Reviews

(function() {

	if ($('.slide', reviews).length > 1) {

		$('.slideshow-wrapper', reviews).addClass('swiper-wrapper');
		$('.slide', reviews).addClass('swiper-slide');

		slideshows['reviews'] = new Swiper( $('.slideshow', reviews), {
			loop:true,
			slidesPerView:'auto',
			navigation: {
				prevEl: $('.slideshow-button.previous', reviews),
				nextEl: $('.slideshow-button.next', reviews)
			},
			on: {
				init: function(){
					var swiper = this;
					disableKeyboardNavigation(swiper.wrapperEl);
					$('.swiper-slide-active', swiper.wrapperEl).nextAll().addBack().slice(0, swiper.params.slidesPerView).each(function(){
						restoreKeyboardNavigation(this, true);
					});
				},
				slideChangeTransitionStart: function(){
					var swiper = this;
					disableKeyboardNavigation(swiper.wrapperEl);
				},
				slideChangeTransitionEnd: function(){
					var swiper = this;
					$('.swiper-slide-active', swiper.wrapperEl).nextAll().addBack().slice(0, swiper.params.slidesPerView).each(function(){
						restoreKeyboardNavigation(this, true);
					});
				}
			}
		});

	}

})();