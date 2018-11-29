function resolveGoogleMap() {
	$.when($.getScript('https://cdn.rawgit.com/googlemaps/v3-utility-library/master/infobox/src/infobox_packed.js')).done(function() {
		googleApiReady.resolve();

		$('.google-map').addClass('loaded');
	});
}

(function() {

	var googleMapContainers = $('.google-map'),
		googleMapContainersExist = false,
		googleMapLoading = false;

	$.each(googleMapContainers, function(index, value){
		if ($(this).length) googleMapContainersExist = true;
	});

	if (googleMapContainersExist){

		var windowObject = $(window),
			windowCurrentScroll = windowObject.scrollTop(),
			windowHeight = windowObject.height();

		windowObject.on('scroll.googlemaps init.googlemaps', function(){

			windowCurrentScroll = windowObject.scrollTop();
			windowHeight = windowObject.height();

			if (!googleMapLoading) {
				$.each(googleMapContainers, function(index, value){
					var element = $(this);
					if (element.length) {
						if (element.offset().top - element.outerHeight() < windowCurrentScroll + windowHeight) {
							googleMapLoading = true;
							return false;
						}
					}
				});
			} else {
				if (typeof google === 'object' && typeof google.maps === 'object') {
					resolveGoogleMap();
				} else {
					$.getScript('//maps.google.com/maps/api/js?key=' + googleApiKey + '&callback=resolveGoogleMap&libraries=geometry');
				}
				windowObject.off('scroll.googlemaps init.googlemaps');
			}

		}).trigger('init.googlemaps');
	}

})();