// GALLERIA INITIALIZATION

Galleria.addTheme({
	name: 'HeBS',
	version: 1.5,
	defaults: {
		autoplay: false,
		debug: false,
		fullscreenDoubleTap: false,
		imageCrop: false,
		imagePan: false,
		initialTransition: 'fade',
		layerFollow: false,
		maxScaleRatio: 1,
		preload: 3,
		queue: true,
		showCounter: false,
		thumbCrop: true,
		thumbQuality: 'auto',
		transition: 'fade',
		transitionSpeed: 300,
		trueFullscreen: false,
		videoPoster: false,
		popupLinks: true,
		youtube: {
			controls: 0,
			modestbranding: 1,
			color: 'red'
		}
	},
	init: function(options) {

		var gallery = this;

		gallery.bind('loadstart', function() {
			gallery.$('loader').fadeIn(200);
		});

		gallery.bind('loadfinish', function() {
			gallery.$('loader').fadeOut(200);
		});

	}
});

function initGallery(options) {

	var settings = $.extend({
			'data': null,
			'id': null,
			'jsonKey': null,
			'categories': false,
			'startingImage': 0
		}, options);

	if (!settings.data || !settings.id) return false;

	var rootObject = $('html'),
		galleryContainer = $('<div />', {'id': 'hebs-gallery'}),
		gallery = $('<div />', {'class': 'galleria'}),
		closeButton = $('<a />', {'class': 'close-button'}),
		photos,
		currentDataIndex = 0,
		categorySelector = $('<select />', {'class': 'category-selector'});

	if (settings.jsonKey) {
		$.each(settings.data[settings.jsonKey], function(index, value) {
			if (value.id == settings.id) {
				photos = value.images;
				currentDataIndex = index;
				return;
			}
		});
	} else {
		photos = settings.data[settings.id].images;
	}

	rootObject.addClass('selection-disabled');

	$('body').append(
		galleryContainer
			.append(gallery)
			.append(closeButton)
	);

	if(settings.categories == true && settings.jsonKey){

		$.each(settings.data[settings.jsonKey], function(index, value) { categorySelector.append($('<option />', {'value': index, 'text': value.name})) });

		if ($('option', categorySelector).length > 1) {
			categorySelector.val(currentDataIndex);
			categorySelector.appendTo(galleryContainer);
			processSelects();
		}

	}

	if (photos.length == 1) {
		galleryContainer.addClass('no-controls');
	}

	galleryContainer.fadeIn(200, function(){
		Galleria.run('#hebs-gallery .galleria', {dataSource: photos, show: settings.startingImage});
	});

	Galleria.ready(function(){
		var gallery = this;

		windowObject.on('orientationchange.galleryLightbox', function() {
			gallery.resize();

			setTimeout(function(){
				gallery.resize();
			}, 1000);
		});

		closeButton.click(function(){
			gallery.pause();
			galleryContainer.fadeOut(200, function(){
				gallery.destroy();
				windowObject.off('orientationchange.galleryLightbox');
				rootObject.removeClass('selection-disabled');
				$(this).remove();
			})
		});

		//KEYBOARD ARROWS CONTROL
		gallery.attachKeyboard({
			right: this.next,
			left: this.prev
		});

		if (settings.categories == true && settings.jsonKey){
			categorySelector.change(function(){
				var photos = settings.data[settings.jsonKey][$(this).val()].images;
				if (photos.length == 1) galleryContainer.addClass('no-controls');
				else galleryContainer.removeClass('no-controls');
				gallery.load(photos);

				setTimeout(function(){
					gallery.resize();
				}, 1000);
			});
		}

	});

}

// GALLERY

$(function() { // Document ready event

	if (typeof galleryJSON != 'undefined' && !$.isEmptyObject(galleryJSON)) {
		$(".gallery button").click(function() {

			initGallery({
				'data': galleryJSON,
				'id': $(this).data('gallery-id'),
				'jsonKey': $(this).data('gallery-json-key'),
				'categories': true,
				'startingImage': $(this).data('image-index') ? $(this).data('image-index') : 0
			});

			return false;
		});
	}

});