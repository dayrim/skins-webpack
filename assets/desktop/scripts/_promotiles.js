// Promo tiles

(function() {

	if ($('.promo', promos).length > 1) {

		$('.slideshow-wrapper', promos).addClass('swiper-wrapper');
		$('.promo', promos).addClass('swiper-slide');
		$('.thumbnail', promos).each(function(){
			$(this).addClass('swiper-lazy').append('<div class="loading swiper-lazy-preloader" />');
		});

		slideshows['promos'] = new Swiper($('.slideshow', promos), {
			loop: true,
			slidesPerView: 3,
			preloadImages: false,
			lazy: {
				loadPrevNext: true,
				loadOnTransitionStart: true
			},
			breakpoints: {
				960: {
					slidesPerView: 2
				},
				768: {
					slidesPerView: 1.2
				}
			},
			pagination: {
				el: $('.slideshow-pagination', promos),
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

	// Promotiles frequencies

	// var frequencies_json={},
	// 	currentPromo = [];
	//
	// $(document).ready(function(){
	// 	function setNewPromo(id, key){
	// 		localStorage[key] = id + "," + "1";
	// 		$("#promotile-"+id).show();
	// 	}
	// 	if (window.localStorage) {
	// 		$.each(frequencies_json, function(i, v){
	// 			var key = 'area_'+i;
	// 			if(localStorage[key]){
	// 				currentPromo = localStorage[key].split(",");
	// 				if(isNaN(currentPromo[0]) || isNaN(currentPromo[1]) || frequencies_json[i][currentPromo[0]] == undefined){
	// 					setNewPromo(frequencies_json[i]["first"], key);
	// 					return;
	// 				}
	// 				if(frequencies_json[i][currentPromo[0]]["frequency"]){
	// 					if(frequencies_json[i][currentPromo[0]]["frequency"] > currentPromo[1]){
	// 						$("#promotile-"+currentPromo[0]).show();
	// 						currentPromo[1]++;
	// 						localStorage[key] = currentPromo[0] + "," + currentPromo[1];
	// 					}else{
	// 						setNewPromo(frequencies_json[i][currentPromo[0]]["next_id"], key);
	// 					}
	// 				}else{
	// 					setNewPromo(frequencies_json[i]["first"], key);
	// 				}
	// 			}else{
	// 				setNewPromo(frequencies_json[i]["first"], key);
	// 			}
	// 		});
	// 	}else{
	// 		$('.fr-promo:first-child').show();
	// 	}
	// });

})();