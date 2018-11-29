// Top images

(function() {

	if ($('.slide', photos).length > 1) {

		$('.slideshow-wrapper', photos).addClass('swiper-wrapper');
		$('.slide', photos).addClass('swiper-slide swiper-lazy').find('.loading').addClass('swiper-lazy-preloader');

		slideshows['photos'] = new Swiper($('.slideshow', photos), {
			loop:true,
			autoplay: {
				delay: 6000,
			},
			preloadImages: false,
			lazy: {
				loadPrevNext: true,
				loadOnTransitionStart: true
			},
			navigation: {
				prevEl: $('.slideshow-button.previous', photos),
				nextEl: $('.slideshow-button.next', photos)
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
	} else {
		windowObject.on('load', function(){
			$('.loading', photos).remove();
		});
	}

})();