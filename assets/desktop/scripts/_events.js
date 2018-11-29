// Upcoming events

(function() {

	if ($('.event', events).length > 1) {

		$('.slideshow-wrapper', events).addClass('swiper-wrapper');
		$('.event', events).addClass('swiper-slide');
		$('.thumbnail', events).each(function(){
			if ($(this).data('background')) $(this).addClass('swiper-lazy').append('<div class="loading swiper-lazy-preloader" />');
		});

		slideshows['events'] = new Swiper($('.slideshow', events), {
			loop: true,
			slidesPerView: 3,
			preloadImages: false,
			lazy: {
				loadPrevNext: true,
				loadOnTransitionStart: true
			},
			spaceBetween: 10,
			breakpoints: {
				960: {
					slidesPerView: 2
				},
				768: {
					slidesPerView: 1.2
				}
			},
			pagination: {
				el: $('.slideshow-pagination', events),
				clickable: true,
				bulletActiveClass: 'active',
				renderBullet: function (index, className) {
					return '<button class="' + className + '">' + (index + 1) + '</button>';
				}
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