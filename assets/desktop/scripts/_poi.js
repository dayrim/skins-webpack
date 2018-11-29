(function() {

	$.when(googleApiReady).done(function () {

		var poiInstances = $('.poi'),
			mapStyles = [];

		$.each(poiInstances, function () {

			var poi = $(this),
				poiJSON_ID = poi.data('poi-id'),
				poiMap = $('.poi-map', poi);

			if (poiMap.length) {

				var latLng = new google.maps.LatLng(siteSettings.lat, siteSettings.lng),
					mapOptions = {
						zoom: 10,
						center: latLng,
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						mapTypeControl: false,
						scrollwheel: false,
						styles: mapStyles,
						backgroundColor: 'none',
						disableDefaultUI: true
					},
					markers = [],
					mapEl = poiMap[0],
					gmap = new google.maps.Map(mapEl, mapOptions),
					lastMarker,
					ib = new InfoBox({
						content: '',
						closeBoxURL: '',
						closeBoxMargin: 0,
						alignBottom: true,
						pixelOffset: new google.maps.Size(0, -65),
						setZIndex: -1
					}),
					activeCattegoryIndex = $('.category-selector .active', poi).data('poi-category-index') || 0;

				var removeAllMarkers = function (map) {
					for (var i = 0; i < markers.length; i++) {
						markers[i].setMap(map);
					}
					markers = [];
				};

				var drawPointsOnMap = function () {
					removeAllMarkers(null);
					ib.close();

					markers = [];

					var bounds = new google.maps.LatLngBounds();

					// Hotels

					$.each(poiJSON[poiJSON_ID].hotels, function (index, hotel) {

						if (!hotel.lat || !hotel.lng) return;

						var marker = new google.maps.Marker({
							name: hotel.name,
							position: new google.maps.LatLng(parseFloat(hotel.lat), parseFloat(hotel.lng)),
							icon: new google.maps.MarkerImage(templateURL + 'assets/desktop/images/hotel-pin.png', null, null, null, new google.maps.Size(40, 60)),
							content: '<div class="map-content">' +
										'<h3>' + hotel.name + '</h3>' +
										'<p>' + hotel.address + ', ' + hotel.state + ' ' + hotel.zip + '</p>' +
										(hotel.phone ? '<p>Phone: <a href="tel:' + hotel.phone + '">' + hotel.phone + '</a></p>' : '') +
										'<a href="http://maps.google.com/maps?f=d&geocode=&daddr=' + hotel.lat + ',' + hotel.lng + '&z=15" target="_blank" class="button">Get Directions</a>' +
									'</div>',
							map: gmap,
							zIndex: 10,
							initialZIndex: 10,
							state: ''
						});

						markers.push(marker);

						bounds.extend(marker.position);
					});

					// Points

					$.each(poiJSON[poiJSON_ID].categories[activeCattegoryIndex].points, function (index, point) {

						var marker = new google.maps.Marker({
							id: point.id,
							position: new google.maps.LatLng(parseFloat(point.lat), parseFloat(point.lng)),
							icon: new google.maps.MarkerImage(templateURL + 'assets/desktop/images/poi/' + point.pin_slug + '.png', null, null, null, new google.maps.Size(29, 40)),
							content: '<div class="map-content">' +
										'<h3>' + point.name + '</h3>' +
										(point.descr ? '<p>' + point.descr + '</p>' : '') +
										(point.address ? '<p>' + point.address + '</p>' : '') +
										(point.phone ? '<p>Phone: <a href="tel:' + point.phone + '">' + point.phone + '</a></p>' : '') +
										(point.link ? '<p><a href="' + point.link + '" target="_blank">' + (point.url_name ? point.url_name : 'Visit Website') + '</a></p>' : '') +
										'<a href="http://maps.google.com/maps?f=d&geocode=&daddr=' + point.lat + ',' + point.lng + '&z=15" target="_blank" class="button">Get Directions</a>' +
									'</div>',
							map: gmap,
							category: point.category_id,
							distance: point.distance,
							lat: point.lat,
							lng: point.lng,
							zIndex: 1,
							initialZIndex: 1,
							state: ''
						});

						markers.push(marker);

						bounds.extend(marker.position);
					});

					// Clicks

					$.each(markers, function(index, marker){
						google.maps.event.addListener(marker, "click", function () {
							if (lastMarker == marker && ib.getMap()) {
								marker.setOptions({zIndex: marker.initialZIndex});
								ib.close();
							} else {
								if (lastMarker) {
									lastMarker.setOptions({zIndex: lastMarker.initialZIndex});
								}

								marker.setOptions({zIndex: 15});
								ib.setContent(marker.content);
								ib.open(gmap, marker);
							}

							lastMarker = marker;
						});
					});

					fitBoundsWithPadding(bounds);
				};

				// CLOSE INFOWINDOW ON MAP CLICK

				google.maps.event.addListener(gmap, 'click', function () {
					ib.close();
					if (lastMarker) {
						lastMarker.setOptions({zIndex: lastMarker.initialZIndex});
					}
				});

				// Initial points

				google.maps.event.addListenerOnce(gmap, "projection_changed", function(){
					drawPointsOnMap();
				});

				// Upgraded fitbounds function

				function fitBoundsWithPadding(bounds, paddings) { // Modified version of this solution - https://stackoverflow.com/a/43761322, paddings: {top: 0, right: 0, bottom: 0, left: 0}
					var projection = gmap.getProjection();

					if (projection) {
						var paddings = $.extend({top: 0, right: 0, bottom: 0, left: 0}, paddings),
							bounds = new google.maps.LatLngBounds(bounds.getSouthWest(), bounds.getNorthEast());

						if (bounds.getNorthEast().equals(bounds.getSouthWest())) {

							var point1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.006, bounds.getNorthEast().lng() + 0.006),
								point2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.006, bounds.getNorthEast().lng() - 0.006);

							bounds.extend(point1);
							bounds.extend(point2);

						} else if (paddings.top || paddings.right || paddings.bottom ||paddings.left) {

							if (paddings.bottom || paddings.left) {
								gmap.fitBounds(bounds);

								var point1 = projection.fromLatLngToPoint(bounds.getSouthWest()),
									point2 = new google.maps.Point(paddings.left / Math.pow(2, gmap.getZoom()) || 0, paddings.bottom / Math.pow(2, gmap.getZoom()) || 0),
									newPoint = projection.fromPointToLatLng(new google.maps.Point(point1.x - point2.x, point1.y + point2.y));

								bounds.extend(newPoint);
							}

							if (paddings.top || paddings.right) {
								gmap.fitBounds(bounds);

								point1 = projection.fromLatLngToPoint(bounds.getNorthEast());
								point2 = new google.maps.Point(paddings.right / Math.pow(2, gmap.getZoom()) || 0, paddings.top / Math.pow(2, gmap.getZoom()) || 0);
								newPoint = projection.fromPointToLatLng(new google.maps.Point(point1.x + point2.x, point1.y - point2.y));

								bounds.extend(newPoint);
							}

						}

						gmap.fitBounds(bounds);
					}
				}

				// CATEGORY SELECTOR

				var categorySelector = $('.category-selector', poi),
					categorySelectorButtons = $('.button', categorySelector);

				categorySelectorButtons.click(function (e) {
					e.preventDefault();

					if (activeCattegoryIndex == $(this).data('poi-category-index')) return;

					activeCattegoryIndex = $(this).data('poi-category-index');

					drawPointsOnMap();
				});

				// Zoom

				var zoomButtons = $('.poi-zoom button', poi);

				zoomButtons.on('click', function(){
					var button = $(this),
						currentZoomLevel = gmap.getZoom();

					if (button.hasClass('zoom-out')) {
						if (currentZoomLevel != 0) {
							gmap.setZoom(currentZoomLevel - 1);
						}
					} else {
						if (currentZoomLevel != 21) {
							gmap.setZoom(currentZoomLevel + 1);
						}
					}
				})

			}

		});

	});

})();