// Hotel Location maps

(function() {

	$.when(googleApiReady).done(function(){

		$('.hotel-location-map').each(function(){
			var mapCanvas = $(this),
				latLng = new google.maps.LatLng(siteSettings.lat, siteSettings.lng),
				content = '<div class="map-content"><h3>' + siteSettings.name + '</h3><p>' + siteSettings.adr + '<br>' + siteSettings.city + ', ' + siteSettings.state + '</p><p><a href="http://maps.google.com/maps?f=d&geocode=&daddr=' + siteSettings.lat + ',' + siteSettings.lng + '&z=15" target="_blank" class="button">Get directions</a></p></div>',
				markerImage = new google.maps.MarkerImage(templateURL + 'assets/desktop/images/hotel-pin.png', null, null, null, new google.maps.Size(40, 60)),
				mapOptions = {
					zoom: 12,
					center: latLng,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					scrollwheel: false
				},
				ib = new InfoBox({
					content: content,
					closeBoxURL: '',
					closeBoxMargin: 0,
					alignBottom: true,
					pixelOffset: new google.maps.Size(0, -65),
					setZIndex: -1
				});

			var map = new google.maps.Map(mapCanvas[0], mapOptions);

			var marker = new google.maps.Marker({
				position: latLng,
				map: map,
				icon: markerImage
			});

			if (!!mapCanvas.data('open-infowindow')) ib.open(map, marker);

			google.maps.event.addListener(marker, 'click', function() {
				ib.open(map, marker);
			});

			// CLOSE INFOWINDOW ON MAP CLICK

			google.maps.event.addListener(map, 'click', function () {
				ib.close();
			});
		});

	});

})();