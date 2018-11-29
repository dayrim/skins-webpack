// @codekit-prepend "libraries/_jquery.js", "libraries/_jquery.ui.js", "libraries/_cookie.js", "libraries/_json.js", "libraries/_what-input.min.js", "libraries/_validation.js", "libraries/_validation-en.js", "libraries/_hebs.bp.js", "libraries/_swiper.js", "libraries/_galleria.js", "_polyfills.js";

// @codekit-append "_common.js", "_booking.js", "_photos.js", "_promotiles.js", "_events.js", "_reviews.js", "_google-maps.js", "_maps.js", "_poi.js", "_galleries.js", "_pressroom.js", "_rooms.js", "_feeds.js", "_calendar.js";

'use strict';

// Objects cache / Global variables & settings

var windowObject = $(window),
	windowWidth = windowObject.width(),
	windowHeight = windowObject.height(),
	windowCurrentScroll = windowObject.scrollTop(),
	documentObject = $(document),
	rootObject = $('html'),
	bodyObject = $('body'),
	header = $('#header'),
	headerHeight = header.height(),
	headerMainMenu = $('.main-menu', header),
	booking = $('#booking'),
	photos = $('#photos'),
	promos = $('#promos'),
	mobileNavigation = $('#mobile-navigation'),
	mobileNavigationParent = $('li.parent', mobileNavigation),
	mobileNavigationTrigger = $('#mobile-navigation-trigger'),
	events = $('#events'),
	googleApiKey = 'AIzaSyCX9QcG_eeRKQbTdpOW-xqgXRiLZv7kP18',
	googleApiReady = $.Deferred(),
	reviews = $('.reviews-slideshow'),
	slideshows = {},
	keyboardNavigation = false,
	fadeOnScrollElements = $('.fade-on-scroll'),
	fadeOnScrollSupport = !isMobileDevice,
	transitionEndEvent = 'webkitTransitionEnd MSTransitionEnd oTransitionEnd otransitionend transitionend',
	currentScreen = '',
	isMobileDevice = navigator.userAgent ? navigator.userAgent.match(/(iphone|ipad|ipod|android|webos|blackberry|windows phone)/gi) : false;

// "Fix body height" function for mobile devices (prevents 100% height elements from resizing on scroll)

var fixBodyHeight = function(){
	if (!isMobileDevice) return;

	if (currentScreen == 'mobile' || currentScreen == 'tablet') {
		bodyObject.css('height', windowHeight);
	} else {
		bodyObject.removeAttr('style');
	}
};

// Window handlers

if(isMobileDevice) {
	rootObject.addClass('mobile-device');
}

windowObject.on('scroll.globalScrollHandler load.globalScrollHandler init.globalScrollHandler', function(){
	windowCurrentScroll = windowObject.scrollTop();

	requestAnimationFrame(function () {
		rootObject.toggleClass('booking-datepicker-under', windowCurrentScroll > (windowHeight - headerHeight - 380)); // 380 - is a random number that works good in our case

		if (fadeOnScrollSupport == true) {
			if (typeof checkVisibleElements == 'function') checkVisibleElements();
		}
	});
}).trigger('init.globalScrollHandler');

windowObject.on('resize.globalResizeHandler init.globalResizeHandler', function(){
	windowWidth = windowObject.width();
	windowHeight = windowObject.height();
	headerHeight = header.height();

	var newScreen;

	if (matchMedia('only screen and (max-width: 767px)').matches) newScreen = 'mobile';
	if (matchMedia('only screen and (min-width: 768px) and (max-width: 999px)').matches) newScreen = 'tablet';
	if (matchMedia('only screen and (min-width: 1000px)').matches) newScreen = 'desktop';

	if (newScreen != currentScreen) {
		currentScreen = newScreen;

		requestAnimationFrame(function () {
			rootObject.removeClass('mobile tablet desktop').addClass(currentScreen);

			fixBodyHeight();
		});
	}

}).trigger('init.globalResizeHandler');

windowObject.on('orientationchange.globalOrientationHandler', function() {
	fixBodyHeight();

	setTimeout(function(){
		fixBodyHeight();
	}, 500); // Wait for orientation change animation to complete (takes ~ 500ms)
});

// Fade on Scroll

var checkVisibleElements = function(){
	fadeOnScrollElements.each(function(){
		var element = $(this);

		if (element.offset().top + windowHeight / 10 < windowCurrentScroll + windowHeight) {
			if (!element.data('visible') && !element.data('delayedFadeActive')) {

				var delay = parseInt(element.data('delay'));
				if (delay) {
					element.data('delayedFadeActive', true);
					element.data('delayedFadeTimer', setTimeout(function(){
						element.addClass('visible').data('visible', true).data('delayedFadeActive', false);
					}, delay));
				} else {
					element.addClass('visible').data('visible', true);
				}

			}
		} else {
			clearTimeout(element.data('delayedFadeTimer'));
			element.removeClass('visible').data('visible', false).data('delayedFadeActive', false);
		}
	});
};
if (fadeOnScrollSupport == false) {
	fadeOnScrollElements.each(function(){
		$(this).removeClass('fade-on-scroll').removeData('delay');
	});
}

// Automated ADA Alt tags v1.2

function searchForText(ele, originalIMG) {
	var parent = ele.parent(),
		originalIMG = originalIMG || ele,
		randomNum = parseInt(Math.random() * 1000);
	//  if we cant find any related text
	if (!!parent.attr('id')) {
		var parentName = parent.attr('id').charAt(0).toUpperCase() + parent.attr('id').slice(1);
		$(originalIMG).attr('alt', siteSettings.name + ' ' + parentName + ' Section Image ' + randomNum);
		return false
	}
	if (originalIMG.parent().prop('tagName') == 'BODY') {
		$(originalIMG).attr('alt', 'Tracking Pixel ' + randomNum);
	} else if (ele.text().replace(/\s/g, '').length == '') {
		searchForText(parent, originalIMG);
	} else {
		$(originalIMG).attr('alt', ele.text().trim().replace(/\n.*/g, '').split(/\. |\! |\? /)[0]);
	}
}

windowObject.on('load', function () {
	$('body img').each(function (i, v) {
		var img = $(this);
		if (!img.attr('alt')) {
			searchForText(img);
		}
	});
});

// ADA Skip to Content

var skipToContentButton = $('#skip-to-content');

if (skipToContentButton.length) {
	var skipToTarget = $('#content').length ? $('#content') :  photos.next(['id']);

	skipToContentButton.attr('href', '#' + skipToTarget.attr('id'));
	skipToTarget.attr('tabindex', '-1');

	skipToContentButton.on('click', function(event){
		$('html, body').stop().animate({scrollTop: $(skipToContentButton.attr('href')).offset().top - headerHeight}, 400);

		skipToTarget.focus();
		event.preventDefault();
	});
}

// Main menu keyboard navigation

$('> ul > li', headerMainMenu).on('mouseenter', function(){
	$(this).siblings().addBack().removeClass('expanded');
	documentObject.off('mousedown.headerMainMenu');
}).children('a').on('focus', function () {
	
	if (keyboardNavigation) {
		$(this).parents('li').addClass('expanded').siblings().removeClass('expanded');

		documentObject.on('mousedown.headerMainMenu', function () {
			$('.expanded', headerMainMenu).removeClass('expanded');
			documentObject.off('mousedown.headerMainMenu');
		});
	}
});


// Main menu (mobile navigation)

mobileNavigationTrigger.on('click', function(){
	rootObject.toggleClass('mobile-navigation-visible');
});

var mobileNavigationExpandSubmenu = function(target){
	target.addClass('expanded').siblings().each(function(){
		mobileNavigationCollapseSubmenu($(this));
	});
};

var mobileNavigationCollapseSubmenu = function(target){
	target.removeClass('expanded').find('.expanded').removeClass('expanded');
};

mobileNavigationParent.each(function(){
	var target = $(this);

	$('> .plus', target).on('click', function(event){
		if (target.hasClass('expanded')) {
			mobileNavigationCollapseSubmenu(target);
		} else {
			mobileNavigationExpandSubmenu(target);
		}

		event.preventDefault();
	});
});

// Scroll To Explore

$('.scroll-to-explore', photos).click(function (event) {
	event.preventDefault();
	$('html, body').stop().animate({scrollTop: photos.height() - headerHeight}, 400);
});