(function() {

	var bookingDatepicker = {
		container: $("#booking-datepicker"),
		dateFormat: $.datepicker._defaults.dateFormat,
		dates: [null, null],
		inputs: {
			checkin: $('#booking-checkin'),
			checkout: $('#booking-checkout'),
			dates: $('#booking-dates')
		},
		steps: {
			checkinStep: 'checkin-step',
			checkoutStep: 'checkout-step',
			currentStep: 'checkin-step'
		},
		buttons: {}
	};

	processCheckinCheckoutInputs(bookingDatepicker.inputs.checkin, bookingDatepicker.inputs.checkout, true);

	bookingDatepicker.inputs.dates.val(bookingDatepicker.inputs.checkin.val() + ' - ' + bookingDatepicker.inputs.checkout.val());
	bookingDatepicker.dates[0] = $.datepicker.parseDate(bookingDatepicker.dateFormat, bookingDatepicker.inputs.checkin.val()).getTime();
	bookingDatepicker.dates[1] = $.datepicker.parseDate(bookingDatepicker.dateFormat, bookingDatepicker.inputs.checkout.val()).getTime();

	var setBookingDatepickerDates = function(step) {
		$.each(bookingDatepicker.inputs, function () {
			$(this).val('');
		});

		if (bookingDatepicker.dates[0] != null && step == 'checkin'){ // First step, checkin is selected

			bookingDatepicker.inputs.checkin.val($.datepicker.formatDate(bookingDatepicker.dateFormat, $.datepicker.parseDate('@', bookingDatepicker.dates[0])));
			bookingDatepicker.inputs.dates.val(bookingDatepicker.inputs.checkin.val() + ' - ');

		} else if (bookingDatepicker.dates[0] != null && bookingDatepicker.dates[1] != null) { // Second step, checkin and chechout are selected

			bookingDatepicker.inputs.checkin.val($.datepicker.formatDate(bookingDatepicker.dateFormat, $.datepicker.parseDate('@', bookingDatepicker.dates[0]))).trigger('change');
			bookingDatepicker.inputs.checkout.val($.datepicker.formatDate(bookingDatepicker.dateFormat, $.datepicker.parseDate('@', bookingDatepicker.dates[1]))).trigger('change');
			bookingDatepicker.inputs.dates.val(bookingDatepicker.inputs.checkin.val() + ' - ' + bookingDatepicker.inputs.checkout.val()).trigger('change');

		} else if (bookingDatepicker.dates[0] != null && bookingDatepicker.dates[1] == null) { // In case user will close the datepicker before selecting the checkout date

			var checkoutDate = bookingDatepicker.container.datepicker('getDate', '+1d');

			checkoutDate.setDate(checkoutDate.getDate() + 1);
			bookingDatepicker.dates[1] = $.datepicker.parseDate(bookingDatepicker.dateFormat, $.datepicker.formatDate(bookingDatepicker.dateFormat, checkoutDate)).getTime();

			bookingDatepicker.container.datepicker('refresh');

			bookingDatepicker.inputs.checkin.val($.datepicker.formatDate(bookingDatepicker.dateFormat, $.datepicker.parseDate('@', bookingDatepicker.dates[0]))).trigger('change');
			bookingDatepicker.inputs.checkout.val($.datepicker.formatDate(bookingDatepicker.dateFormat, $.datepicker.parseDate('@', bookingDatepicker.dates[1]))).trigger('change');
			bookingDatepicker.inputs.dates.val(bookingDatepicker.inputs.checkin.val() + ' - ' + bookingDatepicker.inputs.checkout.val()).trigger('change');

		}
	};

	var showBookingDatepicker = function(){
		bookingDatepicker.steps.currentStep = bookingDatepicker.steps.checkinStep;
		bookingDatepicker.container.removeClass(bookingDatepicker.steps.checkinStep + ' ' + bookingDatepicker.steps.checkoutStep).addClass(bookingDatepicker.steps.currentStep);

		bookingDatepicker.container.addClass('visible');

		documentObject.on('mousedown.bookingDatepicker', function (event) {
			if ($(event.target).closest(bookingDatepicker.container).length < 1) {
				closeBookingDatepicker();
			}
		});
	};

	var closeBookingDatepicker = function(){
		bookingDatepicker.container.removeClass('visible');

		setBookingDatepickerDates('close');

		documentObject.off('mousedown.bookingDatepicker');
	};

	bookingDatepicker.container.datepicker({
		numberOfMonths: 2,
		dateFormat: bookingDatepicker.dateFormat,
		beforeShowDay: function (date) {
			var highlight = false,
				currentTime = date.getTime(),
				selectedTime = bookingDatepicker.dates,
				addClass = 'ui-datepicker-highlight';

			if (currentTime == selectedTime[0]) {
				addClass += ' checkin-date';
			} else if (currentTime == selectedTime[1]) {
				addClass += ' checkout-date'
			}

			if ((selectedTime[0] && selectedTime[0] == currentTime) || (selectedTime[1] && (currentTime >= selectedTime[0] && currentTime <= selectedTime[1]))) highlight = true;

			return [true, highlight ? addClass : ''];
		},
		onSelect: function (dateText) {
			if (bookingDatepicker.dates[0] == null || bookingDatepicker.dates[1] != null) { // Check-in date
				bookingDatepicker.dates[0] = $.datepicker.parseDate(bookingDatepicker.dateFormat, dateText).getTime();
				bookingDatepicker.dates[1] = null;

				setBookingDatepickerDates('checkin');

				bookingDatepicker.steps.currentStep = bookingDatepicker.steps.checkoutStep;
				bookingDatepicker.container.removeClass(bookingDatepicker.steps.checkinStep + ' ' + bookingDatepicker.steps.checkoutStep).addClass(bookingDatepicker.steps.currentStep);

			} else { // Check out date
				if (bookingDatepicker.dates[0] == $.datepicker.parseDate(bookingDatepicker.dateFormat, dateText).getTime()) return false;

				bookingDatepicker.dates[1] = $.datepicker.parseDate(bookingDatepicker.dateFormat, dateText).getTime();
				bookingDatepicker.dates.sort();

				setBookingDatepickerDates('checkout');

				closeBookingDatepicker();

				if (keyboardNavigation) {
					bookingDatepicker.inputs.dates.focus();
				}
			}
		}
	});

	bookingDatepicker.inputs.dates.parents('div').on('click', 'label, .input-overlay', function(event){
		showBookingDatepicker();

		event.preventDefault();
	});

	// Visually highlight date range

	bookingDatepicker.container.on('mouseover', 'td', function() {
		var target = $(this);

		if (!bookingDatepicker.container.hasClass('visible') || typeof target.data('year') == 'undefined' || bookingDatepicker.steps.currentStep == bookingDatepicker.steps.checkinStep) return;

		var cells = $('td', bookingDatepicker.container),
			indexes = [cells.index(target), cells.index(cells.filter('.ui-datepicker-current-day'))]; // [currently hovered cell, previously selected cell]

		indexes.sort(function(a, b) {
			return a - b;
		});

		$('td', bookingDatepicker.container).each(function(index, element) {
			var target = $(element);
			if (index >= indexes[0] && index <= indexes[1]) target.addClass('ui-datepicker-highlight');
			else target.removeClass('ui-datepicker-highlight');
		});
	});

	// Custom arrows

	$('.ui-datepicker-prev, .ui-datepicker-next', bookingDatepicker.container).on('click', function(event){
		$('.ui-datepicker-header .' + $(this).data('target'), bookingDatepicker.container).trigger('click');

		event.preventDefault();
	});

	// Booking datepicker ADA

	bookingDatepicker.buttons = $('a, button', bookingDatepicker.container);

	bookingDatepicker.inputs.dates.on('keydown.destinationSearch', function(event){
		if (!keyboardNavigation) return;

		if (keyboardNavigation && (event.keyCode == 13 || event.keyCode == 32 || event.keyCode == 38 || event.keyCode == 40 || event.keyCode == 37|| event.keyCode == 39)) { // enter || space || up || down || left || right
			showBookingDatepicker();
			bookingDatepicker.buttons.filter(function(){
				return $(this).parent().hasClass('checkout-date');
			}).focus();

			event.preventDefault();
		}
	});

	bookingDatepicker.container.on('keydown.destinationSearch', 'a, button',function(event){
		if (!keyboardNavigation) return;

		var target = $(this),
			dateButtons = bookingDatepicker.buttons.filter('a.ui-state-default'),
			targetIndex = dateButtons.index(target),
			leftTarget = targetIndex - 1,
			upTarget = targetIndex - 7,
			rightTarget = targetIndex + 1,
			bottomTarget = targetIndex + 7;

		if (event.keyCode == 27) { // escape
			bookingDatepicker.inputs.dates.focus();
			closeBookingDatepicker();
		} else if (event.keyCode == 37 || event.shiftKey && event.keyCode == 9) { // Left
			if (target.hasClass('ui-datepicker-next')) dateButtons.eq(dateButtons.length - 1).focus();
			else if (leftTarget < 0 || target.hasClass('ui-datepicker-prev')) bookingDatepicker.buttons.filter('.ui-datepicker-prev').focus();
			else dateButtons.eq(leftTarget).focus();
		} else if (event.keyCode == 38) { // Up
			if (target.hasClass('ui-datepicker-next')) dateButtons.eq(dateButtons.length - 1).focus();
			else if (upTarget < 0 || target.hasClass('ui-datepicker-prev')) bookingDatepicker.buttons.filter('.ui-datepicker-prev').focus();
			else dateButtons.eq(upTarget).focus();
		} else if (event.keyCode == 39 || event.keyCode == 9) { // Right
			if (target.hasClass('ui-datepicker-prev')) dateButtons.eq(0).focus();
			else if (rightTarget > dateButtons.length - 1 || target.hasClass('ui-datepicker-next')) bookingDatepicker.buttons.filter('.ui-datepicker-next').focus();
			else dateButtons.eq(rightTarget).focus();
		} else if (event.keyCode == 40) { // Down
			if (target.hasClass('ui-datepicker-prev')) dateButtons.eq(0).focus();
			else if (bottomTarget > dateButtons.length - 1 || target.hasClass('ui-datepicker-next')) bookingDatepicker.buttons.filter('.ui-datepicker-next').focus();
			else dateButtons.eq(bottomTarget).focus();
		}

		if (event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39 || event.keyCode == 40) {
			event.preventDefault();
		}
	});

	var bookingDatepickerObserverDebouncer;

	bookingDatepicker.container.observe(function(){

		if (bookingDatepickerObserverDebouncer) clearTimeout(bookingDatepickerObserverDebouncer);

		bookingDatepickerObserverDebouncer = setTimeout(function(){
			bookingDatepicker.buttons = $('a, button', bookingDatepicker.container);
			bookingDatepicker.buttons.each(function(){
				var button = $(this),
					parent = button.parent(),
					parentGroup = button.parents('.ui-datepicker-group');

				button.attr({'role': 'button', 'aria-pressed': parent.hasClass('ui-checkin') || parent.hasClass('ui-checkout') ? 'true' : 'false'}).on('click', function(event){
					event.preventDefault();
				}).on('keydown', function(event){
					if (event.keyCode == '32') button.trigger('click'); // Imitate Click on space
				});

				if (button.hasClass('ui-state-disabled')) button.attr('aria-disabled', 'true');

				// Format: Check In, Tuesday, February 18th, 1986

				if (button.hasClass('ui-state-default')) {

					button.attr({
						'aria-label':
						(!bookingDatepicker.dates[0] || (bookingDatepicker.dates[0] && bookingDatepicker.dates[1] && !parent.hasClass('ui-checkout')) || (bookingDatepicker.dates[0] && parent.hasClass('ui-checkin')) ? 'Check In' : 'Check Out')
						+ ', '
						+ $('th', parentGroup).eq(button.parent().index()).children('span').attr('title')
						+ ', '
						+ $('.ui-datepicker-month', parentGroup).text()
						+ ' '
						+ ordinal_suffix_of(button.text())
						+ ', '
						+ parent.data('year')
					});
				}
			});

			if (keyboardNavigation) {
				if (bookingDatepicker.dates[0] && bookingDatepicker.dates[1]) bookingDatepicker.buttons.filter('.ui-state-default').eq(0).focus();
				if (bookingDatepicker.dates[0] && !bookingDatepicker.dates[1]) bookingDatepicker.buttons.filter('.ui-state-active').focus();
			}

			$('.ui-datepicker-prev', bookingDatepicker.container).toggleClass('ui-state-disabled', $('.ui-datepicker-header .ui-datepicker-prev', bookingDatepicker.container).hasClass('ui-state-disabled'));
		}, 5);

	}, {subtree:true, childList:true, characterData:false, attributes:false});

	// Booking mobile

	$(".booking-trigger").on('click', function(){
		rootObject.addClass('booking-visible');
	});

	$(".booking-close-button", booking).on('click', function(){
		rootObject.removeClass('booking-visible');
	});

	// SMART BOOKING


	$('form', booking).hebsBP({
		checkIn : '#booking-checkin',
		checkOut : '#booking-checkout',
		extraFields: {
			'#booking-dates': 'change',
			'#booking-adults': 'change',
			'#booking-children': 'change'
		},
		singleCookie: true,

		onComplete: function(booking) {
			if (booking) {
				var checkin_date = new Date(booking.checkin_date);

				checkin_date.setHours(0);
				checkin_date.setMinutes(0);
				checkin_date.setSeconds(0);
				checkin_date.setMilliseconds(0);
				var checkin_timestamp = checkin_date.getTime();

				var checkout_date = new Date(booking.checkout_date);

				checkout_date.setHours(0);
				checkout_date.setMinutes(0);
				checkout_date.setSeconds(0);
				checkout_date.setMilliseconds(0);
				var checkout_timestamp = checkout_date.getTime();

				bookingDatepicker.dates = [checkin_timestamp, checkout_timestamp];
				bookingDatepicker.inputs.checkin.val($.datepicker.formatDate(bookingDatepicker.dateFormat, checkin_date));
				bookingDatepicker.inputs.checkout.val($.datepicker.formatDate(bookingDatepicker.dateFormat, checkout_date));
				bookingDatepicker.inputs.dates.val(bookingDatepicker.inputs.checkin.val() + ' - ' + bookingDatepicker.inputs.checkout.val());

				bookingDatepicker.container.datepicker('refresh');
				bookingDatepicker.container.datepicker('setDate', bookingDatepicker.inputs.checkin.val());
			}
		}

	});

})();
function printCalendar() {
	$('html').addClass('print');
	window.print();
	$('html').removeClass("print");
}

(function() {

	function calendarResize(){

		if ($('#calendar-year .y2').length) {
			// if two years
			var currentMonth = $('#calendar-month a.border_line'),
				l1 = currentMonth.offset().left - $('#calendar-month').offset().left ,
				l2 = $('#calendar-year').width()-l1;
			$('#calendar-year .y1').width(l1).next().width(l2);
		} else {
			// if only one year
			var l1 =$('#calendar-month').width();
			$('#calendar-year .y1').width(l1);
		}

	}

	//resize Calendar Year

	calendarResize();

	windowObject.resize(function() {
		calendarResize();
	});

	var calendarDaysContainer = $('#calendar-days');

	$('dl', calendarDaysContainer).each(function () {
		// options

		var hideDelay = 400,
			hideDelayTimer = null,
			beingShown = false,
			trigger = $('dt a', this),
			popup = $('dd', this),
			delta = trigger.offset().left+popup.outerWidth()/2;

		trigger.mousemove(function(event) {
			var newPosition = event.pageX-trigger.offset().left-popup.outerWidth()/2;

			if (newPosition < 0) newPosition = 0;
			if (newPosition > trigger.outerWidth() - popup.outerWidth()) newPosition = trigger.outerWidth() - popup.outerWidth();

			popup.css({
				left: newPosition
			});
		});

		$(this).hover(function() {
			$('.evid'+$(this).data('eventid')).addClass('hover');
		},function() {
			$('.evid'+$(this).data('eventid')).removeClass('hover');
		});

		// set the mouseover and mouseout on both element
		$([trigger.get(0), popup.get(0)]).mouseover(function () {

			// stops the hide event if we move from the trigger to the popup element
			if (hideDelayTimer) clearTimeout(hideDelayTimer);

			// don't trigger the animation again if we're being shown
			if (beingShown) {
				return;
			} else {
				beingShown = true;

				$('#calendar-days dd').hide();

				// reset position of popup box
				popup.css({
					bottom: 28,
					display: 'block'
				});

				// once the animation is complete, set the tracker variables
				beingShown = false;

			}
		}).mouseout(function () {
			// reset the timer if we get fired again - avoids double animations
			if (hideDelayTimer) clearTimeout(hideDelayTimer);

			// store the timer so that it can be cleared in the mouseover if required
			hideDelayTimer = setTimeout(function () {
				hideDelayTimer = null;
				// hide the popup entirely after the effect (opacity alone doesn't do the job)
				popup.hide();
			}, hideDelay);
		});
	});

})();
// Forms security

if ($('#ping').length) $('#ping').after($('<input>').attr({
	'name': 'pong',
	'value': $('#ping').val(),
	'class': 'hide',
	'aria-label': 'Security Check (do not modify)'
}));

// target="_blank" for external links

$('a[rel="external"], form.form-external, a[href^="http"][href*="://"]:not([href*="' + window.location.host + '"]), a[href*=".pdf"]').attr('target', '_blank');

// ADA Current input method detection

var slideshowsStopped = false;

windowObject.on('keydown', function(event) {
	if(event.keyCode == 9) { // Tab
		rootObject.addClass('keyboard-navigation');
		keyboardNavigation = true;

		// Disable automatic slideshows on page when keyboard navigation is detected
		if (!slideshowsStopped) {
			$.each(slideshows, function(index, slideshow){
				slideshow.autoplay.stop();
			});
		}
	}
});

whatInput.registerOnChange(function(type){
	if (type != 'keyboard') {
		rootObject.removeClass('keyboard-navigation');
		keyboardNavigation = false;
	}
});

// Forms validation

if ($.validationEngine) {
	$(".page-content .form, #newsletter form").validationEngine({
		promptPosition: "topLeft",
		autoPositionUpdate: true,
		scroll: false,
		showArrow: false,
		focusFirstField : false
	}).on('click', '[class*="validate[required"]', function(){
		$(this).siblings('.formError').fadeOut();
	});
}

// Datepickers

$.datepicker.setDefaults({
	dateFormat: 'mm/dd/yy',
	showOtherMonths: true,
	minDate: 0,
	showAnim: '',
	onSelect: function(date, instance){
		instance.input.blur();
	}
});

$.datepicker._shouldFocusInput = function(){ // Prevent datepicker from focusing on input
	return false;
};

// RFP Datepickers

$(".date-picker, .date-pick").each(function(){
	var input = $(this),
		parent = input.parent();

	input
		.datepicker({
			showOn: 'both',
			minDate: input.hasClass('no-min-date') ? null : $.datepicker._defaults.minDate
		})
		.wrap('<div class="datepicker-input-wrapper" />')
		.after('<div class="input-overlay" />');

	parent.on('click', 'label, .input-overlay', function(event){
		input.datepicker('show');

		event.preventDefault();
	});
});

// "Checkin/Checkout connection" function

var processCheckinCheckoutInputs = function (checkin, checkout, prefill, interval) {
	prefill = prefill || false;
	interval = interval || 1;

	if (prefill) {
		var currentDate = new Date(),
			defaultCheckoutDate = new Date();

		defaultCheckoutDate.setDate(defaultCheckoutDate.getDate() + interval);
		checkin.val($.datepicker.formatDate($.datepicker._defaults.dateFormat, currentDate)).datepicker("setDate", currentDate);
		checkout.val($.datepicker.formatDate($.datepicker._defaults.dateFormat, defaultCheckoutDate)).datepicker("setDate", defaultCheckoutDate);
	}

	checkin.datepicker("option", "onSelect", function (selectedDate) {

		var checkOutMinDate = new Date($.datepicker.parseDate($.datepicker._defaults.dateFormat, selectedDate));

		checkOutMinDate.setDate(checkOutMinDate.getDate() + interval);
		checkout.datepicker("option", "minDate", checkOutMinDate);
		checkout.datepicker("setDate", checkOutMinDate);
	});
};

// "Checkin/Checkout" connection for RFP

processCheckinCheckoutInputs($('input[name="arrival_date"]'), $('input[name="departure_date"]'), true);

// Responsive scrollable tables

$('.page-content table').wrap('<div class="table-wrapper" />');

// Even/odd rows to table

$(".page-content table tr:nth-child(even)").removeClass('odd').addClass('even');
$(".page-content table tr:nth-child(odd)").removeClass('even').addClass("odd");

// Category selector

var processCategorySelectors = function(){
	$('.category-selector').each(function(){
		var target = $(this),
			buttons = $('.button', target);

		if (!buttons.length) return;

		if (!buttons.filter('.active').length) buttons.eq(0).addClass('active');

		buttons.off('click.categorySelector').on('click.categorySelector', function(){
			var button = $(this);
			button.addClass('active').siblings().removeClass('active');
			$('select', target).prop('selectedIndex', button.index());
		});

		// Select for mobile devices

		if (!target.find('select').length) {
			target.append('<select aria-label="Category" />');

			$('select', target).on('change.categorySelector', function(){
				buttons.eq($(this).val())[0].click();
			});
		}

		buttons.each(function(index){
			var button = $(this),
				select = $('select', target);

			if (!$('option', select).filter(function(){ return $(this).text() == button.text() }).length) {
				select.append('<option value="' + index + '" ' + (button.hasClass('active') ? 'selected' : '') + '>' + button.text() + '</option>');
			}
		});
	});

	if (typeof processSelects == 'function') processSelects();
};

processCategorySelectors();

// Select icons

var processSelects = function(){
	$('select').each(function(){
		var select = $(this);

		if (select.parent('.select-wrapper').length) return;

		select.wrap('<div class="select-wrapper" data-select-class="' + select.attr('class') + '" />').after('<div class="select-icon" />');
	});
};

processSelects();

// ADA functions

var disableKeyboardNavigation = function(target){
	if (!target) return;
	var target = $(target);

	target.find(':focusable').addBack().each(function(){
		var focusable = $(this);
		if (focusable.attr('tabindex')) focusable.data('original-tabindex', focusable.attr('tabindex'));
		focusable.attr('tabindex', '-1');
	});
};

var restoreKeyboardNavigation = function(target, ignoreOriginalTabindex){
	if (!target) return;

	var target = $(target),
		ignoreOriginalTabindex = typeof ignoreOriginalTabindex !== 'undefined' ?  ignoreOriginalTabindex : false;

	target.find(':focusable').addBack().each(function(){
		var focusable = $(this);
		if (focusable.data('original-tabindex') && !ignoreOriginalTabindex) focusable.attr('tabindex', focusable.data('original-tabindex')).removeData('original-tabindex');
		else focusable.removeAttr('tabindex');
	});
};

// Content "Read More"

var contentReadMore = $('.content-read-more');

contentReadMore.each(function(){
	var target = $(this),
		parent = target.parent();

	if (parent.is('p')) {
		target.insertBefore(parent);
		if (parent.is(':empty')) parent.remove();
	}

	target.nextAll().wrapAll('<div class="content-read-more-wrapper" />');

	var wrapper = target.next('.content-read-more-wrapper');

	target.click(function(){
		target.addClass('removed');
		wrapper.addClass('expanded');
	});

	target.keypress(function (e) {
		if (e.keyCode == 13) {
			target.addClass('removed');
			wrapper.addClass('expanded');
		}
	});
});
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
// Feeds

(function() {

	var feeds = $('#feeds'),
		feedsLoading = false,
		feedsLoaded = false,
		feedsArray = [],
		feedCategoriesArray = [],
		itemsPerPattern = 0,
		feedItems,
		feedCategories = $('.category-selector', feeds),
		feedItemsContainer = $('.feed-items', feeds),
		feedControls = $('.feed-controls', feeds);

	function calculateFeedsPattern(){
		var counter = 0;

		if (windowWidth < 450) {
			counter = 2;
		} else if (windowWidth >= 450 && windowWidth < 768) {
			counter = 4;
		} else if (windowWidth >= 768 && windowWidth < 980) {
			counter = 6;
		} else if (windowWidth >= 980 && windowWidth < 1440) {
			counter = 5;
		} else if (windowWidth >= 1440 && windowWidth < 1800) {
			counter = 9;
		} else if (windowWidth >= 1800) {
			counter = 10;
		}

		return counter;
	}

	function rebuildFeeds () {
		var counter = calculateFeedsPattern();

		if (counter != itemsPerPattern) {
			itemsPerPattern = counter;

			removeFeeds();
			feeds.addClass('loading');
			feedCategories.children().eq(0).trigger('click');
			buildFeeds();
		}
	}

	function removeFeeds (){
		feedItemsContainer.empty();
		feedControls.empty();
	}

	function buildCategories(){
		if (feedCategoriesArray.length <=1 ) return;

		feedCategoriesArray = feedCategoriesArray.filter(function(e){return e});

		feedCategoriesArray.unshift({
			name: 'All',
			type: 'all'
		});

		$.each(feedCategoriesArray, function (index, entry) {
			$('<button />', {
				class: 'button ' + entry.type +'-button'+ (index == 0 ? ' active' : ''),
				text: entry.name,
				'data-feedtype': entry.type
			}).on( "click", function() {
				var thisCategory = $(this),
					thisFeedtype = thisCategory.data("feedtype");

				if(thisFeedtype === 'all'){
					feedItems.addClass('hide current');
					feedItems.parent().addClass('hide');
					feedItems.slice(0, itemsPerPattern).removeClass('hide');
					feedItems.slice(0, itemsPerPattern).parent().removeClass('hide');
				}else{
					feedItems.addClass('hide').removeClass('current');
					feedItems.parent().addClass('hide');

					var currentCategory = feedItems.filter(function( index ) {
						return $(this).data("feedtype" ) === thisFeedtype;
					});

					currentCategory.addClass('current');
					currentCategory.slice(0, itemsPerPattern).removeClass('hide');
					currentCategory.slice(0, itemsPerPattern).parent().removeClass('hide');

					feedItemsContainer.addClass('filtered ' + thisFeedtype);
				}

				($('.current.hide', feedItemsContainer).length > 0) ? $('.load-more', feedControls).show() : $('.load-more', feedControls).hide();

				feeds.removeClass('all-feeds');

				if ($(this).data("feedtype") == 'all'){
					feeds.addClass('all-feeds');
				}
			}).appendTo(feedCategories);
		});

		processCategorySelectors();
	}

	function buildFeeds(){
		var feedData = '',
			counter = 1;

		if (!feedsArray.length) return;

		$.each(feedsArray, function(index, entry) {
			var feedDate = (entry.date == 'blog' ) ? entry.timestamp : new Date(entry.timestamp),
				feedMonth = feedDate.getMonth(),
				feedMonthsArray = ['January','February','March','April','May','June','July','August','September','October','November','December'],
				feedDay = feedDate.getDate(),
				feedYear = feedDate.getFullYear(),
				feedHour = feedDate.getHours(),
				feedHourFormatted = (feedHour % 12 != 0) ? (feedHour % 12) : 12, /* the hour '0' should be '12' */
				feedMinutes = feedDate.getMinutes(),
				ampm = feedHour >= 12 ? 'pm' : 'am';

			if (entry.type == 'facebook' && entry.text === undefined) return true;

			feedData += '<div class="feed-item invisible ' + entry.type + ' item-'+ counter + '" data-feedtype="' + entry.type + '">';

			if (entry.image) {
				feedData += '<div class="feed-thumb"><div style="background-image:url(' + entry.image + ');"></div></div>';
			}

			var textString = entry.text,
				textStringLength = entry.text.length,
				requiredLength = 120,
				trimmedTextString = textString.substring(0, requiredLength);

			feedData += '<div class="feed-descr">';
			feedData += '<h3 class="feed-title">' + entry.title + '</h3>';
			feedData += '<time class="feed-date">'+ feedDay + ' ' + feedMonthsArray[feedMonth] + ' '+ feedHourFormatted +':'+ feedMinutes +''+ ampm +' </time>';
			feedData += '<p class="feed-text">' + trimmedTextString + (textStringLength > requiredLength ? '...' : '') +'</p>';
			feedData += '</div>';
			feedData += '<a class="feed-link" href="' + entry.url + '" target="_blank" aria-label="Click to open link">';
			feedData += '</a>';
			feedData += '</div>';

			counter++;

		});

		feeds.removeClass('loading');

		feedItemsContainer.empty().removeClass(function (index, className) {
			return (className.match (/items-per-pattern-\S+/g) || []).join(' ');
		}).addClass('items-per-pattern-' + itemsPerPattern).append(feedData);

		feedItems = $('.feed-item', feedItemsContainer);

		for(var i = 0; i < feedItems.length; i += itemsPerPattern) {
			feedItems.slice(i, i + itemsPerPattern).wrapAll('<div class="pattern" />');
		}

		feedItems.addClass('hide current');
		feedItems.parent().addClass('hide');
		feedItems.slice(0, itemsPerPattern).removeClass('hide');
		feedItems.slice(0, itemsPerPattern).parent().removeClass('hide');

		feedItems.each(function(index){
			var that = this;
			var t = setTimeout(function() {
				$(that).removeClass("invisible");
			}, 50 * index);
		});

		if( feedItems.length > itemsPerPattern ){

			$('<button />', {class: 'button load-more', text: 'Load More'})
				.on( "click", function() {
					$('.current.hide', feedItemsContainer).slice(0,itemsPerPattern).removeClass('hide');
					$('.current:not(.hide)', feedItemsContainer).parent().removeClass('hide');

					($('.current.hide', feedItemsContainer).length > 0) ? '' : $(this).hide();
				})
				.appendTo(feedControls);
		}
	}

	function loadFeeds(){
		if(feedCredentials) {

			feedsLoading = true;

			var ajaxCalls = [];

			$.each(feedCredentials, function(index, feed) {
				if (feed.type && feed.name && feed.value) {

					var feedPath;

					if (feed.type == 'instagram') {
						feedPath = '/json/instagram.json?screen_name=' + feed.value;
					} else if (feed.type == 'facebook') {
						feedPath = '/json/facebook.json?profile_id=' + feed.value;
					} else if (feed.type == 'twitter') {
						feedPath = '/json/twitter.json?screen_name=' + feed.value;
					} else if (feed.type == 'blog') {
						feedPath =  templateURL + 'assets/desktop/php/blog-feed.php?url=' + feed.value + '&posts_limit=30&tag=' + (typeof blogTags != 'undefined' ? blogTags : '');
					}

					if (!feedPath) return;

					var deferred = $.Deferred();

					$.ajax({
						dataType: "json",
						url: feedPath,
						success: function(json) {

							var data = (feed.type == 'blog') ? json : json.data;

							if (!data || !data.length) {
								deferred.resolve();
								return;
							}

							feedCategoriesArray[index] = {
								name: feedCredentials[index].name,
								type: feedCredentials[index].type
							};

							$.each(data, function(i,entry) {
								feedsArray.push({
									type: feed.type,
									timestamp: (feed.type == 'blog') ? (new Date(entry.date)).getTime() : entry.timestamp * 1000,
									id: entry.id,
									url: entry.url,
									title: (feed.type == 'blog') ? entry.title : siteSettings.name,
									text: (feed.type == 'instagram') ? entry.title : (feed.type == 'blog') ? entry.text.replace('Read More','') : entry.text,
									author: (feed.type == 'facebook') ? entry.author.name : (feed.type == 'blog') ? '' : entry.author.screen_name,
									image: entry.images ? entry.images.standard : entry.image ? entry.image : null
								});
							});

							deferred.resolve();
						},
						error: function(){
							deferred.resolve();
						}
					});

					ajaxCalls.push(deferred);
				}

			});

			$.when.apply(this, ajaxCalls).then(function() {
				feedsLoading = false;
				feedsLoaded = true;

				feedsArray.sort(function(a,b){return b.timestamp - a.timestamp});

				buildFeeds();

				buildCategories();
			});
		}
	}

	windowObject.on('scroll.feeds load.feeds init.feeds', function(){
		requestAnimationFrame(function () {
			if (!feedsLoaded && !feedsLoading) {
				if (feeds.length && windowCurrentScroll > (feeds.position().top - windowHeight)) {
					feedsLoading = true;

					itemsPerPattern = calculateFeedsPattern();
					loadFeeds();
				}
			}
		});

	}).trigger('init.feeds');

	windowObject.on('resize.feeds', function () {
		if(feedsLoaded) {
			rebuildFeeds();
		}
	});

})();
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
//  requestAnimationFrame polyfill

(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
			|| window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); },
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());

// Simplified Mutation Observer wrapped into a new jQuery method

(function($) {
	$.fn.observe = function(cb, e) {
		e = e || {subtree:true, childList:true, characterData:true, attributes:true};
		$(this).each(function() {
			function callback(changes) { cb.call(node, changes, this); }
			var node = this;
			(new MutationObserver(callback)).observe(node, e);
		});
	};
})(jQuery);

// Placeholder support detection

jQuery.support.placeholder = (function(){
	var i = document.createElement('input');
	return 'placeholder' in i;
})();

// Leading zeroes

function leadingZero(string){
	return string < 10 ? '0' + string : string;
}

// Ordinal suffix for numbers

function ordinal_suffix_of(i) {
	var j = i % 10,
		k = i % 100;
	if (j == 1 && k != 11) {
		return i + "st";
	}
	if (j == 2 && k != 12) {
		return i + "nd";
	}
	if (j == 3 && k != 13) {
		return i + "rd";
	}
	return i + "th";
}
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
// ROOMS SCRIPTS

(function(window, $) {

	'use strict';

	// TEMPLATE 1

	$('.rooms').each(function(){

		var roomsWidget = $(this),
			roomsCategories = $('.category-selector', roomsWidget),
			roomsCategory = $('button', roomsCategories),
			roomsDescriptions = $('.categories-descr', roomsWidget),
			roomsDescription = $('.category-descr', roomsDescriptions),
			roomsEntry = $('.rooms-entry', roomsWidget);

		roomsEntry.each(function(){

			var thisRoom = $(this);

			roomsCategory.click(function(){

				var thisCategory = $(this),
					thisCategoryId = thisCategory.data('category');

				var currentDescription = roomsDescription.filter(function( index ) {
					return $(this).data('category') === thisCategoryId;
				});

				roomsDescription.removeClass('active');
				currentDescription.addClass('active');

				if( thisCategoryId == "0" ){
					roomsEntry.removeClass('hide');
				} else {
					$.each( roomsEntry, function(){
						$(this).toggleClass('hide', ($(this).data('category')+"").split(',').indexOf(thisCategoryId + "") < 0);
					});
				}

				return false;
			});

			$('.toggle', thisRoom).click(function() {
				$('.amenities', thisRoom).toggleClass('expand');
				return false;
			});

			$(window).on("load resize",function(){

				$.each($('.rooms .amenities'), function(){
					$(this).toggleClass("multiline", $('.main-list .rooms-icon', this).length * $('.main-list .rooms-icon', this).width() > $(this).width());
				});
			});

			$(".rooms-item-gallery", thisRoom).click(function() {
				initGallery({
					'data': roomsJSON,
					'id': $(this).data('gallery-id'),
					'categories': false,
					'startingImage': $(this).data('image-index') ? $(this).data('image-index') : 0
				});

				return false;
			});
		});

	});

	// TEMPLATE 2

	//if($('.rooms').length > 0){
	//
	//	$('.rooms .expand-collapse, .rooms .full-description .close').click(function(e){
	//		e.preventDefault();
	//
	//		$(this).parents('.rooms-entry').find('.expand-collapse').toggleClass('expand collapse');
	//
	//		$(this).parents('.rooms-entry').find('.full-description').toggleClass('show');
	//	});
	//
	//	$('.rooms .categories-list').click(function(){
	//		$(this).toggleClass('active');
	//	});
	//
	//	$('.rooms .categories-list button').click(function(){
	//		$('.rooms .categories-list button').removeClass('active');
	//		$(this).addClass('active');
	//		$('.rooms .categories-list').removeClass('active');
	//	});
	//
	//	if (typeof roomsJSON != 'undefined' && !$.isEmptyObject(roomsJSON)) {
	//		$.each(roomsJSON, function() {
	//			for (var length = this.images.length, index = 0; index < length; index++) {
	//				this.images[index].image = this.images[index].full;
	//				this.images[index].description = this.images[index].caption;
	//			}
	//		});
	//
	//		$(".rooms-item-gallery").click(function() {
	//			initGallery({
	//				'data': roomsJSON,
	//				'id': $(this).data('gallery-id'),
	//				'categories': false,
	//				'startingImage': $(this).data('image-index') ? $(this).data('image-index') : 0
	//			});
	//
	//			return false;
	//		});
	//	}
	//
	//	$('.rooms').each(function( index ) {
	//
	//		var widget = $(this),
	//			widgetCategories = $('.categories-list', widget),
	//			widgetCategory = $('button', widgetCategories),
	//			widgetListEntry = $('.rooms-entry', widget);
	//
	//		widgetCategory.click(function(){
	//
	//			var $this = $(this);
	//
	//			widgetCategory.removeClass('active');
	//			$this.addClass('active');
	//
	//			if( $this.data('category') == "0" ){
	//				widgetListEntry.removeClass('hide');
	//			} else {
	//				var currentCategory = $this.data('category');
	//				$.each( widgetListEntry, function(){
	//					$(this).toggleClass('hide', ($(this).data('category')+"").split(',').indexOf(currentCategory + "") < 0);
	//				});
	//			}
	//
	//			return false;
	//		});
	//	});
	//
	//}

})(window, jQuery);
/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (arguments.length > 1 && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));
/**
 *
 * MODIFIED VERSION!!! destroy() method fixed, YouTube thumbnail changed from hqdefault.jpg to maxresdefault.jpg
 *
 * Galleria v1.5.7 2017-05-10
 * http://galleria.io
 *
 * Copyright (c) 2010 - 2016 worse is better UG
 * Licensed under the MIT license
 * https://raw.github.com/worseisbetter/galleria/master/LICENSE
 *
 */

(function( $, window, Galleria, undef ) {

	/*global jQuery, navigator, Image, module, define */

// some references
	var doc    = window.document,
		$doc   = $( doc ),
		$win   = $( window ),

// native prototypes
		protoArray = Array.prototype,

// internal constants
		VERSION = 1.57,
		DEBUG = true,
		TIMEOUT = 30000,
		DUMMY = false,
		NAV = navigator.userAgent.toLowerCase(),
		HASH = window.location.hash.replace(/#\//, ''),
		PROT = window.location.protocol == "file:" ? "http:" : window.location.protocol,
		M = Math,
		F = function(){},
		FALSE = function() { return false; },
		MOBILE = !(
			( window.screen.width > 1279 && window.devicePixelRatio == 1 ) || // there are not so many mobile devices with more than 1280px and pixelRatio equal to 1 (i.e. retina displays are equal to 2...)
			( window.screen.width > 1000 && window.innerWidth < (window.screen.width * .9) ) // this checks in the end if a user is using a resized browser window which is not common on mobile devices
		),
		IE = (function() {

			var v = 3,
				div = doc.createElement( 'div' ),
				all = div.getElementsByTagName( 'i' );

			do {
				div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->';
			} while ( all[0] );

			return v > 4 ? v : doc.documentMode || undef;

		}() ),
		DOM = function() {
			return {
				html:  doc.documentElement,
				body:  doc.body,
				head:  doc.getElementsByTagName('head')[0],
				title: doc.title
			};
		},
		IFRAME = window.parent !== window.self,

		// list of Galleria events
		_eventlist = 'data ready thumbnail loadstart loadfinish image play pause progress ' +
			'fullscreen_enter fullscreen_exit idle_enter idle_exit rescale ' +
			'lightbox_open lightbox_close lightbox_image',

		_events = (function() {

			var evs = [];

			$.each( _eventlist.split(' '), function( i, ev ) {
				evs.push( ev );

				// legacy events
				if ( /_/.test( ev ) ) {
					evs.push( ev.replace( /_/g, '' ) );
				}
			});

			return evs;

		}()),

		// legacy options
		// allows the old my_setting syntax and converts it to camel case

		_legacyOptions = function( options ) {

			var n;

			if ( typeof options !== 'object' ) {

				// return whatever it was...
				return options;
			}

			$.each( options, function( key, value ) {
				if ( /^[a-z]+_/.test( key ) ) {
					n = '';
					$.each( key.split('_'), function( i, k ) {
						n += i > 0 ? k.substr( 0, 1 ).toUpperCase() + k.substr( 1 ) : k;
					});
					options[ n ] = value;
					delete options[ key ];
				}
			});

			return options;
		},

		_patchEvent = function( type ) {

			// allow 'image' instead of Galleria.IMAGE
			if ( $.inArray( type, _events ) > -1 ) {
				return Galleria[ type.toUpperCase() ];
			}

			return type;
		},

		// video providers
		_video = {
			youtube: {
				reg: /https?:\/\/(?:[a-zA_Z]{2,3}.)?(?:youtube\.com\/watch\?)((?:[\w\d\-\_\=]+&amp;(?:amp;)?)*v(?:&lt;[A-Z]+&gt;)?=([0-9a-zA-Z\-\_]+))/i,
				embed: function() {
					return PROT + '//www.youtube.com/embed/' + this.id;
				},
				get_thumb: function( data ) {
					return PROT + '//img.youtube.com/vi/'+this.id+'/default.jpg';
				},
				get_image: function( data ) {
					return PROT + '//img.youtube.com/vi/'+this.id+'/maxresdefault.jpg';
				}
			},
			vimeo: {
				reg: /https?:\/\/(?:www\.)?(vimeo\.com)\/(?:hd#)?([0-9]+)/i,
				embed: function() {
					return PROT + '//player.vimeo.com/video/' + this.id;
				},
				getUrl: function() {
					return PROT + '//vimeo.com/api/v2/video/' + this.id + '.json?callback=?';
				},
				get_thumb: function( data ) {
					return data[0].thumbnail_medium;
				},
				get_image: function( data ) {
					return data[0].thumbnail_large;
				}
			},
			dailymotion: {
				reg: /https?:\/\/(?:www\.)?(dailymotion\.com)\/video\/([^_]+)/,
				embed: function() {
					return PROT + '//www.dailymotion.com/embed/video/' + this.id;
				},
				getUrl: function() {
					return 'https://api.dailymotion.com/video/' + this.id + '?fields=thumbnail_240_url,thumbnail_720_url&callback=?';
				},
				get_thumb: function( data ) {
					return data.thumbnail_240_url;
				},
				get_image: function( data ) {
					return data.thumbnail_720_url;
				}
			},
			_inst: []
		},
		Video = function( type, id ) {

			for( var i=0; i<_video._inst.length; i++ ) {
				if ( _video._inst[i].id === id && _video._inst[i].type == type ) {
					return _video._inst[i];
				}
			}

			this.type = type;
			this.id = id;
			this.readys = [];

			_video._inst.push(this);

			var self = this;

			$.extend( this, _video[type] );

			_videoThumbs = function(data) {
				self.data = data;
				$.each( self.readys, function( i, fn ) {
					fn( self.data );
				});
				self.readys = [];
			};

			if ( this.hasOwnProperty('getUrl') ) {
				$.getJSON( this.getUrl(), _videoThumbs);
			} else {
				window.setTimeout(_videoThumbs, 400);
			}

			this.getMedia = function( type, callback, fail ) {
				fail = fail || F;
				var self = this;
				var success = function( data ) {
					callback( self['get_'+type]( data ) );
				};
				try {
					if ( self.data ) {
						success( self.data );
					} else {
						self.readys.push( success );
					}
				} catch(e) {
					fail();
				}
			};
		},

		// utility for testing the video URL and getting the video ID
		_videoTest = function( url ) {
			var match;
			for ( var v in _video ) {
				match = url && _video[v].reg && url.match( _video[v].reg );
				if( match && match.length ) {
					return {
						id: match[2],
						provider: v
					};
				}
			}
			return false;
		},

		// native fullscreen handler
		_nativeFullscreen = {

			support: (function() {
				var html = DOM().html;
				return !IFRAME && ( html.requestFullscreen || html.msRequestFullscreen || html.mozRequestFullScreen || html.webkitRequestFullScreen );
			}()),

			callback: F,

			enter: function( instance, callback, elem ) {

				this.instance = instance;

				this.callback = callback || F;

				elem = elem || DOM().html;
				if ( elem.requestFullscreen ) {
					elem.requestFullscreen();
				}
				else if ( elem.msRequestFullscreen ) {
					elem.msRequestFullscreen();
				}
				else if ( elem.mozRequestFullScreen ) {
					elem.mozRequestFullScreen();
				}
				else if ( elem.webkitRequestFullScreen ) {
					elem.webkitRequestFullScreen();
				}
			},

			exit: function( callback ) {

				this.callback = callback || F;

				if ( doc.exitFullscreen ) {
					doc.exitFullscreen();
				}
				else if ( doc.msExitFullscreen ) {
					doc.msExitFullscreen();
				}
				else if ( doc.mozCancelFullScreen ) {
					doc.mozCancelFullScreen();
				}
				else if ( doc.webkitCancelFullScreen ) {
					doc.webkitCancelFullScreen();
				}
			},

			instance: null,

			listen: function() {

				if ( !this.support ) {
					return;
				}

				var handler = function() {

					if ( !_nativeFullscreen.instance ) {
						return;
					}
					var fs = _nativeFullscreen.instance._fullscreen;

					if ( doc.fullscreen || doc.mozFullScreen || doc.webkitIsFullScreen || ( doc.msFullscreenElement && doc.msFullscreenElement !== null ) ) {
						fs._enter( _nativeFullscreen.callback );
					} else {
						fs._exit( _nativeFullscreen.callback );
					}
				};
				doc.addEventListener( 'fullscreenchange', handler, false );
				doc.addEventListener( 'MSFullscreenChange', handler, false );
				doc.addEventListener( 'mozfullscreenchange', handler, false );
				doc.addEventListener( 'webkitfullscreenchange', handler, false );
			}
		},

		// the internal gallery holder
		_galleries = [],

		// the internal instance holder
		_instances = [],

		// flag for errors
		_hasError = false,

		// canvas holder
		_canvas = false,

		// instance pool, holds the galleries until themeLoad is triggered
		_pool = [],

		// Run galleries from theme trigger
		_loadedThemes = [],
		_themeLoad = function( theme ) {

			_loadedThemes.push(theme);

			// run the instances we have in the pool
			// and apply the last theme if not specified
			$.each( _pool, function( i, instance ) {
				if ( instance._options.theme == theme.name || (!instance._initialized && !instance._options.theme) ) {
					instance.theme = theme;
					instance._init.call( instance );
				}
			});
		},

		// the Utils singleton
		Utils = (function() {

			return {

				// legacy support for clearTimer
				clearTimer: function( id ) {
					$.each( Galleria.get(), function() {
						this.clearTimer( id );
					});
				},

				// legacy support for addTimer
				addTimer: function( id ) {
					$.each( Galleria.get(), function() {
						this.addTimer( id );
					});
				},

				array : function( obj ) {
					return protoArray.slice.call(obj, 0);
				},

				create : function( className, nodeName ) {
					nodeName = nodeName || 'div';
					var elem = doc.createElement( nodeName );
					elem.className = className;
					return elem;
				},

				removeFromArray : function( arr, elem ) {
					$.each(arr, function(i, el) {
						if ( el == elem ) {
							arr.splice(i, 1);
							return false;
						}
					});
					return arr;
				},

				getScriptPath : function( src ) {

					// the currently executing script is always the last
					src = src || $('script:last').attr('src');
					var slices = src.split('/');

					if (slices.length == 1) {
						return '';
					}

					slices.pop();

					return slices.join('/') + '/';
				},

				// CSS3 transitions, added in 1.2.4
				animate : (function() {

					// detect transition
					var transition = (function( style ) {
						var props = 'transition WebkitTransition MozTransition OTransition'.split(' '),
							i;

						// disable css3 animations in opera until stable
						if ( window.opera ) {
							return false;
						}

						for ( i = 0; props[i]; i++ ) {
							if ( typeof style[ props[ i ] ] !== 'undefined' ) {
								return props[ i ];
							}
						}
						return false;
					}(( doc.body || doc.documentElement).style ));

					// map transitionend event
					var endEvent = {
						MozTransition: 'transitionend',
						OTransition: 'oTransitionEnd',
						WebkitTransition: 'webkitTransitionEnd',
						transition: 'transitionend'
					}[ transition ];

					// map bezier easing conversions
					var easings = {
						_default: [0.25, 0.1, 0.25, 1],
						galleria: [0.645, 0.045, 0.355, 1],
						galleriaIn: [0.55, 0.085, 0.68, 0.53],
						galleriaOut: [0.25, 0.46, 0.45, 0.94],
						ease: [0.25, 0, 0.25, 1],
						linear: [0.25, 0.25, 0.75, 0.75],
						'ease-in': [0.42, 0, 1, 1],
						'ease-out': [0, 0, 0.58, 1],
						'ease-in-out': [0.42, 0, 0.58, 1]
					};

					// function for setting transition css for all browsers
					var setStyle = function( elem, value, suffix ) {
						var css = {};
						suffix = suffix || 'transition';
						$.each( 'webkit moz ms o'.split(' '), function() {
							css[ '-' + this + '-' + suffix ] = value;
						});
						elem.css( css );
					};

					// clear styles
					var clearStyle = function( elem ) {
						setStyle( elem, 'none', 'transition' );
						if ( Galleria.WEBKIT && Galleria.TOUCH ) {
							setStyle( elem, 'translate3d(0,0,0)', 'transform' );
							if ( elem.data('revert') ) {
								elem.css( elem.data('revert') );
								elem.data('revert', null);
							}
						}
					};

					// various variables
					var change, strings, easing, syntax, revert, form, css;

					// the actual animation method
					return function( elem, to, options ) {

						// extend defaults
						options = $.extend({
							duration: 400,
							complete: F,
							stop: false
						}, options);

						// cache jQuery instance
						elem = $( elem );

						if ( !options.duration ) {
							elem.css( to );
							options.complete.call( elem[0] );
							return;
						}

						// fallback to jQuery's animate if transition is not supported
						if ( !transition ) {
							elem.animate(to, options);
							return;
						}

						// stop
						if ( options.stop ) {
							// clear the animation
							elem.off( endEvent );
							clearStyle( elem );
						}

						// see if there is a change
						change = false;
						$.each( to, function( key, val ) {
							css = elem.css( key );
							if ( Utils.parseValue( css ) != Utils.parseValue( val ) ) {
								change = true;
							}
							// also add computed styles for FF
							elem.css( key, css );
						});
						if ( !change ) {
							window.setTimeout( function() {
								options.complete.call( elem[0] );
							}, options.duration );
							return;
						}

						// the css strings to be applied
						strings = [];

						// the easing bezier
						easing = options.easing in easings ? easings[ options.easing ] : easings._default;

						// the syntax
						syntax = ' ' + options.duration + 'ms' + ' cubic-bezier('  + easing.join(',') + ')';

						// add a tiny timeout so that the browsers catches any css changes before animating
						window.setTimeout( (function(elem, endEvent, to, syntax) {
							return function() {

								// attach the end event
								elem.one(endEvent, (function( elem ) {
									return function() {

										// clear the animation
										clearStyle(elem);

										// run the complete method
										options.complete.call(elem[0]);
									};
								}( elem )));

								// do the webkit translate3d for better performance on iOS
								if( Galleria.WEBKIT && Galleria.TOUCH ) {

									revert = {};
									form = [0,0,0];

									$.each( ['left', 'top'], function(i, m) {
										if ( m in to ) {
											form[ i ] = ( Utils.parseValue( to[ m ] ) - Utils.parseValue(elem.css( m )) ) + 'px';
											revert[ m ] = to[ m ];
											delete to[ m ];
										}
									});

									if ( form[0] || form[1]) {

										elem.data('revert', revert);

										strings.push('-webkit-transform' + syntax);

										// 3d animate
										setStyle( elem, 'translate3d(' + form.join(',') + ')', 'transform');
									}
								}

								// push the animation props
								$.each(to, function( p, val ) {
									strings.push(p + syntax);
								});

								// set the animation styles
								setStyle( elem, strings.join(',') );

								// animate
								elem.css( to );

							};
						}(elem, endEvent, to, syntax)), 2);
					};
				}()),

				removeAlpha : function( elem ) {
					if ( elem instanceof jQuery ) {
						elem = elem[0];
					}
					if ( IE < 9 && elem ) {

						var style = elem.style,
							currentStyle = elem.currentStyle,
							filter = currentStyle && currentStyle.filter || style.filter || "";

						if ( /alpha/.test( filter ) ) {
							style.filter = filter.replace( /alpha\([^)]*\)/i, '' );
						}
					}
				},

				forceStyles : function( elem, styles ) {
					elem = $(elem);
					if ( elem.attr( 'style' ) ) {
						elem.data( 'styles', elem.attr( 'style' ) ).removeAttr( 'style' );
					}
					elem.css( styles );
				},

				revertStyles : function() {
					$.each( Utils.array( arguments ), function( i, elem ) {

						elem = $( elem );
						elem.removeAttr( 'style' );

						elem.attr('style',''); // "fixes" webkit bug

						if ( elem.data( 'styles' ) ) {
							elem.attr( 'style', elem.data('styles') ).data( 'styles', null );
						}
					});
				},

				moveOut : function( elem ) {
					Utils.forceStyles( elem, {
						position: 'absolute',
						left: -10000
					});
				},

				moveIn : function() {
					Utils.revertStyles.apply( Utils, Utils.array( arguments ) );
				},

				hide : function( elem, speed, callback ) {

					callback = callback || F;

					var $elem = $(elem);
					elem = $elem[0];

					// save the value if not exist
					if (! $elem.data('opacity') ) {
						$elem.data('opacity', $elem.css('opacity') );
					}

					// always hide
					var style = { opacity: 0 };

					if (speed) {

						var complete = IE < 9 && elem ? function() {
							Utils.removeAlpha( elem );
							elem.style.visibility = 'hidden';
							callback.call( elem );
						} : callback;

						Utils.animate( elem, style, {
							duration: speed,
							complete: complete,
							stop: true
						});
					} else {
						if ( IE < 9 && elem ) {
							Utils.removeAlpha( elem );
							elem.style.visibility = 'hidden';
						} else {
							$elem.css( style );
						}
					}
				},

				show : function( elem, speed, callback ) {

					callback = callback || F;

					var $elem = $(elem);
					elem = $elem[0];

					// bring back saved opacity
					var saved = parseFloat( $elem.data('opacity') ) || 1,
						style = { opacity: saved };

					// animate or toggle
					if (speed) {

						if ( IE < 9 ) {
							$elem.css('opacity', 0);
							elem.style.visibility = 'visible';
						}

						var complete = IE < 9 && elem ? function() {
							if ( style.opacity == 1 ) {
								Utils.removeAlpha( elem );
							}
							callback.call( elem );
						} : callback;

						Utils.animate( elem, style, {
							duration: speed,
							complete: complete,
							stop: true
						});
					} else {
						if ( IE < 9 && style.opacity == 1 && elem ) {
							Utils.removeAlpha( elem );
							elem.style.visibility = 'visible';
						} else {
							$elem.css( style );
						}
					}
				},

				wait : function(options) {

					Galleria._waiters = Galleria._waiters || [];

					options = $.extend({
						until : FALSE,
						success : F,
						error : function() { Galleria.raise('Could not complete wait function.'); },
						timeout: 3000
					}, options);

					var start = Utils.timestamp(),
						elapsed,
						now,
						tid,
						fn = function() {
							now = Utils.timestamp();
							elapsed = now - start;
							Utils.removeFromArray( Galleria._waiters, tid );
							if ( options.until( elapsed ) ) {
								options.success();
								return false;
							}
							if (typeof options.timeout == 'number' && now >= start + options.timeout) {
								options.error();
								return false;
							}
							Galleria._waiters.push( tid = window.setTimeout(fn, 10) );
						};
					Galleria._waiters.push( tid = window.setTimeout(fn, 10) );
				},

				toggleQuality : function( img, force ) {

					if ( ( IE !== 7 && IE !== 8 ) || !img || img.nodeName.toUpperCase() != 'IMG' ) {
						return;
					}

					if ( typeof force === 'undefined' ) {
						force = img.style.msInterpolationMode === 'nearest-neighbor';
					}

					img.style.msInterpolationMode = force ? 'bicubic' : 'nearest-neighbor';
				},

				insertStyleTag : function( styles, id ) {

					if ( id && $( '#'+id ).length ) {
						return;
					}

					var style = doc.createElement( 'style' );
					if ( id ) {
						style.id = id;
					}

					DOM().head.appendChild( style );

					if ( style.styleSheet ) { // IE
						style.styleSheet.cssText = styles;
					} else {
						var cssText = doc.createTextNode( styles );
						style.appendChild( cssText );
					}
				},

				// a loadscript method that works for local scripts
				loadScript: function( url, callback ) {

					var done = false,
						script = $('<scr'+'ipt>').attr({
							src: url,
							async: true
						}).get(0);

					// Attach handlers for all browsers
					script.onload = script.onreadystatechange = function() {
						if ( !done && (!this.readyState ||
								this.readyState === 'loaded' || this.readyState === 'complete') ) {

							done = true;

							// Handle memory leak in IE
							script.onload = script.onreadystatechange = null;

							if (typeof callback === 'function') {
								callback.call( this, this );
							}
						}
					};

					DOM().head.appendChild( script );
				},

				// parse anything into a number
				parseValue: function( val ) {
					if (typeof val === 'number') {
						return val;
					} else if (typeof val === 'string') {
						var arr = val.match(/\-?\d|\./g);
						return arr && arr.constructor === Array ? arr.join('')*1 : 0;
					} else {
						return 0;
					}
				},

				// timestamp abstraction
				timestamp: function() {
					return new Date().getTime();
				},

				loadCSS : function( href, id, callback ) {

					var link,
						length;

					// look for manual css
					$('link[rel=stylesheet]').each(function() {
						if ( new RegExp( href ).test( this.href ) ) {
							link = this;
							return false;
						}
					});

					if ( typeof id === 'function' ) {
						callback = id;
						id = undef;
					}

					callback = callback || F; // dirty

					// if already present, return
					if ( link ) {
						callback.call( link, link );
						return link;
					}

					// save the length of stylesheets to check against
					length = doc.styleSheets.length;

					// check for existing id
					if( $( '#' + id ).length ) {

						$( '#' + id ).attr( 'href', href );
						length--;

					} else {
						link = $( '<link>' ).attr({
							rel: 'stylesheet',
							href: href,
							id: id
						}).get(0);

						var styles = $('link[rel="stylesheet"], style');
						if ( styles.length ) {
							styles.get(0).parentNode.insertBefore( link, styles[0] );
						} else {
							DOM().head.appendChild( link );
						}

						if ( IE && length >= 31 ) {
							Galleria.raise( 'You have reached the browser stylesheet limit (31)', true );
							return;
						}
					}

					if ( typeof callback === 'function' ) {

						// First check for dummy element (new in 1.2.8)
						var $loader = $('<s>').attr( 'id', 'galleria-loader' ).hide().appendTo( DOM().body );

						Utils.wait({
							until: function() {
								return $loader.height() > 0;
							},
							success: function() {
								$loader.remove();
								callback.call( link, link );
							},
							error: function() {
								$loader.remove();

								// If failed, tell the dev to download the latest theme
								Galleria.raise( 'Theme CSS could not load after 20 sec. ' + ( Galleria.QUIRK ?
									'Your browser is in Quirks Mode, please add a correct doctype.' :
									'Please download the latest theme at http://galleria.io/customer/.' ), true );
							},
							timeout: 5000
						});
					}
					return link;
				}
			};
		}()),

		// play icon
		_playIcon = function( container ) {

			var css = '.galleria-videoicon{width:60px;height:60px;position:absolute;top:50%;left:50%;z-index:1;' +
				'margin:-30px 0 0 -30px;cursor:pointer;background:#000;background:rgba(0,0,0,.8);border-radius:3px;-webkit-transition:all 150ms}' +
				'.galleria-videoicon i{width:0px;height:0px;border-style:solid;border-width:10px 0 10px 16px;display:block;' +
				'border-color:transparent transparent transparent #ffffff;margin:20px 0 0 22px}.galleria-image:hover .galleria-videoicon{background:#000}';

			Utils.insertStyleTag( css, 'galleria-videoicon' );

			return $( Utils.create( 'galleria-videoicon' ) ).html( '<i></i>' ).appendTo( container )
				.click( function() { $( this ).siblings( 'img' ).mouseup(); });
		},

		// the transitions holder
		_transitions = (function() {

			var _slide = function(params, complete, fade, door) {

				var easing = this.getOptions('easing'),
					distance = this.getStageWidth(),
					from = { left: distance * ( params.rewind ? -1 : 1 ) },
					to = { left: 0 };

				if ( fade ) {
					from.opacity = 0;
					to.opacity = 1;
				} else {
					from.opacity = 1;
				}

				$(params.next).css(from);

				Utils.animate(params.next, to, {
					duration: params.speed,
					complete: (function( elems ) {
						return function() {
							complete();
							elems.css({
								left: 0
							});
						};
					}( $( params.next ).add( params.prev ) )),
					queue: false,
					easing: easing
				});

				if (door) {
					params.rewind = !params.rewind;
				}

				if (params.prev) {

					from = { left: 0 };
					to = { left: distance * ( params.rewind ? 1 : -1 ) };

					if ( fade ) {
						from.opacity = 1;
						to.opacity = 0;
					}

					$(params.prev).css(from);
					Utils.animate(params.prev, to, {
						duration: params.speed,
						queue: false,
						easing: easing,
						complete: function() {
							$(this).css('opacity', 0);
						}
					});
				}
			};

			return {

				active: false,

				init: function( effect, params, complete ) {
					if ( _transitions.effects.hasOwnProperty( effect ) ) {
						_transitions.effects[ effect ].call( this, params, complete );
					}
				},

				effects: {

					fade: function(params, complete) {
						$(params.next).css({
							opacity: 0,
							left: 0
						});
						Utils.animate(params.next, {
							opacity: 1
						},{
							duration: params.speed,
							complete: complete
						});
						if (params.prev) {
							$(params.prev).css('opacity',1).show();
							Utils.animate(params.prev, {
								opacity: 0
							},{
								duration: params.speed
							});
						}
					},

					flash: function(params, complete) {
						$(params.next).css({
							opacity: 0,
							left: 0
						});
						if (params.prev) {
							Utils.animate( params.prev, {
								opacity: 0
							},{
								duration: params.speed/2,
								complete: function() {
									Utils.animate( params.next, {
										opacity:1
									},{
										duration: params.speed,
										complete: complete
									});
								}
							});
						} else {
							Utils.animate( params.next, {
								opacity: 1
							},{
								duration: params.speed,
								complete: complete
							});
						}
					},

					pulse: function(params, complete) {
						if (params.prev) {
							$(params.prev).hide();
						}
						$(params.next).css({
							opacity: 0,
							left: 0
						}).show();
						Utils.animate(params.next, {
							opacity:1
						},{
							duration: params.speed,
							complete: complete
						});
					},

					slide: function(params, complete) {
						_slide.apply( this, Utils.array( arguments ) );
					},

					fadeslide: function(params, complete) {
						_slide.apply( this, Utils.array( arguments ).concat( [true] ) );
					},

					doorslide: function(params, complete) {
						_slide.apply( this, Utils.array( arguments ).concat( [false, true] ) );
					}
				}
			};
		}());

// listen to fullscreen
	_nativeFullscreen.listen();

// create special click:fast event for fast touch interaction
	$.event.special['click:fast'] = {
		propagate: true,
		add: function(handleObj) {

			var getCoords = function(e) {
				if ( e.touches && e.touches.length ) {
					var touch = e.touches[0];
					return {
						x: touch.pageX,
						y: touch.pageY
					};
				}
			};

			var def = {
				touched: false,
				touchdown: false,
				coords: { x:0, y:0 },
				evObj: {}
			};

			$(this).data({
				clickstate: def,
				timer: 0
			}).on('touchstart.fast', function(e) {
				window.clearTimeout($(this).data('timer'));
				$(this).data('clickstate', {
					touched: true,
					touchdown: true,
					coords: getCoords(e.originalEvent),
					evObj: e
				});
			}).on('touchmove.fast', function(e) {
				var coords = getCoords(e.originalEvent),
					state = $(this).data('clickstate'),
					distance = Math.max(
						Math.abs(state.coords.x - coords.x),
						Math.abs(state.coords.y - coords.y)
					);
				if ( distance > 6 ) {
					$(this).data('clickstate', $.extend(state, {
						touchdown: false
					}));
				}
			}).on('touchend.fast', function(e) {
				var $this = $(this),
					state = $this.data('clickstate');
				if(state.touchdown) {
					handleObj.handler.call(this, e);
				}
				$this.data('timer', window.setTimeout(function() {
					$this.data('clickstate', def);
				}, 400));
			}).on('click.fast', function(e) {
				var state = $(this).data('clickstate');
				if ( state.touched ) {
					return false;
				}
				$(this).data('clickstate', def);
				handleObj.handler.call(this, e);
			});
		},
		remove: function() {
			$(this).off('touchstart.fast touchmove.fast touchend.fast click.fast');
		}
	};

// trigger resize on orientationchange (IOS7)
	$win.on( 'orientationchange', function() {
		$(this).resize();
	});

	/**
	 The main Galleria class

	 @class
	 @constructor

	 @example var gallery = new Galleria();

	 @author http://wib.io

	 @requires jQuery

	 */

	Galleria = function() {

		var self = this;

		// internal options
		this._options = {};

		// flag for controlling play/pause
		this._playing = false;

		// internal interval for slideshow
		this._playtime = 5000;

		// internal variable for the currently active image
		this._active = null;

		// the internal queue, arrayified
		this._queue = { length: 0 };

		// the internal data array
		this._data = [];

		// the internal dom collection
		this._dom = {};

		// the internal thumbnails array
		this._thumbnails = [];

		// the internal layers array
		this._layers = [];

		// internal init flag
		this._initialized = false;

		// internal firstrun flag
		this._firstrun = false;

		// global stagewidth/height
		this._stageWidth = 0;
		this._stageHeight = 0;

		// target holder
		this._target = undef;

		// bind hashes
		this._binds = [];

		// instance id
		this._id = parseInt(M.random()*10000, 10);

		// add some elements
		var divs =  'container stage images image-nav image-nav-left image-nav-right ' +
			'info info-text info-title info-description ' +
			'thumbnails thumbnails-list thumbnails-container thumb-nav-left thumb-nav-right ' +
			'loader counter tooltip',
			spans = 'current total';

		$.each( divs.split(' '), function( i, elemId ) {
			self._dom[ elemId ] = Utils.create( 'galleria-' + elemId );
		});

		$.each( spans.split(' '), function( i, elemId ) {
			self._dom[ elemId ] = Utils.create( 'galleria-' + elemId, 'span' );
		});

		// the internal keyboard object
		// keeps reference of the keybinds and provides helper methods for binding keys
		var keyboard = this._keyboard = {

			keys : {
				'UP': 38,
				'DOWN': 40,
				'LEFT': 37,
				'RIGHT': 39,
				'RETURN': 13,
				'ESCAPE': 27,
				'BACKSPACE': 8,
				'SPACE': 32
			},

			map : {},

			bound: false,

			press: function(e) {
				var key = e.keyCode || e.which;
				if ( key in keyboard.map && typeof keyboard.map[key] === 'function' ) {
					keyboard.map[key].call(self, e);
				}
			},

			attach: function(map) {

				var key, up;

				for( key in map ) {
					if ( map.hasOwnProperty( key ) ) {
						up = key.toUpperCase();
						if ( up in keyboard.keys ) {
							keyboard.map[ keyboard.keys[up] ] = map[key];
						} else {
							keyboard.map[ up ] = map[key];
						}
					}
				}
				if ( !keyboard.bound ) {
					keyboard.bound = true;
					$doc.on('keydown', keyboard.press);
				}
			},

			detach: function() {
				keyboard.bound = false;
				keyboard.map = {};
				$doc.off('keydown', keyboard.press);
			}
		};

		// internal controls for keeping track of active / inactive images
		var controls = this._controls = {

			0: undef,

			1: undef,

			active : 0,

			swap : function() {
				controls.active = controls.active ? 0 : 1;
			},

			getActive : function() {
				return self._options.swipe ? controls.slides[ self._active ] : controls[ controls.active ];
			},

			getNext : function() {
				return self._options.swipe ? controls.slides[ self.getNext( self._active ) ] : controls[ 1 - controls.active ];
			},

			slides : [],

			frames: [],

			layers: []
		};

		// internal carousel object
		var carousel = this._carousel = {

			// shortcuts
			next: self.$('thumb-nav-right'),
			prev: self.$('thumb-nav-left'),

			// cache the width
			width: 0,

			// track the current position
			current: 0,

			// cache max value
			max: 0,

			// save all hooks for each width in an array
			hooks: [],

			// update the carousel
			// you can run this method anytime, f.ex on window.resize
			update: function() {
				var w = 0,
					h = 0,
					hooks = [0];

				$.each( self._thumbnails, function( i, thumb ) {
					if ( thumb.ready ) {
						w += thumb.outerWidth || $( thumb.container ).outerWidth( true );
						// Due to a bug in jquery, outerwidth() returns the floor of the actual outerwidth,
						// if the browser is zoom to a value other than 100%. height() returns the floating point value.
						var containerWidth = $( thumb.container).width();
						w += containerWidth - M.floor(containerWidth);

						hooks[ i+1 ] = w;
						h = M.max( h, thumb.outerHeight || $( thumb.container).outerHeight( true ) );
					}
				});

				self.$( 'thumbnails' ).css({
					width: w,
					height: h
				});

				carousel.max = w;
				carousel.hooks = hooks;
				carousel.width = self.$( 'thumbnails-list' ).width();
				carousel.setClasses();

				self.$( 'thumbnails-container' ).toggleClass( 'galleria-carousel', w > carousel.width );

				// one extra calculation
				carousel.width = self.$( 'thumbnails-list' ).width();

				// todo: fix so the carousel moves to the left
			},

			bindControls: function() {

				var i;

				carousel.next.on( 'click:fast', function(e) {
					e.preventDefault();

					if ( self._options.carouselSteps === 'auto' ) {

						for ( i = carousel.current; i < carousel.hooks.length; i++ ) {
							if ( carousel.hooks[i] - carousel.hooks[ carousel.current ] > carousel.width ) {
								carousel.set(i - 2);
								break;
							}
						}

					} else {
						carousel.set( carousel.current + self._options.carouselSteps);
					}
				});

				carousel.prev.on( 'click:fast', function(e) {
					e.preventDefault();

					if ( self._options.carouselSteps === 'auto' ) {

						for ( i = carousel.current; i >= 0; i-- ) {
							if ( carousel.hooks[ carousel.current ] - carousel.hooks[i] > carousel.width ) {
								carousel.set( i + 2 );
								break;
							} else if ( i === 0 ) {
								carousel.set( 0 );
								break;
							}
						}
					} else {
						carousel.set( carousel.current - self._options.carouselSteps );
					}
				});
			},

			// calculate and set positions
			set: function( i ) {
				i = M.max( i, 0 );
				while ( carousel.hooks[i - 1] + carousel.width >= carousel.max && i >= 0 ) {
					i--;
				}
				carousel.current = i;
				carousel.animate();
			},

			// get the last position
			getLast: function(i) {
				return ( i || carousel.current ) - 1;
			},

			// follow the active image
			follow: function(i) {

				//don't follow if position fits
				if ( i === 0 || i === carousel.hooks.length - 2 ) {
					carousel.set( i );
					return;
				}

				// calculate last position
				var last = carousel.current;
				while( carousel.hooks[last] - carousel.hooks[ carousel.current ] <
				carousel.width && last <= carousel.hooks.length ) {
					last ++;
				}

				// set position
				if ( i - 1 < carousel.current ) {
					carousel.set( i - 1 );
				} else if ( i + 2 > last) {
					carousel.set( i - last + carousel.current + 2 );
				}
			},

			// helper for setting disabled classes
			setClasses: function() {
				carousel.prev.toggleClass( 'disabled', !carousel.current );
				carousel.next.toggleClass( 'disabled', carousel.hooks[ carousel.current ] + carousel.width >= carousel.max );
			},

			// the animation method
			animate: function(to) {
				carousel.setClasses();
				var num = carousel.hooks[ carousel.current ] * -1;

				if ( isNaN( num ) ) {
					return;
				}

				// FF 24 bug
				self.$( 'thumbnails' ).css('left', function() {
					return $(this).css('left');
				});

				Utils.animate(self.get( 'thumbnails' ), {
					left: num
				},{
					duration: self._options.carouselSpeed,
					easing: self._options.easing,
					queue: false
				});
			}
		};

		// tooltip control
		// added in 1.2
		var tooltip = this._tooltip = {

			initialized : false,

			open: false,

			timer: 'tooltip' + self._id,

			swapTimer: 'swap' + self._id,

			init: function() {

				tooltip.initialized = true;

				var css = '.galleria-tooltip{padding:3px 8px;max-width:50%;background:#ffe;color:#000;z-index:3;position:absolute;font-size:11px;line-height:1.3;' +
					'opacity:0;box-shadow:0 0 2px rgba(0,0,0,.4);-moz-box-shadow:0 0 2px rgba(0,0,0,.4);-webkit-box-shadow:0 0 2px rgba(0,0,0,.4);}';

				Utils.insertStyleTag( css, 'galleria-tooltip' );

				self.$( 'tooltip' ).css({
					opacity: 0.8,
					visibility: 'visible',
					display: 'none'
				});

			},

			// move handler
			move: function( e ) {
				var mouseX = self.getMousePosition(e).x,
					mouseY = self.getMousePosition(e).y,
					$elem = self.$( 'tooltip' ),
					x = mouseX,
					y = mouseY,
					height = $elem.outerHeight( true ) + 1,
					width = $elem.outerWidth( true ),
					limitY = height + 15;

				var maxX = self.$( 'container' ).width() - width - 2,
					maxY = self.$( 'container' ).height() - height - 2;

				if ( !isNaN(x) && !isNaN(y) ) {

					x += 10;
					y -= ( height+8 );

					x = M.max( 0, M.min( maxX, x ) );
					y = M.max( 0, M.min( maxY, y ) );

					if( mouseY < limitY ) {
						y = limitY;
					}

					$elem.css({ left: x, top: y });
				}
			},

			// bind elements to the tooltip
			// you can bind multiple elementIDs using { elemID : function } or { elemID : string }
			// you can also bind single DOM elements using bind(elem, string)
			bind: function( elem, value ) {

				// todo: revise if alternative tooltip is needed for mobile devices
				if (Galleria.TOUCH) {
					return;
				}

				if (! tooltip.initialized ) {
					tooltip.init();
				}

				var mouseout = function() {
					self.$( 'container' ).off( 'mousemove', tooltip.move );
					self.clearTimer( tooltip.timer );

					self.$( 'tooltip' ).stop().animate({
						opacity: 0
					}, 200, function() {

						self.$( 'tooltip' ).hide();

						self.addTimer( tooltip.swapTimer, function() {
							tooltip.open = false;
						}, 1000);
					});
				};

				var hover = function( elem, value) {

					tooltip.define( elem, value );

					$( elem ).hover(function() {

						self.clearTimer( tooltip.swapTimer );
						self.$('container').off( 'mousemove', tooltip.move ).on( 'mousemove', tooltip.move ).trigger( 'mousemove' );
						tooltip.show( elem );

						self.addTimer( tooltip.timer, function() {
							self.$( 'tooltip' ).stop().show().animate({
								opacity: 1
							});
							tooltip.open = true;

						}, tooltip.open ? 0 : 500);

					}, mouseout).click(mouseout);
				};

				if ( typeof value === 'string' ) {
					hover( ( elem in self._dom ? self.get( elem ) : elem ), value );
				} else {
					// asume elemID here
					$.each( elem, function( elemID, val ) {
						hover( self.get(elemID), val );
					});
				}
			},

			show: function( elem ) {

				elem = $( elem in self._dom ? self.get(elem) : elem );

				var text = elem.data( 'tt' ),
					mouseup = function( e ) {

						// attach a tiny settimeout to make sure the new tooltip is filled
						window.setTimeout( (function( ev ) {
							return function() {
								tooltip.move( ev );
							};
						}( e )), 10);

						elem.off( 'mouseup', mouseup );

					};

				text = typeof text === 'function' ? text() : text;

				if ( ! text ) {
					return;
				}

				self.$( 'tooltip' ).html( text.replace(/\s/, '&#160;') );

				// trigger mousemove on mouseup in case of click
				elem.on( 'mouseup', mouseup );
			},

			define: function( elem, value ) {

				// we store functions, not strings
				if (typeof value !== 'function') {
					var s = value;
					value = function() {
						return s;
					};
				}

				elem = $( elem in self._dom ? self.get(elem) : elem ).data('tt', value);

				tooltip.show( elem );

			}
		};

		// internal fullscreen control
		var fullscreen = this._fullscreen = {

			scrolled: 0,

			crop: undef,

			active: false,

			prev: $(),

			beforeEnter: function(fn){ fn(); },
			beforeExit:  function(fn){ fn(); },

			keymap: self._keyboard.map,

			parseCallback: function( callback, enter ) {

				return _transitions.active ? function() {
					if ( typeof callback == 'function' ) {
						callback.call(self);
					}
					var active = self._controls.getActive(),
						next = self._controls.getNext();

					self._scaleImage( next );
					self._scaleImage( active );

					if ( enter && self._options.trueFullscreen ) {
						// Firefox bug, revise later
						$( active.container ).add( next.container ).trigger( 'transitionend' );
					}

				} : callback;

			},

			enter: function( callback ) {

				fullscreen.beforeEnter(function() {

					callback = fullscreen.parseCallback( callback, true );

					if ( self._options.trueFullscreen && _nativeFullscreen.support ) {

						// do some stuff prior animation for wmoother transitions

						fullscreen.active = true;

						Utils.forceStyles( self.get('container'), {
							width: '100%',
							height: '100%'
						});

						self.rescale();

						if ( Galleria.MAC ) {
							if ( !( Galleria.SAFARI && /version\/[1-5]/.test(NAV)) ) {
								self.$('container').css('opacity', 0).addClass('fullscreen');
								window.setTimeout(function() {
									fullscreen.scale();
									self.$('container').css('opacity', 1);
								}, 50);
							} else {
								self.$('stage').css('opacity', 0);
								window.setTimeout(function() {
									fullscreen.scale();
									self.$('stage').css('opacity', 1);
								},4);
							}
						} else {
							self.$('container').addClass('fullscreen');
						}

						$win.resize( fullscreen.scale );

						_nativeFullscreen.enter( self, callback, self.get('container') );

					} else {

						fullscreen.scrolled = $win.scrollTop();
						if( !Galleria.TOUCH ) {
							window.scrollTo(0, 0);
						}

						fullscreen._enter( callback );
					}
				});

			},

			_enter: function( callback ) {

				fullscreen.active = true;

				if ( IFRAME ) {

					fullscreen.iframe = (function() {

						var elem,
							refer = doc.referrer,
							test = doc.createElement('a'),
							loc = window.location;

						test.href = refer;

						if( test.protocol != loc.protocol ||
							test.hostname != loc.hostname ||
							test.port != loc.port ) {
							Galleria.raise('Parent fullscreen not available. Iframe protocol, domains and ports must match.');
							return false;
						}

						fullscreen.pd = window.parent.document;

						$( fullscreen.pd ).find('iframe').each(function() {
							var idoc = this.contentDocument || this.contentWindow.document;
							if ( idoc === doc ) {
								elem = this;
								return false;
							}
						});

						return elem;
					}());

				}

				// hide the image until rescale is complete
				Utils.hide( self.getActiveImage() );

				if ( IFRAME && fullscreen.iframe ) {
					fullscreen.iframe.scrolled = $( window.parent ).scrollTop();
					window.parent.scrollTo(0, 0);
				}

				var data = self.getData(),
					options = self._options,
					inBrowser = !self._options.trueFullscreen || !_nativeFullscreen.support,
					htmlbody = {
						height: '100%',
						overflow: 'hidden',
						margin:0,
						padding:0
					};

				if (inBrowser) {

					self.$('container').addClass('fullscreen');
					fullscreen.prev = self.$('container').prev();

					if ( !fullscreen.prev.length ) {
						fullscreen.parent = self.$( 'container' ).parent();
					}

					// move
					self.$( 'container' ).appendTo( 'body' );

					// begin styleforce

					Utils.forceStyles(self.get('container'), {
						position: Galleria.TOUCH ? 'absolute' : 'fixed',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						zIndex: 10000
					});
					Utils.forceStyles( DOM().html, htmlbody );
					Utils.forceStyles( DOM().body, htmlbody );
				}

				if ( IFRAME && fullscreen.iframe ) {
					Utils.forceStyles( fullscreen.pd.documentElement, htmlbody );
					Utils.forceStyles( fullscreen.pd.body, htmlbody );
					Utils.forceStyles( fullscreen.iframe, $.extend( htmlbody, {
						width: '100%',
						height: '100%',
						top: 0,
						left: 0,
						position: 'fixed',
						zIndex: 10000,
						border: 'none'
					}));
				}

				// temporarily attach some keys
				// save the old ones first in a cloned object
				fullscreen.keymap = $.extend({}, self._keyboard.map);

				self.attachKeyboard({
					escape: self.exitFullscreen,
					right: self.next,
					left: self.prev
				});

				// temporarily save the crop
				fullscreen.crop = options.imageCrop;

				// set fullscreen options
				if ( options.fullscreenCrop != undef ) {
					options.imageCrop = options.fullscreenCrop;
				}

				// swap to big image if it's different from the display image
				if ( data && data.big && data.image !== data.big ) {
					var big    = new Galleria.Picture(),
						cached = big.isCached( data.big ),
						index  = self.getIndex(),
						thumb  = self._thumbnails[ index ];

					self.trigger( {
						type: Galleria.LOADSTART,
						cached: cached,
						rewind: false,
						index: index,
						imageTarget: self.getActiveImage(),
						thumbTarget: thumb,
						galleriaData: data
					});

					big.load( data.big, function( big ) {
						self._scaleImage( big, {
							complete: function( big ) {
								self.trigger({
									type: Galleria.LOADFINISH,
									cached: cached,
									index: index,
									rewind: false,
									imageTarget: big.image,
									thumbTarget: thumb
								});
								var image = self._controls.getActive().image;
								if ( image ) {
									$( image ).width( big.image.width ).height( big.image.height )
										.attr( 'style', $( big.image ).attr('style') )
										.attr( 'src', big.image.src );
								}
							}
						});
					});

					var n = self.getNext(index),
						p = new Galleria.Picture(),
						ndata = self.getData( n );
					p.preload( self.isFullscreen() && ndata.big ? ndata.big : ndata.image );
				}

				// init the first rescale and attach callbacks

				self.rescale(function() {

					self.addTimer(false, function() {
						// show the image after 50 ms
						if ( inBrowser ) {
							Utils.show( self.getActiveImage() );
						}

						if (typeof callback === 'function') {
							callback.call( self );
						}
						self.rescale();

					}, 100);

					self.trigger( Galleria.FULLSCREEN_ENTER );
				});

				if ( !inBrowser ) {
					Utils.show( self.getActiveImage() );
				} else {
					$win.resize( fullscreen.scale );
				}

			},

			scale : function() {
				self.rescale();
			},

			exit: function( callback ) {

				fullscreen.beforeExit(function() {

					callback = fullscreen.parseCallback( callback );

					if ( self._options.trueFullscreen && _nativeFullscreen.support ) {
						_nativeFullscreen.exit( callback );
					} else {
						fullscreen._exit( callback );
					}
				});
			},

			_exit: function( callback ) {

				fullscreen.active = false;

				var inBrowser = !self._options.trueFullscreen || !_nativeFullscreen.support,
					$container = self.$( 'container' ).removeClass( 'fullscreen' );

				// move back
				if ( fullscreen.parent ) {
					fullscreen.parent.prepend( $container );
				} else {
					$container.insertAfter( fullscreen.prev );
				}

				if ( inBrowser ) {
					Utils.hide( self.getActiveImage() );

					// revert all styles
					Utils.revertStyles( self.get('container'), DOM().html, DOM().body );

					// scroll back
					if( !Galleria.TOUCH ) {
						window.scrollTo(0, fullscreen.scrolled);
					}

					// reload iframe src manually
					var frame = self._controls.frames[ self._controls.active ];
					if ( frame && frame.image ) {
						frame.image.src = frame.image.src;
					}
				}

				if ( IFRAME && fullscreen.iframe ) {
					Utils.revertStyles( fullscreen.pd.documentElement, fullscreen.pd.body, fullscreen.iframe );
					if ( fullscreen.iframe.scrolled ) {
						window.parent.scrollTo(0, fullscreen.iframe.scrolled );
					}
				}

				// detach all keyboard events and apply the old keymap
				self.detachKeyboard();
				self.attachKeyboard( fullscreen.keymap );

				// bring back cached options
				self._options.imageCrop = fullscreen.crop;

				// return to original image
				var big = self.getData().big,
					image = self._controls.getActive().image;

				if ( !self.getData().iframe && image && big && big == image.src ) {

					window.setTimeout(function(src) {
						return function() {
							image.src = src;
						};
					}( self.getData().image ), 1 );

				}

				self.rescale(function() {
					self.addTimer(false, function() {

						// show the image after 50 ms
						if ( inBrowser ) {
							Utils.show( self.getActiveImage() );
						}

						if ( typeof callback === 'function' ) {
							callback.call( self );
						}

						$win.trigger( 'resize' );

					}, 50);
					self.trigger( Galleria.FULLSCREEN_EXIT );
				});

				$win.off('resize', fullscreen.scale);
			}
		};

		// the internal idle object for controlling idle states
		var idle = this._idle = {

			trunk: [],

			bound: false,

			active: false,

			add: function(elem, to, from, hide) {
				if ( !elem || Galleria.TOUCH ) {
					return;
				}
				if (!idle.bound) {
					idle.addEvent();
				}
				elem = $(elem);

				if ( typeof from == 'boolean' ) {
					hide = from;
					from = {};
				}

				from = from || {};

				var extract = {},
					style;

				for ( style in to ) {
					if ( to.hasOwnProperty( style ) ) {
						extract[ style ] = elem.css( style );
					}
				}

				elem.data('idle', {
					from: $.extend( extract, from ),
					to: to,
					complete: true,
					busy: false
				});

				if ( !hide ) {
					idle.addTimer();
				} else {
					elem.css( to );
				}
				idle.trunk.push(elem);
			},

			remove: function(elem) {

				elem = $(elem);

				$.each(idle.trunk, function(i, el) {
					if ( el && el.length && !el.not(elem).length ) {
						elem.css( elem.data( 'idle' ).from );
						idle.trunk.splice(i, 1);
					}
				});

				if (!idle.trunk.length) {
					idle.removeEvent();
					self.clearTimer( idle.timer );
				}
			},

			addEvent : function() {
				idle.bound = true;
				self.$('container').on( 'mousemove click', idle.showAll );
				if ( self._options.idleMode == 'hover' ) {
					self.$('container').on( 'mouseleave', idle.hide );
				}
			},

			removeEvent : function() {
				idle.bound = false;
				self.$('container').on( 'mousemove click', idle.showAll );
				if ( self._options.idleMode == 'hover' ) {
					self.$('container').off( 'mouseleave', idle.hide );
				}
			},

			addTimer : function() {
				if( self._options.idleMode == 'hover' ) {
					return;
				}
				self.addTimer( 'idle', function() {
					idle.hide();
				}, self._options.idleTime );
			},

			hide : function() {

				if ( !self._options.idleMode || self.getIndex() === false ) {
					return;
				}

				self.trigger( Galleria.IDLE_ENTER );

				var len = idle.trunk.length;

				$.each( idle.trunk, function(i, elem) {

					var data = elem.data('idle');

					if (! data) {
						return;
					}

					elem.data('idle').complete = false;

					Utils.animate( elem, data.to, {
						duration: self._options.idleSpeed,
						complete: function() {
							if ( i == len-1 ) {
								idle.active = false;
							}
						}
					});
				});
			},

			showAll : function() {

				self.clearTimer( 'idle' );

				$.each( idle.trunk, function( i, elem ) {
					idle.show( elem );
				});
			},

			show: function(elem) {

				var data = elem.data('idle');

				if ( !idle.active || ( !data.busy && !data.complete ) ) {

					data.busy = true;

					self.trigger( Galleria.IDLE_EXIT );

					self.clearTimer( 'idle' );

					Utils.animate( elem, data.from, {
						duration: self._options.idleSpeed/2,
						complete: function() {
							idle.active = true;
							$(elem).data('idle').busy = false;
							$(elem).data('idle').complete = true;
						}
					});

				}
				idle.addTimer();
			}
		};

		// internal lightbox object
		// creates a predesigned lightbox for simple popups of images in galleria
		var lightbox = this._lightbox = {

			width : 0,

			height : 0,

			initialized : false,

			active : null,

			image : null,

			elems : {},

			keymap: false,

			init : function() {

				if ( lightbox.initialized ) {
					return;
				}
				lightbox.initialized = true;

				// create some elements to work with
				var elems = 'overlay box content shadow title info close prevholder prev nextholder next counter image',
					el = {},
					op = self._options,
					css = '',
					abs = 'position:absolute;',
					prefix = 'lightbox-',
					cssMap = {
						overlay:    'position:fixed;display:none;opacity:'+op.overlayOpacity+';filter:alpha(opacity='+(op.overlayOpacity*100)+
						');top:0;left:0;width:100%;height:100%;background:'+op.overlayBackground+';z-index:99990',
						box:        'position:fixed;display:none;width:400px;height:400px;top:50%;left:50%;margin-top:-200px;margin-left:-200px;z-index:99991',
						shadow:     abs+'background:#000;width:100%;height:100%;',
						content:    abs+'background-color:#fff;top:10px;left:10px;right:10px;bottom:10px;overflow:hidden',
						info:       abs+'bottom:10px;left:10px;right:10px;color:#444;font:11px/13px arial,sans-serif;height:13px',
						close:      abs+'top:10px;right:10px;height:20px;width:20px;background:#fff;text-align:center;cursor:pointer;color:#444;font:16px/22px arial,sans-serif;z-index:99999',
						image:      abs+'top:10px;left:10px;right:10px;bottom:30px;overflow:hidden;display:block;',
						prevholder: abs+'width:50%;top:0;bottom:40px;cursor:pointer;',
						nextholder: abs+'width:50%;top:0;bottom:40px;right:-1px;cursor:pointer;',
						prev:       abs+'top:50%;margin-top:-20px;height:40px;width:30px;background:#fff;left:20px;display:none;text-align:center;color:#000;font:bold 16px/36px arial,sans-serif',
						next:       abs+'top:50%;margin-top:-20px;height:40px;width:30px;background:#fff;right:20px;left:auto;display:none;font:bold 16px/36px arial,sans-serif;text-align:center;color:#000',
						title:      'float:left',
						counter:    'float:right;margin-left:8px;'
					},
					hover = function(elem) {
						return elem.hover(
							function() { $(this).css( 'color', '#bbb' ); },
							function() { $(this).css( 'color', '#444' ); }
						);
					},
					appends = {};

				// fix for navigation hovers transparent background event "feature"
				var exs = '';
				if ( IE > 7 ) {
					exs = IE < 9 ? 'background:#000;filter:alpha(opacity=0);' : 'background:rgba(0,0,0,0);';
				} else {
					exs = 'z-index:99999';
				}

				cssMap.nextholder += exs;
				cssMap.prevholder += exs;

				// create and insert CSS
				$.each(cssMap, function( key, value ) {
					css += '.galleria-'+prefix+key+'{'+value+'}';
				});

				css += '.galleria-'+prefix+'box.iframe .galleria-'+prefix+'prevholder,'+
					'.galleria-'+prefix+'box.iframe .galleria-'+prefix+'nextholder{'+
					'width:100px;height:100px;top:50%;margin-top:-70px}';

				Utils.insertStyleTag( css, 'galleria-lightbox' );

				// create the elements
				$.each(elems.split(' '), function( i, elemId ) {
					self.addElement( 'lightbox-' + elemId );
					el[ elemId ] = lightbox.elems[ elemId ] = self.get( 'lightbox-' + elemId );
				});

				// initiate the image
				lightbox.image = new Galleria.Picture();

				// append the elements
				$.each({
					box: 'shadow content close prevholder nextholder',
					info: 'title counter',
					content: 'info image',
					prevholder: 'prev',
					nextholder: 'next'
				}, function( key, val ) {
					var arr = [];
					$.each( val.split(' '), function( i, prop ) {
						arr.push( prefix + prop );
					});
					appends[ prefix+key ] = arr;
				});

				self.append( appends );

				$( el.image ).append( lightbox.image.container );

				$( DOM().body ).append( el.overlay, el.box );

				// add the prev/next nav and bind some controls

				hover( $( el.close ).on( 'click:fast', lightbox.hide ).html('&#215;') );

				$.each( ['Prev','Next'], function(i, dir) {

					var $d = $( el[ dir.toLowerCase() ] ).html( /v/.test( dir ) ? '&#8249;&#160;' : '&#160;&#8250;' ),
						$e = $( el[ dir.toLowerCase()+'holder'] );

					$e.on( 'click:fast', function() {
						lightbox[ 'show' + dir ]();
					});

					// IE7 and touch devices will simply show the nav
					if ( IE < 8 || Galleria.TOUCH ) {
						$d.show();
						return;
					}

					$e.hover( function() {
						$d.show();
					}, function(e) {
						$d.stop().fadeOut( 200 );
					});

				});
				$( el.overlay ).on( 'click:fast', lightbox.hide );

				// the lightbox animation is slow on ipad
				if ( Galleria.IPAD ) {
					self._options.lightboxTransitionSpeed = 0;
				}

			},

			rescale: function(event) {

				// calculate
				var width = M.min( $win.width()-40, lightbox.width ),
					height = M.min( $win.height()-60, lightbox.height ),
					ratio = M.min( width / lightbox.width, height / lightbox.height ),
					destWidth = M.round( lightbox.width * ratio ) + 40,
					destHeight = M.round( lightbox.height * ratio ) + 60,
					to = {
						width: destWidth,
						height: destHeight,
						'margin-top': M.ceil( destHeight / 2 ) *- 1,
						'margin-left': M.ceil( destWidth / 2 ) *- 1
					};

				// if rescale event, don't animate
				if ( event ) {
					$( lightbox.elems.box ).css( to );
				} else {
					$( lightbox.elems.box ).animate( to, {
						duration: self._options.lightboxTransitionSpeed,
						easing: self._options.easing,
						complete: function() {
							var image = lightbox.image,
								speed = self._options.lightboxFadeSpeed;

							self.trigger({
								type: Galleria.LIGHTBOX_IMAGE,
								imageTarget: image.image
							});

							$( image.container ).show();

							$( image.image ).animate({ opacity: 1 }, speed);
							Utils.show( lightbox.elems.info, speed );
						}
					});
				}
			},

			hide: function() {

				// remove the image
				lightbox.image.image = null;

				$win.off('resize', lightbox.rescale);

				$( lightbox.elems.box ).hide().find( 'iframe' ).remove();

				Utils.hide( lightbox.elems.info );

				self.detachKeyboard();
				self.attachKeyboard( lightbox.keymap );

				lightbox.keymap = false;

				Utils.hide( lightbox.elems.overlay, 200, function() {
					$( this ).hide().css( 'opacity', self._options.overlayOpacity );
					self.trigger( Galleria.LIGHTBOX_CLOSE );
				});
			},

			showNext: function() {
				lightbox.show( self.getNext( lightbox.active ) );
			},

			showPrev: function() {
				lightbox.show( self.getPrev( lightbox.active ) );
			},

			show: function(index) {

				lightbox.active = index = typeof index === 'number' ? index : self.getIndex() || 0;

				if ( !lightbox.initialized ) {
					lightbox.init();
				}

				// trigger the event
				self.trigger( Galleria.LIGHTBOX_OPEN );

				// temporarily attach some keys
				// save the old ones first in a cloned object
				if ( !lightbox.keymap ) {

					lightbox.keymap = $.extend({}, self._keyboard.map);

					self.attachKeyboard({
						escape: lightbox.hide,
						right: lightbox.showNext,
						left: lightbox.showPrev
					});
				}

				$win.off('resize', lightbox.rescale );

				var data = self.getData(index),
					total = self.getDataLength(),
					n = self.getNext( index ),
					ndata, p, i;

				Utils.hide( lightbox.elems.info );

				try {
					for ( i = self._options.preload; i > 0; i-- ) {
						p = new Galleria.Picture();
						ndata = self.getData( n );
						p.preload( ndata.big ? ndata.big : ndata.image );
						n = self.getNext( n );
					}
				} catch(e) {}

				lightbox.image.isIframe = ( data.iframe && !data.image );

				$( lightbox.elems.box ).toggleClass( 'iframe', lightbox.image.isIframe );

				$( lightbox.image.container ).find( '.galleria-videoicon' ).remove();

				lightbox.image.load( data.big || data.image || data.iframe, function( image ) {

					if ( image.isIframe ) {

						var cw = $(window).width(),
							ch = $(window).height();

						if ( image.video && self._options.maxVideoSize ) {
							var r = M.min( self._options.maxVideoSize/cw, self._options.maxVideoSize/ch );
							if ( r < 1 ) {
								cw *= r;
								ch *= r;
							}
						}
						lightbox.width = cw;
						lightbox.height = ch;

					} else {
						lightbox.width = image.original.width;
						lightbox.height = image.original.height;
					}

					$( image.image ).css({
						width: image.isIframe ? '100%' : '100.1%',
						height: image.isIframe ? '100%' : '100.1%',
						top: 0,
						bottom: 0,
						zIndex: 99998,
						opacity: 0,
						visibility: 'visible'
					}).parent().height('100%');

					lightbox.elems.title.innerHTML = data.title || '';
					lightbox.elems.counter.innerHTML = (index + 1) + ' / ' + total;
					$win.resize( lightbox.rescale );
					lightbox.rescale();

					if( data.image && data.iframe ) {

						$( lightbox.elems.box ).addClass('iframe');

						if ( data.video ) {
							var $icon = _playIcon( image.container ).hide();
							window.setTimeout(function() {
								$icon.fadeIn(200);
							}, 200);
						}

						$( image.image ).css( 'cursor', 'pointer' ).mouseup((function(data, image) {
							return function(e) {
								$( lightbox.image.container ).find( '.galleria-videoicon' ).remove();
								e.preventDefault();
								image.isIframe = true;
								image.load( data.iframe + ( data.video ? '&autoplay=1' : '' ), {
									width: '100%',
									height: IE < 8 ? $( lightbox.image.container ).height() : '100%'
								});
							};
						}(data, image)));
					}
				});

				$( lightbox.elems.overlay ).show().css( 'visibility', 'visible' );
				$( lightbox.elems.box ).show();
			}
		};

		// the internal timeouts object
		// provides helper methods for controlling timeouts

		var _timer = this._timer = {

			trunk: {},

			add: function( id, fn, delay, loop ) {
				id = id || new Date().getTime();
				loop = loop || false;
				this.clear( id );
				if ( loop ) {
					var old = fn;
					fn = function() {
						old();
						_timer.add( id, fn, delay );
					};
				}
				this.trunk[ id ] = window.setTimeout( fn, delay );
			},

			clear: function( id ) {

				var del = function( i ) {
					window.clearTimeout( this.trunk[ i ] );
					delete this.trunk[ i ];
				}, i;

				if ( !!id && id in this.trunk ) {
					del.call( this, id );

				} else if ( typeof id === 'undefined' ) {
					for ( i in this.trunk ) {
						if ( this.trunk.hasOwnProperty( i ) ) {
							del.call( this, i );
						}
					}
				}
			}
		};

		return this;
	};

// end Galleria constructor

	Galleria.prototype = {

		// bring back the constructor reference

		constructor: Galleria,

		/**
		 Use this function to initialize the gallery and start loading.
		 Should only be called once per instance.

		 @param {HTMLElement} target The target element
		 @param {Object} options The gallery options

		 @returns Instance
		 */

		init: function( target, options ) {

			options = _legacyOptions( options );

			// save the original ingredients
			this._original = {
				target: target,
				options: options,
				data: null
			};

			// save the target here
			this._target = this._dom.target = target.nodeName ? target : $( target ).get(0);

			// save the original content for destruction
			this._original.html = this._target.innerHTML;

			// push the instance
			_instances.push( this );

			// raise error if no target is detected
			if ( !this._target ) {
				Galleria.raise('Target not found', true);
				return;
			}

			// apply options
			this._options = {
				autoplay: false,
				carousel: true,
				carouselFollow: true, // legacy, deprecate at 1.3
				carouselSpeed: 400,
				carouselSteps: 'auto',
				clicknext: false,
				dailymotion: {
					foreground: '%23EEEEEE',
					highlight: '%235BCEC5',
					background: '%23222222',
					logo: 0,
					hideInfos: 1
				},
				dataConfig : function( elem ) { return {}; },
				dataSelector: 'img',
				dataSort: false,
				dataSource: this._target,
				debug: undef,
				dummy: undef, // 1.2.5
				easing: 'galleria',
				extend: function(options) {},
				fullscreenCrop: undef, // 1.2.5
				fullscreenDoubleTap: true, // 1.2.4 toggles fullscreen on double-tap for touch devices
				fullscreenTransition: undef, // 1.2.6
				height: 0,
				idleMode: true, // 1.2.4 toggles idleMode
				idleTime: 3000,
				idleSpeed: 200,
				imageCrop: false,
				imageMargin: 0,
				imagePan: false,
				imagePanSmoothness: 12,
				imagePosition: '50%',
				imageTimeout: undef, // 1.2.5
				initialTransition: undef, // 1.2.4, replaces transitionInitial
				keepSource: false,
				layerFollow: true, // 1.2.5
				lightbox: false, // 1.2.3
				lightboxFadeSpeed: 200,
				lightboxTransitionSpeed: 200,
				linkSourceImages: true,
				maxScaleRatio: undef,
				maxVideoSize: undef, // 1.2.9
				minScaleRatio: undef, // deprecated in 1.2.9
				overlayOpacity: 0.85,
				overlayBackground: '#0b0b0b',
				pauseOnInteraction: true,
				popupLinks: false,
				preload: 2,
				queue: true,
				responsive: true,
				show: 0,
				showInfo: true,
				showCounter: true,
				showImagenav: true,
				swipe: 'auto', // 1.2.4 -> revised in 1.3 -> changed type in 1.3.5
				theme: null,
				thumbCrop: true,
				thumbEventType: 'click:fast',
				thumbMargin: 0,
				thumbQuality: 'auto',
				thumbDisplayOrder: true, // 1.2.8
				thumbPosition: '50%', // 1.3
				thumbnails: true,
				touchTransition: undef, // 1.2.6
				transition: 'fade',
				transitionInitial: undef, // legacy, deprecate in 1.3. Use initialTransition instead.
				transitionSpeed: 400,
				trueFullscreen: true, // 1.2.7
				useCanvas: false, // 1.2.4
				variation: '', // 1.3.2
				videoPoster: true, // 1.3
				vimeo: {
					title: 0,
					byline: 0,
					portrait: 0,
					color: 'aaaaaa'
				},
				wait: 5000, // 1.2.7
				width: 'auto',
				youtube: {
					modestbranding: 1,
					autohide: 1,
					color: 'white',
					hd: 1,
					rel: 0,
					showinfo: 0
				}
			};

			// legacy support for transitionInitial
			this._options.initialTransition = this._options.initialTransition || this._options.transitionInitial;

			if ( options ) {

				// turn off debug
				if ( options.debug === false ) {
					DEBUG = false;
				}

				// set timeout
				if ( typeof options.imageTimeout === 'number' ) {
					TIMEOUT = options.imageTimeout;
				}

				// set dummy
				if ( typeof options.dummy === 'string' ) {
					DUMMY = options.dummy;
				}

				// set theme
				if ( typeof options.theme == 'string' ) {
					this._options.theme = options.theme;
				}
			}

			// hide all content
			$( this._target ).children().hide();

			// Warn for quirks mode
			if ( Galleria.QUIRK ) {
				Galleria.raise('Your page is in Quirks mode, Galleria may not render correctly. Please validate your HTML and add a correct doctype.');
			}

			// now we just have to wait for the theme...
			// first check if it has already loaded
			if ( _loadedThemes.length ) {
				if ( this._options.theme ) {
					for ( var i=0; i<_loadedThemes.length; i++ ) {
						if( this._options.theme === _loadedThemes[i].name ) {
							this.theme = _loadedThemes[i];
							break;
						}
					}
				} else {
					// if no theme sepcified, apply the first loaded theme
					this.theme = _loadedThemes[0];
				}
			}

			if ( typeof this.theme == 'object' ) {
				this._init();
			} else {
				// if no theme is loaded yet, push the instance into a pool and run it when the theme is ready
				_pool.push( this );
			}

			return this;
		},

		// this method should only be called once per instance
		// for manipulation of data, use the .load method

		_init: function() {

			var self = this,
				options = this._options;

			if ( this._initialized ) {
				Galleria.raise( 'Init failed: Gallery instance already initialized.' );
				return this;
			}

			this._initialized = true;

			if ( !this.theme ) {
				Galleria.raise( 'Init failed: No theme found.', true );
				return this;
			}

			// merge the theme & caller options
			$.extend( true, options, this.theme.defaults, this._original.options, Galleria.configure.options );

			// internally we use boolean for swipe
			options.swipe = (function(s) {

				if ( s == 'enforced' ) { return true; }

				// legacy patch
				if( s === false || s == 'disabled' ) { return false; }

				return !!Galleria.TOUCH;

			}( options.swipe ));

			// disable options that arent compatible with swipe
			if ( options.swipe ) {
				options.clicknext = false;
				options.imagePan = false;
			}

			// check for canvas support
			(function( can ) {
				if ( !( 'getContext' in can ) ) {
					can = null;
					return;
				}
				_canvas = _canvas || {
					elem: can,
					context: can.getContext( '2d' ),
					cache: {},
					length: 0
				};
			}( doc.createElement( 'canvas' ) ) );

			// bind the gallery to run when data is ready
			this.bind( Galleria.DATA, function() {

				// remove big if total pixels are less than 1024 (most phones)
				if ( window.screen && window.screen.width && Array.prototype.forEach ) {

					this._data.forEach(function(data) {

						var density = 'devicePixelRatio' in window ? window.devicePixelRatio : 1,
							m = M.max( window.screen.width, window.screen.height );

						if ( m*density < 1024 ) {
							data.big = data.image;
						}
					});
				}

				// save the new data
				this._original.data = this._data;

				// lets show the counter here
				this.get('total').innerHTML = this.getDataLength();

				// cache the container
				var $container = this.$( 'container' );

				// set ratio if height is < 2
				if ( self._options.height < 2 ) {
					self._userRatio = self._ratio = self._options.height;
				}

				// the gallery is ready, let's just wait for the css
				var num = { width: 0, height: 0 };
				var testHeight = function() {
					return self.$( 'stage' ).height();
				};

				// check container and thumbnail height
				Utils.wait({
					until: function() {

						// keep trying to get the value
						num = self._getWH();
						$container.width( num.width ).height( num.height );
						return testHeight() && num.width && num.height > 50;

					},
					success: function() {

						self._width = num.width;
						self._height = num.height;
						self._ratio = self._ratio || num.height/num.width;

						// for some strange reason, webkit needs a single setTimeout to play ball
						if ( Galleria.WEBKIT ) {
							window.setTimeout( function() {
								self._run();
							}, 1);
						} else {
							self._run();
						}
					},
					error: function() {

						// Height was probably not set, raise hard errors

						if ( testHeight() ) {
							Galleria.raise('Could not extract sufficient width/height of the gallery container. Traced measures: width:' + num.width + 'px, height: ' + num.height + 'px.', true);
						} else {
							Galleria.raise('Could not extract a stage height from the CSS. Traced height: ' + testHeight() + 'px.', true);
						}
					},
					timeout: typeof this._options.wait == 'number' ? this._options.wait : false
				});
			});

			// build the gallery frame
			this.append({
				'info-text' :
					['info-title', 'info-description'],
				'info' :
					['info-text'],
				'image-nav' :
					['image-nav-right', 'image-nav-left'],
				'stage' :
					['images', 'loader', 'counter', 'image-nav'],
				'thumbnails-list' :
					['thumbnails'],
				'thumbnails-container' :
					['thumb-nav-left', 'thumbnails-list', 'thumb-nav-right'],
				'container' :
					['stage', 'thumbnails-container', 'info', 'tooltip']
			});

			Utils.hide( this.$( 'counter' ).append(
				this.get( 'current' ),
				doc.createTextNode(' / '),
				this.get( 'total' )
			) );

			this.setCounter('&#8211;');

			Utils.hide( self.get('tooltip') );

			// add a notouch class on the container to prevent unwanted :hovers on touch devices
			this.$( 'container' ).addClass([
				( Galleria.TOUCH ? 'touch' : 'notouch' ),
				this._options.variation,
				'galleria-theme-'+this.theme.name
			].join(' '));

			// add images to the controls
			if ( !this._options.swipe ) {
				$.each( new Array(2), function( i ) {

					// create a new Picture instance
					var image = new Galleria.Picture();

					// apply some styles, create & prepend overlay
					$( image.container ).css({
						position: 'absolute',
						top: 0,
						left: 0
					}).prepend( self._layers[i] = $( Utils.create('galleria-layer') ).css({
						position: 'absolute',
						top:0, left:0, right:0, bottom:0,
						zIndex:2
					})[0] );

					// append the image
					self.$( 'images' ).append( image.container );

					// reload the controls
					self._controls[i] = image;

					// build a frame
					var frame = new Galleria.Picture();
					frame.isIframe = true;

					$( frame.container ).attr('class', 'galleria-frame').css({
						position: 'absolute',
						top: 0,
						left: 0,
						zIndex: 4,
						background: '#000',
						display: 'none'
					}).appendTo( image.container );

					self._controls.frames[i] = frame;

				});
			}

			// some forced generic styling
			this.$( 'images' ).css({
				position: 'relative',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%'
			});

			if ( options.swipe ) {
				this.$( 'images' ).css({
					position: 'absolute',
					top: 0,
					left: 0,
					width: 0,
					height: '100%'
				});
				this.finger = new Galleria.Finger(this.get('stage'), {
					onchange: function(page) {
						self.pause().show(page);
					},
					oncomplete: function(page) {

						var index = M.max( 0, M.min( parseInt( page, 10 ), self.getDataLength() - 1 ) ),
							data = self.getData(index);

						$( self._thumbnails[ index ].container )
							.addClass( 'active' )
							.siblings( '.active' )
							.removeClass( 'active' );

						if ( !data ) {
							return;
						}

						// remove video iframes
						self.$( 'images' ).find( '.galleria-frame' ).css('opacity', 0).hide().find( 'iframe' ).remove();

						if ( self._options.carousel && self._options.carouselFollow ) {
							self._carousel.follow( index );
						}
					}
				});
				this.bind( Galleria.RESCALE, function() {
					this.finger.setup();
				});
				this.$('stage').on('click', function(e) {
					var data = self.getData();
					if ( !data ) {
						return;
					}
					if ( data.iframe ) {

						if ( self.isPlaying() ) {
							self.pause();
						}
						var frame = self._controls.frames[ self._active ],
							w = self._stageWidth,
							h = self._stageHeight;

						if ( $( frame.container ).find( 'iframe' ).length ) {
							return;
						}

						$( frame.container ).css({
							width: w,
							height: h,
							opacity: 0
						}).show().animate({
							opacity: 1
						}, 200);

						window.setTimeout(function() {
							frame.load( data.iframe + ( data.video ? '&autoplay=1' : '' ), {
								width: w,
								height: h
							}, function( frame ) {
								self.$( 'container' ).addClass( 'videoplay' );
								frame.scale({
									width: self._stageWidth,
									height: self._stageHeight,
									iframelimit: data.video ? self._options.maxVideoSize : undef
								});
							});
						}, 100);

						return;
					}

					if ( data.link ) {
						if ( self._options.popupLinks ) {
							var win = window.open( data.link, '_blank' );
						} else {
							window.location.href = data.link;
						}
						return;
					}
				});
				this.bind( Galleria.IMAGE, function(e) {

					self.setCounter( e.index );
					self.setInfo( e.index );

					var next = this.getNext(),
						prev = this.getPrev();

					var preloads = [prev,next];
					preloads.push(this.getNext(next), this.getPrev(prev), self._controls.slides.length-1);

					var filtered = [];

					$.each(preloads, function(i, val) {
						if ( $.inArray(val, filtered) == -1 ) {
							filtered.push(val);
						}
					});

					$.each(filtered, function(i, loadme) {
						var d = self.getData(loadme),
							img = self._controls.slides[loadme],
							src = self.isFullscreen() && d.big ? d.big : ( d.image || d.iframe );

						if ( d.iframe && !d.image ) {
							img.isIframe = true;
						}

						if ( !img.ready ) {
							self._controls.slides[loadme].load(src, function(img) {
								if ( !img.isIframe ) {
									$(img.image).css('visibility', 'hidden');
								}
								self._scaleImage(img, {
									complete: function(img) {
										if ( !img.isIframe ) {
											$(img.image).css({
												opacity: 0,
												visibility: 'visible'
											}).animate({
												opacity: 1
											}, 200);
										}
									}
								});
							});
						}
					});
				});
			}

			this.$( 'thumbnails, thumbnails-list' ).css({
				overflow: 'hidden',
				position: 'relative'
			});

			// bind image navigation arrows
			this.$( 'image-nav-right, image-nav-left' ).on( 'click:fast', function(e) {

				// pause if options is set
				if ( options.pauseOnInteraction ) {
					self.pause();
				}

				// navigate
				var fn = /right/.test( this.className ) ? 'next' : 'prev';
				self[ fn ]();

			}).on('click', function(e) {

				e.preventDefault();

				// tune the clicknext option
				if ( options.clicknext || options.swipe ) {
					e.stopPropagation();
				}
			});

			// hide controls if chosen to
			$.each( ['info','counter','image-nav'], function( i, el ) {
				if ( options[ 'show' + el.substr(0,1).toUpperCase() + el.substr(1).replace(/-/,'') ] === false ) {
					Utils.moveOut( self.get( el.toLowerCase() ) );
				}
			});

			// load up target content
			this.load();

			// now it's usually safe to remove the content
			// IE will never stop loading if we remove it, so let's keep it hidden for IE (it's usually fast enough anyway)
			if ( !options.keepSource && !IE ) {
				this._target.innerHTML = '';
			}

			// re-append the errors, if they happened before clearing
			if ( this.get( 'errors' ) ) {
				this.appendChild( 'target', 'errors' );
			}

			// append the gallery frame
			this.appendChild( 'target', 'container' );

			// parse the carousel on each thumb load
			if ( options.carousel ) {
				var count = 0,
					show = options.show;
				this.bind( Galleria.THUMBNAIL, function() {
					this.updateCarousel();
					if ( ++count == this.getDataLength() && typeof show == 'number' && show > 0 ) {
						this._carousel.follow( show );
					}
				});
			}

			// bind window resize for responsiveness
			if ( options.responsive ) {
				$win.on( 'resize', function() {
					if ( !self.isFullscreen() ) {
						self.resize();
					}
				});
			}

			// double-tap/click fullscreen toggle

			if ( options.fullscreenDoubleTap ) {

				this.$( 'stage' ).on( 'touchstart', (function() {
					var last, cx, cy, lx, ly, now,
						getData = function(e) {
							return e.originalEvent.touches ? e.originalEvent.touches[0] : e;
						};
					self.$( 'stage' ).on('touchmove', function() {
						last = 0;
					});
					return function(e) {
						if( /(-left|-right)/.test(e.target.className) ) {
							return;
						}
						now = Utils.timestamp();
						cx = getData(e).pageX;
						cy = getData(e).pageY;
						if ( e.originalEvent.touches.length < 2 && ( now - last < 300 ) && ( cx - lx < 20) && ( cy - ly < 20) ) {
							self.toggleFullscreen();
							e.preventDefault();
							return;
						}
						last = now;
						lx = cx;
						ly = cy;
					};
				}()));
			}

			// bind the ons
			$.each( Galleria.on.binds, function(i, bind) {
				// check if already bound
				if ( $.inArray( bind.hash, self._binds ) == -1 ) {
					self.bind( bind.type, bind.callback );
				}
			});

			return this;
		},

		addTimer : function() {
			this._timer.add.apply( this._timer, Utils.array( arguments ) );
			return this;
		},

		clearTimer : function() {
			this._timer.clear.apply( this._timer, Utils.array( arguments ) );
			return this;
		},

		// parse width & height from CSS or options

		_getWH : function() {

			var $container = this.$( 'container' ),
				$target = this.$( 'target' ),
				self = this,
				num = {},
				arr;

			$.each(['width', 'height'], function( i, m ) {

				// first check if options is set
				if ( self._options[ m ] && typeof self._options[ m ] === 'number') {
					num[ m ] = self._options[ m ];
				} else {

					arr = [
						Utils.parseValue( $container.css( m ) ),         // the container css height
						Utils.parseValue( $target.css( m ) ),            // the target css height
						$container[ m ](),                               // the container jQuery method
						$target[ m ]()                                   // the target jQuery method
					];

					// if first time, include the min-width & min-height
					if ( !self[ '_'+m ] ) {
						arr.splice(arr.length,
							Utils.parseValue( $container.css( 'min-'+m ) ),
							Utils.parseValue( $target.css( 'min-'+m ) )
						);
					}

					// else extract the measures from different sources and grab the highest value
					num[ m ] = M.max.apply( M, arr );
				}
			});

			// allow setting a height ratio instead of exact value
			// useful when doing responsive galleries

			if ( self._userRatio ) {
				num.height = num.width * self._userRatio;
			}

			return num;
		},

		// Creates the thumbnails and carousel
		// can be used at any time, f.ex when the data object is manipulated
		// push is an optional argument with pushed images

		_createThumbnails : function( push ) {

			this.get( 'total' ).innerHTML = this.getDataLength();

			var src,
				thumb,
				data,

				$container,

				self = this,
				o = this._options,

				i = push ? this._data.length - push.length : 0,
				chunk = i,

				thumbchunk = [],
				loadindex = 0,

				gif = IE < 8 ? 'http://upload.wikimedia.org/wikipedia/commons/c/c0/Blank.gif' :
					'data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw%3D%3D',

				// get previously active thumbnail, if exists
				active = (function() {
					var a = self.$('thumbnails').find('.active');
					if ( !a.length ) {
						return false;
					}
					return a.find('img').attr('src');
				}()),

				// cache the thumbnail option
				optval = typeof o.thumbnails === 'string' ? o.thumbnails.toLowerCase() : null,

				// move some data into the instance
				// for some reason, jQuery cant handle css(property) when zooming in FF, breaking the gallery
				// so we resort to getComputedStyle for browsers who support it
				getStyle = function( prop ) {
					return doc.defaultView && doc.defaultView.getComputedStyle ?
						doc.defaultView.getComputedStyle( thumb.container, null )[ prop ] :
						$container.css( prop );
				},

				fake = function(image, index, container) {
					return function() {
						$( container ).append( image );
						self.trigger({
							type: Galleria.THUMBNAIL,
							thumbTarget: image,
							index: index,
							galleriaData: self.getData( index )
						});
					};
				},

				onThumbEvent = function( e ) {

					// pause if option is set
					if ( o.pauseOnInteraction ) {
						self.pause();
					}

					// extract the index from the data
					var index = $( e.currentTarget ).data( 'index' );
					if ( self.getIndex() !== index ) {
						self.show( index );
					}

					e.preventDefault();
				},

				thumbComplete = function( thumb, callback ) {

					$( thumb.container ).css( 'visibility', 'visible' );
					self.trigger({
						type: Galleria.THUMBNAIL,
						thumbTarget: thumb.image,
						index: thumb.data.order,
						galleriaData: self.getData( thumb.data.order )
					});

					if ( typeof callback == 'function' ) {
						callback.call( self, thumb );
					}
				},

				onThumbLoad = function( thumb, callback ) {

					// scale when ready
					thumb.scale({
						width:    thumb.data.width,
						height:   thumb.data.height,
						crop:     o.thumbCrop,
						margin:   o.thumbMargin,
						canvas:   o.useCanvas,
						position: o.thumbPosition,
						complete: function( thumb ) {

							// shrink thumbnails to fit
							var top = ['left', 'top'],
								arr = ['Width', 'Height'],
								m,
								css,
								data = self.getData( thumb.index );

							// calculate shrinked positions
							$.each(arr, function( i, measure ) {
								m = measure.toLowerCase();
								if ( (o.thumbCrop !== true || o.thumbCrop === m ) ) {
									css = {};
									css[ m ] = thumb[ m ];
									$( thumb.container ).css( css );
									css = {};
									css[ top[ i ] ] = 0;
									$( thumb.image ).css( css );
								}

								// cache outer measures
								thumb[ 'outer' + measure ] = $( thumb.container )[ 'outer' + measure ]( true );
							});

							// set high quality if downscale is moderate
							Utils.toggleQuality( thumb.image,
								o.thumbQuality === true ||
								( o.thumbQuality === 'auto' && thumb.original.width < thumb.width * 3 )
							);

							if ( o.thumbDisplayOrder && !thumb.lazy ) {

								$.each( thumbchunk, function( i, th ) {
									if ( i === loadindex && th.ready && !th.displayed ) {

										loadindex++;
										th.displayed = true;

										thumbComplete( th, callback );

										return;
									}
								});
							} else {
								thumbComplete( thumb, callback );
							}
						}
					});
				};

			if ( !push ) {
				this._thumbnails = [];
				this.$( 'thumbnails' ).empty();
			}

			// loop through data and create thumbnails
			for( ; this._data[ i ]; i++ ) {

				data = this._data[ i ];

				// get source from thumb or image
				src = data.thumb || data.image;

				if ( ( o.thumbnails === true || optval == 'lazy' ) && ( data.thumb || data.image ) ) {

					// add a new Picture instance
					thumb = new Galleria.Picture(i);

					// save the index
					thumb.index = i;

					// flag displayed
					thumb.displayed = false;

					// flag lazy
					thumb.lazy = false;

					// flag video
					thumb.video = false;

					// append the thumbnail
					this.$( 'thumbnails' ).append( thumb.container );

					// cache the container
					$container = $( thumb.container );

					// hide it
					$container.css( 'visibility', 'hidden' );

					thumb.data = {
						width  : Utils.parseValue( getStyle( 'width' ) ),
						height : Utils.parseValue( getStyle( 'height' ) ),
						order  : i,
						src    : src
					};

					// grab & reset size for smoother thumbnail loads
					if ( o.thumbCrop !== true ) {
						$container.css( { width: 'auto', height: 'auto' } );
					} else {
						$container.css( { width: thumb.data.width, height: thumb.data.height } );
					}

					// load the thumbnail
					if ( optval == 'lazy' ) {

						$container.addClass( 'lazy' );

						thumb.lazy = true;

						thumb.load( gif, {
							height: thumb.data.height,
							width: thumb.data.width
						});

					} else {
						thumb.load( src, onThumbLoad );
					}

					// preload all images here
					if ( o.preload === 'all' ) {
						thumb.preload( data.image );
					}

					// create empty spans if thumbnails is set to 'empty'
				} else if ( ( data.iframe && optval !== null ) || optval === 'empty' || optval === 'numbers' ) {
					thumb = {
						container: Utils.create( 'galleria-image' ),
						image: Utils.create( 'img', 'span' ),
						ready: true,
						data: {
							order: i
						}
					};

					// create numbered thumbnails
					if ( optval === 'numbers' ) {
						$( thumb.image ).text( i + 1 );
					}

					if ( data.iframe ) {
						$( thumb.image ).addClass( 'iframe' );
					}

					this.$( 'thumbnails' ).append( thumb.container );

					// we need to "fake" a loading delay before we append and trigger
					// 50+ should be enough

					window.setTimeout( ( fake )( thumb.image, i, thumb.container ), 50 + ( i*20 ) );

					// create null object to silent errors
				} else {
					thumb = {
						container: null,
						image: null
					};
				}

				// add events for thumbnails
				// you can control the event type using thumb_event_type
				// we'll add the same event to the source if it's kept

				$( thumb.container ).add( o.keepSource && o.linkSourceImages ? data.original : null )
					.data('index', i).on( o.thumbEventType, onThumbEvent )
					.data('thumbload', onThumbLoad);

				if (active === src) {
					$( thumb.container ).addClass( 'active' );
				}

				this._thumbnails.push( thumb );
			}

			thumbchunk = this._thumbnails.slice( chunk );

			return this;
		},

		/**
		 Lazy-loads thumbnails.
		 You can call this method to load lazy thumbnails at run time

		 @param {Array|Number} index Index or array of indexes of thumbnails to be loaded
		 @param {Function} complete Callback that is called when all lazy thumbnails have been loaded

		 @returns Instance
		 */

		lazyLoad: function( index, complete ) {

			var arr = index.constructor == Array ? index : [ index ],
				self = this,
				loaded = 0;

			$.each( arr, function(i, ind) {

				if ( ind > self._thumbnails.length - 1 ) {
					return;
				}

				var thumb = self._thumbnails[ ind ],
					data = thumb.data,
					callback = function() {
						if ( ++loaded == arr.length && typeof complete == 'function' ) {
							complete.call( self );
						}
					},
					thumbload = $( thumb.container ).data( 'thumbload' );
				if (thumbload) {
					if ( thumb.video ) {
						thumbload.call( self, thumb, callback );
					} else {
						thumb.load( data.src , function( thumb ) {
							thumbload.call( self, thumb, callback );
						});
					}
				}
			});

			return this;

		},

		/**
		 Lazy-loads thumbnails in chunks.
		 This method automatcally chops up the loading process of many thumbnails into chunks

		 @param {Number} size Size of each chunk to be loaded
		 @param {Number} [delay] Delay between each loads

		 @returns Instance
		 */

		lazyLoadChunks: function( size, delay ) {

			var len = this.getDataLength(),
				i = 0,
				n = 0,
				arr = [],
				temp = [],
				self = this;

			delay = delay || 0;

			for( ; i<len; i++ ) {
				temp.push(i);
				if ( ++n == size || i == len-1 ) {
					arr.push( temp );
					n = 0;
					temp = [];
				}
			}

			var init = function( wait ) {
				var a = arr.shift();
				if ( a ) {
					window.setTimeout(function() {
						self.lazyLoad(a, function() {
							init( true );
						});
					}, ( delay && wait ) ? delay : 0 );
				}
			};

			init( false );

			return this;

		},

		// the internal _run method should be called after loading data into galleria
		// makes sure the gallery has proper measurements before postrun & ready
		_run : function() {

			var self = this;

			self._createThumbnails();

			// make sure we have a stageHeight && stageWidth

			Utils.wait({

				timeout: 10000,

				until: function() {

					// Opera crap
					if ( Galleria.OPERA ) {
						self.$( 'stage' ).css( 'display', 'inline-block' );
					}

					self._stageWidth  = self.$( 'stage' ).width();
					self._stageHeight = self.$( 'stage' ).height();

					return( self._stageWidth &&
						self._stageHeight > 50 ); // what is an acceptable height?
				},

				success: function() {

					// save the instance
					_galleries.push( self );

					// postrun some stuff after the gallery is ready

					// create the touch slider
					if ( self._options.swipe ) {

						var $images = self.$( 'images' ).width( self.getDataLength() * self._stageWidth );
						$.each( new Array( self.getDataLength() ), function(i) {

							var image = new Galleria.Picture(),
								data = self.getData(i);

							$( image.container ).css({
								position: 'absolute',
								top: 0,
								left: self._stageWidth*i
							}).prepend( self._layers[i] = $( Utils.create('galleria-layer') ).css({
								position: 'absolute',
								top:0, left:0, right:0, bottom:0,
								zIndex:2
							})[0] ).appendTo( $images );

							if( data.video ) {
								_playIcon( image.container );
							}

							self._controls.slides.push(image);

							var frame = new Galleria.Picture();
							frame.isIframe = true;

							$( frame.container ).attr('class', 'galleria-frame').css({
								position: 'absolute',
								top: 0,
								left: 0,
								zIndex: 4,
								background: '#000',
								display: 'none'
							}).appendTo( image.container );

							self._controls.frames.push(frame);
						});

						self.finger.setup();
					}

					// show counter
					Utils.show( self.get('counter') );

					// bind carousel nav
					if ( self._options.carousel ) {
						self._carousel.bindControls();
					}

					// start autoplay
					if ( self._options.autoplay ) {

						self.pause();

						if ( typeof self._options.autoplay === 'number' ) {
							self._playtime = self._options.autoplay;
						}

						self._playing = true;
					}
					// if second load, just do the show and return
					if ( self._firstrun ) {

						if ( self._options.autoplay ) {
							self.trigger( Galleria.PLAY );
						}

						if ( typeof self._options.show === 'number' ) {
							self.show( self._options.show );
						}
						return;
					}

					self._firstrun = true;

					// initialize the History plugin
					if ( Galleria.History ) {

						// bind the show method
						Galleria.History.change(function( value ) {

							// if ID is NaN, the user pressed back from the first image
							// return to previous address
							if ( isNaN( value ) ) {
								window.history.go(-1);

								// else show the image
							} else {
								self.show( value, undef, true );
							}
						});
					}

					self.trigger( Galleria.READY );

					// call the theme init method
					self.theme.init.call( self, self._options );

					// Trigger Galleria.ready
					$.each( Galleria.ready.callbacks, function(i ,fn) {
						if ( typeof fn == 'function' ) {
							fn.call( self, self._options );
						}
					});

					// call the extend option
					self._options.extend.call( self, self._options );

					// show the initial image
					// first test for permalinks in history
					if ( /^[0-9]{1,4}$/.test( HASH ) && Galleria.History ) {
						self.show( HASH, undef, true );

					} else if( self._data[ self._options.show ] ) {
						self.show( self._options.show );
					}

					// play trigger
					if ( self._options.autoplay ) {
						self.trigger( Galleria.PLAY );
					}
				},

				error: function() {
					Galleria.raise('Stage width or height is too small to show the gallery. Traced measures: width:' + self._stageWidth + 'px, height: ' + self._stageHeight + 'px.', true);
				}

			});
		},

		/**
		 Loads data into the gallery.
		 You can call this method on an existing gallery to reload the gallery with new data.

		 @param {Array|string} [source] Optional JSON array of data or selector of where to find data in the document.
		 Defaults to the Galleria target or dataSource option.

		 @param {string} [selector] Optional element selector of what elements to parse.
		 Defaults to 'img'.

		 @param {Function} [config] Optional function to modify the data extraction proceedure from the selector.
		 See the dataConfig option for more information.

		 @returns Instance
		 */

		load : function( source, selector, config ) {

			var self = this,
				o = this._options;

			// empty the data array
			this._data = [];

			// empty the thumbnails
			this._thumbnails = [];
			this.$('thumbnails').empty();

			// shorten the arguments
			if ( typeof selector === 'function' ) {
				config = selector;
				selector = null;
			}

			// use the source set by target
			source = source || o.dataSource;

			// use selector set by option
			selector = selector || o.dataSelector;

			// use the dataConfig set by option
			config = config || o.dataConfig;

			// if source is a true object, make it into an array
			if( $.isPlainObject( source ) ) {
				source = [source];
			}

			// check if the data is an array already
			if ( $.isArray( source ) ) {
				if ( this.validate( source ) ) {
					this._data = source;
				} else {
					Galleria.raise( 'Load failed: JSON Array not valid.' );
				}
			} else {

				// add .video and .iframe to the selector (1.2.7)
				selector += ',.video,.iframe';

				// loop through images and set data
				$( source ).find( selector ).each( function( i, elem ) {

					elem = $( elem );
					var data = {},
						parent = elem.parent(),
						href = parent.attr( 'href' ),
						rel  = parent.attr( 'rel' );

					if( href && ( elem[0].nodeName == 'IMG' || elem.hasClass('video') ) && _videoTest( href ) ) {
						data.video = href;
					} else if( href && elem.hasClass('iframe') ) {
						data.iframe = href;
					} else {
						data.image = data.big = href;
					}

					if ( rel ) {
						data.big = rel;
					}

					// alternative extraction from HTML5 data attribute, added in 1.2.7
					$.each( 'big title description link layer image'.split(' '), function( i, val ) {
						if ( elem.data(val) ) {
							data[ val ] = elem.data(val).toString();
						}
					});

					if ( !data.big ) {
						data.big = data.image;
					}

					// mix default extractions with the hrefs and config
					// and push it into the data array
					self._data.push( $.extend({

						title:       elem.attr('title') || '',
						thumb:       elem.attr('src'),
						image:       elem.attr('src'),
						big:         elem.attr('src'),
						description: elem.attr('alt') || '',
						link:        elem.attr('longdesc'),
						original:    elem.get(0) // saved as a reference

					}, data, config( elem ) ) );

				});
			}

			if ( typeof o.dataSort == 'function' ) {
				protoArray.sort.call( this._data, o.dataSort );
			} else if ( o.dataSort == 'random' ) {
				this._data.sort( function() {
					return M.round(M.random())-0.5;
				});
			}

			// trigger the DATA event and return
			if ( this.getDataLength() ) {
				this._parseData( function() {
					this.trigger( Galleria.DATA );
				} );
			}
			return this;

		},

		// make sure the data works properly
		_parseData : function( callback ) {

			var self = this,
				current,
				ready = false,
				onload = function() {
					var complete = true;
					$.each( self._data, function( i, data ) {
						if ( data.loading ) {
							complete = false;
							return false;
						}
					});
					if ( complete && !ready ) {
						ready = true;
						callback.call( self );
					}
				};

			$.each( this._data, function( i, data ) {

				current = self._data[ i ];

				// copy image as thumb if no thumb exists
				if ( 'thumb' in data === false ) {
					current.thumb = data.image;
				}
				// copy image as big image if no biggie exists
				if ( !data.big ) {
					current.big = data.image;
				}
				// parse video
				if ( 'video' in data ) {
					var result = _videoTest( data.video );

					if ( result ) {
						current.iframe = new Video(result.provider, result.id ).embed() + (function() {

							// add options
							if ( typeof self._options[ result.provider ] == 'object' ) {
								var str = '?', arr = [];
								$.each( self._options[ result.provider ], function( key, val ) {
									arr.push( key + '=' + val );
								});

								// small youtube specifics, perhaps move to _video later
								if ( result.provider == 'youtube' ) {
									arr = ['wmode=opaque'].concat(arr);
								}
								return str + arr.join('&');
							}
							return '';
						}());

						// pre-fetch video providers media

						if( !current.thumb || !current.image ) {
							$.each( ['thumb', 'image'], function( i, type ) {
								if ( type == 'image' && !self._options.videoPoster ) {
									current.image = undef;
									return;
								}
								var video = new Video( result.provider, result.id );
								if ( !current[ type ] ) {
									current.loading = true;
									video.getMedia( type, (function(current, type) {
										return function(src) {
											current[ type ] = src;
											if ( type == 'image' && !current.big ) {
												current.big = current.image;
											}
											delete current.loading;
											onload();
										};
									}( current, type )));
								}
							});
						}
					}
				}
			});

			onload();

			return this;
		},

		/**
		 Destroy the Galleria instance and recover the original content

		 @example this.destroy();

		 @returns Instance
		 */

		destroy : function() {
			this.$( 'target' ).data( 'galleria', null );
			this.$( 'container' ).off( 'galleria' );
			this.get( 'target' ).innerHTML = this._original.html;
			this.clearTimer();
			Utils.removeFromArray( _instances, this );
			Utils.removeFromArray( _galleries, this );
			if ( Galleria._waiters !== undefined && Galleria._waiters.length ) {
				$.each( Galleria._waiters, function( i, w ) {
					if ( w ) window.clearTimeout( w );
				});
			}
			_video._inst = [];
			return this;
		},

		/**
		 Adds and/or removes images from the gallery
		 Works just like Array.splice
		 https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/splice

		 @example this.splice( 2, 4 ); // removes 4 images after the second image

		 @returns Instance
		 */

		splice : function() {
			var self = this,
				args = Utils.array( arguments );
			window.setTimeout(function() {
				protoArray.splice.apply( self._data, args );
				self._parseData( function() {
					self._createThumbnails();
				});
			},2);
			return self;
		},

		/**
		 Append images to the gallery
		 Works just like Array.push
		 https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/push

		 @example this.push({ image: 'image1.jpg' }); // appends the image to the gallery

		 @returns Instance
		 */

		push : function() {
			var self = this,
				args = Utils.array( arguments );

			if ( args.length == 1 && args[0].constructor == Array ) {
				args = args[0];
			}

			window.setTimeout(function() {
				protoArray.push.apply( self._data, args );
				self._parseData( function() {
					self._createThumbnails( args );
				});
			}, 2);
			return self;
		},

		_getActive : function() {
			return this._controls.getActive();
		},

		validate : function( data ) {
			// todo: validate a custom data array
			return true;
		},

		/**
		 Bind any event to Galleria

		 @param {string} type The Event type to listen for
		 @param {Function} fn The function to execute when the event is triggered

		 @example this.bind( 'image', function() { Galleria.log('image shown') });

		 @returns Instance
		 */

		bind : function(type, fn) {

			// allow 'image' instead of Galleria.IMAGE
			type = _patchEvent( type );

			this.$( 'container' ).on( type, this.proxy(fn) );
			return this;
		},

		/**
		 Unbind any event to Galleria

		 @param {string} type The Event type to forget

		 @returns Instance
		 */

		unbind : function(type) {

			type = _patchEvent( type );

			this.$( 'container' ).off( type );
			return this;
		},

		/**
		 Manually trigger a Galleria event

		 @param {string} type The Event to trigger

		 @returns Instance
		 */

		trigger : function( type ) {

			type = typeof type === 'object' ?
				$.extend( type, { scope: this } ) :
				{ type: _patchEvent( type ), scope: this };

			this.$( 'container' ).trigger( type );

			return this;
		},

		/**
		 Assign an "idle state" to any element.
		 The idle state will be applied after a certain amount of idle time
		 Useful to hide f.ex navigation when the gallery is inactive

		 @param {HTMLElement|string} elem The Dom node or selector to apply the idle state to
		 @param {Object} styles the CSS styles to apply when in idle mode
		 @param {Object} [from] the CSS styles to apply when in normal
		 @param {Boolean} [hide] set to true if you want to hide it first

		 @example addIdleState( this.get('image-nav'), { opacity: 0 });
		 @example addIdleState( '.galleria-image-nav', { top: -200 }, true);

		 @returns Instance
		 */

		addIdleState: function( elem, styles, from, hide ) {
			this._idle.add.apply( this._idle, Utils.array( arguments ) );
			return this;
		},

		/**
		 Removes any idle state previously set using addIdleState()

		 @param {HTMLElement|string} elem The Dom node or selector to remove the idle state from.

		 @returns Instance
		 */

		removeIdleState: function( elem ) {
			this._idle.remove.apply( this._idle, Utils.array( arguments ) );
			return this;
		},

		/**
		 Force Galleria to enter idle mode.

		 @returns Instance
		 */

		enterIdleMode: function() {
			this._idle.hide();
			return this;
		},

		/**
		 Force Galleria to exit idle mode.

		 @returns Instance
		 */

		exitIdleMode: function() {
			this._idle.showAll();
			return this;
		},

		/**
		 Enter FullScreen mode

		 @param {Function} callback the function to be executed when the fullscreen mode is fully applied.

		 @returns Instance
		 */

		enterFullscreen: function( callback ) {
			this._fullscreen.enter.apply( this, Utils.array( arguments ) );
			return this;
		},

		/**
		 Exits FullScreen mode

		 @param {Function} callback the function to be executed when the fullscreen mode is fully applied.

		 @returns Instance
		 */

		exitFullscreen: function( callback ) {
			this._fullscreen.exit.apply( this, Utils.array( arguments ) );
			return this;
		},

		/**
		 Toggle FullScreen mode

		 @param {Function} callback the function to be executed when the fullscreen mode is fully applied or removed.

		 @returns Instance
		 */

		toggleFullscreen: function( callback ) {
			this._fullscreen[ this.isFullscreen() ? 'exit' : 'enter'].apply( this, Utils.array( arguments ) );
			return this;
		},

		/**
		 Adds a tooltip to any element.
		 You can also call this method with an object as argument with elemID:value pairs to apply tooltips to (see examples)

		 @param {HTMLElement} elem The DOM Node to attach the event to
		 @param {string|Function} value The tooltip message. Can also be a function that returns a string.

		 @example this.bindTooltip( this.get('thumbnails'), 'My thumbnails');
		 @example this.bindTooltip( this.get('thumbnails'), function() { return 'My thumbs' });
		 @example this.bindTooltip( { image_nav: 'Navigation' });

		 @returns Instance
		 */

		bindTooltip: function( elem, value ) {
			this._tooltip.bind.apply( this._tooltip, Utils.array(arguments) );
			return this;
		},

		/**
		 Note: this method is deprecated. Use refreshTooltip() instead.

		 Redefine a tooltip.
		 Use this if you want to re-apply a tooltip value to an already bound tooltip element.

		 @param {HTMLElement} elem The DOM Node to attach the event to
		 @param {string|Function} value The tooltip message. Can also be a function that returns a string.

		 @returns Instance
		 */

		defineTooltip: function( elem, value ) {
			this._tooltip.define.apply( this._tooltip, Utils.array(arguments) );
			return this;
		},

		/**
		 Refresh a tooltip value.
		 Use this if you want to change the tooltip value at runtime, f.ex if you have a play/pause toggle.

		 @param {HTMLElement} elem The DOM Node that has a tooltip that should be refreshed

		 @returns Instance
		 */

		refreshTooltip: function( elem ) {
			this._tooltip.show.apply( this._tooltip, Utils.array(arguments) );
			return this;
		},

		/**
		 Open a pre-designed lightbox with the currently active image.
		 You can control some visuals using gallery options.

		 @returns Instance
		 */

		openLightbox: function() {
			this._lightbox.show.apply( this._lightbox, Utils.array( arguments ) );
			return this;
		},

		/**
		 Close the lightbox.

		 @returns Instance
		 */

		closeLightbox: function() {
			this._lightbox.hide.apply( this._lightbox, Utils.array( arguments ) );
			return this;
		},

		/**
		 Check if a variation exists

		 @returns {Boolean} If the variation has been applied
		 */

		hasVariation: function( variation ) {
			return $.inArray( variation, this._options.variation.split(/\s+/) ) > -1;
		},

		/**
		 Get the currently active image element.

		 @returns {HTMLElement} The image element
		 */

		getActiveImage: function() {
			var active = this._getActive();
			return active ? active.image : undef;
		},

		/**
		 Get the currently active thumbnail element.

		 @returns {HTMLElement} The thumbnail element
		 */

		getActiveThumb: function() {
			return this._thumbnails[ this._active ].image || undef;
		},

		/**
		 Get the mouse position relative to the gallery container

		 @param e The mouse event

		 @example

		 var gallery = this;
		 $(document).mousemove(function(e) {
    console.log( gallery.getMousePosition(e).x );
});

		 @returns {Object} Object with x & y of the relative mouse postion
		 */

		getMousePosition : function(e) {
			return {
				x: e.pageX - this.$( 'container' ).offset().left,
				y: e.pageY - this.$( 'container' ).offset().top
			};
		},

		/**
		 Adds a panning effect to the image

		 @param [img] The optional image element. If not specified it takes the currently active image

		 @returns Instance
		 */

		addPan : function( img ) {

			if ( this._options.imageCrop === false ) {
				return;
			}

			img = $( img || this.getActiveImage() );

			// define some variables and methods
			var self   = this,
				x      = img.width() / 2,
				y      = img.height() / 2,
				destX  = parseInt( img.css( 'left' ), 10 ),
				destY  = parseInt( img.css( 'top' ), 10 ),
				curX   = destX || 0,
				curY   = destY || 0,
				distX  = 0,
				distY  = 0,
				active = false,
				ts     = Utils.timestamp(),
				cache  = 0,
				move   = 0,

				// positions the image
				position = function( dist, cur, pos ) {
					if ( dist > 0 ) {
						move = M.round( M.max( dist * -1, M.min( 0, cur ) ) );
						if ( cache !== move ) {

							cache = move;

							if ( IE === 8 ) { // scroll is faster for IE
								img.parent()[ 'scroll' + pos ]( move * -1 );
							} else {
								var css = {};
								css[ pos.toLowerCase() ] = move;
								img.css(css);
							}
						}
					}
				},

				// calculates mouse position after 50ms
				calculate = function(e) {
					if (Utils.timestamp() - ts < 50) {
						return;
					}
					active = true;
					x = self.getMousePosition(e).x;
					y = self.getMousePosition(e).y;
				},

				// the main loop to check
				loop = function(e) {

					if (!active) {
						return;
					}

					distX = img.width() - self._stageWidth;
					distY = img.height() - self._stageHeight;
					destX = x / self._stageWidth * distX * -1;
					destY = y / self._stageHeight * distY * -1;
					curX += ( destX - curX ) / self._options.imagePanSmoothness;
					curY += ( destY - curY ) / self._options.imagePanSmoothness;

					position( distY, curY, 'Top' );
					position( distX, curX, 'Left' );

				};

			// we need to use scroll in IE8 to speed things up
			if ( IE === 8 ) {

				img.parent().scrollTop( curY * -1 ).scrollLeft( curX * -1 );
				img.css({
					top: 0,
					left: 0
				});

			}

			// unbind and bind event
			this.$( 'stage' ).off( 'mousemove', calculate ).on( 'mousemove', calculate );

			// loop the loop
			this.addTimer( 'pan' + self._id, loop, 50, true);

			return this;
		},

		/**
		 Brings the scope into any callback

		 @param fn The callback to bring the scope into
		 @param [scope] Optional scope to bring

		 @example $('#fullscreen').click( this.proxy(function() { this.enterFullscreen(); }) )

		 @returns {Function} Return the callback with the gallery scope
		 */

		proxy : function( fn, scope ) {
			if ( typeof fn !== 'function' ) {
				return F;
			}
			scope = scope || this;
			return function() {
				return fn.apply( scope, Utils.array( arguments ) );
			};
		},

		/**
		 Tells you the theme name of the gallery

		 @returns {String} theme name
		 */

		getThemeName : function() {
			return this.theme.name;
		},

		/**
		 Removes the panning effect set by addPan()

		 @returns Instance
		 */

		removePan: function() {

			// todo: doublecheck IE8

			this.$( 'stage' ).off( 'mousemove' );

			this.clearTimer( 'pan' + this._id );

			return this;
		},

		/**
		 Adds an element to the Galleria DOM array.
		 When you add an element here, you can access it using element ID in many API calls

		 @param {string} id The element ID you wish to use. You can add many elements by adding more arguments.

		 @example addElement('mybutton');
		 @example addElement('mybutton','mylink');

		 @returns Instance
		 */

		addElement : function( id ) {

			var dom = this._dom;

			$.each( Utils.array(arguments), function( i, blueprint ) {
				dom[ blueprint ] = Utils.create( 'galleria-' + blueprint );
			});

			return this;
		},

		/**
		 Attach keyboard events to Galleria

		 @param {Object} map The map object of events.
		 Possible keys are 'UP', 'DOWN', 'LEFT', 'RIGHT', 'RETURN', 'ESCAPE', 'BACKSPACE', and 'SPACE'.

		 @example

		 this.attachKeyboard({
    right: this.next,
    left: this.prev,
    up: function() {
        console.log( 'up key pressed' )
    }
});

		 @returns Instance
		 */

		attachKeyboard : function( map ) {
			this._keyboard.attach.apply( this._keyboard, Utils.array( arguments ) );
			return this;
		},

		/**
		 Detach all keyboard events to Galleria

		 @returns Instance
		 */

		detachKeyboard : function() {
			this._keyboard.detach.apply( this._keyboard, Utils.array( arguments ) );
			return this;
		},

		/**
		 Fast helper for appending galleria elements that you added using addElement()

		 @param {string} parentID The parent element ID where the element will be appended
		 @param {string} childID the element ID that should be appended

		 @example this.addElement('myElement');
		 this.appendChild( 'info', 'myElement' );

		 @returns Instance
		 */

		appendChild : function( parentID, childID ) {
			this.$( parentID ).append( this.get( childID ) || childID );
			return this;
		},

		/**
		 Fast helper for prepending galleria elements that you added using addElement()

		 @param {string} parentID The parent element ID where the element will be prepended
		 @param {string} childID the element ID that should be prepended

		 @example

		 this.addElement('myElement');
		 this.prependChild( 'info', 'myElement' );

		 @returns Instance
		 */

		prependChild : function( parentID, childID ) {
			this.$( parentID ).prepend( this.get( childID ) || childID );
			return this;
		},

		/**
		 Remove an element by blueprint

		 @param {string} elemID The element to be removed.
		 You can remove multiple elements by adding arguments.

		 @returns Instance
		 */

		remove : function( elemID ) {
			this.$( Utils.array( arguments ).join(',') ).remove();
			return this;
		},

		// a fast helper for building dom structures
		// leave this out of the API for now

		append : function( data ) {
			var i, j;
			for( i in data ) {
				if ( data.hasOwnProperty( i ) ) {
					if ( data[i].constructor === Array ) {
						for( j = 0; data[i][j]; j++ ) {
							this.appendChild( i, data[i][j] );
						}
					} else {
						this.appendChild( i, data[i] );
					}
				}
			}
			return this;
		},

		// an internal helper for scaling according to options
		_scaleImage : function( image, options ) {

			image = image || this._controls.getActive();

			// janpub (JH) fix:
			// image might be unselected yet
			// e.g. when external logics rescales the gallery on window resize events
			if( !image ) {
				return;
			}

			var complete,

				scaleLayer = function( img ) {
					$( img.container ).children(':first').css({
						top: M.max(0, Utils.parseValue( img.image.style.top )),
						left: M.max(0, Utils.parseValue( img.image.style.left )),
						width: Utils.parseValue( img.image.width ),
						height: Utils.parseValue( img.image.height )
					});
				};

			options = $.extend({
				width:       this._stageWidth,
				height:      this._stageHeight,
				crop:        this._options.imageCrop,
				max:         this._options.maxScaleRatio,
				min:         this._options.minScaleRatio,
				margin:      this._options.imageMargin,
				position:    this._options.imagePosition,
				iframelimit: this._options.maxVideoSize
			}, options );

			if ( this._options.layerFollow && this._options.imageCrop !== true ) {

				if ( typeof options.complete == 'function' ) {
					complete = options.complete;
					options.complete = function() {
						complete.call( image, image );
						scaleLayer( image );
					};
				} else {
					options.complete = scaleLayer;
				}

			} else {
				$( image.container ).children(':first').css({ top: 0, left: 0 });
			}

			image.scale( options );
			return this;
		},

		/**
		 Updates the carousel,
		 useful if you resize the gallery and want to re-check if the carousel nav is needed.

		 @returns Instance
		 */

		updateCarousel : function() {
			this._carousel.update();
			return this;
		},

		/**
		 Resize the entire gallery container

		 @param {Object} [measures] Optional object with width/height specified
		 @param {Function} [complete] The callback to be called when the scaling is complete

		 @returns Instance
		 */

		resize : function( measures, complete ) {

			if ( typeof measures == 'function' ) {
				complete = measures;
				measures = undef;
			}

			measures = $.extend( { width:0, height:0 }, measures );

			var self = this,
				$container = this.$( 'container' );

			$.each( measures, function( m, val ) {
				if ( !val ) {
					$container[ m ]( 'auto' );
					measures[ m ] = self._getWH()[ m ];
				}
			});

			$.each( measures, function( m, val ) {
				$container[ m ]( val );
			});

			return this.rescale( complete );

		},

		/**
		 Rescales the gallery

		 @param {number} width The target width
		 @param {number} height The target height
		 @param {Function} complete The callback to be called when the scaling is complete

		 @returns Instance
		 */

		rescale : function( width, height, complete ) {

			var self = this;

			// allow rescale(fn)
			if ( typeof width === 'function' ) {
				complete = width;
				width = undef;
			}

			var scale = function() {

				// set stagewidth
				self._stageWidth = width || self.$( 'stage' ).width();
				self._stageHeight = height || self.$( 'stage' ).height();

				if ( self._options.swipe ) {
					$.each( self._controls.slides, function(i, img) {
						self._scaleImage( img );
						$( img.container ).css('left', self._stageWidth * i);
					});
					self.$('images').css('width', self._stageWidth * self.getDataLength());
				} else {
					// scale the active image
					self._scaleImage();
				}

				if ( self._options.carousel ) {
					self.updateCarousel();
				}

				var frame = self._controls.frames[ self._controls.active ];

				if (frame) {
					self._controls.frames[ self._controls.active ].scale({
						width: self._stageWidth,
						height: self._stageHeight,
						iframelimit: self._options.maxVideoSize
					});
				}

				self.trigger( Galleria.RESCALE );

				if ( typeof complete === 'function' ) {
					complete.call( self );
				}
			};

			scale.call( self );

			return this;
		},

		/**
		 Refreshes the gallery.
		 Useful if you change image options at runtime and want to apply the changes to the active image.

		 @returns Instance
		 */

		refreshImage : function() {
			this._scaleImage();
			if ( this._options.imagePan ) {
				this.addPan();
			}
			return this;
		},

		_preload: function() {
			if ( this._options.preload ) {
				var p, i,
					n = this.getNext(),
					ndata;
				try {
					for ( i = this._options.preload; i > 0; i-- ) {
						p = new Galleria.Picture();
						ndata = this.getData( n );
						p.preload( this.isFullscreen() && ndata.big ? ndata.big : ndata.image );
						n = this.getNext( n );
					}
				} catch(e) {}
			}
		},

		/**
		 Shows an image by index

		 @param {number|boolean} index The index to show
		 @param {Boolean} rewind A boolean that should be true if you want the transition to go back

		 @returns Instance
		 */

		show : function( index, rewind, _history ) {

			var swipe = this._options.swipe;

			// do nothing queue is long || index is false || queue is false and transition is in progress
			if ( !swipe &&
				( this._queue.length > 3 || index === false || ( !this._options.queue && this._queue.stalled ) ) ) {
				return;
			}

			index = M.max( 0, M.min( parseInt( index, 10 ), this.getDataLength() - 1 ) );

			rewind = typeof rewind !== 'undefined' ? !!rewind : index < this.getIndex();

			_history = _history || false;

			// do the history thing and return
			if ( !_history && Galleria.History ) {
				Galleria.History.set( index.toString() );
				return;
			}

			if ( this.finger && index !== this._active ) {
				this.finger.to = -( index*this.finger.width );
				this.finger.index = index;
			}
			this._active = index;

			// we do things a bit simpler in swipe:
			if ( swipe ) {

				var data = this.getData(index),
					self = this;
				if ( !data ) {
					return;
				}

				var src = this.isFullscreen() && data.big ? data.big : ( data.image || data.iframe ),
					image = this._controls.slides[index],
					cached = image.isCached( src ),
					thumb = this._thumbnails[ index ];

				var evObj = {
					cached: cached,
					index: index,
					rewind: rewind,
					imageTarget: image.image,
					thumbTarget: thumb.image,
					galleriaData: data
				};

				this.trigger($.extend(evObj, {
					type: Galleria.LOADSTART
				}));

				self.$('container').removeClass( 'videoplay' );

				var complete = function() {

					self._layers[index].innerHTML = self.getData().layer || '';

					self.trigger($.extend(evObj, {
						type: Galleria.LOADFINISH
					}));
					self._playCheck();
				};

				self._preload();

				window.setTimeout(function() {

					// load if not ready
					if ( !image.ready || $(image.image).attr('src') != src ) {
						if ( data.iframe && !data.image ) {
							image.isIframe = true;
						}
						image.load(src, function(image) {
							evObj.imageTarget = image.image;
							self._scaleImage(image, complete).trigger($.extend(evObj, {
								type: Galleria.IMAGE
							}));
							complete();
						});
					} else {
						self.trigger($.extend(evObj, {
							type: Galleria.IMAGE
						}));
						complete();
					}
				}, 100);

			} else {
				protoArray.push.call( this._queue, {
					index : index,
					rewind : rewind
				});
				if ( !this._queue.stalled ) {
					this._show();
				}
			}

			return this;
		},

		// the internal _show method does the actual showing
		_show : function() {

			// shortcuts
			var self = this,
				queue = this._queue[ 0 ],
				data = this.getData( queue.index );

			if ( !data ) {
				return;
			}

			var src = this.isFullscreen() && data.big ? data.big : ( data.image || data.iframe ),
				active = this._controls.getActive(),
				next = this._controls.getNext(),
				cached = next.isCached( src ),
				thumb = this._thumbnails[ queue.index ],
				mousetrigger = function() {
					$( next.image ).trigger( 'mouseup' );
				};

			self.$('container').toggleClass('iframe', !!data.isIframe).removeClass( 'videoplay' );

			// to be fired when loading & transition is complete:
			var complete = (function( data, next, active, queue, thumb ) {

				return function() {

					var win;

					_transitions.active = false;

					// optimize quality
					Utils.toggleQuality( next.image, self._options.imageQuality );

					// remove old layer
					self._layers[ self._controls.active ].innerHTML = '';

					// swap
					$( active.container ).css({
						zIndex: 0,
						opacity: 0
					}).show();

					$( active.container ).find( 'iframe, .galleria-videoicon' ).remove();
					$( self._controls.frames[ self._controls.active ].container ).hide();

					$( next.container ).css({
						zIndex: 1,
						left: 0,
						top: 0
					}).show();

					self._controls.swap();

					// add pan according to option
					if ( self._options.imagePan ) {
						self.addPan( next.image );
					}

					// make the image clickable
					// order of precedence: iframe, link, lightbox, clicknext
					if ( ( data.iframe && data.image ) || data.link || self._options.lightbox || self._options.clicknext ) {

						$( next.image ).css({
							cursor: 'pointer'
						}).on( 'mouseup', function( e ) {

							// non-left click
							if ( typeof e.which == 'number' && e.which > 1 ) {
								return;
							}

							// iframe / video
							if ( data.iframe ) {

								if ( self.isPlaying() ) {
									self.pause();
								}
								var frame = self._controls.frames[ self._controls.active ],
									w = self._stageWidth,
									h = self._stageHeight;

								$( frame.container ).css({
									width: w,
									height: h,
									opacity: 0
								}).show().animate({
									opacity: 1
								}, 200);

								window.setTimeout(function() {
									frame.load( data.iframe + ( data.video ? '&autoplay=1' : '' ), {
										width: w,
										height: h
									}, function( frame ) {
										self.$( 'container' ).addClass( 'videoplay' );
										frame.scale({
											width: self._stageWidth,
											height: self._stageHeight,
											iframelimit: data.video ? self._options.maxVideoSize : undef
										});
									});
								}, 100);

								return;
							}

							// clicknext
							if ( self._options.clicknext && !Galleria.TOUCH ) {
								if ( self._options.pauseOnInteraction ) {
									self.pause();
								}
								self.next();
								return;
							}

							// popup link
							if ( data.link ) {
								if ( self._options.popupLinks ) {
									win = window.open( data.link, '_blank' );
								} else {
									window.location.href = data.link;
								}
								return;
							}

							if ( self._options.lightbox ) {
								self.openLightbox();
							}

						});
					}

					// check if we are playing
					self._playCheck();

					// trigger IMAGE event
					self.trigger({
						type: Galleria.IMAGE,
						index: queue.index,
						imageTarget: next.image,
						thumbTarget: thumb.image,
						galleriaData: data
					});

					// remove the queued image
					protoArray.shift.call( self._queue );

					// remove stalled
					self._queue.stalled = false;

					// if we still have images in the queue, show it
					if ( self._queue.length ) {
						self._show();
					}

				};
			}( data, next, active, queue, thumb ));

			// let the carousel follow
			if ( this._options.carousel && this._options.carouselFollow ) {
				this._carousel.follow( queue.index );
			}

			// preload images
			self._preload();

			// show the next image, just in case
			Utils.show( next.container );

			next.isIframe = data.iframe && !data.image;

			// add active classes
			$( self._thumbnails[ queue.index ].container )
				.addClass( 'active' )
				.siblings( '.active' )
				.removeClass( 'active' );

			// trigger the LOADSTART event
			self.trigger( {
				type: Galleria.LOADSTART,
				cached: cached,
				index: queue.index,
				rewind: queue.rewind,
				imageTarget: next.image,
				thumbTarget: thumb.image,
				galleriaData: data
			});

			// stall the queue
			self._queue.stalled = true;

			// begin loading the next image
			next.load( src, function( next ) {

				// add layer HTML
				var layer = $( self._layers[ 1-self._controls.active ] ).html( data.layer || '' ).hide();

				self._scaleImage( next, {

					complete: function( next ) {

						// toggle low quality for IE
						if ( 'image' in active ) {
							Utils.toggleQuality( active.image, false );
						}
						Utils.toggleQuality( next.image, false );

						// remove the image panning, if applied
						// TODO: rethink if this is necessary
						self.removePan();

						// set the captions and counter
						self.setInfo( queue.index );
						self.setCounter( queue.index );

						// show the layer now
						if ( data.layer ) {
							layer.show();
							// inherit click events set on image
							if ( ( data.iframe && data.image ) || data.link || self._options.lightbox || self._options.clicknext ) {
								layer.css( 'cursor', 'pointer' ).off( 'mouseup' ).mouseup( mousetrigger );
							}
						}

						// add play icon
						if( data.video && data.image ) {
							_playIcon( next.container );
						}

						var transition = self._options.transition;

						// can JavaScript loop through objects in order? yes.
						$.each({
							initial: active.image === null,
							touch: Galleria.TOUCH,
							fullscreen: self.isFullscreen()
						}, function( type, arg ) {
							if ( arg && self._options[ type + 'Transition' ] !== undef ) {
								transition = self._options[ type + 'Transition' ];
								return false;
							}
						});

						// validate the transition
						if ( transition in _transitions.effects === false ) {
							complete();
						} else {
							var params = {
								prev: active.container,
								next: next.container,
								rewind: queue.rewind,
								speed: self._options.transitionSpeed || 400
							};

							_transitions.active = true;

							// call the transition function and send some stuff
							_transitions.init.call( self, transition, params, complete );

						}

						// trigger the LOADFINISH event
						self.trigger({
							type: Galleria.LOADFINISH,
							cached: cached,
							index: queue.index,
							rewind: queue.rewind,
							imageTarget: next.image,
							thumbTarget: self._thumbnails[ queue.index ].image,
							galleriaData: self.getData( queue.index )
						});
					}
				});
			});
		},

		/**
		 Gets the next index

		 @param {number} [base] Optional starting point

		 @returns {number} the next index, or the first if you are at the first (looping)
		 */

		getNext : function( base ) {
			base = typeof base === 'number' ? base : this.getIndex();
			return base === this.getDataLength() - 1 ? 0 : base + 1;
		},

		/**
		 Gets the previous index

		 @param {number} [base] Optional starting point

		 @returns {number} the previous index, or the last if you are at the first (looping)
		 */

		getPrev : function( base ) {
			base = typeof base === 'number' ? base : this.getIndex();
			return base === 0 ? this.getDataLength() - 1 : base - 1;
		},

		/**
		 Shows the next image in line

		 @returns Instance
		 */

		next : function() {
			if ( this.getDataLength() > 1 ) {
				this.show( this.getNext(), false );
			}
			return this;
		},

		/**
		 Shows the previous image in line

		 @returns Instance
		 */

		prev : function() {
			if ( this.getDataLength() > 1 ) {
				this.show( this.getPrev(), true );
			}
			return this;
		},

		/**
		 Retrieve a DOM element by element ID

		 @param {string} elemId The delement ID to fetch

		 @returns {HTMLElement} The elements DOM node or null if not found.
		 */

		get : function( elemId ) {
			return elemId in this._dom ? this._dom[ elemId ] : null;
		},

		/**
		 Retrieve a data object

		 @param {number} index The data index to retrieve.
		 If no index specified it will take the currently active image

		 @returns {Object} The data object
		 */

		getData : function( index ) {
			return index in this._data ?
				this._data[ index ] : this._data[ this._active ];
		},

		/**
		 Retrieve the number of data items

		 @returns {number} The data length
		 */
		getDataLength : function() {
			return this._data.length;
		},

		/**
		 Retrieve the currently active index

		 @returns {number|boolean} The active index or false if none found
		 */

		getIndex : function() {
			return typeof this._active === 'number' ? this._active : false;
		},

		/**
		 Retrieve the stage height

		 @returns {number} The stage height
		 */

		getStageHeight : function() {
			return this._stageHeight;
		},

		/**
		 Retrieve the stage width

		 @returns {number} The stage width
		 */

		getStageWidth : function() {
			return this._stageWidth;
		},

		/**
		 Retrieve the option

		 @param {string} key The option key to retrieve. If no key specified it will return all options in an object.

		 @returns option or options
		 */

		getOptions : function( key ) {
			return typeof key === 'undefined' ? this._options : this._options[ key ];
		},

		/**
		 Set options to the instance.
		 You can set options using a key & value argument or a single object argument (see examples)

		 @param {string} key The option key
		 @param {string} value the the options value

		 @example setOptions( 'autoplay', true )
		 @example setOptions({ autoplay: true });

		 @returns Instance
		 */

		setOptions : function( key, value ) {
			if ( typeof key === 'object' ) {
				$.extend( this._options, key );
			} else {
				this._options[ key ] = value;
			}
			return this;
		},

		/**
		 Starts playing the slideshow

		 @param {number} delay Sets the slideshow interval in milliseconds.
		 If you set it once, you can just call play() and get the same interval the next time.

		 @returns Instance
		 */

		play : function( delay ) {

			this._playing = true;

			this._playtime = delay || this._playtime;

			this._playCheck();

			this.trigger( Galleria.PLAY );

			return this;
		},

		/**
		 Stops the slideshow if currently playing

		 @returns Instance
		 */

		pause : function() {

			this._playing = false;

			this.trigger( Galleria.PAUSE );

			return this;
		},

		/**
		 Toggle between play and pause events.

		 @param {number} delay Sets the slideshow interval in milliseconds.

		 @returns Instance
		 */

		playToggle : function( delay ) {
			return ( this._playing ) ? this.pause() : this.play( delay );
		},

		/**
		 Checks if the gallery is currently playing

		 @returns {Boolean}
		 */

		isPlaying : function() {
			return this._playing;
		},

		/**
		 Checks if the gallery is currently in fullscreen mode

		 @returns {Boolean}
		 */

		isFullscreen : function() {
			return this._fullscreen.active;
		},

		_playCheck : function() {
			var self = this,
				played = 0,
				interval = 20,
				now = Utils.timestamp(),
				timer_id = 'play' + this._id;

			if ( this._playing ) {

				this.clearTimer( timer_id );

				var fn = function() {

					played = Utils.timestamp() - now;
					if ( played >= self._playtime && self._playing ) {
						self.clearTimer( timer_id );
						self.next();
						return;
					}
					if ( self._playing ) {

						// trigger the PROGRESS event
						self.trigger({
							type:         Galleria.PROGRESS,
							percent:      M.ceil( played / self._playtime * 100 ),
							seconds:      M.floor( played / 1000 ),
							milliseconds: played
						});

						self.addTimer( timer_id, fn, interval );
					}
				};
				self.addTimer( timer_id, fn, interval );
			}
		},

		/**
		 Modify the slideshow delay

		 @param {number} delay the number of milliseconds between slides,

		 @returns Instance
		 */

		setPlaytime: function( delay ) {
			this._playtime = delay;
			return this;
		},

		setIndex: function( val ) {
			this._active = val;
			return this;
		},

		/**
		 Manually modify the counter

		 @param {number} [index] Optional data index to fectch,
		 if no index found it assumes the currently active index

		 @returns Instance
		 */

		setCounter: function( index ) {

			if ( typeof index === 'number' ) {
				index++;
			} else if ( typeof index === 'undefined' ) {
				index = this.getIndex()+1;
			}

			this.get( 'current' ).innerHTML = index;

			if ( IE ) { // weird IE bug

				var count = this.$( 'counter' ),
					opacity = count.css( 'opacity' );

				if ( parseInt( opacity, 10 ) === 1) {
					Utils.removeAlpha( count[0] );
				} else {
					this.$( 'counter' ).css( 'opacity', opacity );
				}

			}

			return this;
		},

		/**
		 Manually set captions

		 @param {number} [index] Optional data index to fectch and apply as caption,
		 if no index found it assumes the currently active index

		 @returns Instance
		 */

		setInfo : function( index ) {

			var self = this,
				data = this.getData( index );

			$.each( ['title','description'], function( i, type ) {

				var elem = self.$( 'info-' + type );

				if ( !!data[type] ) {
					elem[ data[ type ].length ? 'show' : 'hide' ]().html( data[ type ] );
				} else {
					elem.empty().hide();
				}
			});

			return this;
		},

		/**
		 Checks if the data contains any captions

		 @param {number} [index] Optional data index to fectch,
		 if no index found it assumes the currently active index.

		 @returns {boolean}
		 */

		hasInfo : function( index ) {

			var check = 'title description'.split(' '),
				i;

			for ( i = 0; check[i]; i++ ) {
				if ( !!this.getData( index )[ check[i] ] ) {
					return true;
				}
			}
			return false;

		},

		jQuery : function( str ) {

			var self = this,
				ret = [];

			$.each( str.split(','), function( i, elemId ) {
				elemId = $.trim( elemId );

				if ( self.get( elemId ) ) {
					ret.push( elemId );
				}
			});

			var jQ = $( self.get( ret.shift() ) );

			$.each( ret, function( i, elemId ) {
				jQ = jQ.add( self.get( elemId ) );
			});

			return jQ;

		},

		/**
		 Converts element IDs into a jQuery collection
		 You can call for multiple IDs separated with commas.

		 @param {string} str One or more element IDs (comma-separated)

		 @returns jQuery

		 @example this.$('info,container').hide();
		 */

		$ : function( str ) {
			return this.jQuery.apply( this, Utils.array( arguments ) );
		}

	};

// End of Galleria prototype

// Add events as static variables
	$.each( _events, function( i, ev ) {

		// legacy events
		var type = /_/.test( ev ) ? ev.replace( /_/g, '' ) : ev;

		Galleria[ ev.toUpperCase() ] = 'galleria.'+type;

	} );

	$.extend( Galleria, {

		// Browser helpers
		IE9:     IE === 9,
		IE8:     IE === 8,
		IE7:     IE === 7,
		IE6:     IE === 6,
		IE:      IE,
		WEBKIT:  /webkit/.test( NAV ),
		CHROME:  /chrome/.test( NAV ),
		SAFARI:  /safari/.test( NAV ) && !(/chrome/.test( NAV )),
		QUIRK:   ( IE && doc.compatMode && doc.compatMode === "BackCompat" ),
		MAC:     /mac/.test( navigator.platform.toLowerCase() ),
		OPERA:   !!window.opera,
		IPHONE:  /iphone/.test( NAV ),
		IPAD:    /ipad/.test( NAV ),
		ANDROID: /android/.test( NAV ),
		TOUCH:   ( 'ontouchstart' in doc ) && MOBILE // rule out false positives on Win10

	});

// Galleria static methods

	/**
	 Adds a theme that you can use for your Gallery

	 @param {Object} theme Object that should contain all your theme settings.
	 <ul>
	 <li>name - name of the theme</li>
	 <li>author - name of the author</li>
	 <li>css - css file name (not path)</li>
	 <li>defaults - default options to apply, including theme-specific options</li>
	 <li>init - the init function</li>
	 </ul>

	 @returns {Object} theme
	 */

	Galleria.addTheme = function( theme ) {

		// make sure we have a name
		if ( !theme.name ) {
			Galleria.raise('No theme name specified');
		}

		// make sure it's compatible
		if ( !theme.version || parseInt(Galleria.version*10) > parseInt(theme.version*10) ) {
			Galleria.raise('This version of Galleria requires '+theme.name+' theme version '+parseInt(Galleria.version*10)/10+' or later', true);
		}

		if ( typeof theme.defaults !== 'object' ) {
			theme.defaults = {};
		} else {
			theme.defaults = _legacyOptions( theme.defaults );
		}

		var css = false,
			reg, reg2;

		if ( typeof theme.css === 'string' ) {

			// look for manually added CSS
			$('link').each(function( i, link ) {
				reg = new RegExp( theme.css );
				if ( reg.test( link.href ) ) {

					// we found the css
					css = true;

					// the themeload trigger
					_themeLoad( theme );

					return false;
				}
			});

			// else look for the absolute path and load the CSS dynamic
			if ( !css ) {


				$(function() {
					// Try to determine the css-path from the theme script.
					// In IE8/9, the script-dom-element seems to be not present
					// at once, if galleria itself is inserted into the dom
					// dynamically. We therefore try multiple times before raising
					// an error.
					var retryCount = 0;
					var tryLoadCss = function() {
						$('script').each(function (i, script) {
							// look for the theme script
							reg = new RegExp('galleria\\.' + theme.name.toLowerCase() + '\\.');
							reg2 = new RegExp('galleria\\.io\\/theme\\/' + theme.name.toLowerCase() + '\\/(\\d*\\.*)?(\\d*\\.*)?(\\d*\\/)?js');
							if (reg.test(script.src) || reg2.test(script.src)) {
								// we have a match
								css = script.src.replace(/[^\/]*$/, '') + theme.css;

								window.setTimeout(function () {
									Utils.loadCSS(css, 'galleria-theme-'+theme.name, function () {

										// run galleries with this theme
										_themeLoad(theme);

									});
								}, 1);
							}
						});
						if (!css) {
							if (retryCount++ > 5) {
								Galleria.raise('No theme CSS loaded');
							} else {
								window.setTimeout(tryLoadCss, 500);
							}
						}
					};
					tryLoadCss();
				});
			}

		} else {

			// pass
			_themeLoad( theme );
		}
		return theme;
	};

	/**
	 loadTheme loads a theme js file and attaches a load event to Galleria

	 @param {string} src The relative path to the theme source file

	 @param {Object} [options] Optional options you want to apply

	 @returns Galleria
	 */

	Galleria.loadTheme = function( src, options ) {

		// Don't load if theme is already loaded
		if( $('script').filter(function() { return $(this).attr('src') == src; }).length ) {
			return;
		}

		var loaded = false,
			err;

		// start listening for the timeout onload
		$( window ).on('load', function() {
			if ( !loaded ) {
				// give it another 20 seconds
				err = window.setTimeout(function() {
					if ( !loaded ) {
						Galleria.raise( "Galleria had problems loading theme at " + src + ". Please check theme path or load manually.", true );
					}
				}, 20000);
			}
		});

		// load the theme
		Utils.loadScript( src, function() {
			loaded = true;
			window.clearTimeout( err );
		});

		return Galleria;
	};

	/**
	 Retrieves a Galleria instance.

	 @param {number} [index] Optional index to retrieve.
	 If no index is supplied, the method will return all instances in an array.

	 @returns Instance or Array of instances
	 */

	Galleria.get = function( index ) {
		if ( !!_instances[ index ] ) {
			return _instances[ index ];
		} else if ( typeof index !== 'number' ) {
			return _instances;
		} else {
			Galleria.raise('Gallery index ' + index + ' not found');
		}
	};

	/**

	 Configure Galleria options via a static function.
	 The options will be applied to all instances

	 @param {string|object} key The options to apply or a key

	 @param [value] If key is a string, this is the value

	 @returns Galleria

	 */

	Galleria.configure = function( key, value ) {

		var opts = {};

		if( typeof key == 'string' && value ) {
			opts[key] = value;
			key = opts;
		} else {
			$.extend( opts, key );
		}

		Galleria.configure.options = opts;

		$.each( Galleria.get(), function(i, instance) {
			instance.setOptions( opts );
		});

		return Galleria;
	};

	Galleria.configure.options = {};

	/**

	 Bind a Galleria event to the gallery

	 @param {string} type A string representing the galleria event

	 @param {function} callback The function that should run when the event is triggered

	 @returns Galleria

	 */

	Galleria.on = function( type, callback ) {
		if ( !type ) {
			return;
		}

		callback = callback || F;

		// hash the bind
		var hash = type + callback.toString().replace(/\s/g,'') + Utils.timestamp();

		// for existing instances
		$.each( Galleria.get(), function(i, instance) {
			instance._binds.push( hash );
			instance.bind( type, callback );
		});

		// for future instances
		Galleria.on.binds.push({
			type: type,
			callback: callback,
			hash: hash
		});

		return Galleria;
	};

	Galleria.on.binds = [];

	/**

	 Run Galleria
	 Alias for $(selector).galleria(options)

	 @param {string} selector A selector of element(s) to intialize galleria to

	 @param {object} options The options to apply

	 @returns Galleria

	 */

	Galleria.run = function( selector, options ) {
		if ( $.isFunction( options ) ) {
			options = { extend: options };
		}
		$( selector || '#galleria' ).galleria( options );
		return Galleria;
	};

	/**
	 Creates a transition to be used in your gallery

	 @param {string} name The name of the transition that you will use as an option

	 @param {Function} fn The function to be executed in the transition.
	 The function contains two arguments, params and complete.
	 Use the params Object to integrate the transition, and then call complete when you are done.

	 @returns Galleria

	 */

	Galleria.addTransition = function( name, fn ) {
		_transitions.effects[name] = fn;
		return Galleria;
	};

	/**
	 The Galleria utilites
	 */

	Galleria.utils = Utils;

	/**
	 A helper metod for cross-browser logging.
	 It uses the console log if available otherwise it falls back to alert

	 @example Galleria.log("hello", document.body, [1,2,3]);
	 */

	Galleria.log = function() {
		var args = Utils.array( arguments );
		if( 'console' in window && 'log' in window.console ) {
			try {
				return window.console.log.apply( window.console, args );
			} catch( e ) {
				$.each( args, function() {
					window.console.log(this);
				});
			}
		} else {
			return window.alert( args.join('<br>') );
		}
	};

	/**
	 A ready method for adding callbacks when a gallery is ready
	 Each method is call before the extend option for every instance

	 @param {function} callback The function to call

	 @returns Galleria
	 */

	Galleria.ready = function( fn ) {
		if ( typeof fn != 'function' ) {
			return Galleria;
		}
		$.each( _galleries, function( i, gallery ) {
			fn.call( gallery, gallery._options );
		});
		Galleria.ready.callbacks.push( fn );
		return Galleria;
	};

	Galleria.ready.callbacks = [];

	/**
	 Method for raising errors

	 @param {string} msg The message to throw

	 @param {boolean} [fatal] Set this to true to override debug settings and display a fatal error
	 */

	Galleria.raise = function( msg, fatal ) {

		var type = fatal ? 'Fatal error' : 'Error',

			css = {
				color: '#fff',
				position: 'absolute',
				top: 0,
				left: 0,
				zIndex: 100000
			},

			echo = function( msg ) {

				var html = '<div style="padding:4px;margin:0 0 2px;background:#' +
					( fatal ? '811' : '222' ) + ';">' +
					( fatal ? '<strong>' + type + ': </strong>' : '' ) +
					msg + '</div>';

				$.each( _instances, function() {

					var cont = this.$( 'errors' ),
						target = this.$( 'target' );

					if ( !cont.length ) {

						target.css( 'position', 'relative' );

						cont = this.addElement( 'errors' ).appendChild( 'target', 'errors' ).$( 'errors' ).css(css);
					}
					cont.append( html );

				});

				if ( !_instances.length ) {
					$('<div>').css( $.extend( css, { position: 'fixed' } ) ).append( html ).appendTo( DOM().body );
				}
			};

		// if debug is on, display errors and throw exception if fatal
		if ( DEBUG ) {
			echo( msg );
			if ( fatal ) {
				throw new Error(type + ': ' + msg);
			}

			// else just echo a silent generic error if fatal
		} else if ( fatal ) {
			if ( _hasError ) {
				return;
			}
			_hasError = true;
			fatal = false;
			echo( 'Gallery could not load.' );
		}
	};

// Add the version
	Galleria.version = VERSION;

	Galleria.getLoadedThemes = function() {
		return $.map(_loadedThemes, function(theme) {
			return theme.name;
		});
	};

	/**
	 A method for checking what version of Galleria the user has installed and throws a readable error if the user needs to upgrade.
	 Useful when building plugins that requires a certain version to function.

	 @param {number} version The minimum version required

	 @param {string} [msg] Optional message to display. If not specified, Galleria will throw a generic error.

	 @returns Galleria
	 */

	Galleria.requires = function( version, msg ) {
		msg = msg || 'You need to upgrade Galleria to version ' + version + ' to use one or more components.';
		if ( Galleria.version < version ) {
			Galleria.raise(msg, true);
		}
		return Galleria;
	};

	/**
	 Adds preload, cache, scale and crop functionality

	 @constructor

	 @requires jQuery

	 @param {number} [id] Optional id to keep track of instances
	 */

	Galleria.Picture = function( id ) {

		// save the id
		this.id = id || null;

		// the image should be null until loaded
		this.image = null;

		// Create a new container
		this.container = Utils.create('galleria-image');

		// add container styles
		$( this.container ).css({
			overflow: 'hidden',
			position: 'relative' // for IE Standards mode
		});

		// saves the original measurements
		this.original = {
			width: 0,
			height: 0
		};

		// flag when the image is ready
		this.ready = false;

		// flag for iframe Picture
		this.isIframe = false;

	};

	Galleria.Picture.prototype = {

		// the inherited cache object
		cache: {},

		// show the image on stage
		show: function() {
			Utils.show( this.image );
		},

		// hide the image
		hide: function() {
			Utils.moveOut( this.image );
		},

		clear: function() {
			this.image = null;
		},

		/**
		 Checks if an image is in cache

		 @param {string} src The image source path, ex '/path/to/img.jpg'

		 @returns {boolean}
		 */

		isCached: function( src ) {
			return !!this.cache[src];
		},

		/**
		 Preloads an image into the cache

		 @param {string} src The image source path, ex '/path/to/img.jpg'

		 @returns Galleria.Picture
		 */

		preload: function( src ) {
			$( new Image() ).on( 'load', (function(src, cache) {
				return function() {
					cache[ src ] = src;
				};
			}( src, this.cache ))).attr( 'src', src );
		},

		/**
		 Loads an image and call the callback when ready.
		 Will also add the image to cache.

		 @param {string} src The image source path, ex '/path/to/img.jpg'
		 @param {Object} [size] The forced size of the image, defined as an object { width: xx, height:xx }
		 @param {Function} callback The function to be executed when the image is loaded & scaled

		 @returns The image container (jQuery object)
		 */

		load: function(src, size, callback) {

			if ( typeof size == 'function' ) {
				callback = size;
				size = null;
			}

			if( this.isIframe ) {
				var id = 'if'+new Date().getTime();

				var iframe = this.image = $('<iframe>', {
					src: src,
					frameborder: 0,
					id: id,
					allowfullscreen: true,
					css: { visibility: 'hidden' }
				})[0];

				if ( size ) {
					$( iframe ).css( size );
				}

				$( this.container ).find( 'iframe,img' ).remove();

				this.container.appendChild( this.image );

				$('#'+id).on( 'load', (function( self, callback ) {
					return function() {
						window.setTimeout(function() {
							$( self.image ).css( 'visibility', 'visible' );
							if( typeof callback == 'function' ) {
								callback.call( self, self );
							}
						}, 10);
					};
				}( this, callback )));

				return this.container;
			}

			this.image = new Image();

			// IE8 opacity inherit bug
			if ( Galleria.IE8 ) {
				$( this.image ).css( 'filter', 'inherit' );
			}

			// FF shaking images bug:
			// http://support.galleria.io/discussions/problems/12245-shaking-photos
			if ( !Galleria.IE && !Galleria.CHROME && !Galleria.SAFARI ) {
				$( this.image ).css( 'image-rendering', 'optimizequality' );
			}

			var reload = false,
				resort = false,

				// some jquery cache
				$container = $( this.container ),
				$image = $( this.image ),

				onerror = function() {
					if ( !reload ) {
						reload = true;
						// reload the image with a timestamp
						window.setTimeout((function(image, src) {
							return function() {
								image.attr('src', src + (src.indexOf('?') > -1 ? '&' : '?') + Utils.timestamp() );
							};
						}( $(this), src )), 50);
					} else {
						// apply the dummy image if it exists
						if ( DUMMY ) {
							$( this ).attr( 'src', DUMMY );
						} else {
							Galleria.raise('Image not found: ' + src);
						}
					}
				},

				// the onload method
				onload = (function( self, callback, src ) {

					return function() {

						var complete = function() {

							$( this ).off( 'load' );

							// save the original size
							self.original = size || {
								height: this.height,
								width: this.width
							};

							// translate3d if needed
							if ( Galleria.HAS3D ) {
								this.style.MozTransform = this.style.webkitTransform = 'translate3d(0,0,0)';
							}

							$container.append( this );

							self.cache[ src ] = src; // will override old cache

							if (typeof callback == 'function' ) {
								window.setTimeout(function() {
									callback.call( self, self );
								},1);
							}
						};

						// Delay the callback to "fix" the Adblock Bug
						// http://code.google.com/p/adblockforchrome/issues/detail?id=3701
						if ( ( !this.width || !this.height ) ) {
							(function( img ) {
								Utils.wait({
									until: function() {
										return img.width && img.height;
									},
									success: function() {
										complete.call( img );
									},
									error: function() {
										if ( !resort ) {
											$(new Image()).on( 'load', onload ).attr( 'src', img.src );
											resort = true;
										} else {
											Galleria.raise('Could not extract width/height from image: ' + img.src +
												'. Traced measures: width:' + img.width + 'px, height: ' + img.height + 'px.');
										}
									},
									timeout: 100
								});
							}( this ));
						} else {
							complete.call( this );
						}
					};
				}( this, callback, src ));

			// remove any previous images
			$container.find( 'iframe,img' ).remove();

			// append the image
			$image.css( 'display', 'block');

			// hide it for now
			Utils.hide( this.image );

			// remove any max/min scaling
			$.each('minWidth minHeight maxWidth maxHeight'.split(' '), function(i, prop) {
				$image.css(prop, (/min/.test(prop) ? '0' : 'none'));
			});

			// begin load and insert in cache when done
			$image.on( 'load', onload ).on( 'error', onerror ).attr( 'src', src );

			// return the container
			return this.container;
		},

		/**
		 Scales and crops the image

		 @param {Object} options The method takes an object with a number of options:

		 <ul>
		 <li>width - width of the container</li>
		 <li>height - height of the container</li>
		 <li>min - minimum scale ratio</li>
		 <li>max - maximum scale ratio</li>
		 <li>margin - distance in pixels from the image border to the container</li>
		 <li>complete - a callback that fires when scaling is complete</li>
		 <li>position - positions the image, works like the css background-image property.</li>
		 <li>crop - defines how to crop. Can be true, false, 'width' or 'height'</li>
		 <li>canvas - set to true to try a canvas-based rescale</li>
		 </ul>

		 @returns The image container object (jQuery)
		 */

		scale: function( options ) {

			var self = this;

			// extend some defaults
			options = $.extend({
				width: 0,
				height: 0,
				min: undef,
				max: undef,
				margin: 0,
				complete: F,
				position: 'center',
				crop: false,
				canvas: false,
				iframelimit: undef
			}, options);

			if( this.isIframe ) {

				var cw = options.width,
					ch = options.height,
					nw, nh;
				if ( options.iframelimit ) {
					var r = M.min( options.iframelimit/cw, options.iframelimit/ch );
					if ( r < 1 ) {
						nw = cw * r;
						nh = ch * r;

						$( this.image ).css({
							top: ch/2-nh/2,
							left: cw/2-nw/2,
							position: 'absolute'
						});
					} else {
						$( this.image ).css({
							top: 0,
							left: 0
						});
					}
				}
				$( this.image ).width( nw || cw ).height( nh || ch ).removeAttr( 'width' ).removeAttr( 'height' );
				$( this.container ).width( cw ).height( ch );
				options.complete.call(self, self);
				try {
					if( this.image.contentWindow ) {
						$( this.image.contentWindow ).trigger('resize');
					}
				} catch(e) {}
				return this.container;

			}

			// return the element if no image found
			if (!this.image) {
				return this.container;
			}

			// store locale variables
			var width,
				height,
				$container = $( self.container ),
				data;

			// wait for the width/height
			Utils.wait({
				until: function() {
					width  = options.width ||
						$container.width() ||
						Utils.parseValue( $container.css('width') );

					height = options.height ||
						$container.height() ||
						Utils.parseValue( $container.css('height') );

					return width && height;
				},
				success: function() {

					// calculate some cropping
					var newWidth = ( width - options.margin * 2 ) / self.original.width,
						newHeight = ( height - options.margin * 2 ) / self.original.height,
						min = M.min( newWidth, newHeight ),
						max = M.max( newWidth, newHeight ),
						cropMap = {
							'true'  : max,
							'width' : newWidth,
							'height': newHeight,
							'false' : min,
							'landscape': self.original.width > self.original.height ? max : min,
							'portrait': self.original.width < self.original.height ? max : min
						},
						ratio = cropMap[ options.crop.toString() ],
						canvasKey = '';

					// allow maxScaleRatio
					if ( options.max ) {
						ratio = M.min( options.max, ratio );
					}

					// allow minScaleRatio
					if ( options.min ) {
						ratio = M.max( options.min, ratio );
					}

					$.each( ['width','height'], function( i, m ) {
						$( self.image )[ m ]( self[ m ] = self.image[ m ] = M.round( self.original[ m ] * ratio ) );
					});

					$( self.container ).width( width ).height( height );

					if ( options.canvas && _canvas ) {

						_canvas.elem.width = self.width;
						_canvas.elem.height = self.height;

						canvasKey = self.image.src + ':' + self.width + 'x' + self.height;

						self.image.src = _canvas.cache[ canvasKey ] || (function( key ) {

							_canvas.context.drawImage(self.image, 0, 0, self.original.width*ratio, self.original.height*ratio);

							try {

								data = _canvas.elem.toDataURL();
								_canvas.length += data.length;
								_canvas.cache[ key ] = data;
								return data;

							} catch( e ) {
								return self.image.src;
							}

						}( canvasKey ) );

					}

					// calculate image_position
					var pos = {},
						mix = {},
						getPosition = function(value, measure, margin) {
							var result = 0;
							if (/\%/.test(value)) {
								var flt = parseInt( value, 10 ) / 100,
									m = self.image[ measure ] || $( self.image )[ measure ]();

								result = M.ceil( m * -1 * flt + margin * flt );
							} else {
								result = Utils.parseValue( value );
							}
							return result;
						},
						positionMap = {
							'top': { top: 0 },
							'left': { left: 0 },
							'right': { left: '100%' },
							'bottom': { top: '100%' }
						};

					$.each( options.position.toLowerCase().split(' '), function( i, value ) {
						if ( value === 'center' ) {
							value = '50%';
						}
						pos[i ? 'top' : 'left'] = value;
					});

					$.each( pos, function( i, value ) {
						if ( positionMap.hasOwnProperty( value ) ) {
							$.extend( mix, positionMap[ value ] );
						}
					});

					pos = pos.top ? $.extend( pos, mix ) : mix;

					pos = $.extend({
						top: '50%',
						left: '50%'
					}, pos);

					// apply position
					$( self.image ).css({
						position : 'absolute',
						top :  getPosition(pos.top, 'height', height),
						left : getPosition(pos.left, 'width', width)
					});

					// show the image
					self.show();

					// flag ready and call the callback
					self.ready = true;
					options.complete.call( self, self );

				},
				error: function() {
					Galleria.raise('Could not scale image: '+self.image.src);
				},
				timeout: 1000
			});
			return this;
		}
	};

// our own easings
	$.extend( $.easing, {

		galleria: function (_, t, b, c, d) {
			if ((t/=d/2) < 1) {
				return c/2*t*t*t + b;
			}
			return c/2*((t-=2)*t*t + 2) + b;
		},

		galleriaIn: function (_, t, b, c, d) {
			return c*(t/=d)*t + b;
		},

		galleriaOut: function (_, t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		}

	});


// Forked version of Ainos Finger.js for native-style touch

	Galleria.Finger = (function() {

		var abs = M.abs;

		// test for translate3d support
		var has3d = Galleria.HAS3D = (function() {

			var el = doc.createElement('p'),
				has3d,
				t = ['webkit','O','ms','Moz',''],
				s,
				i=0,
				a = 'transform';

			DOM().html.insertBefore(el, null);

			for (; t[i]; i++) {
				s = t[i] ? t[i]+'Transform' : a;
				if (el.style[s] !== undefined) {
					el.style[s] = "translate3d(1px,1px,1px)";
					has3d = $(el).css(t[i] ? '-'+t[i].toLowerCase()+'-'+a : a);
				}
			}

			DOM().html.removeChild(el);
			return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
		}());

		// request animation shim
		var requestFrame = (function(){
			var r = 'RequestAnimationFrame';
			return window.requestAnimationFrame ||
				window['webkit'+r] ||
				window['moz'+r] ||
				window['o'+r] ||
				window['ms'+r] ||
				function( callback ) {
					window.setTimeout(callback, 1000 / 60);
				};
		}());

		var Finger = function(elem, options) {

			// default options
			this.config = {
				start: 0,
				duration: 500,
				onchange: function() {},
				oncomplete: function() {},
				easing: function(x,t,b,c,d) {
					return -c * ((t=t/d-1)*t*t*t - 1) + b; // easeOutQuart
				}
			};

			this.easeout = function (x, t, b, c, d) {
				return c*((t=t/d-1)*t*t*t*t + 1) + b;
			};

			if ( !elem.children.length ) {
				return;
			}

			var self = this;

			// extend options
			$.extend(this.config, options);

			this.elem = elem;
			this.child = elem.children[0];
			this.to = this.pos = 0;
			this.touching = false;
			this.start = {};
			this.index = this.config.start;
			this.anim = 0;
			this.easing = this.config.easing;

			if ( !has3d ) {
				this.child.style.position = 'absolute';
				this.elem.style.position = 'relative';
			}

			// Bind event handlers to context
			$.each(['ontouchstart','ontouchmove','ontouchend','setup'], function(i, fn) {
				self[fn] = (function(caller) {
					return function() {
						caller.apply( self, arguments );
					};
				}(self[fn]));
			});

			// the physical animator
			this.setX = function() {

				var style = self.child.style;

				if (!has3d) {
					// this is actually faster than CSS3 translate
					style.left = self.pos+'px';
					return;
				}
				style.MozTransform = style.webkitTransform = style.transform = 'translate3d(' + self.pos + 'px,0,0)';
				return;
			};

			// bind events
			$(elem).on('touchstart', this.ontouchstart);
			$(window).on('resize', this.setup);
			$(window).on('orientationchange', this.setup);

			// set up width
			this.setup();

			// start the animations
			(function animloop(){
				requestFrame(animloop);
				self.loop.call( self );
			}());

		};

		Finger.prototype = {

			constructor: Finger,

			setup: function() {
				this.width = $( this.elem ).width();
				this.length = M.ceil( $(this.child).width() / this.width );
				if ( this.index !== 0 ) {
					this.index = M.max(0, M.min( this.index, this.length-1 ) );
					this.pos = this.to = -this.width*this.index;
				}
			},

			setPosition: function(pos) {
				this.pos = pos;
				this.to = pos;
			},

			ontouchstart: function(e) {

				var touch = e.originalEvent.touches;

				this.start = {
					pageX: touch[0].pageX,
					pageY: touch[0].pageY,
					time:  +new Date()
				};

				this.isScrolling = null;
				this.touching = true;
				this.deltaX = 0;

				$doc.on('touchmove', this.ontouchmove);
				$doc.on('touchend', this.ontouchend);
			},

			ontouchmove: function(e) {

				var touch = e.originalEvent.touches;

				// ensure swiping with one touch and not pinching
				if( touch && touch.length > 1 || e.scale && e.scale !== 1 ) {
					return;
				}

				this.deltaX = touch[0].pageX - this.start.pageX;

				// determine if scrolling test has run - one time test
				if ( this.isScrolling === null ) {
					this.isScrolling = !!(
						this.isScrolling ||
						M.abs(this.deltaX) < M.abs(touch[0].pageY - this.start.pageY)
					);
				}

				// if user is not trying to scroll vertically
				if (!this.isScrolling) {

					// prevent native scrolling
					e.preventDefault();

					// increase resistance if first or last slide
					this.deltaX /= ( (!this.index && this.deltaX > 0 || this.index == this.length - 1 && this.deltaX < 0 ) ?
						( M.abs(this.deltaX) / this.width + 1.8 )  : 1 );
					this.to = this.deltaX - this.index * this.width;
				}
				e.stopPropagation();
			},

			ontouchend: function(e) {

				this.touching = false;

				// determine if slide attempt triggers next/prev slide
				var isValidSlide = +new Date() - this.start.time < 250 &&
					M.abs(this.deltaX) > 40 ||
					M.abs(this.deltaX) > this.width/2,

					isPastBounds = !this.index && this.deltaX > 0 ||
						this.index == this.length - 1 && this.deltaX < 0;

				// if not scrolling vertically
				if ( !this.isScrolling ) {
					this.show( this.index + ( isValidSlide && !isPastBounds ? (this.deltaX < 0 ? 1 : -1) : 0 ) );
				}

				$doc.off('touchmove', this.ontouchmove);
				$doc.off('touchend', this.ontouchend);
			},

			show: function( index ) {
				if ( index != this.index ) {
					this.config.onchange.call(this, index);
				} else {
					this.to = -( index*this.width );
				}
			},

			moveTo: function( index ) {
				if ( index != this.index ) {
					this.pos = this.to = -( index*this.width );
					this.index = index;
				}
			},

			loop: function() {

				var distance = this.to - this.pos,
					factor = 1;

				if ( this.width && distance ) {
					factor = M.max(0.5, M.min(1.5, M.abs(distance / this.width) ) );
				}

				// if distance is short or the user is touching, do a 1-1 animation
				if ( this.touching || M.abs(distance) <= 1 ) {
					this.pos = this.to;
					distance = 0;
					if ( this.anim && !this.touching ) {
						this.config.oncomplete( this.index );
					}
					this.anim = 0;
					this.easing = this.config.easing;
				} else {
					if ( !this.anim ) {
						// save animation parameters
						this.anim = { start: this.pos, time: +new Date(), distance: distance, factor: factor, destination: this.to };
					}
					// check if to has changed or time has run out
					var elapsed = +new Date() - this.anim.time;
					var duration = this.config.duration*this.anim.factor;

					if ( elapsed > duration || this.anim.destination != this.to ) {
						this.anim = 0;
						this.easing = this.easeout;
						return;
					}
					// apply easing
					this.pos = this.easing(
						null,
						elapsed,
						this.anim.start,
						this.anim.distance,
						duration
					);
				}
				this.setX();
			}
		};

		return Finger;

	}());

// the plugin initializer
	$.fn.galleria = function( options ) {

		var selector = this.selector;

		// try domReady if element not found
		if ( !$(this).length ) {

			$(function() {
				if ( $( selector ).length ) {

					// if found on domReady, go ahead
					$( selector ).galleria( options );

				} else {

					// if not, try fetching the element for 5 secs, then raise a warning.
					Galleria.utils.wait({
						until: function() {
							return $( selector ).length;
						},
						success: function() {
							$( selector ).galleria( options );
						},
						error: function() {
							Galleria.raise('Init failed: Galleria could not find the element "'+selector+'".');
						},
						timeout: 5000
					});

				}
			});
			return this;
		}

		return this.each(function() {

			// destroy previous instance and prepare for new load
			if ( $.data(this, 'galleria') ) {
				$.data( this, 'galleria' ).destroy();
				$( this ).find( '*' ).hide();
			}

			// load the new gallery
			$.data( this, 'galleria', new Galleria().init( this, options ) );
		});

	};

// export as AMD or CommonJS
	if ( typeof module === "object" && module && typeof module.exports === "object" ) {
		module.exports = Galleria;
	} else {
		window.Galleria = Galleria;
		if ( typeof define === "function" && define.amd ) {
			define( "galleria", ['jquery'], function() { return Galleria; } );
		}
	}

// phew

}( jQuery, this ) );
(function( $ ) {
    var log = function() {
        try {
            console.log.apply(console, arguments);
        } catch(err) {}
    };

    $.fn.hebsBP = function(options) {
        if (typeof bookingEngineVars === 'undefined') {
            log('HeBS Booking: "bookingEngineVars" variable must be defined.');
            return false;
        }

        var self = $(this);

        if (self.length == 0) {
            log('HeBS Booking: must be attached to form. Please specify proper form selector.');
            return false;
        }

        var settings = {
            'propertyId'       : null,
            'propertySelector' : null,
            'checkIn'               : null,
            'checkOut'              : null,
            'stay'             : null,
            'adults'           : null,
            'extraFields'      : {},
            'singleCookie'     : true,
            'onComplete'       : function() {}
        };

        try {
            var booking_window, booking_length, number_of_adults, extraFields = [];
            if (options) {
                $.extend( settings, options );
            }

            if (!settings.checkIn || !$(settings.checkIn, self).length) {
                log('HeBS Booking: "Check-in" selector is incorrect.');
                return false;
            }

            var settingsPropertyId = settings.propertyId;
            var currentDefaultBooking = $.grep(bookingEngineVars, function(e){
                if (settingsPropertyId) {
                    return e.property_id == settingsPropertyId;
                } else {
                    return !e.property_id;
                }
            });

            var today = new Date(),
                checkin_date,
                checkout_date;

            var property_id = null,
                default_booking_window   = currentDefaultBooking[0].default_booking_window,
                default_booking_length   = currentDefaultBooking[0].default_booking_length,
                default_number_of_adults = currentDefaultBooking[0].default_number_of_adults;

            var cookie_base_name = '__hebs_booking',
                cookie_options = { expires : 36500, path : '/' },
                cookie;

            if(settings.singleCookie){
                cookie = $.cookie(cookie_base_name);
            }
            else{
                if (settingsPropertyId) {
                    cookie = $.cookie(cookie_base_name + '-' + settingsPropertyId);
                } else {
                    cookie = $.cookie(cookie_base_name);
                }
            }

            if (cookie) {
                var cookie_obj = $.secureEvalJSON(cookie);

                booking_window = typeof cookie_obj.bw !== 'undefined' ? cookie_obj.bw : default_booking_window;
                if (today.getTime() <= cookie_obj.checkInDate) {
                    booking_length   = typeof cookie_obj.bl !== 'undefined' ? cookie_obj.bl : default_booking_length;
                    number_of_adults = typeof cookie_obj.noa  !== 'undefined' ? cookie_obj.noa : default_number_of_adults;

                    /* init ckeckin date */
                    checkin_date  = new Date(cookie_obj.checkInDate);

                    /* init ckeckout date */
                    checkout_date = new Date(checkin_date);
                    checkout_date.setDate(checkout_date.getDate() + booking_length);
                } else {
                    booking_length   = typeof cookie_obj.bl !== 'undefined' ? cookie_obj.bl : default_booking_length;
                    number_of_adults = cookie_obj.noa ? cookie_obj.noa : default_number_of_adults;

                    /* init ckeckin date */
                    checkin_date = new Date(today);
                    checkin_date.setDate(checkin_date.getDate()+booking_window);

                    /* init ckeckout date */
                    checkout_date = new Date(checkin_date);
                    checkout_date.setDate(checkout_date.getDate() + booking_length);
                }

                if (cookie_obj.ef) {
                    $.each (cookie_obj.ef, function( key, value ) {
                        $(key, self).val(value);
                        extraFields.push({'selector':key,'value':value});
                    });
                }

                if (cookie_obj.pid && typeof cookie_obj.pid !== 'undefined') {
                    property_id = cookie_obj.pid;
                }
            } else {

                booking_window   = default_booking_window;
                booking_length   = default_booking_length;
                number_of_adults = default_number_of_adults;

                /* init ckeckin date */
                checkin_date = new Date(today);

                checkin_date.setDate(checkin_date.getDate()+booking_window);

                /* init ckeckout date */
                checkout_date = new Date(checkin_date);
                checkout_date.setDate(checkout_date.getDate() + booking_length);
            }

            // returns default values if cookie dosnt exist
            var return_data  = {
                'checkin_date'     : checkin_date,
                'checkout_date'    : checkout_date,
                'booking_window'   : booking_window,
                'booking_length'   : booking_length,
                'number_of_adults' : number_of_adults,
                'property_id'      : (settingsPropertyId) ? settingsPropertyId : property_id,
                'extra_fields'     : extraFields ? extraFields : [],
                'default'          : {
                    'booking_window'   : default_booking_window,
                    'booking_length'   : default_booking_length,
                    'number_of_adults' : default_number_of_adults
                }
            };
        }
        catch(err){}

        if (currentPropertyId) {
            var ccookie_obj = {
                pid: currentPropertyId
            };
            var ccookie = $.cookie(cookie_base_name);
            if (ccookie) {
                ccookie_obj = $.secureEvalJSON(ccookie);
                /* set corporate widget's property to last visited property */
                ccookie_obj.pid = currentPropertyId;
            }
            var cjson = $.toJSON(ccookie_obj);
            $.cookie(cookie_base_name, cjson, cookie_options);
        }

        $(self).on( "submit", function() {
            saveCookie();
        });

        if (settings.propertySelector && $(settings.propertySelector, self).length) {
            $(settings.propertySelector, self).on('change',function(){
                saveCookie();
            });
        }

        if (settings.checkIn && $(settings.checkIn, self).length) {
            $(settings.checkIn, self).on('change',function(){
                saveCookie();
            });
        }

        if (settings.checkOut && $(settings.checkOut, self).length) {
            $(settings.checkOut, self).on('change',function(){
                saveCookie();
            });
        }

        if (settings.adults && $(settings.adults, self).length) {
            $(settings.adults, self).on('change',function(){
                saveCookie();
            });
        }

        if (settings.extraFields){
            $.each( settings.extraFields, function( key, value ) {
                $(key, self).on( value, function() {
                    saveCookie();
                });
            });
        }

        if (typeof settings.onComplete == 'function') {
            settings.onComplete.call(self, return_data);
        }

        function getValue(selector, scope) {
            if (selector && $(selector, scope).length) {
                var type = $(selector, scope).prop('type');
                switch (type) {
                    case 'radio':
                    case 'checkbox':
                        return $(selector+":checked", scope).map(function(){ return $(this).val(); }).get();
                    default:
                        return $(selector, scope).val();
                }
            }
            return undefined;
        }

        function saveCookie(){
            var propertyId;
            var selected_property_id = null;
            if (!currentPropertyId) {
                selected_property_id = getValue(settings.propertySelector, self);
                propertyId = typeof selected_property_id !== 'undefined' ? selected_property_id : null;
            }
            else
                propertyId = currentPropertyId;

            try{
                var today = new Date();
                today.setHours(0,0,0,0);

                var ci = new Date($(settings.checkIn, self).val());
                ci.setHours(0,0,0,0);

                var booking_window = Math.floor((ci - today)/86400000);

                var booking_length = default_booking_window;
                if (settings.checkOut && $(settings.checkOut, self).length) {
                    var co = new Date ($(settings.checkOut, self).val());
                    co.setHours(0,0,0,0);
                    booking_length = Math.floor((co - ci)/86400000);
                } else if (settings.stay && $(settings.stay, self).length) {
                    booking_length = $(settings.stay, self).val();
                }

                var number_of_adults = null;
                if (settings.adults && $(settings.adults, self).length) {
                    number_of_adults = $(settings.adults, self).val();
                }

                var extraFields = {};
                if (settings.extraFields) {
                    $.each( settings.extraFields, function( key, value ) {
                        extraFields[key] =  getValue(key, self);
                    });
                }

                var obj = {
                    checkInDate: ci.getTime(),
                    bw:          booking_window,
                    bl:          booking_length,
                    noa:         number_of_adults,
                    ef:          extraFields,
                    pid:         propertyId
                };

                var json = $.toJSON(obj);
                if(!settings.singleCookie && currentPropertyId){
                    $.cookie(cookie_base_name + '-' + currentPropertyId, json, cookie_options);

                    var cobj = {
                        pid: obj.pid
                    };

                    var ccookie = $.cookie(cookie_base_name);
                    if (ccookie) {
                        ccookie_obj = $.secureEvalJSON(ccookie);
                        cobj = $.extend({}, ccookie_obj, cobj);
                    }

                    var cjson = $.toJSON(cobj);
                    $.cookie(cookie_base_name, cjson, cookie_options);
                }
                else{
                    $.cookie(cookie_base_name, json, cookie_options);
                }
            } catch(err){}
        }

        return self;

    };
})(jQuery);

/*! jQuery v3.3.1 | (c) JS Foundation and other contributors | jquery.org/license */
!function(e,t){"use strict";"object"==typeof module&&"object"==typeof module.exports?module.exports=e.document?t(e,!0):function(e){if(!e.document)throw new Error("jQuery requires a window with a document");return t(e)}:t(e)}("undefined"!=typeof window?window:this,function(e,t){"use strict";var n=[],r=e.document,i=Object.getPrototypeOf,o=n.slice,a=n.concat,s=n.push,u=n.indexOf,l={},c=l.toString,f=l.hasOwnProperty,p=f.toString,d=p.call(Object),h={},g=function e(t){return"function"==typeof t&&"number"!=typeof t.nodeType},y=function e(t){return null!=t&&t===t.window},v={type:!0,src:!0,noModule:!0};function m(e,t,n){var i,o=(t=t||r).createElement("script");if(o.text=e,n)for(i in v)n[i]&&(o[i]=n[i]);t.head.appendChild(o).parentNode.removeChild(o)}function x(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?l[c.call(e)]||"object":typeof e}var b="3.3.1",w=function(e,t){return new w.fn.init(e,t)},T=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;w.fn=w.prototype={jquery:"3.3.1",constructor:w,length:0,toArray:function(){return o.call(this)},get:function(e){return null==e?o.call(this):e<0?this[e+this.length]:this[e]},pushStack:function(e){var t=w.merge(this.constructor(),e);return t.prevObject=this,t},each:function(e){return w.each(this,e)},map:function(e){return this.pushStack(w.map(this,function(t,n){return e.call(t,n,t)}))},slice:function(){return this.pushStack(o.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(e){var t=this.length,n=+e+(e<0?t:0);return this.pushStack(n>=0&&n<t?[this[n]]:[])},end:function(){return this.prevObject||this.constructor()},push:s,sort:n.sort,splice:n.splice},w.extend=w.fn.extend=function(){var e,t,n,r,i,o,a=arguments[0]||{},s=1,u=arguments.length,l=!1;for("boolean"==typeof a&&(l=a,a=arguments[s]||{},s++),"object"==typeof a||g(a)||(a={}),s===u&&(a=this,s--);s<u;s++)if(null!=(e=arguments[s]))for(t in e)n=a[t],a!==(r=e[t])&&(l&&r&&(w.isPlainObject(r)||(i=Array.isArray(r)))?(i?(i=!1,o=n&&Array.isArray(n)?n:[]):o=n&&w.isPlainObject(n)?n:{},a[t]=w.extend(l,o,r)):void 0!==r&&(a[t]=r));return a},w.extend({expando:"jQuery"+("3.3.1"+Math.random()).replace(/\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isPlainObject:function(e){var t,n;return!(!e||"[object Object]"!==c.call(e))&&(!(t=i(e))||"function"==typeof(n=f.call(t,"constructor")&&t.constructor)&&p.call(n)===d)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},globalEval:function(e){m(e)},each:function(e,t){var n,r=0;if(C(e)){for(n=e.length;r<n;r++)if(!1===t.call(e[r],r,e[r]))break}else for(r in e)if(!1===t.call(e[r],r,e[r]))break;return e},trim:function(e){return null==e?"":(e+"").replace(T,"")},makeArray:function(e,t){var n=t||[];return null!=e&&(C(Object(e))?w.merge(n,"string"==typeof e?[e]:e):s.call(n,e)),n},inArray:function(e,t,n){return null==t?-1:u.call(t,e,n)},merge:function(e,t){for(var n=+t.length,r=0,i=e.length;r<n;r++)e[i++]=t[r];return e.length=i,e},grep:function(e,t,n){for(var r,i=[],o=0,a=e.length,s=!n;o<a;o++)(r=!t(e[o],o))!==s&&i.push(e[o]);return i},map:function(e,t,n){var r,i,o=0,s=[];if(C(e))for(r=e.length;o<r;o++)null!=(i=t(e[o],o,n))&&s.push(i);else for(o in e)null!=(i=t(e[o],o,n))&&s.push(i);return a.apply([],s)},guid:1,support:h}),"function"==typeof Symbol&&(w.fn[Symbol.iterator]=n[Symbol.iterator]),w.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(e,t){l["[object "+t+"]"]=t.toLowerCase()});function C(e){var t=!!e&&"length"in e&&e.length,n=x(e);return!g(e)&&!y(e)&&("array"===n||0===t||"number"==typeof t&&t>0&&t-1 in e)}var E=function(e){var t,n,r,i,o,a,s,u,l,c,f,p,d,h,g,y,v,m,x,b="sizzle"+1*new Date,w=e.document,T=0,C=0,E=ae(),k=ae(),S=ae(),D=function(e,t){return e===t&&(f=!0),0},N={}.hasOwnProperty,A=[],j=A.pop,q=A.push,L=A.push,H=A.slice,O=function(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return n;return-1},P="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",R="(?:\\\\.|[\\w-]|[^\0-\\xa0])+",I="\\["+M+"*("+R+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+R+"))|)"+M+"*\\]",W=":("+R+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+I+")*)|.*)\\)|)",$=new RegExp(M+"+","g"),B=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),F=new RegExp("^"+M+"*,"+M+"*"),_=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),z=new RegExp("="+M+"*([^\\]'\"]*?)"+M+"*\\]","g"),X=new RegExp(W),U=new RegExp("^"+R+"$"),V={ID:new RegExp("^#("+R+")"),CLASS:new RegExp("^\\.("+R+")"),TAG:new RegExp("^("+R+"|[*])"),ATTR:new RegExp("^"+I),PSEUDO:new RegExp("^"+W),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+P+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},G=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Q=/^[^{]+\{\s*\[native \w/,J=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,K=/[+~]/,Z=new RegExp("\\\\([\\da-f]{1,6}"+M+"?|("+M+")|.)","ig"),ee=function(e,t,n){var r="0x"+t-65536;return r!==r||n?t:r<0?String.fromCharCode(r+65536):String.fromCharCode(r>>10|55296,1023&r|56320)},te=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,ne=function(e,t){return t?"\0"===e?"\ufffd":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e},re=function(){p()},ie=me(function(e){return!0===e.disabled&&("form"in e||"label"in e)},{dir:"parentNode",next:"legend"});try{L.apply(A=H.call(w.childNodes),w.childNodes),A[w.childNodes.length].nodeType}catch(e){L={apply:A.length?function(e,t){q.apply(e,H.call(t))}:function(e,t){var n=e.length,r=0;while(e[n++]=t[r++]);e.length=n-1}}}function oe(e,t,r,i){var o,s,l,c,f,h,v,m=t&&t.ownerDocument,T=t?t.nodeType:9;if(r=r||[],"string"!=typeof e||!e||1!==T&&9!==T&&11!==T)return r;if(!i&&((t?t.ownerDocument||t:w)!==d&&p(t),t=t||d,g)){if(11!==T&&(f=J.exec(e)))if(o=f[1]){if(9===T){if(!(l=t.getElementById(o)))return r;if(l.id===o)return r.push(l),r}else if(m&&(l=m.getElementById(o))&&x(t,l)&&l.id===o)return r.push(l),r}else{if(f[2])return L.apply(r,t.getElementsByTagName(e)),r;if((o=f[3])&&n.getElementsByClassName&&t.getElementsByClassName)return L.apply(r,t.getElementsByClassName(o)),r}if(n.qsa&&!S[e+" "]&&(!y||!y.test(e))){if(1!==T)m=t,v=e;else if("object"!==t.nodeName.toLowerCase()){(c=t.getAttribute("id"))?c=c.replace(te,ne):t.setAttribute("id",c=b),s=(h=a(e)).length;while(s--)h[s]="#"+c+" "+ve(h[s]);v=h.join(","),m=K.test(e)&&ge(t.parentNode)||t}if(v)try{return L.apply(r,m.querySelectorAll(v)),r}catch(e){}finally{c===b&&t.removeAttribute("id")}}}return u(e.replace(B,"$1"),t,r,i)}function ae(){var e=[];function t(n,i){return e.push(n+" ")>r.cacheLength&&delete t[e.shift()],t[n+" "]=i}return t}function se(e){return e[b]=!0,e}function ue(e){var t=d.createElement("fieldset");try{return!!e(t)}catch(e){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function le(e,t){var n=e.split("|"),i=n.length;while(i--)r.attrHandle[n[i]]=t}function ce(e,t){var n=t&&e,r=n&&1===e.nodeType&&1===t.nodeType&&e.sourceIndex-t.sourceIndex;if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return-1;return e?1:-1}function fe(e){return function(t){return"input"===t.nodeName.toLowerCase()&&t.type===e}}function pe(e){return function(t){var n=t.nodeName.toLowerCase();return("input"===n||"button"===n)&&t.type===e}}function de(e){return function(t){return"form"in t?t.parentNode&&!1===t.disabled?"label"in t?"label"in t.parentNode?t.parentNode.disabled===e:t.disabled===e:t.isDisabled===e||t.isDisabled!==!e&&ie(t)===e:t.disabled===e:"label"in t&&t.disabled===e}}function he(e){return se(function(t){return t=+t,se(function(n,r){var i,o=e([],n.length,t),a=o.length;while(a--)n[i=o[a]]&&(n[i]=!(r[i]=n[i]))})})}function ge(e){return e&&"undefined"!=typeof e.getElementsByTagName&&e}n=oe.support={},o=oe.isXML=function(e){var t=e&&(e.ownerDocument||e).documentElement;return!!t&&"HTML"!==t.nodeName},p=oe.setDocument=function(e){var t,i,a=e?e.ownerDocument||e:w;return a!==d&&9===a.nodeType&&a.documentElement?(d=a,h=d.documentElement,g=!o(d),w!==d&&(i=d.defaultView)&&i.top!==i&&(i.addEventListener?i.addEventListener("unload",re,!1):i.attachEvent&&i.attachEvent("onunload",re)),n.attributes=ue(function(e){return e.className="i",!e.getAttribute("className")}),n.getElementsByTagName=ue(function(e){return e.appendChild(d.createComment("")),!e.getElementsByTagName("*").length}),n.getElementsByClassName=Q.test(d.getElementsByClassName),n.getById=ue(function(e){return h.appendChild(e).id=b,!d.getElementsByName||!d.getElementsByName(b).length}),n.getById?(r.filter.ID=function(e){var t=e.replace(Z,ee);return function(e){return e.getAttribute("id")===t}},r.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&g){var n=t.getElementById(e);return n?[n]:[]}}):(r.filter.ID=function(e){var t=e.replace(Z,ee);return function(e){var n="undefined"!=typeof e.getAttributeNode&&e.getAttributeNode("id");return n&&n.value===t}},r.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&g){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return[o];i=t.getElementsByName(e),r=0;while(o=i[r++])if((n=o.getAttributeNode("id"))&&n.value===e)return[o]}return[]}}),r.find.TAG=n.getElementsByTagName?function(e,t){return"undefined"!=typeof t.getElementsByTagName?t.getElementsByTagName(e):n.qsa?t.querySelectorAll(e):void 0}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){while(n=o[i++])1===n.nodeType&&r.push(n);return r}return o},r.find.CLASS=n.getElementsByClassName&&function(e,t){if("undefined"!=typeof t.getElementsByClassName&&g)return t.getElementsByClassName(e)},v=[],y=[],(n.qsa=Q.test(d.querySelectorAll))&&(ue(function(e){h.appendChild(e).innerHTML="<a id='"+b+"'></a><select id='"+b+"-\r\\' msallowcapture=''><option selected=''></option></select>",e.querySelectorAll("[msallowcapture^='']").length&&y.push("[*^$]="+M+"*(?:''|\"\")"),e.querySelectorAll("[selected]").length||y.push("\\["+M+"*(?:value|"+P+")"),e.querySelectorAll("[id~="+b+"-]").length||y.push("~="),e.querySelectorAll(":checked").length||y.push(":checked"),e.querySelectorAll("a#"+b+"+*").length||y.push(".#.+[+~]")}),ue(function(e){e.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var t=d.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),e.querySelectorAll("[name=d]").length&&y.push("name"+M+"*[*^$|!~]?="),2!==e.querySelectorAll(":enabled").length&&y.push(":enabled",":disabled"),h.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&y.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),y.push(",.*:")})),(n.matchesSelector=Q.test(m=h.matches||h.webkitMatchesSelector||h.mozMatchesSelector||h.oMatchesSelector||h.msMatchesSelector))&&ue(function(e){n.disconnectedMatch=m.call(e,"*"),m.call(e,"[s!='']:x"),v.push("!=",W)}),y=y.length&&new RegExp(y.join("|")),v=v.length&&new RegExp(v.join("|")),t=Q.test(h.compareDocumentPosition),x=t||Q.test(h.contains)?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return!0;return!1},D=t?function(e,t){if(e===t)return f=!0,0;var r=!e.compareDocumentPosition-!t.compareDocumentPosition;return r||(1&(r=(e.ownerDocument||e)===(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!n.sortDetached&&t.compareDocumentPosition(e)===r?e===d||e.ownerDocument===w&&x(w,e)?-1:t===d||t.ownerDocument===w&&x(w,t)?1:c?O(c,e)-O(c,t):0:4&r?-1:1)}:function(e,t){if(e===t)return f=!0,0;var n,r=0,i=e.parentNode,o=t.parentNode,a=[e],s=[t];if(!i||!o)return e===d?-1:t===d?1:i?-1:o?1:c?O(c,e)-O(c,t):0;if(i===o)return ce(e,t);n=e;while(n=n.parentNode)a.unshift(n);n=t;while(n=n.parentNode)s.unshift(n);while(a[r]===s[r])r++;return r?ce(a[r],s[r]):a[r]===w?-1:s[r]===w?1:0},d):d},oe.matches=function(e,t){return oe(e,null,null,t)},oe.matchesSelector=function(e,t){if((e.ownerDocument||e)!==d&&p(e),t=t.replace(z,"='$1']"),n.matchesSelector&&g&&!S[t+" "]&&(!v||!v.test(t))&&(!y||!y.test(t)))try{var r=m.call(e,t);if(r||n.disconnectedMatch||e.document&&11!==e.document.nodeType)return r}catch(e){}return oe(t,d,null,[e]).length>0},oe.contains=function(e,t){return(e.ownerDocument||e)!==d&&p(e),x(e,t)},oe.attr=function(e,t){(e.ownerDocument||e)!==d&&p(e);var i=r.attrHandle[t.toLowerCase()],o=i&&N.call(r.attrHandle,t.toLowerCase())?i(e,t,!g):void 0;return void 0!==o?o:n.attributes||!g?e.getAttribute(t):(o=e.getAttributeNode(t))&&o.specified?o.value:null},oe.escape=function(e){return(e+"").replace(te,ne)},oe.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},oe.uniqueSort=function(e){var t,r=[],i=0,o=0;if(f=!n.detectDuplicates,c=!n.sortStable&&e.slice(0),e.sort(D),f){while(t=e[o++])t===e[o]&&(i=r.push(o));while(i--)e.splice(r[i],1)}return c=null,e},i=oe.getText=function(e){var t,n="",r=0,o=e.nodeType;if(o){if(1===o||9===o||11===o){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=i(e)}else if(3===o||4===o)return e.nodeValue}else while(t=e[r++])n+=i(t);return n},(r=oe.selectors={cacheLength:50,createPseudo:se,match:V,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(Z,ee),e[3]=(e[3]||e[4]||e[5]||"").replace(Z,ee),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||oe.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&oe.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return V.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&X.test(n)&&(t=a(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(Z,ee).toLowerCase();return"*"===e?function(){return!0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=E[e+" "];return t||(t=new RegExp("(^|"+M+")"+e+"("+M+"|$)"))&&E(e,function(e){return t.test("string"==typeof e.className&&e.className||"undefined"!=typeof e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r){var i=oe.attr(r,e);return null==i?"!="===t:!t||(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i.replace($," ")+" ").indexOf(n)>-1:"|="===t&&(i===n||i.slice(0,n.length+1)===n+"-"))}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),a="last"!==e.slice(-4),s="of-type"===t;return 1===r&&0===i?function(e){return!!e.parentNode}:function(t,n,u){var l,c,f,p,d,h,g=o!==a?"nextSibling":"previousSibling",y=t.parentNode,v=s&&t.nodeName.toLowerCase(),m=!u&&!s,x=!1;if(y){if(o){while(g){p=t;while(p=p[g])if(s?p.nodeName.toLowerCase()===v:1===p.nodeType)return!1;h=g="only"===e&&!h&&"nextSibling"}return!0}if(h=[a?y.firstChild:y.lastChild],a&&m){x=(d=(l=(c=(f=(p=y)[b]||(p[b]={}))[p.uniqueID]||(f[p.uniqueID]={}))[e]||[])[0]===T&&l[1])&&l[2],p=d&&y.childNodes[d];while(p=++d&&p&&p[g]||(x=d=0)||h.pop())if(1===p.nodeType&&++x&&p===t){c[e]=[T,d,x];break}}else if(m&&(x=d=(l=(c=(f=(p=t)[b]||(p[b]={}))[p.uniqueID]||(f[p.uniqueID]={}))[e]||[])[0]===T&&l[1]),!1===x)while(p=++d&&p&&p[g]||(x=d=0)||h.pop())if((s?p.nodeName.toLowerCase()===v:1===p.nodeType)&&++x&&(m&&((c=(f=p[b]||(p[b]={}))[p.uniqueID]||(f[p.uniqueID]={}))[e]=[T,x]),p===t))break;return(x-=i)===r||x%r==0&&x/r>=0}}},PSEUDO:function(e,t){var n,i=r.pseudos[e]||r.setFilters[e.toLowerCase()]||oe.error("unsupported pseudo: "+e);return i[b]?i(t):i.length>1?(n=[e,e,"",t],r.setFilters.hasOwnProperty(e.toLowerCase())?se(function(e,n){var r,o=i(e,t),a=o.length;while(a--)e[r=O(e,o[a])]=!(n[r]=o[a])}):function(e){return i(e,0,n)}):i}},pseudos:{not:se(function(e){var t=[],n=[],r=s(e.replace(B,"$1"));return r[b]?se(function(e,t,n,i){var o,a=r(e,null,i,[]),s=e.length;while(s--)(o=a[s])&&(e[s]=!(t[s]=o))}):function(e,i,o){return t[0]=e,r(t,null,o,n),t[0]=null,!n.pop()}}),has:se(function(e){return function(t){return oe(e,t).length>0}}),contains:se(function(e){return e=e.replace(Z,ee),function(t){return(t.textContent||t.innerText||i(t)).indexOf(e)>-1}}),lang:se(function(e){return U.test(e||"")||oe.error("unsupported lang: "+e),e=e.replace(Z,ee).toLowerCase(),function(t){var n;do{if(n=g?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return(n=n.toLowerCase())===e||0===n.indexOf(e+"-")}while((t=t.parentNode)&&1===t.nodeType);return!1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===h},focus:function(e){return e===d.activeElement&&(!d.hasFocus||d.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:de(!1),disabled:de(!0),checked:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return!1;return!0},parent:function(e){return!r.pseudos.empty(e)},header:function(e){return Y.test(e.nodeName)},input:function(e){return G.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return"input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:he(function(){return[0]}),last:he(function(e,t){return[t-1]}),eq:he(function(e,t,n){return[n<0?n+t:n]}),even:he(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:he(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:he(function(e,t,n){for(var r=n<0?n+t:n;--r>=0;)e.push(r);return e}),gt:he(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}}).pseudos.nth=r.pseudos.eq;for(t in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})r.pseudos[t]=fe(t);for(t in{submit:!0,reset:!0})r.pseudos[t]=pe(t);function ye(){}ye.prototype=r.filters=r.pseudos,r.setFilters=new ye,a=oe.tokenize=function(e,t){var n,i,o,a,s,u,l,c=k[e+" "];if(c)return t?0:c.slice(0);s=e,u=[],l=r.preFilter;while(s){n&&!(i=F.exec(s))||(i&&(s=s.slice(i[0].length)||s),u.push(o=[])),n=!1,(i=_.exec(s))&&(n=i.shift(),o.push({value:n,type:i[0].replace(B," ")}),s=s.slice(n.length));for(a in r.filter)!(i=V[a].exec(s))||l[a]&&!(i=l[a](i))||(n=i.shift(),o.push({value:n,type:a,matches:i}),s=s.slice(n.length));if(!n)break}return t?s.length:s?oe.error(e):k(e,u).slice(0)};function ve(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function me(e,t,n){var r=t.dir,i=t.next,o=i||r,a=n&&"parentNode"===o,s=C++;return t.first?function(t,n,i){while(t=t[r])if(1===t.nodeType||a)return e(t,n,i);return!1}:function(t,n,u){var l,c,f,p=[T,s];if(u){while(t=t[r])if((1===t.nodeType||a)&&e(t,n,u))return!0}else while(t=t[r])if(1===t.nodeType||a)if(f=t[b]||(t[b]={}),c=f[t.uniqueID]||(f[t.uniqueID]={}),i&&i===t.nodeName.toLowerCase())t=t[r]||t;else{if((l=c[o])&&l[0]===T&&l[1]===s)return p[2]=l[2];if(c[o]=p,p[2]=e(t,n,u))return!0}return!1}}function xe(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return!1;return!0}:e[0]}function be(e,t,n){for(var r=0,i=t.length;r<i;r++)oe(e,t[r],n);return n}function we(e,t,n,r,i){for(var o,a=[],s=0,u=e.length,l=null!=t;s<u;s++)(o=e[s])&&(n&&!n(o,r,i)||(a.push(o),l&&t.push(s)));return a}function Te(e,t,n,r,i,o){return r&&!r[b]&&(r=Te(r)),i&&!i[b]&&(i=Te(i,o)),se(function(o,a,s,u){var l,c,f,p=[],d=[],h=a.length,g=o||be(t||"*",s.nodeType?[s]:s,[]),y=!e||!o&&t?g:we(g,p,e,s,u),v=n?i||(o?e:h||r)?[]:a:y;if(n&&n(y,v,s,u),r){l=we(v,d),r(l,[],s,u),c=l.length;while(c--)(f=l[c])&&(v[d[c]]=!(y[d[c]]=f))}if(o){if(i||e){if(i){l=[],c=v.length;while(c--)(f=v[c])&&l.push(y[c]=f);i(null,v=[],l,u)}c=v.length;while(c--)(f=v[c])&&(l=i?O(o,f):p[c])>-1&&(o[l]=!(a[l]=f))}}else v=we(v===a?v.splice(h,v.length):v),i?i(null,a,v,u):L.apply(a,v)})}function Ce(e){for(var t,n,i,o=e.length,a=r.relative[e[0].type],s=a||r.relative[" "],u=a?1:0,c=me(function(e){return e===t},s,!0),f=me(function(e){return O(t,e)>-1},s,!0),p=[function(e,n,r){var i=!a&&(r||n!==l)||((t=n).nodeType?c(e,n,r):f(e,n,r));return t=null,i}];u<o;u++)if(n=r.relative[e[u].type])p=[me(xe(p),n)];else{if((n=r.filter[e[u].type].apply(null,e[u].matches))[b]){for(i=++u;i<o;i++)if(r.relative[e[i].type])break;return Te(u>1&&xe(p),u>1&&ve(e.slice(0,u-1).concat({value:" "===e[u-2].type?"*":""})).replace(B,"$1"),n,u<i&&Ce(e.slice(u,i)),i<o&&Ce(e=e.slice(i)),i<o&&ve(e))}p.push(n)}return xe(p)}function Ee(e,t){var n=t.length>0,i=e.length>0,o=function(o,a,s,u,c){var f,h,y,v=0,m="0",x=o&&[],b=[],w=l,C=o||i&&r.find.TAG("*",c),E=T+=null==w?1:Math.random()||.1,k=C.length;for(c&&(l=a===d||a||c);m!==k&&null!=(f=C[m]);m++){if(i&&f){h=0,a||f.ownerDocument===d||(p(f),s=!g);while(y=e[h++])if(y(f,a||d,s)){u.push(f);break}c&&(T=E)}n&&((f=!y&&f)&&v--,o&&x.push(f))}if(v+=m,n&&m!==v){h=0;while(y=t[h++])y(x,b,a,s);if(o){if(v>0)while(m--)x[m]||b[m]||(b[m]=j.call(u));b=we(b)}L.apply(u,b),c&&!o&&b.length>0&&v+t.length>1&&oe.uniqueSort(u)}return c&&(T=E,l=w),x};return n?se(o):o}return s=oe.compile=function(e,t){var n,r=[],i=[],o=S[e+" "];if(!o){t||(t=a(e)),n=t.length;while(n--)(o=Ce(t[n]))[b]?r.push(o):i.push(o);(o=S(e,Ee(i,r))).selector=e}return o},u=oe.select=function(e,t,n,i){var o,u,l,c,f,p="function"==typeof e&&e,d=!i&&a(e=p.selector||e);if(n=n||[],1===d.length){if((u=d[0]=d[0].slice(0)).length>2&&"ID"===(l=u[0]).type&&9===t.nodeType&&g&&r.relative[u[1].type]){if(!(t=(r.find.ID(l.matches[0].replace(Z,ee),t)||[])[0]))return n;p&&(t=t.parentNode),e=e.slice(u.shift().value.length)}o=V.needsContext.test(e)?0:u.length;while(o--){if(l=u[o],r.relative[c=l.type])break;if((f=r.find[c])&&(i=f(l.matches[0].replace(Z,ee),K.test(u[0].type)&&ge(t.parentNode)||t))){if(u.splice(o,1),!(e=i.length&&ve(u)))return L.apply(n,i),n;break}}}return(p||s(e,d))(i,t,!g,n,!t||K.test(e)&&ge(t.parentNode)||t),n},n.sortStable=b.split("").sort(D).join("")===b,n.detectDuplicates=!!f,p(),n.sortDetached=ue(function(e){return 1&e.compareDocumentPosition(d.createElement("fieldset"))}),ue(function(e){return e.innerHTML="<a href='#'></a>","#"===e.firstChild.getAttribute("href")})||le("type|href|height|width",function(e,t,n){if(!n)return e.getAttribute(t,"type"===t.toLowerCase()?1:2)}),n.attributes&&ue(function(e){return e.innerHTML="<input/>",e.firstChild.setAttribute("value",""),""===e.firstChild.getAttribute("value")})||le("value",function(e,t,n){if(!n&&"input"===e.nodeName.toLowerCase())return e.defaultValue}),ue(function(e){return null==e.getAttribute("disabled")})||le(P,function(e,t,n){var r;if(!n)return!0===e[t]?t.toLowerCase():(r=e.getAttributeNode(t))&&r.specified?r.value:null}),oe}(e);w.find=E,w.expr=E.selectors,w.expr[":"]=w.expr.pseudos,w.uniqueSort=w.unique=E.uniqueSort,w.text=E.getText,w.isXMLDoc=E.isXML,w.contains=E.contains,w.escapeSelector=E.escape;var k=function(e,t,n){var r=[],i=void 0!==n;while((e=e[t])&&9!==e.nodeType)if(1===e.nodeType){if(i&&w(e).is(n))break;r.push(e)}return r},S=function(e,t){for(var n=[];e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n},D=w.expr.match.needsContext;function N(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()}var A=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;function j(e,t,n){return g(t)?w.grep(e,function(e,r){return!!t.call(e,r,e)!==n}):t.nodeType?w.grep(e,function(e){return e===t!==n}):"string"!=typeof t?w.grep(e,function(e){return u.call(t,e)>-1!==n}):w.filter(t,e,n)}w.filter=function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?w.find.matchesSelector(r,e)?[r]:[]:w.find.matches(e,w.grep(t,function(e){return 1===e.nodeType}))},w.fn.extend({find:function(e){var t,n,r=this.length,i=this;if("string"!=typeof e)return this.pushStack(w(e).filter(function(){for(t=0;t<r;t++)if(w.contains(i[t],this))return!0}));for(n=this.pushStack([]),t=0;t<r;t++)w.find(e,i[t],n);return r>1?w.uniqueSort(n):n},filter:function(e){return this.pushStack(j(this,e||[],!1))},not:function(e){return this.pushStack(j(this,e||[],!0))},is:function(e){return!!j(this,"string"==typeof e&&D.test(e)?w(e):e||[],!1).length}});var q,L=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;(w.fn.init=function(e,t,n){var i,o;if(!e)return this;if(n=n||q,"string"==typeof e){if(!(i="<"===e[0]&&">"===e[e.length-1]&&e.length>=3?[null,e,null]:L.exec(e))||!i[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(i[1]){if(t=t instanceof w?t[0]:t,w.merge(this,w.parseHTML(i[1],t&&t.nodeType?t.ownerDocument||t:r,!0)),A.test(i[1])&&w.isPlainObject(t))for(i in t)g(this[i])?this[i](t[i]):this.attr(i,t[i]);return this}return(o=r.getElementById(i[2]))&&(this[0]=o,this.length=1),this}return e.nodeType?(this[0]=e,this.length=1,this):g(e)?void 0!==n.ready?n.ready(e):e(w):w.makeArray(e,this)}).prototype=w.fn,q=w(r);var H=/^(?:parents|prev(?:Until|All))/,O={children:!0,contents:!0,next:!0,prev:!0};w.fn.extend({has:function(e){var t=w(e,this),n=t.length;return this.filter(function(){for(var e=0;e<n;e++)if(w.contains(this,t[e]))return!0})},closest:function(e,t){var n,r=0,i=this.length,o=[],a="string"!=typeof e&&w(e);if(!D.test(e))for(;r<i;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(n.nodeType<11&&(a?a.index(n)>-1:1===n.nodeType&&w.find.matchesSelector(n,e))){o.push(n);break}return this.pushStack(o.length>1?w.uniqueSort(o):o)},index:function(e){return e?"string"==typeof e?u.call(w(e),this[0]):u.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(w.uniqueSort(w.merge(this.get(),w(e,t))))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}});function P(e,t){while((e=e[t])&&1!==e.nodeType);return e}w.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return k(e,"parentNode")},parentsUntil:function(e,t,n){return k(e,"parentNode",n)},next:function(e){return P(e,"nextSibling")},prev:function(e){return P(e,"previousSibling")},nextAll:function(e){return k(e,"nextSibling")},prevAll:function(e){return k(e,"previousSibling")},nextUntil:function(e,t,n){return k(e,"nextSibling",n)},prevUntil:function(e,t,n){return k(e,"previousSibling",n)},siblings:function(e){return S((e.parentNode||{}).firstChild,e)},children:function(e){return S(e.firstChild)},contents:function(e){return N(e,"iframe")?e.contentDocument:(N(e,"template")&&(e=e.content||e),w.merge([],e.childNodes))}},function(e,t){w.fn[e]=function(n,r){var i=w.map(this,t,n);return"Until"!==e.slice(-5)&&(r=n),r&&"string"==typeof r&&(i=w.filter(r,i)),this.length>1&&(O[e]||w.uniqueSort(i),H.test(e)&&i.reverse()),this.pushStack(i)}});var M=/[^\x20\t\r\n\f]+/g;function R(e){var t={};return w.each(e.match(M)||[],function(e,n){t[n]=!0}),t}w.Callbacks=function(e){e="string"==typeof e?R(e):w.extend({},e);var t,n,r,i,o=[],a=[],s=-1,u=function(){for(i=i||e.once,r=t=!0;a.length;s=-1){n=a.shift();while(++s<o.length)!1===o[s].apply(n[0],n[1])&&e.stopOnFalse&&(s=o.length,n=!1)}e.memory||(n=!1),t=!1,i&&(o=n?[]:"")},l={add:function(){return o&&(n&&!t&&(s=o.length-1,a.push(n)),function t(n){w.each(n,function(n,r){g(r)?e.unique&&l.has(r)||o.push(r):r&&r.length&&"string"!==x(r)&&t(r)})}(arguments),n&&!t&&u()),this},remove:function(){return w.each(arguments,function(e,t){var n;while((n=w.inArray(t,o,n))>-1)o.splice(n,1),n<=s&&s--}),this},has:function(e){return e?w.inArray(e,o)>-1:o.length>0},empty:function(){return o&&(o=[]),this},disable:function(){return i=a=[],o=n="",this},disabled:function(){return!o},lock:function(){return i=a=[],n||t||(o=n=""),this},locked:function(){return!!i},fireWith:function(e,n){return i||(n=[e,(n=n||[]).slice?n.slice():n],a.push(n),t||u()),this},fire:function(){return l.fireWith(this,arguments),this},fired:function(){return!!r}};return l};function I(e){return e}function W(e){throw e}function $(e,t,n,r){var i;try{e&&g(i=e.promise)?i.call(e).done(t).fail(n):e&&g(i=e.then)?i.call(e,t,n):t.apply(void 0,[e].slice(r))}catch(e){n.apply(void 0,[e])}}w.extend({Deferred:function(t){var n=[["notify","progress",w.Callbacks("memory"),w.Callbacks("memory"),2],["resolve","done",w.Callbacks("once memory"),w.Callbacks("once memory"),0,"resolved"],["reject","fail",w.Callbacks("once memory"),w.Callbacks("once memory"),1,"rejected"]],r="pending",i={state:function(){return r},always:function(){return o.done(arguments).fail(arguments),this},"catch":function(e){return i.then(null,e)},pipe:function(){var e=arguments;return w.Deferred(function(t){w.each(n,function(n,r){var i=g(e[r[4]])&&e[r[4]];o[r[1]](function(){var e=i&&i.apply(this,arguments);e&&g(e.promise)?e.promise().progress(t.notify).done(t.resolve).fail(t.reject):t[r[0]+"With"](this,i?[e]:arguments)})}),e=null}).promise()},then:function(t,r,i){var o=0;function a(t,n,r,i){return function(){var s=this,u=arguments,l=function(){var e,l;if(!(t<o)){if((e=r.apply(s,u))===n.promise())throw new TypeError("Thenable self-resolution");l=e&&("object"==typeof e||"function"==typeof e)&&e.then,g(l)?i?l.call(e,a(o,n,I,i),a(o,n,W,i)):(o++,l.call(e,a(o,n,I,i),a(o,n,W,i),a(o,n,I,n.notifyWith))):(r!==I&&(s=void 0,u=[e]),(i||n.resolveWith)(s,u))}},c=i?l:function(){try{l()}catch(e){w.Deferred.exceptionHook&&w.Deferred.exceptionHook(e,c.stackTrace),t+1>=o&&(r!==W&&(s=void 0,u=[e]),n.rejectWith(s,u))}};t?c():(w.Deferred.getStackHook&&(c.stackTrace=w.Deferred.getStackHook()),e.setTimeout(c))}}return w.Deferred(function(e){n[0][3].add(a(0,e,g(i)?i:I,e.notifyWith)),n[1][3].add(a(0,e,g(t)?t:I)),n[2][3].add(a(0,e,g(r)?r:W))}).promise()},promise:function(e){return null!=e?w.extend(e,i):i}},o={};return w.each(n,function(e,t){var a=t[2],s=t[5];i[t[1]]=a.add,s&&a.add(function(){r=s},n[3-e][2].disable,n[3-e][3].disable,n[0][2].lock,n[0][3].lock),a.add(t[3].fire),o[t[0]]=function(){return o[t[0]+"With"](this===o?void 0:this,arguments),this},o[t[0]+"With"]=a.fireWith}),i.promise(o),t&&t.call(o,o),o},when:function(e){var t=arguments.length,n=t,r=Array(n),i=o.call(arguments),a=w.Deferred(),s=function(e){return function(n){r[e]=this,i[e]=arguments.length>1?o.call(arguments):n,--t||a.resolveWith(r,i)}};if(t<=1&&($(e,a.done(s(n)).resolve,a.reject,!t),"pending"===a.state()||g(i[n]&&i[n].then)))return a.then();while(n--)$(i[n],s(n),a.reject);return a.promise()}});var B=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;w.Deferred.exceptionHook=function(t,n){e.console&&e.console.warn&&t&&B.test(t.name)&&e.console.warn("jQuery.Deferred exception: "+t.message,t.stack,n)},w.readyException=function(t){e.setTimeout(function(){throw t})};var F=w.Deferred();w.fn.ready=function(e){return F.then(e)["catch"](function(e){w.readyException(e)}),this},w.extend({isReady:!1,readyWait:1,ready:function(e){(!0===e?--w.readyWait:w.isReady)||(w.isReady=!0,!0!==e&&--w.readyWait>0||F.resolveWith(r,[w]))}}),w.ready.then=F.then;function _(){r.removeEventListener("DOMContentLoaded",_),e.removeEventListener("load",_),w.ready()}"complete"===r.readyState||"loading"!==r.readyState&&!r.documentElement.doScroll?e.setTimeout(w.ready):(r.addEventListener("DOMContentLoaded",_),e.addEventListener("load",_));var z=function(e,t,n,r,i,o,a){var s=0,u=e.length,l=null==n;if("object"===x(n)){i=!0;for(s in n)z(e,t,s,n[s],!0,o,a)}else if(void 0!==r&&(i=!0,g(r)||(a=!0),l&&(a?(t.call(e,r),t=null):(l=t,t=function(e,t,n){return l.call(w(e),n)})),t))for(;s<u;s++)t(e[s],n,a?r:r.call(e[s],s,t(e[s],n)));return i?e:l?t.call(e):u?t(e[0],n):o},X=/^-ms-/,U=/-([a-z])/g;function V(e,t){return t.toUpperCase()}function G(e){return e.replace(X,"ms-").replace(U,V)}var Y=function(e){return 1===e.nodeType||9===e.nodeType||!+e.nodeType};function Q(){this.expando=w.expando+Q.uid++}Q.uid=1,Q.prototype={cache:function(e){var t=e[this.expando];return t||(t={},Y(e)&&(e.nodeType?e[this.expando]=t:Object.defineProperty(e,this.expando,{value:t,configurable:!0}))),t},set:function(e,t,n){var r,i=this.cache(e);if("string"==typeof t)i[G(t)]=n;else for(r in t)i[G(r)]=t[r];return i},get:function(e,t){return void 0===t?this.cache(e):e[this.expando]&&e[this.expando][G(t)]},access:function(e,t,n){return void 0===t||t&&"string"==typeof t&&void 0===n?this.get(e,t):(this.set(e,t,n),void 0!==n?n:t)},remove:function(e,t){var n,r=e[this.expando];if(void 0!==r){if(void 0!==t){n=(t=Array.isArray(t)?t.map(G):(t=G(t))in r?[t]:t.match(M)||[]).length;while(n--)delete r[t[n]]}(void 0===t||w.isEmptyObject(r))&&(e.nodeType?e[this.expando]=void 0:delete e[this.expando])}},hasData:function(e){var t=e[this.expando];return void 0!==t&&!w.isEmptyObject(t)}};var J=new Q,K=new Q,Z=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,ee=/[A-Z]/g;function te(e){return"true"===e||"false"!==e&&("null"===e?null:e===+e+""?+e:Z.test(e)?JSON.parse(e):e)}function ne(e,t,n){var r;if(void 0===n&&1===e.nodeType)if(r="data-"+t.replace(ee,"-$&").toLowerCase(),"string"==typeof(n=e.getAttribute(r))){try{n=te(n)}catch(e){}K.set(e,t,n)}else n=void 0;return n}w.extend({hasData:function(e){return K.hasData(e)||J.hasData(e)},data:function(e,t,n){return K.access(e,t,n)},removeData:function(e,t){K.remove(e,t)},_data:function(e,t,n){return J.access(e,t,n)},_removeData:function(e,t){J.remove(e,t)}}),w.fn.extend({data:function(e,t){var n,r,i,o=this[0],a=o&&o.attributes;if(void 0===e){if(this.length&&(i=K.get(o),1===o.nodeType&&!J.get(o,"hasDataAttrs"))){n=a.length;while(n--)a[n]&&0===(r=a[n].name).indexOf("data-")&&(r=G(r.slice(5)),ne(o,r,i[r]));J.set(o,"hasDataAttrs",!0)}return i}return"object"==typeof e?this.each(function(){K.set(this,e)}):z(this,function(t){var n;if(o&&void 0===t){if(void 0!==(n=K.get(o,e)))return n;if(void 0!==(n=ne(o,e)))return n}else this.each(function(){K.set(this,e,t)})},null,t,arguments.length>1,null,!0)},removeData:function(e){return this.each(function(){K.remove(this,e)})}}),w.extend({queue:function(e,t,n){var r;if(e)return t=(t||"fx")+"queue",r=J.get(e,t),n&&(!r||Array.isArray(n)?r=J.access(e,t,w.makeArray(n)):r.push(n)),r||[]},dequeue:function(e,t){t=t||"fx";var n=w.queue(e,t),r=n.length,i=n.shift(),o=w._queueHooks(e,t),a=function(){w.dequeue(e,t)};"inprogress"===i&&(i=n.shift(),r--),i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,a,o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return J.get(e,n)||J.access(e,n,{empty:w.Callbacks("once memory").add(function(){J.remove(e,[t+"queue",n])})})}}),w.fn.extend({queue:function(e,t){var n=2;return"string"!=typeof e&&(t=e,e="fx",n--),arguments.length<n?w.queue(this[0],e):void 0===t?this:this.each(function(){var n=w.queue(this,e,t);w._queueHooks(this,e),"fx"===e&&"inprogress"!==n[0]&&w.dequeue(this,e)})},dequeue:function(e){return this.each(function(){w.dequeue(this,e)})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=w.Deferred(),o=this,a=this.length,s=function(){--r||i.resolveWith(o,[o])};"string"!=typeof e&&(t=e,e=void 0),e=e||"fx";while(a--)(n=J.get(o[a],e+"queueHooks"))&&n.empty&&(r++,n.empty.add(s));return s(),i.promise(t)}});var re=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,ie=new RegExp("^(?:([+-])=|)("+re+")([a-z%]*)$","i"),oe=["Top","Right","Bottom","Left"],ae=function(e,t){return"none"===(e=t||e).style.display||""===e.style.display&&w.contains(e.ownerDocument,e)&&"none"===w.css(e,"display")},se=function(e,t,n,r){var i,o,a={};for(o in t)a[o]=e.style[o],e.style[o]=t[o];i=n.apply(e,r||[]);for(o in t)e.style[o]=a[o];return i};function ue(e,t,n,r){var i,o,a=20,s=r?function(){return r.cur()}:function(){return w.css(e,t,"")},u=s(),l=n&&n[3]||(w.cssNumber[t]?"":"px"),c=(w.cssNumber[t]||"px"!==l&&+u)&&ie.exec(w.css(e,t));if(c&&c[3]!==l){u/=2,l=l||c[3],c=+u||1;while(a--)w.style(e,t,c+l),(1-o)*(1-(o=s()/u||.5))<=0&&(a=0),c/=o;c*=2,w.style(e,t,c+l),n=n||[]}return n&&(c=+c||+u||0,i=n[1]?c+(n[1]+1)*n[2]:+n[2],r&&(r.unit=l,r.start=c,r.end=i)),i}var le={};function ce(e){var t,n=e.ownerDocument,r=e.nodeName,i=le[r];return i||(t=n.body.appendChild(n.createElement(r)),i=w.css(t,"display"),t.parentNode.removeChild(t),"none"===i&&(i="block"),le[r]=i,i)}function fe(e,t){for(var n,r,i=[],o=0,a=e.length;o<a;o++)(r=e[o]).style&&(n=r.style.display,t?("none"===n&&(i[o]=J.get(r,"display")||null,i[o]||(r.style.display="")),""===r.style.display&&ae(r)&&(i[o]=ce(r))):"none"!==n&&(i[o]="none",J.set(r,"display",n)));for(o=0;o<a;o++)null!=i[o]&&(e[o].style.display=i[o]);return e}w.fn.extend({show:function(){return fe(this,!0)},hide:function(){return fe(this)},toggle:function(e){return"boolean"==typeof e?e?this.show():this.hide():this.each(function(){ae(this)?w(this).show():w(this).hide()})}});var pe=/^(?:checkbox|radio)$/i,de=/<([a-z][^\/\0>\x20\t\r\n\f]+)/i,he=/^$|^module$|\/(?:java|ecma)script/i,ge={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ge.optgroup=ge.option,ge.tbody=ge.tfoot=ge.colgroup=ge.caption=ge.thead,ge.th=ge.td;function ye(e,t){var n;return n="undefined"!=typeof e.getElementsByTagName?e.getElementsByTagName(t||"*"):"undefined"!=typeof e.querySelectorAll?e.querySelectorAll(t||"*"):[],void 0===t||t&&N(e,t)?w.merge([e],n):n}function ve(e,t){for(var n=0,r=e.length;n<r;n++)J.set(e[n],"globalEval",!t||J.get(t[n],"globalEval"))}var me=/<|&#?\w+;/;function xe(e,t,n,r,i){for(var o,a,s,u,l,c,f=t.createDocumentFragment(),p=[],d=0,h=e.length;d<h;d++)if((o=e[d])||0===o)if("object"===x(o))w.merge(p,o.nodeType?[o]:o);else if(me.test(o)){a=a||f.appendChild(t.createElement("div")),s=(de.exec(o)||["",""])[1].toLowerCase(),u=ge[s]||ge._default,a.innerHTML=u[1]+w.htmlPrefilter(o)+u[2],c=u[0];while(c--)a=a.lastChild;w.merge(p,a.childNodes),(a=f.firstChild).textContent=""}else p.push(t.createTextNode(o));f.textContent="",d=0;while(o=p[d++])if(r&&w.inArray(o,r)>-1)i&&i.push(o);else if(l=w.contains(o.ownerDocument,o),a=ye(f.appendChild(o),"script"),l&&ve(a),n){c=0;while(o=a[c++])he.test(o.type||"")&&n.push(o)}return f}!function(){var e=r.createDocumentFragment().appendChild(r.createElement("div")),t=r.createElement("input");t.setAttribute("type","radio"),t.setAttribute("checked","checked"),t.setAttribute("name","t"),e.appendChild(t),h.checkClone=e.cloneNode(!0).cloneNode(!0).lastChild.checked,e.innerHTML="<textarea>x</textarea>",h.noCloneChecked=!!e.cloneNode(!0).lastChild.defaultValue}();var be=r.documentElement,we=/^key/,Te=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,Ce=/^([^.]*)(?:\.(.+)|)/;function Ee(){return!0}function ke(){return!1}function Se(){try{return r.activeElement}catch(e){}}function De(e,t,n,r,i,o){var a,s;if("object"==typeof t){"string"!=typeof n&&(r=r||n,n=void 0);for(s in t)De(e,s,n,r,t[s],o);return e}if(null==r&&null==i?(i=n,r=n=void 0):null==i&&("string"==typeof n?(i=r,r=void 0):(i=r,r=n,n=void 0)),!1===i)i=ke;else if(!i)return e;return 1===o&&(a=i,(i=function(e){return w().off(e),a.apply(this,arguments)}).guid=a.guid||(a.guid=w.guid++)),e.each(function(){w.event.add(this,t,i,r,n)})}w.event={global:{},add:function(e,t,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,y=J.get(e);if(y){n.handler&&(n=(o=n).handler,i=o.selector),i&&w.find.matchesSelector(be,i),n.guid||(n.guid=w.guid++),(u=y.events)||(u=y.events={}),(a=y.handle)||(a=y.handle=function(t){return"undefined"!=typeof w&&w.event.triggered!==t.type?w.event.dispatch.apply(e,arguments):void 0}),l=(t=(t||"").match(M)||[""]).length;while(l--)d=g=(s=Ce.exec(t[l])||[])[1],h=(s[2]||"").split(".").sort(),d&&(f=w.event.special[d]||{},d=(i?f.delegateType:f.bindType)||d,f=w.event.special[d]||{},c=w.extend({type:d,origType:g,data:r,handler:n,guid:n.guid,selector:i,needsContext:i&&w.expr.match.needsContext.test(i),namespace:h.join(".")},o),(p=u[d])||((p=u[d]=[]).delegateCount=0,f.setup&&!1!==f.setup.call(e,r,h,a)||e.addEventListener&&e.addEventListener(d,a)),f.add&&(f.add.call(e,c),c.handler.guid||(c.handler.guid=n.guid)),i?p.splice(p.delegateCount++,0,c):p.push(c),w.event.global[d]=!0)}},remove:function(e,t,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,y=J.hasData(e)&&J.get(e);if(y&&(u=y.events)){l=(t=(t||"").match(M)||[""]).length;while(l--)if(s=Ce.exec(t[l])||[],d=g=s[1],h=(s[2]||"").split(".").sort(),d){f=w.event.special[d]||{},p=u[d=(r?f.delegateType:f.bindType)||d]||[],s=s[2]&&new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"),a=o=p.length;while(o--)c=p[o],!i&&g!==c.origType||n&&n.guid!==c.guid||s&&!s.test(c.namespace)||r&&r!==c.selector&&("**"!==r||!c.selector)||(p.splice(o,1),c.selector&&p.delegateCount--,f.remove&&f.remove.call(e,c));a&&!p.length&&(f.teardown&&!1!==f.teardown.call(e,h,y.handle)||w.removeEvent(e,d,y.handle),delete u[d])}else for(d in u)w.event.remove(e,d+t[l],n,r,!0);w.isEmptyObject(u)&&J.remove(e,"handle events")}},dispatch:function(e){var t=w.event.fix(e),n,r,i,o,a,s,u=new Array(arguments.length),l=(J.get(this,"events")||{})[t.type]||[],c=w.event.special[t.type]||{};for(u[0]=t,n=1;n<arguments.length;n++)u[n]=arguments[n];if(t.delegateTarget=this,!c.preDispatch||!1!==c.preDispatch.call(this,t)){s=w.event.handlers.call(this,t,l),n=0;while((o=s[n++])&&!t.isPropagationStopped()){t.currentTarget=o.elem,r=0;while((a=o.handlers[r++])&&!t.isImmediatePropagationStopped())t.rnamespace&&!t.rnamespace.test(a.namespace)||(t.handleObj=a,t.data=a.data,void 0!==(i=((w.event.special[a.origType]||{}).handle||a.handler).apply(o.elem,u))&&!1===(t.result=i)&&(t.preventDefault(),t.stopPropagation()))}return c.postDispatch&&c.postDispatch.call(this,t),t.result}},handlers:function(e,t){var n,r,i,o,a,s=[],u=t.delegateCount,l=e.target;if(u&&l.nodeType&&!("click"===e.type&&e.button>=1))for(;l!==this;l=l.parentNode||this)if(1===l.nodeType&&("click"!==e.type||!0!==l.disabled)){for(o=[],a={},n=0;n<u;n++)void 0===a[i=(r=t[n]).selector+" "]&&(a[i]=r.needsContext?w(i,this).index(l)>-1:w.find(i,this,null,[l]).length),a[i]&&o.push(r);o.length&&s.push({elem:l,handlers:o})}return l=this,u<t.length&&s.push({elem:l,handlers:t.slice(u)}),s},addProp:function(e,t){Object.defineProperty(w.Event.prototype,e,{enumerable:!0,configurable:!0,get:g(t)?function(){if(this.originalEvent)return t(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[e]},set:function(t){Object.defineProperty(this,e,{enumerable:!0,configurable:!0,writable:!0,value:t})}})},fix:function(e){return e[w.expando]?e:new w.Event(e)},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==Se()&&this.focus)return this.focus(),!1},delegateType:"focusin"},blur:{trigger:function(){if(this===Se()&&this.blur)return this.blur(),!1},delegateType:"focusout"},click:{trigger:function(){if("checkbox"===this.type&&this.click&&N(this,"input"))return this.click(),!1},_default:function(e){return N(e.target,"a")}},beforeunload:{postDispatch:function(e){void 0!==e.result&&e.originalEvent&&(e.originalEvent.returnValue=e.result)}}}},w.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n)},w.Event=function(e,t){if(!(this instanceof w.Event))return new w.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||void 0===e.defaultPrevented&&!1===e.returnValue?Ee:ke,this.target=e.target&&3===e.target.nodeType?e.target.parentNode:e.target,this.currentTarget=e.currentTarget,this.relatedTarget=e.relatedTarget):this.type=e,t&&w.extend(this,t),this.timeStamp=e&&e.timeStamp||Date.now(),this[w.expando]=!0},w.Event.prototype={constructor:w.Event,isDefaultPrevented:ke,isPropagationStopped:ke,isImmediatePropagationStopped:ke,isSimulated:!1,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=Ee,e&&!this.isSimulated&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=Ee,e&&!this.isSimulated&&e.stopPropagation()},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=Ee,e&&!this.isSimulated&&e.stopImmediatePropagation(),this.stopPropagation()}},w.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,"char":!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:function(e){var t=e.button;return null==e.which&&we.test(e.type)?null!=e.charCode?e.charCode:e.keyCode:!e.which&&void 0!==t&&Te.test(e.type)?1&t?1:2&t?3:4&t?2:0:e.which}},w.event.addProp),w.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(e,t){w.event.special[e]={delegateType:t,bindType:t,handle:function(e){var n,r=this,i=e.relatedTarget,o=e.handleObj;return i&&(i===r||w.contains(r,i))||(e.type=o.origType,n=o.handler.apply(this,arguments),e.type=t),n}}}),w.fn.extend({on:function(e,t,n,r){return De(this,e,t,n,r)},one:function(e,t,n,r){return De(this,e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,w(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if("object"==typeof e){for(i in e)this.off(i,t,e[i]);return this}return!1!==t&&"function"!=typeof t||(n=t,t=void 0),!1===n&&(n=ke),this.each(function(){w.event.remove(this,e,n,t)})}});var Ne=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,Ae=/<script|<style|<link/i,je=/checked\s*(?:[^=]|=\s*.checked.)/i,qe=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function Le(e,t){return N(e,"table")&&N(11!==t.nodeType?t:t.firstChild,"tr")?w(e).children("tbody")[0]||e:e}function He(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function Oe(e){return"true/"===(e.type||"").slice(0,5)?e.type=e.type.slice(5):e.removeAttribute("type"),e}function Pe(e,t){var n,r,i,o,a,s,u,l;if(1===t.nodeType){if(J.hasData(e)&&(o=J.access(e),a=J.set(t,o),l=o.events)){delete a.handle,a.events={};for(i in l)for(n=0,r=l[i].length;n<r;n++)w.event.add(t,i,l[i][n])}K.hasData(e)&&(s=K.access(e),u=w.extend({},s),K.set(t,u))}}function Me(e,t){var n=t.nodeName.toLowerCase();"input"===n&&pe.test(e.type)?t.checked=e.checked:"input"!==n&&"textarea"!==n||(t.defaultValue=e.defaultValue)}function Re(e,t,n,r){t=a.apply([],t);var i,o,s,u,l,c,f=0,p=e.length,d=p-1,y=t[0],v=g(y);if(v||p>1&&"string"==typeof y&&!h.checkClone&&je.test(y))return e.each(function(i){var o=e.eq(i);v&&(t[0]=y.call(this,i,o.html())),Re(o,t,n,r)});if(p&&(i=xe(t,e[0].ownerDocument,!1,e,r),o=i.firstChild,1===i.childNodes.length&&(i=o),o||r)){for(u=(s=w.map(ye(i,"script"),He)).length;f<p;f++)l=i,f!==d&&(l=w.clone(l,!0,!0),u&&w.merge(s,ye(l,"script"))),n.call(e[f],l,f);if(u)for(c=s[s.length-1].ownerDocument,w.map(s,Oe),f=0;f<u;f++)l=s[f],he.test(l.type||"")&&!J.access(l,"globalEval")&&w.contains(c,l)&&(l.src&&"module"!==(l.type||"").toLowerCase()?w._evalUrl&&w._evalUrl(l.src):m(l.textContent.replace(qe,""),c,l))}return e}function Ie(e,t,n){for(var r,i=t?w.filter(t,e):e,o=0;null!=(r=i[o]);o++)n||1!==r.nodeType||w.cleanData(ye(r)),r.parentNode&&(n&&w.contains(r.ownerDocument,r)&&ve(ye(r,"script")),r.parentNode.removeChild(r));return e}w.extend({htmlPrefilter:function(e){return e.replace(Ne,"<$1></$2>")},clone:function(e,t,n){var r,i,o,a,s=e.cloneNode(!0),u=w.contains(e.ownerDocument,e);if(!(h.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||w.isXMLDoc(e)))for(a=ye(s),r=0,i=(o=ye(e)).length;r<i;r++)Me(o[r],a[r]);if(t)if(n)for(o=o||ye(e),a=a||ye(s),r=0,i=o.length;r<i;r++)Pe(o[r],a[r]);else Pe(e,s);return(a=ye(s,"script")).length>0&&ve(a,!u&&ye(e,"script")),s},cleanData:function(e){for(var t,n,r,i=w.event.special,o=0;void 0!==(n=e[o]);o++)if(Y(n)){if(t=n[J.expando]){if(t.events)for(r in t.events)i[r]?w.event.remove(n,r):w.removeEvent(n,r,t.handle);n[J.expando]=void 0}n[K.expando]&&(n[K.expando]=void 0)}}}),w.fn.extend({detach:function(e){return Ie(this,e,!0)},remove:function(e){return Ie(this,e)},text:function(e){return z(this,function(e){return void 0===e?w.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=e)})},null,e,arguments.length)},append:function(){return Re(this,arguments,function(e){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||Le(this,e).appendChild(e)})},prepend:function(){return Re(this,arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=Le(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return Re(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return Re(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},empty:function(){for(var e,t=0;null!=(e=this[t]);t++)1===e.nodeType&&(w.cleanData(ye(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null!=e&&e,t=null==t?e:t,this.map(function(){return w.clone(this,e,t)})},html:function(e){return z(this,function(e){var t=this[0]||{},n=0,r=this.length;if(void 0===e&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!Ae.test(e)&&!ge[(de.exec(e)||["",""])[1].toLowerCase()]){e=w.htmlPrefilter(e);try{for(;n<r;n++)1===(t=this[n]||{}).nodeType&&(w.cleanData(ye(t,!1)),t.innerHTML=e);t=0}catch(e){}}t&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var e=[];return Re(this,arguments,function(t){var n=this.parentNode;w.inArray(this,e)<0&&(w.cleanData(ye(this)),n&&n.replaceChild(t,this))},e)}}),w.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){w.fn[e]=function(e){for(var n,r=[],i=w(e),o=i.length-1,a=0;a<=o;a++)n=a===o?this:this.clone(!0),w(i[a])[t](n),s.apply(r,n.get());return this.pushStack(r)}});var We=new RegExp("^("+re+")(?!px)[a-z%]+$","i"),$e=function(t){var n=t.ownerDocument.defaultView;return n&&n.opener||(n=e),n.getComputedStyle(t)},Be=new RegExp(oe.join("|"),"i");!function(){function t(){if(c){l.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",c.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",be.appendChild(l).appendChild(c);var t=e.getComputedStyle(c);i="1%"!==t.top,u=12===n(t.marginLeft),c.style.right="60%",s=36===n(t.right),o=36===n(t.width),c.style.position="absolute",a=36===c.offsetWidth||"absolute",be.removeChild(l),c=null}}function n(e){return Math.round(parseFloat(e))}var i,o,a,s,u,l=r.createElement("div"),c=r.createElement("div");c.style&&(c.style.backgroundClip="content-box",c.cloneNode(!0).style.backgroundClip="",h.clearCloneStyle="content-box"===c.style.backgroundClip,w.extend(h,{boxSizingReliable:function(){return t(),o},pixelBoxStyles:function(){return t(),s},pixelPosition:function(){return t(),i},reliableMarginLeft:function(){return t(),u},scrollboxSize:function(){return t(),a}}))}();function Fe(e,t,n){var r,i,o,a,s=e.style;return(n=n||$e(e))&&(""!==(a=n.getPropertyValue(t)||n[t])||w.contains(e.ownerDocument,e)||(a=w.style(e,t)),!h.pixelBoxStyles()&&We.test(a)&&Be.test(t)&&(r=s.width,i=s.minWidth,o=s.maxWidth,s.minWidth=s.maxWidth=s.width=a,a=n.width,s.width=r,s.minWidth=i,s.maxWidth=o)),void 0!==a?a+"":a}function _e(e,t){return{get:function(){if(!e())return(this.get=t).apply(this,arguments);delete this.get}}}var ze=/^(none|table(?!-c[ea]).+)/,Xe=/^--/,Ue={position:"absolute",visibility:"hidden",display:"block"},Ve={letterSpacing:"0",fontWeight:"400"},Ge=["Webkit","Moz","ms"],Ye=r.createElement("div").style;function Qe(e){if(e in Ye)return e;var t=e[0].toUpperCase()+e.slice(1),n=Ge.length;while(n--)if((e=Ge[n]+t)in Ye)return e}function Je(e){var t=w.cssProps[e];return t||(t=w.cssProps[e]=Qe(e)||e),t}function Ke(e,t,n){var r=ie.exec(t);return r?Math.max(0,r[2]-(n||0))+(r[3]||"px"):t}function Ze(e,t,n,r,i,o){var a="width"===t?1:0,s=0,u=0;if(n===(r?"border":"content"))return 0;for(;a<4;a+=2)"margin"===n&&(u+=w.css(e,n+oe[a],!0,i)),r?("content"===n&&(u-=w.css(e,"padding"+oe[a],!0,i)),"margin"!==n&&(u-=w.css(e,"border"+oe[a]+"Width",!0,i))):(u+=w.css(e,"padding"+oe[a],!0,i),"padding"!==n?u+=w.css(e,"border"+oe[a]+"Width",!0,i):s+=w.css(e,"border"+oe[a]+"Width",!0,i));return!r&&o>=0&&(u+=Math.max(0,Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-o-u-s-.5))),u}function et(e,t,n){var r=$e(e),i=Fe(e,t,r),o="border-box"===w.css(e,"boxSizing",!1,r),a=o;if(We.test(i)){if(!n)return i;i="auto"}return a=a&&(h.boxSizingReliable()||i===e.style[t]),("auto"===i||!parseFloat(i)&&"inline"===w.css(e,"display",!1,r))&&(i=e["offset"+t[0].toUpperCase()+t.slice(1)],a=!0),(i=parseFloat(i)||0)+Ze(e,t,n||(o?"border":"content"),a,r,i)+"px"}w.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Fe(e,"opacity");return""===n?"1":n}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{},style:function(e,t,n,r){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var i,o,a,s=G(t),u=Xe.test(t),l=e.style;if(u||(t=Je(s)),a=w.cssHooks[t]||w.cssHooks[s],void 0===n)return a&&"get"in a&&void 0!==(i=a.get(e,!1,r))?i:l[t];"string"==(o=typeof n)&&(i=ie.exec(n))&&i[1]&&(n=ue(e,t,i),o="number"),null!=n&&n===n&&("number"===o&&(n+=i&&i[3]||(w.cssNumber[s]?"":"px")),h.clearCloneStyle||""!==n||0!==t.indexOf("background")||(l[t]="inherit"),a&&"set"in a&&void 0===(n=a.set(e,n,r))||(u?l.setProperty(t,n):l[t]=n))}},css:function(e,t,n,r){var i,o,a,s=G(t);return Xe.test(t)||(t=Je(s)),(a=w.cssHooks[t]||w.cssHooks[s])&&"get"in a&&(i=a.get(e,!0,n)),void 0===i&&(i=Fe(e,t,r)),"normal"===i&&t in Ve&&(i=Ve[t]),""===n||n?(o=parseFloat(i),!0===n||isFinite(o)?o||0:i):i}}),w.each(["height","width"],function(e,t){w.cssHooks[t]={get:function(e,n,r){if(n)return!ze.test(w.css(e,"display"))||e.getClientRects().length&&e.getBoundingClientRect().width?et(e,t,r):se(e,Ue,function(){return et(e,t,r)})},set:function(e,n,r){var i,o=$e(e),a="border-box"===w.css(e,"boxSizing",!1,o),s=r&&Ze(e,t,r,a,o);return a&&h.scrollboxSize()===o.position&&(s-=Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-parseFloat(o[t])-Ze(e,t,"border",!1,o)-.5)),s&&(i=ie.exec(n))&&"px"!==(i[3]||"px")&&(e.style[t]=n,n=w.css(e,t)),Ke(e,n,s)}}}),w.cssHooks.marginLeft=_e(h.reliableMarginLeft,function(e,t){if(t)return(parseFloat(Fe(e,"marginLeft"))||e.getBoundingClientRect().left-se(e,{marginLeft:0},function(){return e.getBoundingClientRect().left}))+"px"}),w.each({margin:"",padding:"",border:"Width"},function(e,t){w.cssHooks[e+t]={expand:function(n){for(var r=0,i={},o="string"==typeof n?n.split(" "):[n];r<4;r++)i[e+oe[r]+t]=o[r]||o[r-2]||o[0];return i}},"margin"!==e&&(w.cssHooks[e+t].set=Ke)}),w.fn.extend({css:function(e,t){return z(this,function(e,t,n){var r,i,o={},a=0;if(Array.isArray(t)){for(r=$e(e),i=t.length;a<i;a++)o[t[a]]=w.css(e,t[a],!1,r);return o}return void 0!==n?w.style(e,t,n):w.css(e,t)},e,t,arguments.length>1)}});function tt(e,t,n,r,i){return new tt.prototype.init(e,t,n,r,i)}w.Tween=tt,tt.prototype={constructor:tt,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||w.easing._default,this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(w.cssNumber[n]?"":"px")},cur:function(){var e=tt.propHooks[this.prop];return e&&e.get?e.get(this):tt.propHooks._default.get(this)},run:function(e){var t,n=tt.propHooks[this.prop];return this.options.duration?this.pos=t=w.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):tt.propHooks._default.set(this),this}},tt.prototype.init.prototype=tt.prototype,tt.propHooks={_default:{get:function(e){var t;return 1!==e.elem.nodeType||null!=e.elem[e.prop]&&null==e.elem.style[e.prop]?e.elem[e.prop]:(t=w.css(e.elem,e.prop,""))&&"auto"!==t?t:0},set:function(e){w.fx.step[e.prop]?w.fx.step[e.prop](e):1!==e.elem.nodeType||null==e.elem.style[w.cssProps[e.prop]]&&!w.cssHooks[e.prop]?e.elem[e.prop]=e.now:w.style(e.elem,e.prop,e.now+e.unit)}}},tt.propHooks.scrollTop=tt.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},w.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},_default:"swing"},w.fx=tt.prototype.init,w.fx.step={};var nt,rt,it=/^(?:toggle|show|hide)$/,ot=/queueHooks$/;function at(){rt&&(!1===r.hidden&&e.requestAnimationFrame?e.requestAnimationFrame(at):e.setTimeout(at,w.fx.interval),w.fx.tick())}function st(){return e.setTimeout(function(){nt=void 0}),nt=Date.now()}function ut(e,t){var n,r=0,i={height:e};for(t=t?1:0;r<4;r+=2-t)i["margin"+(n=oe[r])]=i["padding"+n]=e;return t&&(i.opacity=i.width=e),i}function lt(e,t,n){for(var r,i=(pt.tweeners[t]||[]).concat(pt.tweeners["*"]),o=0,a=i.length;o<a;o++)if(r=i[o].call(n,t,e))return r}function ct(e,t,n){var r,i,o,a,s,u,l,c,f="width"in t||"height"in t,p=this,d={},h=e.style,g=e.nodeType&&ae(e),y=J.get(e,"fxshow");n.queue||(null==(a=w._queueHooks(e,"fx")).unqueued&&(a.unqueued=0,s=a.empty.fire,a.empty.fire=function(){a.unqueued||s()}),a.unqueued++,p.always(function(){p.always(function(){a.unqueued--,w.queue(e,"fx").length||a.empty.fire()})}));for(r in t)if(i=t[r],it.test(i)){if(delete t[r],o=o||"toggle"===i,i===(g?"hide":"show")){if("show"!==i||!y||void 0===y[r])continue;g=!0}d[r]=y&&y[r]||w.style(e,r)}if((u=!w.isEmptyObject(t))||!w.isEmptyObject(d)){f&&1===e.nodeType&&(n.overflow=[h.overflow,h.overflowX,h.overflowY],null==(l=y&&y.display)&&(l=J.get(e,"display")),"none"===(c=w.css(e,"display"))&&(l?c=l:(fe([e],!0),l=e.style.display||l,c=w.css(e,"display"),fe([e]))),("inline"===c||"inline-block"===c&&null!=l)&&"none"===w.css(e,"float")&&(u||(p.done(function(){h.display=l}),null==l&&(c=h.display,l="none"===c?"":c)),h.display="inline-block")),n.overflow&&(h.overflow="hidden",p.always(function(){h.overflow=n.overflow[0],h.overflowX=n.overflow[1],h.overflowY=n.overflow[2]})),u=!1;for(r in d)u||(y?"hidden"in y&&(g=y.hidden):y=J.access(e,"fxshow",{display:l}),o&&(y.hidden=!g),g&&fe([e],!0),p.done(function(){g||fe([e]),J.remove(e,"fxshow");for(r in d)w.style(e,r,d[r])})),u=lt(g?y[r]:0,r,p),r in y||(y[r]=u.start,g&&(u.end=u.start,u.start=0))}}function ft(e,t){var n,r,i,o,a;for(n in e)if(r=G(n),i=t[r],o=e[n],Array.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),(a=w.cssHooks[r])&&"expand"in a){o=a.expand(o),delete e[r];for(n in o)n in e||(e[n]=o[n],t[n]=i)}else t[r]=i}function pt(e,t,n){var r,i,o=0,a=pt.prefilters.length,s=w.Deferred().always(function(){delete u.elem}),u=function(){if(i)return!1;for(var t=nt||st(),n=Math.max(0,l.startTime+l.duration-t),r=1-(n/l.duration||0),o=0,a=l.tweens.length;o<a;o++)l.tweens[o].run(r);return s.notifyWith(e,[l,r,n]),r<1&&a?n:(a||s.notifyWith(e,[l,1,0]),s.resolveWith(e,[l]),!1)},l=s.promise({elem:e,props:w.extend({},t),opts:w.extend(!0,{specialEasing:{},easing:w.easing._default},n),originalProperties:t,originalOptions:n,startTime:nt||st(),duration:n.duration,tweens:[],createTween:function(t,n){var r=w.Tween(e,l.opts,t,n,l.opts.specialEasing[t]||l.opts.easing);return l.tweens.push(r),r},stop:function(t){var n=0,r=t?l.tweens.length:0;if(i)return this;for(i=!0;n<r;n++)l.tweens[n].run(1);return t?(s.notifyWith(e,[l,1,0]),s.resolveWith(e,[l,t])):s.rejectWith(e,[l,t]),this}}),c=l.props;for(ft(c,l.opts.specialEasing);o<a;o++)if(r=pt.prefilters[o].call(l,e,c,l.opts))return g(r.stop)&&(w._queueHooks(l.elem,l.opts.queue).stop=r.stop.bind(r)),r;return w.map(c,lt,l),g(l.opts.start)&&l.opts.start.call(e,l),l.progress(l.opts.progress).done(l.opts.done,l.opts.complete).fail(l.opts.fail).always(l.opts.always),w.fx.timer(w.extend(u,{elem:e,anim:l,queue:l.opts.queue})),l}w.Animation=w.extend(pt,{tweeners:{"*":[function(e,t){var n=this.createTween(e,t);return ue(n.elem,e,ie.exec(t),n),n}]},tweener:function(e,t){g(e)?(t=e,e=["*"]):e=e.match(M);for(var n,r=0,i=e.length;r<i;r++)n=e[r],pt.tweeners[n]=pt.tweeners[n]||[],pt.tweeners[n].unshift(t)},prefilters:[ct],prefilter:function(e,t){t?pt.prefilters.unshift(e):pt.prefilters.push(e)}}),w.speed=function(e,t,n){var r=e&&"object"==typeof e?w.extend({},e):{complete:n||!n&&t||g(e)&&e,duration:e,easing:n&&t||t&&!g(t)&&t};return w.fx.off?r.duration=0:"number"!=typeof r.duration&&(r.duration in w.fx.speeds?r.duration=w.fx.speeds[r.duration]:r.duration=w.fx.speeds._default),null!=r.queue&&!0!==r.queue||(r.queue="fx"),r.old=r.complete,r.complete=function(){g(r.old)&&r.old.call(this),r.queue&&w.dequeue(this,r.queue)},r},w.fn.extend({fadeTo:function(e,t,n,r){return this.filter(ae).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(e,t,n,r){var i=w.isEmptyObject(e),o=w.speed(t,n,r),a=function(){var t=pt(this,w.extend({},e),o);(i||J.get(this,"finish"))&&t.stop(!0)};return a.finish=a,i||!1===o.queue?this.each(a):this.queue(o.queue,a)},stop:function(e,t,n){var r=function(e){var t=e.stop;delete e.stop,t(n)};return"string"!=typeof e&&(n=t,t=e,e=void 0),t&&!1!==e&&this.queue(e||"fx",[]),this.each(function(){var t=!0,i=null!=e&&e+"queueHooks",o=w.timers,a=J.get(this);if(i)a[i]&&a[i].stop&&r(a[i]);else for(i in a)a[i]&&a[i].stop&&ot.test(i)&&r(a[i]);for(i=o.length;i--;)o[i].elem!==this||null!=e&&o[i].queue!==e||(o[i].anim.stop(n),t=!1,o.splice(i,1));!t&&n||w.dequeue(this,e)})},finish:function(e){return!1!==e&&(e=e||"fx"),this.each(function(){var t,n=J.get(this),r=n[e+"queue"],i=n[e+"queueHooks"],o=w.timers,a=r?r.length:0;for(n.finish=!0,w.queue(this,e,[]),i&&i.stop&&i.stop.call(this,!0),t=o.length;t--;)o[t].elem===this&&o[t].queue===e&&(o[t].anim.stop(!0),o.splice(t,1));for(t=0;t<a;t++)r[t]&&r[t].finish&&r[t].finish.call(this);delete n.finish})}}),w.each(["toggle","show","hide"],function(e,t){var n=w.fn[t];w.fn[t]=function(e,r,i){return null==e||"boolean"==typeof e?n.apply(this,arguments):this.animate(ut(t,!0),e,r,i)}}),w.each({slideDown:ut("show"),slideUp:ut("hide"),slideToggle:ut("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){w.fn[e]=function(e,n,r){return this.animate(t,e,n,r)}}),w.timers=[],w.fx.tick=function(){var e,t=0,n=w.timers;for(nt=Date.now();t<n.length;t++)(e=n[t])()||n[t]!==e||n.splice(t--,1);n.length||w.fx.stop(),nt=void 0},w.fx.timer=function(e){w.timers.push(e),w.fx.start()},w.fx.interval=13,w.fx.start=function(){rt||(rt=!0,at())},w.fx.stop=function(){rt=null},w.fx.speeds={slow:600,fast:200,_default:400},w.fn.delay=function(t,n){return t=w.fx?w.fx.speeds[t]||t:t,n=n||"fx",this.queue(n,function(n,r){var i=e.setTimeout(n,t);r.stop=function(){e.clearTimeout(i)}})},function(){var e=r.createElement("input"),t=r.createElement("select").appendChild(r.createElement("option"));e.type="checkbox",h.checkOn=""!==e.value,h.optSelected=t.selected,(e=r.createElement("input")).value="t",e.type="radio",h.radioValue="t"===e.value}();var dt,ht=w.expr.attrHandle;w.fn.extend({attr:function(e,t){return z(this,w.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each(function(){w.removeAttr(this,e)})}}),w.extend({attr:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return"undefined"==typeof e.getAttribute?w.prop(e,t,n):(1===o&&w.isXMLDoc(e)||(i=w.attrHooks[t.toLowerCase()]||(w.expr.match.bool.test(t)?dt:void 0)),void 0!==n?null===n?void w.removeAttr(e,t):i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:(e.setAttribute(t,n+""),n):i&&"get"in i&&null!==(r=i.get(e,t))?r:null==(r=w.find.attr(e,t))?void 0:r)},attrHooks:{type:{set:function(e,t){if(!h.radioValue&&"radio"===t&&N(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},removeAttr:function(e,t){var n,r=0,i=t&&t.match(M);if(i&&1===e.nodeType)while(n=i[r++])e.removeAttribute(n)}}),dt={set:function(e,t,n){return!1===t?w.removeAttr(e,n):e.setAttribute(n,n),n}},w.each(w.expr.match.bool.source.match(/\w+/g),function(e,t){var n=ht[t]||w.find.attr;ht[t]=function(e,t,r){var i,o,a=t.toLowerCase();return r||(o=ht[a],ht[a]=i,i=null!=n(e,t,r)?a:null,ht[a]=o),i}});var gt=/^(?:input|select|textarea|button)$/i,yt=/^(?:a|area)$/i;w.fn.extend({prop:function(e,t){return z(this,w.prop,e,t,arguments.length>1)},removeProp:function(e){return this.each(function(){delete this[w.propFix[e]||e]})}}),w.extend({prop:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return 1===o&&w.isXMLDoc(e)||(t=w.propFix[t]||t,i=w.propHooks[t]),void 0!==n?i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:e[t]=n:i&&"get"in i&&null!==(r=i.get(e,t))?r:e[t]},propHooks:{tabIndex:{get:function(e){var t=w.find.attr(e,"tabindex");return t?parseInt(t,10):gt.test(e.nodeName)||yt.test(e.nodeName)&&e.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),h.optSelected||(w.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null},set:function(e){var t=e.parentNode;t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex)}}),w.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){w.propFix[this.toLowerCase()]=this});function vt(e){return(e.match(M)||[]).join(" ")}function mt(e){return e.getAttribute&&e.getAttribute("class")||""}function xt(e){return Array.isArray(e)?e:"string"==typeof e?e.match(M)||[]:[]}w.fn.extend({addClass:function(e){var t,n,r,i,o,a,s,u=0;if(g(e))return this.each(function(t){w(this).addClass(e.call(this,t,mt(this)))});if((t=xt(e)).length)while(n=this[u++])if(i=mt(n),r=1===n.nodeType&&" "+vt(i)+" "){a=0;while(o=t[a++])r.indexOf(" "+o+" ")<0&&(r+=o+" ");i!==(s=vt(r))&&n.setAttribute("class",s)}return this},removeClass:function(e){var t,n,r,i,o,a,s,u=0;if(g(e))return this.each(function(t){w(this).removeClass(e.call(this,t,mt(this)))});if(!arguments.length)return this.attr("class","");if((t=xt(e)).length)while(n=this[u++])if(i=mt(n),r=1===n.nodeType&&" "+vt(i)+" "){a=0;while(o=t[a++])while(r.indexOf(" "+o+" ")>-1)r=r.replace(" "+o+" "," ");i!==(s=vt(r))&&n.setAttribute("class",s)}return this},toggleClass:function(e,t){var n=typeof e,r="string"===n||Array.isArray(e);return"boolean"==typeof t&&r?t?this.addClass(e):this.removeClass(e):g(e)?this.each(function(n){w(this).toggleClass(e.call(this,n,mt(this),t),t)}):this.each(function(){var t,i,o,a;if(r){i=0,o=w(this),a=xt(e);while(t=a[i++])o.hasClass(t)?o.removeClass(t):o.addClass(t)}else void 0!==e&&"boolean"!==n||((t=mt(this))&&J.set(this,"__className__",t),this.setAttribute&&this.setAttribute("class",t||!1===e?"":J.get(this,"__className__")||""))})},hasClass:function(e){var t,n,r=0;t=" "+e+" ";while(n=this[r++])if(1===n.nodeType&&(" "+vt(mt(n))+" ").indexOf(t)>-1)return!0;return!1}});var bt=/\r/g;w.fn.extend({val:function(e){var t,n,r,i=this[0];{if(arguments.length)return r=g(e),this.each(function(n){var i;1===this.nodeType&&(null==(i=r?e.call(this,n,w(this).val()):e)?i="":"number"==typeof i?i+="":Array.isArray(i)&&(i=w.map(i,function(e){return null==e?"":e+""})),(t=w.valHooks[this.type]||w.valHooks[this.nodeName.toLowerCase()])&&"set"in t&&void 0!==t.set(this,i,"value")||(this.value=i))});if(i)return(t=w.valHooks[i.type]||w.valHooks[i.nodeName.toLowerCase()])&&"get"in t&&void 0!==(n=t.get(i,"value"))?n:"string"==typeof(n=i.value)?n.replace(bt,""):null==n?"":n}}}),w.extend({valHooks:{option:{get:function(e){var t=w.find.attr(e,"value");return null!=t?t:vt(w.text(e))}},select:{get:function(e){var t,n,r,i=e.options,o=e.selectedIndex,a="select-one"===e.type,s=a?null:[],u=a?o+1:i.length;for(r=o<0?u:a?o:0;r<u;r++)if(((n=i[r]).selected||r===o)&&!n.disabled&&(!n.parentNode.disabled||!N(n.parentNode,"optgroup"))){if(t=w(n).val(),a)return t;s.push(t)}return s},set:function(e,t){var n,r,i=e.options,o=w.makeArray(t),a=i.length;while(a--)((r=i[a]).selected=w.inArray(w.valHooks.option.get(r),o)>-1)&&(n=!0);return n||(e.selectedIndex=-1),o}}}}),w.each(["radio","checkbox"],function(){w.valHooks[this]={set:function(e,t){if(Array.isArray(t))return e.checked=w.inArray(w(e).val(),t)>-1}},h.checkOn||(w.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})}),h.focusin="onfocusin"in e;var wt=/^(?:focusinfocus|focusoutblur)$/,Tt=function(e){e.stopPropagation()};w.extend(w.event,{trigger:function(t,n,i,o){var a,s,u,l,c,p,d,h,v=[i||r],m=f.call(t,"type")?t.type:t,x=f.call(t,"namespace")?t.namespace.split("."):[];if(s=h=u=i=i||r,3!==i.nodeType&&8!==i.nodeType&&!wt.test(m+w.event.triggered)&&(m.indexOf(".")>-1&&(m=(x=m.split(".")).shift(),x.sort()),c=m.indexOf(":")<0&&"on"+m,t=t[w.expando]?t:new w.Event(m,"object"==typeof t&&t),t.isTrigger=o?2:3,t.namespace=x.join("."),t.rnamespace=t.namespace?new RegExp("(^|\\.)"+x.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,t.result=void 0,t.target||(t.target=i),n=null==n?[t]:w.makeArray(n,[t]),d=w.event.special[m]||{},o||!d.trigger||!1!==d.trigger.apply(i,n))){if(!o&&!d.noBubble&&!y(i)){for(l=d.delegateType||m,wt.test(l+m)||(s=s.parentNode);s;s=s.parentNode)v.push(s),u=s;u===(i.ownerDocument||r)&&v.push(u.defaultView||u.parentWindow||e)}a=0;while((s=v[a++])&&!t.isPropagationStopped())h=s,t.type=a>1?l:d.bindType||m,(p=(J.get(s,"events")||{})[t.type]&&J.get(s,"handle"))&&p.apply(s,n),(p=c&&s[c])&&p.apply&&Y(s)&&(t.result=p.apply(s,n),!1===t.result&&t.preventDefault());return t.type=m,o||t.isDefaultPrevented()||d._default&&!1!==d._default.apply(v.pop(),n)||!Y(i)||c&&g(i[m])&&!y(i)&&((u=i[c])&&(i[c]=null),w.event.triggered=m,t.isPropagationStopped()&&h.addEventListener(m,Tt),i[m](),t.isPropagationStopped()&&h.removeEventListener(m,Tt),w.event.triggered=void 0,u&&(i[c]=u)),t.result}},simulate:function(e,t,n){var r=w.extend(new w.Event,n,{type:e,isSimulated:!0});w.event.trigger(r,null,t)}}),w.fn.extend({trigger:function(e,t){return this.each(function(){w.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];if(n)return w.event.trigger(e,t,n,!0)}}),h.focusin||w.each({focus:"focusin",blur:"focusout"},function(e,t){var n=function(e){w.event.simulate(t,e.target,w.event.fix(e))};w.event.special[t]={setup:function(){var r=this.ownerDocument||this,i=J.access(r,t);i||r.addEventListener(e,n,!0),J.access(r,t,(i||0)+1)},teardown:function(){var r=this.ownerDocument||this,i=J.access(r,t)-1;i?J.access(r,t,i):(r.removeEventListener(e,n,!0),J.remove(r,t))}}});var Ct=e.location,Et=Date.now(),kt=/\?/;w.parseXML=function(t){var n;if(!t||"string"!=typeof t)return null;try{n=(new e.DOMParser).parseFromString(t,"text/xml")}catch(e){n=void 0}return n&&!n.getElementsByTagName("parsererror").length||w.error("Invalid XML: "+t),n};var St=/\[\]$/,Dt=/\r?\n/g,Nt=/^(?:submit|button|image|reset|file)$/i,At=/^(?:input|select|textarea|keygen)/i;function jt(e,t,n,r){var i;if(Array.isArray(t))w.each(t,function(t,i){n||St.test(e)?r(e,i):jt(e+"["+("object"==typeof i&&null!=i?t:"")+"]",i,n,r)});else if(n||"object"!==x(t))r(e,t);else for(i in t)jt(e+"["+i+"]",t[i],n,r)}w.param=function(e,t){var n,r=[],i=function(e,t){var n=g(t)?t():t;r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(null==n?"":n)};if(Array.isArray(e)||e.jquery&&!w.isPlainObject(e))w.each(e,function(){i(this.name,this.value)});else for(n in e)jt(n,e[n],t,i);return r.join("&")},w.fn.extend({serialize:function(){return w.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=w.prop(this,"elements");return e?w.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!w(this).is(":disabled")&&At.test(this.nodeName)&&!Nt.test(e)&&(this.checked||!pe.test(e))}).map(function(e,t){var n=w(this).val();return null==n?null:Array.isArray(n)?w.map(n,function(e){return{name:t.name,value:e.replace(Dt,"\r\n")}}):{name:t.name,value:n.replace(Dt,"\r\n")}}).get()}});var qt=/%20/g,Lt=/#.*$/,Ht=/([?&])_=[^&]*/,Ot=/^(.*?):[ \t]*([^\r\n]*)$/gm,Pt=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Mt=/^(?:GET|HEAD)$/,Rt=/^\/\//,It={},Wt={},$t="*/".concat("*"),Bt=r.createElement("a");Bt.href=Ct.href;function Ft(e){return function(t,n){"string"!=typeof t&&(n=t,t="*");var r,i=0,o=t.toLowerCase().match(M)||[];if(g(n))while(r=o[i++])"+"===r[0]?(r=r.slice(1)||"*",(e[r]=e[r]||[]).unshift(n)):(e[r]=e[r]||[]).push(n)}}function _t(e,t,n,r){var i={},o=e===Wt;function a(s){var u;return i[s]=!0,w.each(e[s]||[],function(e,s){var l=s(t,n,r);return"string"!=typeof l||o||i[l]?o?!(u=l):void 0:(t.dataTypes.unshift(l),a(l),!1)}),u}return a(t.dataTypes[0])||!i["*"]&&a("*")}function zt(e,t){var n,r,i=w.ajaxSettings.flatOptions||{};for(n in t)void 0!==t[n]&&((i[n]?e:r||(r={}))[n]=t[n]);return r&&w.extend(!0,e,r),e}function Xt(e,t,n){var r,i,o,a,s=e.contents,u=e.dataTypes;while("*"===u[0])u.shift(),void 0===r&&(r=e.mimeType||t.getResponseHeader("Content-Type"));if(r)for(i in s)if(s[i]&&s[i].test(r)){u.unshift(i);break}if(u[0]in n)o=u[0];else{for(i in n){if(!u[0]||e.converters[i+" "+u[0]]){o=i;break}a||(a=i)}o=o||a}if(o)return o!==u[0]&&u.unshift(o),n[o]}function Ut(e,t,n,r){var i,o,a,s,u,l={},c=e.dataTypes.slice();if(c[1])for(a in e.converters)l[a.toLowerCase()]=e.converters[a];o=c.shift();while(o)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!u&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),u=o,o=c.shift())if("*"===o)o=u;else if("*"!==u&&u!==o){if(!(a=l[u+" "+o]||l["* "+o]))for(i in l)if((s=i.split(" "))[1]===o&&(a=l[u+" "+s[0]]||l["* "+s[0]])){!0===a?a=l[i]:!0!==l[i]&&(o=s[0],c.unshift(s[1]));break}if(!0!==a)if(a&&e["throws"])t=a(t);else try{t=a(t)}catch(e){return{state:"parsererror",error:a?e:"No conversion from "+u+" to "+o}}}return{state:"success",data:t}}w.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Ct.href,type:"GET",isLocal:Pt.test(Ct.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":$t,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":w.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?zt(zt(e,w.ajaxSettings),t):zt(w.ajaxSettings,e)},ajaxPrefilter:Ft(It),ajaxTransport:Ft(Wt),ajax:function(t,n){"object"==typeof t&&(n=t,t=void 0),n=n||{};var i,o,a,s,u,l,c,f,p,d,h=w.ajaxSetup({},n),g=h.context||h,y=h.context&&(g.nodeType||g.jquery)?w(g):w.event,v=w.Deferred(),m=w.Callbacks("once memory"),x=h.statusCode||{},b={},T={},C="canceled",E={readyState:0,getResponseHeader:function(e){var t;if(c){if(!s){s={};while(t=Ot.exec(a))s[t[1].toLowerCase()]=t[2]}t=s[e.toLowerCase()]}return null==t?null:t},getAllResponseHeaders:function(){return c?a:null},setRequestHeader:function(e,t){return null==c&&(e=T[e.toLowerCase()]=T[e.toLowerCase()]||e,b[e]=t),this},overrideMimeType:function(e){return null==c&&(h.mimeType=e),this},statusCode:function(e){var t;if(e)if(c)E.always(e[E.status]);else for(t in e)x[t]=[x[t],e[t]];return this},abort:function(e){var t=e||C;return i&&i.abort(t),k(0,t),this}};if(v.promise(E),h.url=((t||h.url||Ct.href)+"").replace(Rt,Ct.protocol+"//"),h.type=n.method||n.type||h.method||h.type,h.dataTypes=(h.dataType||"*").toLowerCase().match(M)||[""],null==h.crossDomain){l=r.createElement("a");try{l.href=h.url,l.href=l.href,h.crossDomain=Bt.protocol+"//"+Bt.host!=l.protocol+"//"+l.host}catch(e){h.crossDomain=!0}}if(h.data&&h.processData&&"string"!=typeof h.data&&(h.data=w.param(h.data,h.traditional)),_t(It,h,n,E),c)return E;(f=w.event&&h.global)&&0==w.active++&&w.event.trigger("ajaxStart"),h.type=h.type.toUpperCase(),h.hasContent=!Mt.test(h.type),o=h.url.replace(Lt,""),h.hasContent?h.data&&h.processData&&0===(h.contentType||"").indexOf("application/x-www-form-urlencoded")&&(h.data=h.data.replace(qt,"+")):(d=h.url.slice(o.length),h.data&&(h.processData||"string"==typeof h.data)&&(o+=(kt.test(o)?"&":"?")+h.data,delete h.data),!1===h.cache&&(o=o.replace(Ht,"$1"),d=(kt.test(o)?"&":"?")+"_="+Et+++d),h.url=o+d),h.ifModified&&(w.lastModified[o]&&E.setRequestHeader("If-Modified-Since",w.lastModified[o]),w.etag[o]&&E.setRequestHeader("If-None-Match",w.etag[o])),(h.data&&h.hasContent&&!1!==h.contentType||n.contentType)&&E.setRequestHeader("Content-Type",h.contentType),E.setRequestHeader("Accept",h.dataTypes[0]&&h.accepts[h.dataTypes[0]]?h.accepts[h.dataTypes[0]]+("*"!==h.dataTypes[0]?", "+$t+"; q=0.01":""):h.accepts["*"]);for(p in h.headers)E.setRequestHeader(p,h.headers[p]);if(h.beforeSend&&(!1===h.beforeSend.call(g,E,h)||c))return E.abort();if(C="abort",m.add(h.complete),E.done(h.success),E.fail(h.error),i=_t(Wt,h,n,E)){if(E.readyState=1,f&&y.trigger("ajaxSend",[E,h]),c)return E;h.async&&h.timeout>0&&(u=e.setTimeout(function(){E.abort("timeout")},h.timeout));try{c=!1,i.send(b,k)}catch(e){if(c)throw e;k(-1,e)}}else k(-1,"No Transport");function k(t,n,r,s){var l,p,d,b,T,C=n;c||(c=!0,u&&e.clearTimeout(u),i=void 0,a=s||"",E.readyState=t>0?4:0,l=t>=200&&t<300||304===t,r&&(b=Xt(h,E,r)),b=Ut(h,b,E,l),l?(h.ifModified&&((T=E.getResponseHeader("Last-Modified"))&&(w.lastModified[o]=T),(T=E.getResponseHeader("etag"))&&(w.etag[o]=T)),204===t||"HEAD"===h.type?C="nocontent":304===t?C="notmodified":(C=b.state,p=b.data,l=!(d=b.error))):(d=C,!t&&C||(C="error",t<0&&(t=0))),E.status=t,E.statusText=(n||C)+"",l?v.resolveWith(g,[p,C,E]):v.rejectWith(g,[E,C,d]),E.statusCode(x),x=void 0,f&&y.trigger(l?"ajaxSuccess":"ajaxError",[E,h,l?p:d]),m.fireWith(g,[E,C]),f&&(y.trigger("ajaxComplete",[E,h]),--w.active||w.event.trigger("ajaxStop")))}return E},getJSON:function(e,t,n){return w.get(e,t,n,"json")},getScript:function(e,t){return w.get(e,void 0,t,"script")}}),w.each(["get","post"],function(e,t){w[t]=function(e,n,r,i){return g(n)&&(i=i||r,r=n,n=void 0),w.ajax(w.extend({url:e,type:t,dataType:i,data:n,success:r},w.isPlainObject(e)&&e))}}),w._evalUrl=function(e){return w.ajax({url:e,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,"throws":!0})},w.fn.extend({wrapAll:function(e){var t;return this[0]&&(g(e)&&(e=e.call(this[0])),t=w(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstElementChild)e=e.firstElementChild;return e}).append(this)),this},wrapInner:function(e){return g(e)?this.each(function(t){w(this).wrapInner(e.call(this,t))}):this.each(function(){var t=w(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)})},wrap:function(e){var t=g(e);return this.each(function(n){w(this).wrapAll(t?e.call(this,n):e)})},unwrap:function(e){return this.parent(e).not("body").each(function(){w(this).replaceWith(this.childNodes)}),this}}),w.expr.pseudos.hidden=function(e){return!w.expr.pseudos.visible(e)},w.expr.pseudos.visible=function(e){return!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)},w.ajaxSettings.xhr=function(){try{return new e.XMLHttpRequest}catch(e){}};var Vt={0:200,1223:204},Gt=w.ajaxSettings.xhr();h.cors=!!Gt&&"withCredentials"in Gt,h.ajax=Gt=!!Gt,w.ajaxTransport(function(t){var n,r;if(h.cors||Gt&&!t.crossDomain)return{send:function(i,o){var a,s=t.xhr();if(s.open(t.type,t.url,t.async,t.username,t.password),t.xhrFields)for(a in t.xhrFields)s[a]=t.xhrFields[a];t.mimeType&&s.overrideMimeType&&s.overrideMimeType(t.mimeType),t.crossDomain||i["X-Requested-With"]||(i["X-Requested-With"]="XMLHttpRequest");for(a in i)s.setRequestHeader(a,i[a]);n=function(e){return function(){n&&(n=r=s.onload=s.onerror=s.onabort=s.ontimeout=s.onreadystatechange=null,"abort"===e?s.abort():"error"===e?"number"!=typeof s.status?o(0,"error"):o(s.status,s.statusText):o(Vt[s.status]||s.status,s.statusText,"text"!==(s.responseType||"text")||"string"!=typeof s.responseText?{binary:s.response}:{text:s.responseText},s.getAllResponseHeaders()))}},s.onload=n(),r=s.onerror=s.ontimeout=n("error"),void 0!==s.onabort?s.onabort=r:s.onreadystatechange=function(){4===s.readyState&&e.setTimeout(function(){n&&r()})},n=n("abort");try{s.send(t.hasContent&&t.data||null)}catch(e){if(n)throw e}},abort:function(){n&&n()}}}),w.ajaxPrefilter(function(e){e.crossDomain&&(e.contents.script=!1)}),w.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(e){return w.globalEval(e),e}}}),w.ajaxPrefilter("script",function(e){void 0===e.cache&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),w.ajaxTransport("script",function(e){if(e.crossDomain){var t,n;return{send:function(i,o){t=w("<script>").prop({charset:e.scriptCharset,src:e.url}).on("load error",n=function(e){t.remove(),n=null,e&&o("error"===e.type?404:200,e.type)}),r.head.appendChild(t[0])},abort:function(){n&&n()}}}});var Yt=[],Qt=/(=)\?(?=&|$)|\?\?/;w.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Yt.pop()||w.expando+"_"+Et++;return this[e]=!0,e}}),w.ajaxPrefilter("json jsonp",function(t,n,r){var i,o,a,s=!1!==t.jsonp&&(Qt.test(t.url)?"url":"string"==typeof t.data&&0===(t.contentType||"").indexOf("application/x-www-form-urlencoded")&&Qt.test(t.data)&&"data");if(s||"jsonp"===t.dataTypes[0])return i=t.jsonpCallback=g(t.jsonpCallback)?t.jsonpCallback():t.jsonpCallback,s?t[s]=t[s].replace(Qt,"$1"+i):!1!==t.jsonp&&(t.url+=(kt.test(t.url)?"&":"?")+t.jsonp+"="+i),t.converters["script json"]=function(){return a||w.error(i+" was not called"),a[0]},t.dataTypes[0]="json",o=e[i],e[i]=function(){a=arguments},r.always(function(){void 0===o?w(e).removeProp(i):e[i]=o,t[i]&&(t.jsonpCallback=n.jsonpCallback,Yt.push(i)),a&&g(o)&&o(a[0]),a=o=void 0}),"script"}),h.createHTMLDocument=function(){var e=r.implementation.createHTMLDocument("").body;return e.innerHTML="<form></form><form></form>",2===e.childNodes.length}(),w.parseHTML=function(e,t,n){if("string"!=typeof e)return[];"boolean"==typeof t&&(n=t,t=!1);var i,o,a;return t||(h.createHTMLDocument?((i=(t=r.implementation.createHTMLDocument("")).createElement("base")).href=r.location.href,t.head.appendChild(i)):t=r),o=A.exec(e),a=!n&&[],o?[t.createElement(o[1])]:(o=xe([e],t,a),a&&a.length&&w(a).remove(),w.merge([],o.childNodes))},w.fn.load=function(e,t,n){var r,i,o,a=this,s=e.indexOf(" ");return s>-1&&(r=vt(e.slice(s)),e=e.slice(0,s)),g(t)?(n=t,t=void 0):t&&"object"==typeof t&&(i="POST"),a.length>0&&w.ajax({url:e,type:i||"GET",dataType:"html",data:t}).done(function(e){o=arguments,a.html(r?w("<div>").append(w.parseHTML(e)).find(r):e)}).always(n&&function(e,t){a.each(function(){n.apply(this,o||[e.responseText,t,e])})}),this},w.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){w.fn[t]=function(e){return this.on(t,e)}}),w.expr.pseudos.animated=function(e){return w.grep(w.timers,function(t){return e===t.elem}).length},w.offset={setOffset:function(e,t,n){var r,i,o,a,s,u,l,c=w.css(e,"position"),f=w(e),p={};"static"===c&&(e.style.position="relative"),s=f.offset(),o=w.css(e,"top"),u=w.css(e,"left"),(l=("absolute"===c||"fixed"===c)&&(o+u).indexOf("auto")>-1)?(a=(r=f.position()).top,i=r.left):(a=parseFloat(o)||0,i=parseFloat(u)||0),g(t)&&(t=t.call(e,n,w.extend({},s))),null!=t.top&&(p.top=t.top-s.top+a),null!=t.left&&(p.left=t.left-s.left+i),"using"in t?t.using.call(e,p):f.css(p)}},w.fn.extend({offset:function(e){if(arguments.length)return void 0===e?this:this.each(function(t){w.offset.setOffset(this,e,t)});var t,n,r=this[0];if(r)return r.getClientRects().length?(t=r.getBoundingClientRect(),n=r.ownerDocument.defaultView,{top:t.top+n.pageYOffset,left:t.left+n.pageXOffset}):{top:0,left:0}},position:function(){if(this[0]){var e,t,n,r=this[0],i={top:0,left:0};if("fixed"===w.css(r,"position"))t=r.getBoundingClientRect();else{t=this.offset(),n=r.ownerDocument,e=r.offsetParent||n.documentElement;while(e&&(e===n.body||e===n.documentElement)&&"static"===w.css(e,"position"))e=e.parentNode;e&&e!==r&&1===e.nodeType&&((i=w(e).offset()).top+=w.css(e,"borderTopWidth",!0),i.left+=w.css(e,"borderLeftWidth",!0))}return{top:t.top-i.top-w.css(r,"marginTop",!0),left:t.left-i.left-w.css(r,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var e=this.offsetParent;while(e&&"static"===w.css(e,"position"))e=e.offsetParent;return e||be})}}),w.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(e,t){var n="pageYOffset"===t;w.fn[e]=function(r){return z(this,function(e,r,i){var o;if(y(e)?o=e:9===e.nodeType&&(o=e.defaultView),void 0===i)return o?o[t]:e[r];o?o.scrollTo(n?o.pageXOffset:i,n?i:o.pageYOffset):e[r]=i},e,r,arguments.length)}}),w.each(["top","left"],function(e,t){w.cssHooks[t]=_e(h.pixelPosition,function(e,n){if(n)return n=Fe(e,t),We.test(n)?w(e).position()[t]+"px":n})}),w.each({Height:"height",Width:"width"},function(e,t){w.each({padding:"inner"+e,content:t,"":"outer"+e},function(n,r){w.fn[r]=function(i,o){var a=arguments.length&&(n||"boolean"!=typeof i),s=n||(!0===i||!0===o?"margin":"border");return z(this,function(t,n,i){var o;return y(t)?0===r.indexOf("outer")?t["inner"+e]:t.document.documentElement["client"+e]:9===t.nodeType?(o=t.documentElement,Math.max(t.body["scroll"+e],o["scroll"+e],t.body["offset"+e],o["offset"+e],o["client"+e])):void 0===i?w.css(t,n,s):w.style(t,n,i,s)},t,a?i:void 0,a)}})}),w.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(e,t){w.fn[t]=function(e,n){return arguments.length>0?this.on(t,null,e,n):this.trigger(t)}}),w.fn.extend({hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)}}),w.fn.extend({bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)}}),w.proxy=function(e,t){var n,r,i;if("string"==typeof t&&(n=e[t],t=e,e=n),g(e))return r=o.call(arguments,2),i=function(){return e.apply(t||this,r.concat(o.call(arguments)))},i.guid=e.guid=e.guid||w.guid++,i},w.holdReady=function(e){e?w.readyWait++:w.ready(!0)},w.isArray=Array.isArray,w.parseJSON=JSON.parse,w.nodeName=N,w.isFunction=g,w.isWindow=y,w.camelCase=G,w.type=x,w.now=Date.now,w.isNumeric=function(e){var t=w.type(e);return("number"===t||"string"===t)&&!isNaN(e-parseFloat(e))},"function"==typeof define&&define.amd&&define("jquery",[],function(){return w});var Jt=e.jQuery,Kt=e.$;return w.noConflict=function(t){return e.$===w&&(e.$=Kt),t&&e.jQuery===w&&(e.jQuery=Jt),w},t||(e.jQuery=e.$=w),w});

/*! jQuery UI - v1.12.1 - 2017-11-28
 * http://jqueryui.com
 * Includes: widget.js, position.js, focusable.js, form-reset-mixin.js, keycode.js, labels.js, tabbable.js, unique-id.js, widgets/datepicker.js, widgets/menu.js, widgets/mouse.js, widgets/selectmenu.js, widgets/slider.js
 * Copyright jQuery Foundation and other contributors; Licensed MIT */

(function(t){"function"==typeof define&&define.amd?define(["jquery"],t):t(jQuery)})(function(t){function e(t){for(var e=t.css("visibility");"inherit"===e;)t=t.parent(),e=t.css("visibility");return"hidden"!==e}function i(t){for(var e,i;t.length&&t[0]!==document;){if(e=t.css("position"),("absolute"===e||"relative"===e||"fixed"===e)&&(i=parseInt(t.css("zIndex"),10),!isNaN(i)&&0!==i))return i;t=t.parent()}return 0}function s(){this._curInst=null,this._keyEvent=!1,this._disabledInputs=[],this._datepickerShowing=!1,this._inDialog=!1,this._mainDivId="ui-datepicker-div",this._inlineClass="ui-datepicker-inline",this._appendClass="ui-datepicker-append",this._triggerClass="ui-datepicker-trigger",this._dialogClass="ui-datepicker-dialog",this._disableClass="ui-datepicker-disabled",this._unselectableClass="ui-datepicker-unselectable",this._currentClass="ui-datepicker-current-day",this._dayOverClass="ui-datepicker-days-cell-over",this.regional=[],this.regional[""]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su","Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"mm/dd/yy",firstDay:0,isRTL:!1,showMonthAfterYear:!1,yearSuffix:""},this._defaults={showOn:"focus",showAnim:"fadeIn",showOptions:{},defaultDate:null,appendText:"",buttonText:"...",buttonImage:"",buttonImageOnly:!1,hideIfNoPrevNext:!1,navigationAsDateFormat:!1,gotoCurrent:!1,changeMonth:!1,changeYear:!1,yearRange:"c-10:c+10",showOtherMonths:!1,selectOtherMonths:!1,showWeek:!1,calculateWeek:this.iso8601Week,shortYearCutoff:"+10",minDate:null,maxDate:null,duration:"fast",beforeShowDay:null,beforeShow:null,onSelect:null,onChangeMonthYear:null,onClose:null,numberOfMonths:1,showCurrentAtPos:0,stepMonths:1,stepBigMonths:12,altField:"",altFormat:"",constrainInput:!0,showButtonPanel:!1,autoSize:!1,disabled:!1},t.extend(this._defaults,this.regional[""]),this.regional.en=t.extend(!0,{},this.regional[""]),this.regional["en-US"]=t.extend(!0,{},this.regional.en),this.dpDiv=n(t("<div id='"+this._mainDivId+"' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"))}function n(e){var i="button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a";return e.on("mouseout",i,function(){t(this).removeClass("ui-state-hover"),-1!==this.className.indexOf("ui-datepicker-prev")&&t(this).removeClass("ui-datepicker-prev-hover"),-1!==this.className.indexOf("ui-datepicker-next")&&t(this).removeClass("ui-datepicker-next-hover")}).on("mouseover",i,o)}function o(){t.datepicker._isDisabledDatepicker(h.inline?h.dpDiv.parent()[0]:h.input[0])||(t(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover"),t(this).addClass("ui-state-hover"),-1!==this.className.indexOf("ui-datepicker-prev")&&t(this).addClass("ui-datepicker-prev-hover"),-1!==this.className.indexOf("ui-datepicker-next")&&t(this).addClass("ui-datepicker-next-hover"))}function a(e,i){t.extend(e,i);for(var s in i)null==i[s]&&(e[s]=i[s]);return e}t.ui=t.ui||{},t.ui.version="1.12.1";var r=0,l=Array.prototype.slice;t.cleanData=function(e){return function(i){var s,n,o;for(o=0;null!=(n=i[o]);o++)try{s=t._data(n,"events"),s&&s.remove&&t(n).triggerHandler("remove")}catch(a){}e(i)}}(t.cleanData),t.widget=function(e,i,s){var n,o,a,r={},l=e.split(".")[0];e=e.split(".")[1];var h=l+"-"+e;return s||(s=i,i=t.Widget),t.isArray(s)&&(s=t.extend.apply(null,[{}].concat(s))),t.expr[":"][h.toLowerCase()]=function(e){return!!t.data(e,h)},t[l]=t[l]||{},n=t[l][e],o=t[l][e]=function(t,e){return this._createWidget?(arguments.length&&this._createWidget(t,e),void 0):new o(t,e)},t.extend(o,n,{version:s.version,_proto:t.extend({},s),_childConstructors:[]}),a=new i,a.options=t.widget.extend({},a.options),t.each(s,function(e,s){return t.isFunction(s)?(r[e]=function(){function t(){return i.prototype[e].apply(this,arguments)}function n(t){return i.prototype[e].apply(this,t)}return function(){var e,i=this._super,o=this._superApply;return this._super=t,this._superApply=n,e=s.apply(this,arguments),this._super=i,this._superApply=o,e}}(),void 0):(r[e]=s,void 0)}),o.prototype=t.widget.extend(a,{widgetEventPrefix:n?a.widgetEventPrefix||e:e},r,{constructor:o,namespace:l,widgetName:e,widgetFullName:h}),n?(t.each(n._childConstructors,function(e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,o,i._proto)}),delete n._childConstructors):i._childConstructors.push(o),t.widget.bridge(e,o),o},t.widget.extend=function(e){for(var i,s,n=l.call(arguments,1),o=0,a=n.length;a>o;o++)for(i in n[o])s=n[o][i],n[o].hasOwnProperty(i)&&void 0!==s&&(e[i]=t.isPlainObject(s)?t.isPlainObject(e[i])?t.widget.extend({},e[i],s):t.widget.extend({},s):s);return e},t.widget.bridge=function(e,i){var s=i.prototype.widgetFullName||e;t.fn[e]=function(n){var o="string"==typeof n,a=l.call(arguments,1),r=this;return o?this.length||"instance"!==n?this.each(function(){var i,o=t.data(this,s);return"instance"===n?(r=o,!1):o?t.isFunction(o[n])&&"_"!==n.charAt(0)?(i=o[n].apply(o,a),i!==o&&void 0!==i?(r=i&&i.jquery?r.pushStack(i.get()):i,!1):void 0):t.error("no such method '"+n+"' for "+e+" widget instance"):t.error("cannot call methods on "+e+" prior to initialization; "+"attempted to call method '"+n+"'")}):r=void 0:(a.length&&(n=t.widget.extend.apply(null,[n].concat(a))),this.each(function(){var e=t.data(this,s);e?(e.option(n||{}),e._init&&e._init()):t.data(this,s,new i(n,this))})),r}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{classes:{},disabled:!1,create:null},_createWidget:function(e,i){i=t(i||this.defaultElement||this)[0],this.element=t(i),this.uuid=r++,this.eventNamespace="."+this.widgetName+this.uuid,this.bindings=t(),this.hoverable=t(),this.focusable=t(),this.classesElementLookup={},i!==this&&(t.data(i,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===i&&this.destroy()}}),this.document=t(i.style?i.ownerDocument:i.document||i),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this.options=t.widget.extend({},this.options,this._getCreateOptions(),e),this._create(),this.options.disabled&&this._setOptionDisabled(this.options.disabled),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:function(){return{}},_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){var e=this;this._destroy(),t.each(this.classesElementLookup,function(t,i){e._removeClass(i,t)}),this.element.off(this.eventNamespace).removeData(this.widgetFullName),this.widget().off(this.eventNamespace).removeAttr("aria-disabled"),this.bindings.off(this.eventNamespace)},_destroy:t.noop,widget:function(){return this.element},option:function(e,i){var s,n,o,a=e;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof e)if(a={},s=e.split("."),e=s.shift(),s.length){for(n=a[e]=t.widget.extend({},this.options[e]),o=0;s.length-1>o;o++)n[s[o]]=n[s[o]]||{},n=n[s[o]];if(e=s.pop(),1===arguments.length)return void 0===n[e]?null:n[e];n[e]=i}else{if(1===arguments.length)return void 0===this.options[e]?null:this.options[e];a[e]=i}return this._setOptions(a),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return"classes"===t&&this._setOptionClasses(e),this.options[t]=e,"disabled"===t&&this._setOptionDisabled(e),this},_setOptionClasses:function(e){var i,s,n;for(i in e)n=this.classesElementLookup[i],e[i]!==this.options.classes[i]&&n&&n.length&&(s=t(n.get()),this._removeClass(n,i),s.addClass(this._classes({element:s,keys:i,classes:e,add:!0})))},_setOptionDisabled:function(t){this._toggleClass(this.widget(),this.widgetFullName+"-disabled",null,!!t),t&&(this._removeClass(this.hoverable,null,"ui-state-hover"),this._removeClass(this.focusable,null,"ui-state-focus"))},enable:function(){return this._setOptions({disabled:!1})},disable:function(){return this._setOptions({disabled:!0})},_classes:function(e){function i(i,o){var a,r;for(r=0;i.length>r;r++)a=n.classesElementLookup[i[r]]||t(),a=e.add?t(t.unique(a.get().concat(e.element.get()))):t(a.not(e.element).get()),n.classesElementLookup[i[r]]=a,s.push(i[r]),o&&e.classes[i[r]]&&s.push(e.classes[i[r]])}var s=[],n=this;return e=t.extend({element:this.element,classes:this.options.classes||{}},e),this._on(e.element,{remove:"_untrackClassesElement"}),e.keys&&i(e.keys.match(/\S+/g)||[],!0),e.extra&&i(e.extra.match(/\S+/g)||[]),s.join(" ")},_untrackClassesElement:function(e){var i=this;t.each(i.classesElementLookup,function(s,n){-1!==t.inArray(e.target,n)&&(i.classesElementLookup[s]=t(n.not(e.target).get()))})},_removeClass:function(t,e,i){return this._toggleClass(t,e,i,!1)},_addClass:function(t,e,i){return this._toggleClass(t,e,i,!0)},_toggleClass:function(t,e,i,s){s="boolean"==typeof s?s:i;var n="string"==typeof t||null===t,o={extra:n?e:i,keys:n?t:e,element:n?this.element:t,add:s};return o.element.toggleClass(this._classes(o),s),this},_on:function(e,i,s){var n,o=this;"boolean"!=typeof e&&(s=i,i=e,e=!1),s?(i=n=t(i),this.bindings=this.bindings.add(i)):(s=i,i=this.element,n=this.widget()),t.each(s,function(s,a){function r(){return e||o.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof a?o[a]:a).apply(o,arguments):void 0}"string"!=typeof a&&(r.guid=a.guid=a.guid||r.guid||t.guid++);var l=s.match(/^([\w:-]*)\s*(.*)$/),h=l[1]+o.eventNamespace,c=l[2];c?n.on(h,c,r):i.on(h,r)})},_off:function(e,i){i=(i||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.off(i).off(i),this.bindings=t(this.bindings.not(e).get()),this.focusable=t(this.focusable.not(e).get()),this.hoverable=t(this.hoverable.not(e).get())},_delay:function(t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){this._addClass(t(e.currentTarget),null,"ui-state-hover")},mouseleave:function(e){this._removeClass(t(e.currentTarget),null,"ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){this._addClass(t(e.currentTarget),null,"ui-state-focus")},focusout:function(e){this._removeClass(t(e.currentTarget),null,"ui-state-focus")}})},_trigger:function(e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&t.effects.effect[r]?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function(i){t(this)[e](),o&&o.call(s[0]),i()})}}),t.widget,function(){function e(t,e,i){return[parseFloat(t[0])*(u.test(t[0])?e/100:1),parseFloat(t[1])*(u.test(t[1])?i/100:1)]}function i(e,i){return parseInt(t.css(e,i),10)||0}function s(e){var i=e[0];return 9===i.nodeType?{width:e.width(),height:e.height(),offset:{top:0,left:0}}:t.isWindow(i)?{width:e.width(),height:e.height(),offset:{top:e.scrollTop(),left:e.scrollLeft()}}:i.preventDefault?{width:0,height:0,offset:{top:i.pageY,left:i.pageX}}:{width:e.outerWidth(),height:e.outerHeight(),offset:e.offset()}}var n,o=Math.max,a=Math.abs,r=/left|center|right/,l=/top|center|bottom/,h=/[\+\-]\d+(\.[\d]+)?%?/,c=/^\w+/,u=/%$/,d=t.fn.position;t.position={scrollbarWidth:function(){if(void 0!==n)return n;var e,i,s=t("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),o=s.children()[0];return t("body").append(s),e=o.offsetWidth,s.css("overflow","scroll"),i=o.offsetWidth,e===i&&(i=s[0].clientWidth),s.remove(),n=e-i},getScrollInfo:function(e){var i=e.isWindow||e.isDocument?"":e.element.css("overflow-x"),s=e.isWindow||e.isDocument?"":e.element.css("overflow-y"),n="scroll"===i||"auto"===i&&e.width<e.element[0].scrollWidth,o="scroll"===s||"auto"===s&&e.height<e.element[0].scrollHeight;return{width:o?t.position.scrollbarWidth():0,height:n?t.position.scrollbarWidth():0}},getWithinInfo:function(e){var i=t(e||window),s=t.isWindow(i[0]),n=!!i[0]&&9===i[0].nodeType,o=!s&&!n;return{element:i,isWindow:s,isDocument:n,offset:o?t(e).offset():{left:0,top:0},scrollLeft:i.scrollLeft(),scrollTop:i.scrollTop(),width:i.outerWidth(),height:i.outerHeight()}}},t.fn.position=function(n){if(!n||!n.of)return d.apply(this,arguments);n=t.extend({},n);var u,p,f,g,m,_,v=t(n.of),b=t.position.getWithinInfo(n.within),y=t.position.getScrollInfo(b),w=(n.collision||"flip").split(" "),k={};return _=s(v),v[0].preventDefault&&(n.at="left top"),p=_.width,f=_.height,g=_.offset,m=t.extend({},g),t.each(["my","at"],function(){var t,e,i=(n[this]||"").split(" ");1===i.length&&(i=r.test(i[0])?i.concat(["center"]):l.test(i[0])?["center"].concat(i):["center","center"]),i[0]=r.test(i[0])?i[0]:"center",i[1]=l.test(i[1])?i[1]:"center",t=h.exec(i[0]),e=h.exec(i[1]),k[this]=[t?t[0]:0,e?e[0]:0],n[this]=[c.exec(i[0])[0],c.exec(i[1])[0]]}),1===w.length&&(w[1]=w[0]),"right"===n.at[0]?m.left+=p:"center"===n.at[0]&&(m.left+=p/2),"bottom"===n.at[1]?m.top+=f:"center"===n.at[1]&&(m.top+=f/2),u=e(k.at,p,f),m.left+=u[0],m.top+=u[1],this.each(function(){var s,r,l=t(this),h=l.outerWidth(),c=l.outerHeight(),d=i(this,"marginLeft"),_=i(this,"marginTop"),x=h+d+i(this,"marginRight")+y.width,C=c+_+i(this,"marginBottom")+y.height,D=t.extend({},m),T=e(k.my,l.outerWidth(),l.outerHeight());"right"===n.my[0]?D.left-=h:"center"===n.my[0]&&(D.left-=h/2),"bottom"===n.my[1]?D.top-=c:"center"===n.my[1]&&(D.top-=c/2),D.left+=T[0],D.top+=T[1],s={marginLeft:d,marginTop:_},t.each(["left","top"],function(e,i){t.ui.position[w[e]]&&t.ui.position[w[e]][i](D,{targetWidth:p,targetHeight:f,elemWidth:h,elemHeight:c,collisionPosition:s,collisionWidth:x,collisionHeight:C,offset:[u[0]+T[0],u[1]+T[1]],my:n.my,at:n.at,within:b,elem:l})}),n.using&&(r=function(t){var e=g.left-D.left,i=e+p-h,s=g.top-D.top,r=s+f-c,u={target:{element:v,left:g.left,top:g.top,width:p,height:f},element:{element:l,left:D.left,top:D.top,width:h,height:c},horizontal:0>i?"left":e>0?"right":"center",vertical:0>r?"top":s>0?"bottom":"middle"};h>p&&p>a(e+i)&&(u.horizontal="center"),c>f&&f>a(s+r)&&(u.vertical="middle"),u.important=o(a(e),a(i))>o(a(s),a(r))?"horizontal":"vertical",n.using.call(this,t,u)}),l.offset(t.extend(D,{using:r}))})},t.ui.position={fit:{left:function(t,e){var i,s=e.within,n=s.isWindow?s.scrollLeft:s.offset.left,a=s.width,r=t.left-e.collisionPosition.marginLeft,l=n-r,h=r+e.collisionWidth-a-n;e.collisionWidth>a?l>0&&0>=h?(i=t.left+l+e.collisionWidth-a-n,t.left+=l-i):t.left=h>0&&0>=l?n:l>h?n+a-e.collisionWidth:n:l>0?t.left+=l:h>0?t.left-=h:t.left=o(t.left-r,t.left)},top:function(t,e){var i,s=e.within,n=s.isWindow?s.scrollTop:s.offset.top,a=e.within.height,r=t.top-e.collisionPosition.marginTop,l=n-r,h=r+e.collisionHeight-a-n;e.collisionHeight>a?l>0&&0>=h?(i=t.top+l+e.collisionHeight-a-n,t.top+=l-i):t.top=h>0&&0>=l?n:l>h?n+a-e.collisionHeight:n:l>0?t.top+=l:h>0?t.top-=h:t.top=o(t.top-r,t.top)}},flip:{left:function(t,e){var i,s,n=e.within,o=n.offset.left+n.scrollLeft,r=n.width,l=n.isWindow?n.scrollLeft:n.offset.left,h=t.left-e.collisionPosition.marginLeft,c=h-l,u=h+e.collisionWidth-r-l,d="left"===e.my[0]?-e.elemWidth:"right"===e.my[0]?e.elemWidth:0,p="left"===e.at[0]?e.targetWidth:"right"===e.at[0]?-e.targetWidth:0,f=-2*e.offset[0];0>c?(i=t.left+d+p+f+e.collisionWidth-r-o,(0>i||a(c)>i)&&(t.left+=d+p+f)):u>0&&(s=t.left-e.collisionPosition.marginLeft+d+p+f-l,(s>0||u>a(s))&&(t.left+=d+p+f))},top:function(t,e){var i,s,n=e.within,o=n.offset.top+n.scrollTop,r=n.height,l=n.isWindow?n.scrollTop:n.offset.top,h=t.top-e.collisionPosition.marginTop,c=h-l,u=h+e.collisionHeight-r-l,d="top"===e.my[1],p=d?-e.elemHeight:"bottom"===e.my[1]?e.elemHeight:0,f="top"===e.at[1]?e.targetHeight:"bottom"===e.at[1]?-e.targetHeight:0,g=-2*e.offset[1];0>c?(s=t.top+p+f+g+e.collisionHeight-r-o,(0>s||a(c)>s)&&(t.top+=p+f+g)):u>0&&(i=t.top-e.collisionPosition.marginTop+p+f+g-l,(i>0||u>a(i))&&(t.top+=p+f+g))}},flipfit:{left:function(){t.ui.position.flip.left.apply(this,arguments),t.ui.position.fit.left.apply(this,arguments)},top:function(){t.ui.position.flip.top.apply(this,arguments),t.ui.position.fit.top.apply(this,arguments)}}}}(),t.ui.position,t.ui.focusable=function(i,s){var n,o,a,r,l,h=i.nodeName.toLowerCase();return"area"===h?(n=i.parentNode,o=n.name,i.href&&o&&"map"===n.nodeName.toLowerCase()?(a=t("img[usemap='#"+o+"']"),a.length>0&&a.is(":visible")):!1):(/^(input|select|textarea|button|object)$/.test(h)?(r=!i.disabled,r&&(l=t(i).closest("fieldset")[0],l&&(r=!l.disabled))):r="a"===h?i.href||s:s,r&&t(i).is(":visible")&&e(t(i)))},t.extend(t.expr[":"],{focusable:function(e){return t.ui.focusable(e,null!=t.attr(e,"tabindex"))}}),t.ui.focusable,t.fn.form=function(){return"string"==typeof this[0].form?this.closest("form"):t(this[0].form)},t.ui.formResetMixin={_formResetHandler:function(){var e=t(this);setTimeout(function(){var i=e.data("ui-form-reset-instances");t.each(i,function(){this.refresh()})})},_bindFormResetHandler:function(){if(this.form=this.element.form(),this.form.length){var t=this.form.data("ui-form-reset-instances")||[];t.length||this.form.on("reset.ui-form-reset",this._formResetHandler),t.push(this),this.form.data("ui-form-reset-instances",t)}},_unbindFormResetHandler:function(){if(this.form.length){var e=this.form.data("ui-form-reset-instances");e.splice(t.inArray(this,e),1),e.length?this.form.data("ui-form-reset-instances",e):this.form.removeData("ui-form-reset-instances").off("reset.ui-form-reset")}}},t.ui.keyCode={BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38},t.ui.escapeSelector=function(){var t=/([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g;return function(e){return e.replace(t,"\\$1")}}(),t.fn.labels=function(){var e,i,s,n,o;return this[0].labels&&this[0].labels.length?this.pushStack(this[0].labels):(n=this.eq(0).parents("label"),s=this.attr("id"),s&&(e=this.eq(0).parents().last(),o=e.add(e.length?e.siblings():this.siblings()),i="label[for='"+t.ui.escapeSelector(s)+"']",n=n.add(o.find(i).addBack(i))),this.pushStack(n))},t.extend(t.expr[":"],{tabbable:function(e){var i=t.attr(e,"tabindex"),s=null!=i;return(!s||i>=0)&&t.ui.focusable(e,s)}}),t.fn.extend({uniqueId:function(){var t=0;return function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++t)})}}(),removeUniqueId:function(){return this.each(function(){/^ui-id-\d+$/.test(this.id)&&t(this).removeAttr("id")})}}),t.extend(t.ui,{datepicker:{version:"1.12.1"}});var h;t.extend(s.prototype,{markerClassName:"hasDatepicker",maxRows:4,_widgetDatepicker:function(){return this.dpDiv},setDefaults:function(t){return a(this._defaults,t||{}),this},_attachDatepicker:function(e,i){var s,n,o;s=e.nodeName.toLowerCase(),n="div"===s||"span"===s,e.id||(this.uuid+=1,e.id="dp"+this.uuid),o=this._newInst(t(e),n),o.settings=t.extend({},i||{}),"input"===s?this._connectDatepicker(e,o):n&&this._inlineDatepicker(e,o)},_newInst:function(e,i){var s=e[0].id.replace(/([^A-Za-z0-9_\-])/g,"\\\\$1");return{id:s,input:e,selectedDay:0,selectedMonth:0,selectedYear:0,drawMonth:0,drawYear:0,inline:i,dpDiv:i?n(t("<div class='"+this._inlineClass+" ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")):this.dpDiv}},_connectDatepicker:function(e,i){var s=t(e);i.append=t([]),i.trigger=t([]),s.hasClass(this.markerClassName)||(this._attachments(s,i),s.addClass(this.markerClassName).on("keydown",this._doKeyDown).on("keypress",this._doKeyPress).on("keyup",this._doKeyUp),this._autoSize(i),t.data(e,"datepicker",i),i.settings.disabled&&this._disableDatepicker(e))},_attachments:function(e,i){var s,n,o,a=this._get(i,"appendText"),r=this._get(i,"isRTL");i.append&&i.append.remove(),a&&(i.append=t("<span class='"+this._appendClass+"'>"+a+"</span>"),e[r?"before":"after"](i.append)),e.off("focus",this._showDatepicker),i.trigger&&i.trigger.remove(),s=this._get(i,"showOn"),("focus"===s||"both"===s)&&e.on("focus",this._showDatepicker),("button"===s||"both"===s)&&(n=this._get(i,"buttonText"),o=this._get(i,"buttonImage"),i.trigger=t(this._get(i,"buttonImageOnly")?t("<img/>").addClass(this._triggerClass).attr({src:o,alt:n,title:n}):t("<button type='button'></button>").addClass(this._triggerClass).html(o?t("<img/>").attr({src:o,alt:n,title:n}):n)),e[r?"before":"after"](i.trigger),i.trigger.on("click",function(){return t.datepicker._datepickerShowing&&t.datepicker._lastInput===e[0]?t.datepicker._hideDatepicker():t.datepicker._datepickerShowing&&t.datepicker._lastInput!==e[0]?(t.datepicker._hideDatepicker(),t.datepicker._showDatepicker(e[0])):t.datepicker._showDatepicker(e[0]),!1}))},_autoSize:function(t){if(this._get(t,"autoSize")&&!t.inline){var e,i,s,n,o=new Date(2009,11,20),a=this._get(t,"dateFormat");a.match(/[DM]/)&&(e=function(t){for(i=0,s=0,n=0;t.length>n;n++)t[n].length>i&&(i=t[n].length,s=n);return s},o.setMonth(e(this._get(t,a.match(/MM/)?"monthNames":"monthNamesShort"))),o.setDate(e(this._get(t,a.match(/DD/)?"dayNames":"dayNamesShort"))+20-o.getDay())),t.input.attr("size",this._formatDate(t,o).length)}},_inlineDatepicker:function(e,i){var s=t(e);s.hasClass(this.markerClassName)||(s.addClass(this.markerClassName).append(i.dpDiv),t.data(e,"datepicker",i),this._setDate(i,this._getDefaultDate(i),!0),this._updateDatepicker(i),this._updateAlternate(i),i.settings.disabled&&this._disableDatepicker(e),i.dpDiv.css("display","block"))},_dialogDatepicker:function(e,i,s,n,o){var r,l,h,c,u,d=this._dialogInst;return d||(this.uuid+=1,r="dp"+this.uuid,this._dialogInput=t("<input type='text' id='"+r+"' style='position: absolute; top: -100px; width: 0px;'/>"),this._dialogInput.on("keydown",this._doKeyDown),t("body").append(this._dialogInput),d=this._dialogInst=this._newInst(this._dialogInput,!1),d.settings={},t.data(this._dialogInput[0],"datepicker",d)),a(d.settings,n||{}),i=i&&i.constructor===Date?this._formatDate(d,i):i,this._dialogInput.val(i),this._pos=o?o.length?o:[o.pageX,o.pageY]:null,this._pos||(l=document.documentElement.clientWidth,h=document.documentElement.clientHeight,c=document.documentElement.scrollLeft||document.body.scrollLeft,u=document.documentElement.scrollTop||document.body.scrollTop,this._pos=[l/2-100+c,h/2-150+u]),this._dialogInput.css("left",this._pos[0]+20+"px").css("top",this._pos[1]+"px"),d.settings.onSelect=s,this._inDialog=!0,this.dpDiv.addClass(this._dialogClass),this._showDatepicker(this._dialogInput[0]),t.blockUI&&t.blockUI(this.dpDiv),t.data(this._dialogInput[0],"datepicker",d),this},_destroyDatepicker:function(e){var i,s=t(e),n=t.data(e,"datepicker");s.hasClass(this.markerClassName)&&(i=e.nodeName.toLowerCase(),t.removeData(e,"datepicker"),"input"===i?(n.append.remove(),n.trigger.remove(),s.removeClass(this.markerClassName).off("focus",this._showDatepicker).off("keydown",this._doKeyDown).off("keypress",this._doKeyPress).off("keyup",this._doKeyUp)):("div"===i||"span"===i)&&s.removeClass(this.markerClassName).empty(),h===n&&(h=null))},_enableDatepicker:function(e){var i,s,n=t(e),o=t.data(e,"datepicker");n.hasClass(this.markerClassName)&&(i=e.nodeName.toLowerCase(),"input"===i?(e.disabled=!1,o.trigger.filter("button").each(function(){this.disabled=!1}).end().filter("img").css({opacity:"1.0",cursor:""})):("div"===i||"span"===i)&&(s=n.children("."+this._inlineClass),s.children().removeClass("ui-state-disabled"),s.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled",!1)),this._disabledInputs=t.map(this._disabledInputs,function(t){return t===e?null:t}))},_disableDatepicker:function(e){var i,s,n=t(e),o=t.data(e,"datepicker");n.hasClass(this.markerClassName)&&(i=e.nodeName.toLowerCase(),"input"===i?(e.disabled=!0,o.trigger.filter("button").each(function(){this.disabled=!0}).end().filter("img").css({opacity:"0.5",cursor:"default"})):("div"===i||"span"===i)&&(s=n.children("."+this._inlineClass),s.children().addClass("ui-state-disabled"),s.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled",!0)),this._disabledInputs=t.map(this._disabledInputs,function(t){return t===e?null:t}),this._disabledInputs[this._disabledInputs.length]=e)},_isDisabledDatepicker:function(t){if(!t)return!1;for(var e=0;this._disabledInputs.length>e;e++)if(this._disabledInputs[e]===t)return!0;return!1},_getInst:function(e){try{return t.data(e,"datepicker")}catch(i){throw"Missing instance data for this datepicker"}},_optionDatepicker:function(e,i,s){var n,o,r,l,h=this._getInst(e);return 2===arguments.length&&"string"==typeof i?"defaults"===i?t.extend({},t.datepicker._defaults):h?"all"===i?t.extend({},h.settings):this._get(h,i):null:(n=i||{},"string"==typeof i&&(n={},n[i]=s),h&&(this._curInst===h&&this._hideDatepicker(),o=this._getDateDatepicker(e,!0),r=this._getMinMaxDate(h,"min"),l=this._getMinMaxDate(h,"max"),a(h.settings,n),null!==r&&void 0!==n.dateFormat&&void 0===n.minDate&&(h.settings.minDate=this._formatDate(h,r)),null!==l&&void 0!==n.dateFormat&&void 0===n.maxDate&&(h.settings.maxDate=this._formatDate(h,l)),"disabled"in n&&(n.disabled?this._disableDatepicker(e):this._enableDatepicker(e)),this._attachments(t(e),h),this._autoSize(h),this._setDate(h,o),this._updateAlternate(h),this._updateDatepicker(h)),void 0)},_changeDatepicker:function(t,e,i){this._optionDatepicker(t,e,i)},_refreshDatepicker:function(t){var e=this._getInst(t);e&&this._updateDatepicker(e)},_setDateDatepicker:function(t,e){var i=this._getInst(t);i&&(this._setDate(i,e),this._updateDatepicker(i),this._updateAlternate(i))},_getDateDatepicker:function(t,e){var i=this._getInst(t);return i&&!i.inline&&this._setDateFromField(i,e),i?this._getDate(i):null},_doKeyDown:function(e){var i,s,n,o=t.datepicker._getInst(e.target),a=!0,r=o.dpDiv.is(".ui-datepicker-rtl");if(o._keyEvent=!0,t.datepicker._datepickerShowing)switch(e.keyCode){case 9:t.datepicker._hideDatepicker(),a=!1;break;case 13:return n=t("td."+t.datepicker._dayOverClass+":not(."+t.datepicker._currentClass+")",o.dpDiv),n[0]&&t.datepicker._selectDay(e.target,o.selectedMonth,o.selectedYear,n[0]),i=t.datepicker._get(o,"onSelect"),i?(s=t.datepicker._formatDate(o),i.apply(o.input?o.input[0]:null,[s,o])):t.datepicker._hideDatepicker(),!1;case 27:t.datepicker._hideDatepicker();break;case 33:t.datepicker._adjustDate(e.target,e.ctrlKey?-t.datepicker._get(o,"stepBigMonths"):-t.datepicker._get(o,"stepMonths"),"M");break;case 34:t.datepicker._adjustDate(e.target,e.ctrlKey?+t.datepicker._get(o,"stepBigMonths"):+t.datepicker._get(o,"stepMonths"),"M");break;case 35:(e.ctrlKey||e.metaKey)&&t.datepicker._clearDate(e.target),a=e.ctrlKey||e.metaKey;break;case 36:(e.ctrlKey||e.metaKey)&&t.datepicker._gotoToday(e.target),a=e.ctrlKey||e.metaKey;break;case 37:(e.ctrlKey||e.metaKey)&&t.datepicker._adjustDate(e.target,r?1:-1,"D"),a=e.ctrlKey||e.metaKey,e.originalEvent.altKey&&t.datepicker._adjustDate(e.target,e.ctrlKey?-t.datepicker._get(o,"stepBigMonths"):-t.datepicker._get(o,"stepMonths"),"M");break;case 38:(e.ctrlKey||e.metaKey)&&t.datepicker._adjustDate(e.target,-7,"D"),a=e.ctrlKey||e.metaKey;break;case 39:(e.ctrlKey||e.metaKey)&&t.datepicker._adjustDate(e.target,r?-1:1,"D"),a=e.ctrlKey||e.metaKey,e.originalEvent.altKey&&t.datepicker._adjustDate(e.target,e.ctrlKey?+t.datepicker._get(o,"stepBigMonths"):+t.datepicker._get(o,"stepMonths"),"M");break;case 40:(e.ctrlKey||e.metaKey)&&t.datepicker._adjustDate(e.target,7,"D"),a=e.ctrlKey||e.metaKey;break;default:a=!1}else 36===e.keyCode&&e.ctrlKey?t.datepicker._showDatepicker(this):a=!1;a&&(e.preventDefault(),e.stopPropagation())},_doKeyPress:function(e){var i,s,n=t.datepicker._getInst(e.target);return t.datepicker._get(n,"constrainInput")?(i=t.datepicker._possibleChars(t.datepicker._get(n,"dateFormat")),s=String.fromCharCode(null==e.charCode?e.keyCode:e.charCode),e.ctrlKey||e.metaKey||" ">s||!i||i.indexOf(s)>-1):void 0},_doKeyUp:function(e){var i,s=t.datepicker._getInst(e.target);if(s.input.val()!==s.lastVal)try{i=t.datepicker.parseDate(t.datepicker._get(s,"dateFormat"),s.input?s.input.val():null,t.datepicker._getFormatConfig(s)),i&&(t.datepicker._setDateFromField(s),t.datepicker._updateAlternate(s),t.datepicker._updateDatepicker(s))}catch(n){}return!0},_showDatepicker:function(e){if(e=e.target||e,"input"!==e.nodeName.toLowerCase()&&(e=t("input",e.parentNode)[0]),!t.datepicker._isDisabledDatepicker(e)&&t.datepicker._lastInput!==e){var s,n,o,r,l,h,c;s=t.datepicker._getInst(e),t.datepicker._curInst&&t.datepicker._curInst!==s&&(t.datepicker._curInst.dpDiv.stop(!0,!0),s&&t.datepicker._datepickerShowing&&t.datepicker._hideDatepicker(t.datepicker._curInst.input[0])),n=t.datepicker._get(s,"beforeShow"),o=n?n.apply(e,[e,s]):{},o!==!1&&(a(s.settings,o),s.lastVal=null,t.datepicker._lastInput=e,t.datepicker._setDateFromField(s),t.datepicker._inDialog&&(e.value=""),t.datepicker._pos||(t.datepicker._pos=t.datepicker._findPos(e),t.datepicker._pos[1]+=e.offsetHeight),r=!1,t(e).parents().each(function(){return r|="fixed"===t(this).css("position"),!r}),l={left:t.datepicker._pos[0],top:t.datepicker._pos[1]},t.datepicker._pos=null,s.dpDiv.empty(),s.dpDiv.css({position:"absolute",display:"block",top:"-1000px"}),t.datepicker._updateDatepicker(s),l=t.datepicker._checkOffset(s,l,r),s.dpDiv.css({position:t.datepicker._inDialog&&t.blockUI?"static":r?"fixed":"absolute",display:"none",left:l.left+"px",top:l.top+"px"}),s.inline||(h=t.datepicker._get(s,"showAnim"),c=t.datepicker._get(s,"duration"),s.dpDiv.css("z-index",i(t(e))+1),t.datepicker._datepickerShowing=!0,t.effects&&t.effects.effect[h]?s.dpDiv.show(h,t.datepicker._get(s,"showOptions"),c):s.dpDiv[h||"show"](h?c:null),t.datepicker._shouldFocusInput(s)&&s.input.trigger("focus"),t.datepicker._curInst=s))}},_updateDatepicker:function(e){this.maxRows=4,h=e,e.dpDiv.empty().append(this._generateHTML(e)),this._attachHandlers(e);var i,s=this._getNumberOfMonths(e),n=s[1],a=17,r=e.dpDiv.find("."+this._dayOverClass+" a");r.length>0&&o.apply(r.get(0)),e.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width(""),n>1&&e.dpDiv.addClass("ui-datepicker-multi-"+n).css("width",a*n+"em"),e.dpDiv[(1!==s[0]||1!==s[1]?"add":"remove")+"Class"]("ui-datepicker-multi"),e.dpDiv[(this._get(e,"isRTL")?"add":"remove")+"Class"]("ui-datepicker-rtl"),e===t.datepicker._curInst&&t.datepicker._datepickerShowing&&t.datepicker._shouldFocusInput(e)&&e.input.trigger("focus"),e.yearshtml&&(i=e.yearshtml,setTimeout(function(){i===e.yearshtml&&e.yearshtml&&e.dpDiv.find("select.ui-datepicker-year:first").replaceWith(e.yearshtml),i=e.yearshtml=null},0))},_shouldFocusInput:function(t){return t.input&&t.input.is(":visible")&&!t.input.is(":disabled")&&!t.input.is(":focus")},_checkOffset:function(e,i,s){var n=e.dpDiv.outerWidth(),o=e.dpDiv.outerHeight(),a=e.input?e.input.outerWidth():0,r=e.input?e.input.outerHeight():0,l=document.documentElement.clientWidth+(s?0:t(document).scrollLeft()),h=document.documentElement.clientHeight+(s?0:t(document).scrollTop());return i.left-=this._get(e,"isRTL")?n-a:0,i.left-=s&&i.left===e.input.offset().left?t(document).scrollLeft():0,i.top-=s&&i.top===e.input.offset().top+r?t(document).scrollTop():0,i.left-=Math.min(i.left,i.left+n>l&&l>n?Math.abs(i.left+n-l):0),i.top-=Math.min(i.top,i.top+o>h&&h>o?Math.abs(o+r):0),i
},_findPos:function(e){for(var i,s=this._getInst(e),n=this._get(s,"isRTL");e&&("hidden"===e.type||1!==e.nodeType||t.expr.filters.hidden(e));)e=e[n?"previousSibling":"nextSibling"];return i=t(e).offset(),[i.left,i.top]},_hideDatepicker:function(e){var i,s,n,o,a=this._curInst;!a||e&&a!==t.data(e,"datepicker")||this._datepickerShowing&&(i=this._get(a,"showAnim"),s=this._get(a,"duration"),n=function(){t.datepicker._tidyDialog(a)},t.effects&&(t.effects.effect[i]||t.effects[i])?a.dpDiv.hide(i,t.datepicker._get(a,"showOptions"),s,n):a.dpDiv["slideDown"===i?"slideUp":"fadeIn"===i?"fadeOut":"hide"](i?s:null,n),i||n(),this._datepickerShowing=!1,o=this._get(a,"onClose"),o&&o.apply(a.input?a.input[0]:null,[a.input?a.input.val():"",a]),this._lastInput=null,this._inDialog&&(this._dialogInput.css({position:"absolute",left:"0",top:"-100px"}),t.blockUI&&(t.unblockUI(),t("body").append(this.dpDiv))),this._inDialog=!1)},_tidyDialog:function(t){t.dpDiv.removeClass(this._dialogClass).off(".ui-datepicker-calendar")},_checkExternalClick:function(e){if(t.datepicker._curInst){var i=t(e.target),s=t.datepicker._getInst(i[0]);(i[0].id!==t.datepicker._mainDivId&&0===i.parents("#"+t.datepicker._mainDivId).length&&!i.hasClass(t.datepicker.markerClassName)&&!i.closest("."+t.datepicker._triggerClass).length&&t.datepicker._datepickerShowing&&(!t.datepicker._inDialog||!t.blockUI)||i.hasClass(t.datepicker.markerClassName)&&t.datepicker._curInst!==s)&&t.datepicker._hideDatepicker()}},_adjustDate:function(e,i,s){var n=t(e),o=this._getInst(n[0]);this._isDisabledDatepicker(n[0])||(this._adjustInstDate(o,i+("M"===s?this._get(o,"showCurrentAtPos"):0),s),this._updateDatepicker(o))},_gotoToday:function(e){var i,s=t(e),n=this._getInst(s[0]);this._get(n,"gotoCurrent")&&n.currentDay?(n.selectedDay=n.currentDay,n.drawMonth=n.selectedMonth=n.currentMonth,n.drawYear=n.selectedYear=n.currentYear):(i=new Date,n.selectedDay=i.getDate(),n.drawMonth=n.selectedMonth=i.getMonth(),n.drawYear=n.selectedYear=i.getFullYear()),this._notifyChange(n),this._adjustDate(s)},_selectMonthYear:function(e,i,s){var n=t(e),o=this._getInst(n[0]);o["selected"+("M"===s?"Month":"Year")]=o["draw"+("M"===s?"Month":"Year")]=parseInt(i.options[i.selectedIndex].value,10),this._notifyChange(o),this._adjustDate(n)},_selectDay:function(e,i,s,n){var o,a=t(e);t(n).hasClass(this._unselectableClass)||this._isDisabledDatepicker(a[0])||(o=this._getInst(a[0]),o.selectedDay=o.currentDay=t("a",n).html(),o.selectedMonth=o.currentMonth=i,o.selectedYear=o.currentYear=s,this._selectDate(e,this._formatDate(o,o.currentDay,o.currentMonth,o.currentYear)))},_clearDate:function(e){var i=t(e);this._selectDate(i,"")},_selectDate:function(e,i){var s,n=t(e),o=this._getInst(n[0]);i=null!=i?i:this._formatDate(o),o.input&&o.input.val(i),this._updateAlternate(o),s=this._get(o,"onSelect"),s?s.apply(o.input?o.input[0]:null,[i,o]):o.input&&o.input.trigger("change"),o.inline?this._updateDatepicker(o):(this._hideDatepicker(),this._lastInput=o.input[0],"object"!=typeof o.input[0]&&o.input.trigger("focus"),this._lastInput=null)},_updateAlternate:function(e){var i,s,n,o=this._get(e,"altField");o&&(i=this._get(e,"altFormat")||this._get(e,"dateFormat"),s=this._getDate(e),n=this.formatDate(i,s,this._getFormatConfig(e)),t(o).val(n))},noWeekends:function(t){var e=t.getDay();return[e>0&&6>e,""]},iso8601Week:function(t){var e,i=new Date(t.getTime());return i.setDate(i.getDate()+4-(i.getDay()||7)),e=i.getTime(),i.setMonth(0),i.setDate(1),Math.floor(Math.round((e-i)/864e5)/7)+1},parseDate:function(e,i,s){if(null==e||null==i)throw"Invalid arguments";if(i="object"==typeof i?""+i:i+"",""===i)return null;var n,o,a,r,l=0,h=(s?s.shortYearCutoff:null)||this._defaults.shortYearCutoff,c="string"!=typeof h?h:(new Date).getFullYear()%100+parseInt(h,10),u=(s?s.dayNamesShort:null)||this._defaults.dayNamesShort,d=(s?s.dayNames:null)||this._defaults.dayNames,p=(s?s.monthNamesShort:null)||this._defaults.monthNamesShort,f=(s?s.monthNames:null)||this._defaults.monthNames,g=-1,m=-1,_=-1,v=-1,b=!1,y=function(t){var i=e.length>n+1&&e.charAt(n+1)===t;return i&&n++,i},w=function(t){var e=y(t),s="@"===t?14:"!"===t?20:"y"===t&&e?4:"o"===t?3:2,n="y"===t?s:1,o=RegExp("^\\d{"+n+","+s+"}"),a=i.substring(l).match(o);if(!a)throw"Missing number at position "+l;return l+=a[0].length,parseInt(a[0],10)},k=function(e,s,n){var o=-1,a=t.map(y(e)?n:s,function(t,e){return[[e,t]]}).sort(function(t,e){return-(t[1].length-e[1].length)});if(t.each(a,function(t,e){var s=e[1];return i.substr(l,s.length).toLowerCase()===s.toLowerCase()?(o=e[0],l+=s.length,!1):void 0}),-1!==o)return o+1;throw"Unknown name at position "+l},x=function(){if(i.charAt(l)!==e.charAt(n))throw"Unexpected literal at position "+l;l++};for(n=0;e.length>n;n++)if(b)"'"!==e.charAt(n)||y("'")?x():b=!1;else switch(e.charAt(n)){case"d":_=w("d");break;case"D":k("D",u,d);break;case"o":v=w("o");break;case"m":m=w("m");break;case"M":m=k("M",p,f);break;case"y":g=w("y");break;case"@":r=new Date(w("@")),g=r.getFullYear(),m=r.getMonth()+1,_=r.getDate();break;case"!":r=new Date((w("!")-this._ticksTo1970)/1e4),g=r.getFullYear(),m=r.getMonth()+1,_=r.getDate();break;case"'":y("'")?x():b=!0;break;default:x()}if(i.length>l&&(a=i.substr(l),!/^\s+/.test(a)))throw"Extra/unparsed characters found in date: "+a;if(-1===g?g=(new Date).getFullYear():100>g&&(g+=(new Date).getFullYear()-(new Date).getFullYear()%100+(c>=g?0:-100)),v>-1)for(m=1,_=v;;){if(o=this._getDaysInMonth(g,m-1),o>=_)break;m++,_-=o}if(r=this._daylightSavingAdjust(new Date(g,m-1,_)),r.getFullYear()!==g||r.getMonth()+1!==m||r.getDate()!==_)throw"Invalid date";return r},ATOM:"yy-mm-dd",COOKIE:"D, dd M yy",ISO_8601:"yy-mm-dd",RFC_822:"D, d M y",RFC_850:"DD, dd-M-y",RFC_1036:"D, d M y",RFC_1123:"D, d M yy",RFC_2822:"D, d M yy",RSS:"D, d M y",TICKS:"!",TIMESTAMP:"@",W3C:"yy-mm-dd",_ticksTo1970:1e7*60*60*24*(718685+Math.floor(492.5)-Math.floor(19.7)+Math.floor(4.925)),formatDate:function(t,e,i){if(!e)return"";var s,n=(i?i.dayNamesShort:null)||this._defaults.dayNamesShort,o=(i?i.dayNames:null)||this._defaults.dayNames,a=(i?i.monthNamesShort:null)||this._defaults.monthNamesShort,r=(i?i.monthNames:null)||this._defaults.monthNames,l=function(e){var i=t.length>s+1&&t.charAt(s+1)===e;return i&&s++,i},h=function(t,e,i){var s=""+e;if(l(t))for(;i>s.length;)s="0"+s;return s},c=function(t,e,i,s){return l(t)?s[e]:i[e]},u="",d=!1;if(e)for(s=0;t.length>s;s++)if(d)"'"!==t.charAt(s)||l("'")?u+=t.charAt(s):d=!1;else switch(t.charAt(s)){case"d":u+=h("d",e.getDate(),2);break;case"D":u+=c("D",e.getDay(),n,o);break;case"o":u+=h("o",Math.round((new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime()-new Date(e.getFullYear(),0,0).getTime())/864e5),3);break;case"m":u+=h("m",e.getMonth()+1,2);break;case"M":u+=c("M",e.getMonth(),a,r);break;case"y":u+=l("y")?e.getFullYear():(10>e.getFullYear()%100?"0":"")+e.getFullYear()%100;break;case"@":u+=e.getTime();break;case"!":u+=1e4*e.getTime()+this._ticksTo1970;break;case"'":l("'")?u+="'":d=!0;break;default:u+=t.charAt(s)}return u},_possibleChars:function(t){var e,i="",s=!1,n=function(i){var s=t.length>e+1&&t.charAt(e+1)===i;return s&&e++,s};for(e=0;t.length>e;e++)if(s)"'"!==t.charAt(e)||n("'")?i+=t.charAt(e):s=!1;else switch(t.charAt(e)){case"d":case"m":case"y":case"@":i+="0123456789";break;case"D":case"M":return null;case"'":n("'")?i+="'":s=!0;break;default:i+=t.charAt(e)}return i},_get:function(t,e){return void 0!==t.settings[e]?t.settings[e]:this._defaults[e]},_setDateFromField:function(t,e){if(t.input.val()!==t.lastVal){var i=this._get(t,"dateFormat"),s=t.lastVal=t.input?t.input.val():null,n=this._getDefaultDate(t),o=n,a=this._getFormatConfig(t);try{o=this.parseDate(i,s,a)||n}catch(r){s=e?"":s}t.selectedDay=o.getDate(),t.drawMonth=t.selectedMonth=o.getMonth(),t.drawYear=t.selectedYear=o.getFullYear(),t.currentDay=s?o.getDate():0,t.currentMonth=s?o.getMonth():0,t.currentYear=s?o.getFullYear():0,this._adjustInstDate(t)}},_getDefaultDate:function(t){return this._restrictMinMax(t,this._determineDate(t,this._get(t,"defaultDate"),new Date))},_determineDate:function(e,i,s){var n=function(t){var e=new Date;return e.setDate(e.getDate()+t),e},o=function(i){try{return t.datepicker.parseDate(t.datepicker._get(e,"dateFormat"),i,t.datepicker._getFormatConfig(e))}catch(s){}for(var n=(i.toLowerCase().match(/^c/)?t.datepicker._getDate(e):null)||new Date,o=n.getFullYear(),a=n.getMonth(),r=n.getDate(),l=/([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,h=l.exec(i);h;){switch(h[2]||"d"){case"d":case"D":r+=parseInt(h[1],10);break;case"w":case"W":r+=7*parseInt(h[1],10);break;case"m":case"M":a+=parseInt(h[1],10),r=Math.min(r,t.datepicker._getDaysInMonth(o,a));break;case"y":case"Y":o+=parseInt(h[1],10),r=Math.min(r,t.datepicker._getDaysInMonth(o,a))}h=l.exec(i)}return new Date(o,a,r)},a=null==i||""===i?s:"string"==typeof i?o(i):"number"==typeof i?isNaN(i)?s:n(i):new Date(i.getTime());return a=a&&"Invalid Date"==""+a?s:a,a&&(a.setHours(0),a.setMinutes(0),a.setSeconds(0),a.setMilliseconds(0)),this._daylightSavingAdjust(a)},_daylightSavingAdjust:function(t){return t?(t.setHours(t.getHours()>12?t.getHours()+2:0),t):null},_setDate:function(t,e,i){var s=!e,n=t.selectedMonth,o=t.selectedYear,a=this._restrictMinMax(t,this._determineDate(t,e,new Date));t.selectedDay=t.currentDay=a.getDate(),t.drawMonth=t.selectedMonth=t.currentMonth=a.getMonth(),t.drawYear=t.selectedYear=t.currentYear=a.getFullYear(),n===t.selectedMonth&&o===t.selectedYear||i||this._notifyChange(t),this._adjustInstDate(t),t.input&&t.input.val(s?"":this._formatDate(t))},_getDate:function(t){var e=!t.currentYear||t.input&&""===t.input.val()?null:this._daylightSavingAdjust(new Date(t.currentYear,t.currentMonth,t.currentDay));return e},_attachHandlers:function(e){var i=this._get(e,"stepMonths"),s="#"+e.id.replace(/\\\\/g,"\\");e.dpDiv.find("[data-handler]").map(function(){var e={prev:function(){t.datepicker._adjustDate(s,-i,"M")},next:function(){t.datepicker._adjustDate(s,+i,"M")},hide:function(){t.datepicker._hideDatepicker()},today:function(){t.datepicker._gotoToday(s)},selectDay:function(){return t.datepicker._selectDay(s,+this.getAttribute("data-month"),+this.getAttribute("data-year"),this),!1},selectMonth:function(){return t.datepicker._selectMonthYear(s,this,"M"),!1},selectYear:function(){return t.datepicker._selectMonthYear(s,this,"Y"),!1}};t(this).on(this.getAttribute("data-event"),e[this.getAttribute("data-handler")])})},_generateHTML:function(t){var e,i,s,n,o,a,r,l,h,c,u,d,p,f,g,m,_,v,b,y,w,k,x,C,D,T,I,M,P,S,N,H,z,A,O,E,W,F,L,R=new Date,Y=this._daylightSavingAdjust(new Date(R.getFullYear(),R.getMonth(),R.getDate())),B=this._get(t,"isRTL"),j=this._get(t,"showButtonPanel"),q=this._get(t,"hideIfNoPrevNext"),K=this._get(t,"navigationAsDateFormat"),U=this._getNumberOfMonths(t),V=this._get(t,"showCurrentAtPos"),X=this._get(t,"stepMonths"),$=1!==U[0]||1!==U[1],G=this._daylightSavingAdjust(t.currentDay?new Date(t.currentYear,t.currentMonth,t.currentDay):new Date(9999,9,9)),J=this._getMinMaxDate(t,"min"),Q=this._getMinMaxDate(t,"max"),Z=t.drawMonth-V,te=t.drawYear;if(0>Z&&(Z+=12,te--),Q)for(e=this._daylightSavingAdjust(new Date(Q.getFullYear(),Q.getMonth()-U[0]*U[1]+1,Q.getDate())),e=J&&J>e?J:e;this._daylightSavingAdjust(new Date(te,Z,1))>e;)Z--,0>Z&&(Z=11,te--);for(t.drawMonth=Z,t.drawYear=te,i=this._get(t,"prevText"),i=K?this.formatDate(i,this._daylightSavingAdjust(new Date(te,Z-X,1)),this._getFormatConfig(t)):i,s=this._canAdjustMonth(t,-1,te,Z)?"<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click' title='"+i+"'><span class='ui-icon ui-icon-circle-triangle-"+(B?"e":"w")+"'>"+i+"</span></a>":q?"":"<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='"+i+"'><span class='ui-icon ui-icon-circle-triangle-"+(B?"e":"w")+"'>"+i+"</span></a>",n=this._get(t,"nextText"),n=K?this.formatDate(n,this._daylightSavingAdjust(new Date(te,Z+X,1)),this._getFormatConfig(t)):n,o=this._canAdjustMonth(t,1,te,Z)?"<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click' title='"+n+"'><span class='ui-icon ui-icon-circle-triangle-"+(B?"w":"e")+"'>"+n+"</span></a>":q?"":"<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='"+n+"'><span class='ui-icon ui-icon-circle-triangle-"+(B?"w":"e")+"'>"+n+"</span></a>",a=this._get(t,"currentText"),r=this._get(t,"gotoCurrent")&&t.currentDay?G:Y,a=K?this.formatDate(a,r,this._getFormatConfig(t)):a,l=t.inline?"":"<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>"+this._get(t,"closeText")+"</button>",h=j?"<div class='ui-datepicker-buttonpane ui-widget-content'>"+(B?l:"")+(this._isInRange(t,r)?"<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'>"+a+"</button>":"")+(B?"":l)+"</div>":"",c=parseInt(this._get(t,"firstDay"),10),c=isNaN(c)?0:c,u=this._get(t,"showWeek"),d=this._get(t,"dayNames"),p=this._get(t,"dayNamesMin"),f=this._get(t,"monthNames"),g=this._get(t,"monthNamesShort"),m=this._get(t,"beforeShowDay"),_=this._get(t,"showOtherMonths"),v=this._get(t,"selectOtherMonths"),b=this._getDefaultDate(t),y="",k=0;U[0]>k;k++){for(x="",this.maxRows=4,C=0;U[1]>C;C++){if(D=this._daylightSavingAdjust(new Date(te,Z,t.selectedDay)),T=" ui-corner-all",I="",$){if(I+="<div class='ui-datepicker-group",U[1]>1)switch(C){case 0:I+=" ui-datepicker-group-first",T=" ui-corner-"+(B?"right":"left");break;case U[1]-1:I+=" ui-datepicker-group-last",T=" ui-corner-"+(B?"left":"right");break;default:I+=" ui-datepicker-group-middle",T=""}I+="'>"}for(I+="<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix"+T+"'>"+(/all|left/.test(T)&&0===k?B?o:s:"")+(/all|right/.test(T)&&0===k?B?s:o:"")+this._generateMonthYearHeader(t,Z,te,J,Q,k>0||C>0,f,g)+"</div><table class='ui-datepicker-calendar'><thead>"+"<tr>",M=u?"<th class='ui-datepicker-week-col'>"+this._get(t,"weekHeader")+"</th>":"",w=0;7>w;w++)P=(w+c)%7,M+="<th scope='col'"+((w+c+6)%7>=5?" class='ui-datepicker-week-end'":"")+">"+"<span title='"+d[P]+"'>"+p[P]+"</span></th>";for(I+=M+"</tr></thead><tbody>",S=this._getDaysInMonth(te,Z),te===t.selectedYear&&Z===t.selectedMonth&&(t.selectedDay=Math.min(t.selectedDay,S)),N=(this._getFirstDayOfMonth(te,Z)-c+7)%7,H=Math.ceil((N+S)/7),z=$?this.maxRows>H?this.maxRows:H:H,this.maxRows=z,A=this._daylightSavingAdjust(new Date(te,Z,1-N)),O=0;z>O;O++){for(I+="<tr>",E=u?"<td class='ui-datepicker-week-col'>"+this._get(t,"calculateWeek")(A)+"</td>":"",w=0;7>w;w++)W=m?m.apply(t.input?t.input[0]:null,[A]):[!0,""],F=A.getMonth()!==Z,L=F&&!v||!W[0]||J&&J>A||Q&&A>Q,E+="<td class='"+((w+c+6)%7>=5?" ui-datepicker-week-end":"")+(F?" ui-datepicker-other-month":"")+(A.getTime()===D.getTime()&&Z===t.selectedMonth&&t._keyEvent||b.getTime()===A.getTime()&&b.getTime()===D.getTime()?" "+this._dayOverClass:"")+(L?" "+this._unselectableClass+" ui-state-disabled":"")+(F&&!_?"":" "+W[1]+(A.getTime()===G.getTime()?" "+this._currentClass:"")+(A.getTime()===Y.getTime()?" ui-datepicker-today":""))+"'"+(F&&!_||!W[2]?"":" title='"+W[2].replace(/'/g,"&#39;")+"'")+(L?"":" data-handler='selectDay' data-event='click' data-month='"+A.getMonth()+"' data-year='"+A.getFullYear()+"'")+">"+(F&&!_?"&#xa0;":L?"<span class='ui-state-default'>"+A.getDate()+"</span>":"<a class='ui-state-default"+(A.getTime()===Y.getTime()?" ui-state-highlight":"")+(A.getTime()===G.getTime()?" ui-state-active":"")+(F?" ui-priority-secondary":"")+"' href='#'>"+A.getDate()+"</a>")+"</td>",A.setDate(A.getDate()+1),A=this._daylightSavingAdjust(A);I+=E+"</tr>"}Z++,Z>11&&(Z=0,te++),I+="</tbody></table>"+($?"</div>"+(U[0]>0&&C===U[1]-1?"<div class='ui-datepicker-row-break'></div>":""):""),x+=I}y+=x}return y+=h,t._keyEvent=!1,y},_generateMonthYearHeader:function(t,e,i,s,n,o,a,r){var l,h,c,u,d,p,f,g,m=this._get(t,"changeMonth"),_=this._get(t,"changeYear"),v=this._get(t,"showMonthAfterYear"),b="<div class='ui-datepicker-title'>",y="";if(o||!m)y+="<span class='ui-datepicker-month'>"+a[e]+"</span>";else{for(l=s&&s.getFullYear()===i,h=n&&n.getFullYear()===i,y+="<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>",c=0;12>c;c++)(!l||c>=s.getMonth())&&(!h||n.getMonth()>=c)&&(y+="<option value='"+c+"'"+(c===e?" selected='selected'":"")+">"+r[c]+"</option>");y+="</select>"}if(v||(b+=y+(!o&&m&&_?"":"&#xa0;")),!t.yearshtml)if(t.yearshtml="",o||!_)b+="<span class='ui-datepicker-year'>"+i+"</span>";else{for(u=this._get(t,"yearRange").split(":"),d=(new Date).getFullYear(),p=function(t){var e=t.match(/c[+\-].*/)?i+parseInt(t.substring(1),10):t.match(/[+\-].*/)?d+parseInt(t,10):parseInt(t,10);return isNaN(e)?d:e},f=p(u[0]),g=Math.max(f,p(u[1]||"")),f=s?Math.max(f,s.getFullYear()):f,g=n?Math.min(g,n.getFullYear()):g,t.yearshtml+="<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>";g>=f;f++)t.yearshtml+="<option value='"+f+"'"+(f===i?" selected='selected'":"")+">"+f+"</option>";t.yearshtml+="</select>",b+=t.yearshtml,t.yearshtml=null}return b+=this._get(t,"yearSuffix"),v&&(b+=(!o&&m&&_?"":"&#xa0;")+y),b+="</div>"},_adjustInstDate:function(t,e,i){var s=t.selectedYear+("Y"===i?e:0),n=t.selectedMonth+("M"===i?e:0),o=Math.min(t.selectedDay,this._getDaysInMonth(s,n))+("D"===i?e:0),a=this._restrictMinMax(t,this._daylightSavingAdjust(new Date(s,n,o)));t.selectedDay=a.getDate(),t.drawMonth=t.selectedMonth=a.getMonth(),t.drawYear=t.selectedYear=a.getFullYear(),("M"===i||"Y"===i)&&this._notifyChange(t)},_restrictMinMax:function(t,e){var i=this._getMinMaxDate(t,"min"),s=this._getMinMaxDate(t,"max"),n=i&&i>e?i:e;return s&&n>s?s:n},_notifyChange:function(t){var e=this._get(t,"onChangeMonthYear");e&&e.apply(t.input?t.input[0]:null,[t.selectedYear,t.selectedMonth+1,t])},_getNumberOfMonths:function(t){var e=this._get(t,"numberOfMonths");return null==e?[1,1]:"number"==typeof e?[1,e]:e},_getMinMaxDate:function(t,e){return this._determineDate(t,this._get(t,e+"Date"),null)},_getDaysInMonth:function(t,e){return 32-this._daylightSavingAdjust(new Date(t,e,32)).getDate()},_getFirstDayOfMonth:function(t,e){return new Date(t,e,1).getDay()},_canAdjustMonth:function(t,e,i,s){var n=this._getNumberOfMonths(t),o=this._daylightSavingAdjust(new Date(i,s+(0>e?e:n[0]*n[1]),1));return 0>e&&o.setDate(this._getDaysInMonth(o.getFullYear(),o.getMonth())),this._isInRange(t,o)},_isInRange:function(t,e){var i,s,n=this._getMinMaxDate(t,"min"),o=this._getMinMaxDate(t,"max"),a=null,r=null,l=this._get(t,"yearRange");return l&&(i=l.split(":"),s=(new Date).getFullYear(),a=parseInt(i[0],10),r=parseInt(i[1],10),i[0].match(/[+\-].*/)&&(a+=s),i[1].match(/[+\-].*/)&&(r+=s)),(!n||e.getTime()>=n.getTime())&&(!o||e.getTime()<=o.getTime())&&(!a||e.getFullYear()>=a)&&(!r||r>=e.getFullYear())},_getFormatConfig:function(t){var e=this._get(t,"shortYearCutoff");return e="string"!=typeof e?e:(new Date).getFullYear()%100+parseInt(e,10),{shortYearCutoff:e,dayNamesShort:this._get(t,"dayNamesShort"),dayNames:this._get(t,"dayNames"),monthNamesShort:this._get(t,"monthNamesShort"),monthNames:this._get(t,"monthNames")}},_formatDate:function(t,e,i,s){e||(t.currentDay=t.selectedDay,t.currentMonth=t.selectedMonth,t.currentYear=t.selectedYear);var n=e?"object"==typeof e?e:this._daylightSavingAdjust(new Date(s,i,e)):this._daylightSavingAdjust(new Date(t.currentYear,t.currentMonth,t.currentDay));return this.formatDate(this._get(t,"dateFormat"),n,this._getFormatConfig(t))}}),t.fn.datepicker=function(e){if(!this.length)return this;t.datepicker.initialized||(t(document).on("mousedown",t.datepicker._checkExternalClick),t.datepicker.initialized=!0),0===t("#"+t.datepicker._mainDivId).length&&t("body").append(t.datepicker.dpDiv);var i=Array.prototype.slice.call(arguments,1);return"string"!=typeof e||"isDisabled"!==e&&"getDate"!==e&&"widget"!==e?"option"===e&&2===arguments.length&&"string"==typeof arguments[1]?t.datepicker["_"+e+"Datepicker"].apply(t.datepicker,[this[0]].concat(i)):this.each(function(){"string"==typeof e?t.datepicker["_"+e+"Datepicker"].apply(t.datepicker,[this].concat(i)):t.datepicker._attachDatepicker(this,e)}):t.datepicker["_"+e+"Datepicker"].apply(t.datepicker,[this[0]].concat(i))},t.datepicker=new s,t.datepicker.initialized=!1,t.datepicker.uuid=(new Date).getTime(),t.datepicker.version="1.12.1",t.datepicker,t.ui.safeActiveElement=function(t){var e;try{e=t.activeElement}catch(i){e=t.body}return e||(e=t.body),e.nodeName||(e=t.body),e},t.widget("ui.menu",{version:"1.12.1",defaultElement:"<ul>",delay:300,options:{icons:{submenu:"ui-icon-caret-1-e"},items:"> *",menus:"ul",position:{my:"left top",at:"right top"},role:"menu",blur:null,focus:null,select:null},_create:function(){this.activeMenu=this.element,this.mouseHandled=!1,this.element.uniqueId().attr({role:this.options.role,tabIndex:0}),this._addClass("ui-menu","ui-widget ui-widget-content"),this._on({"mousedown .ui-menu-item":function(t){t.preventDefault()},"click .ui-menu-item":function(e){var i=t(e.target),s=t(t.ui.safeActiveElement(this.document[0]));!this.mouseHandled&&i.not(".ui-state-disabled").length&&(this.select(e),e.isPropagationStopped()||(this.mouseHandled=!0),i.has(".ui-menu").length?this.expand(e):!this.element.is(":focus")&&s.closest(".ui-menu").length&&(this.element.trigger("focus",[!0]),this.active&&1===this.active.parents(".ui-menu").length&&clearTimeout(this.timer)))},"mouseenter .ui-menu-item":function(e){if(!this.previousFilter){var i=t(e.target).closest(".ui-menu-item"),s=t(e.currentTarget);i[0]===s[0]&&(this._removeClass(s.siblings().children(".ui-state-active"),null,"ui-state-active"),this.focus(e,s))}},mouseleave:"collapseAll","mouseleave .ui-menu":"collapseAll",focus:function(t,e){var i=this.active||this.element.find(this.options.items).eq(0);e||this.focus(t,i)},blur:function(e){this._delay(function(){var i=!t.contains(this.element[0],t.ui.safeActiveElement(this.document[0]));i&&this.collapseAll(e)})},keydown:"_keydown"}),this.refresh(),this._on(this.document,{click:function(t){this._closeOnDocumentClick(t)&&this.collapseAll(t),this.mouseHandled=!1}})},_destroy:function(){var e=this.element.find(".ui-menu-item").removeAttr("role aria-disabled"),i=e.children(".ui-menu-item-wrapper").removeUniqueId().removeAttr("tabIndex role aria-haspopup");this.element.removeAttr("aria-activedescendant").find(".ui-menu").addBack().removeAttr("role aria-labelledby aria-expanded aria-hidden aria-disabled tabIndex").removeUniqueId().show(),i.children().each(function(){var e=t(this);e.data("ui-menu-submenu-caret")&&e.remove()})},_keydown:function(e){var i,s,n,o,a=!0;switch(e.keyCode){case t.ui.keyCode.PAGE_UP:this.previousPage(e);break;case t.ui.keyCode.PAGE_DOWN:this.nextPage(e);break;case t.ui.keyCode.HOME:this._move("first","first",e);break;case t.ui.keyCode.END:this._move("last","last",e);break;case t.ui.keyCode.UP:this.previous(e);break;case t.ui.keyCode.DOWN:this.next(e);break;case t.ui.keyCode.LEFT:this.collapse(e);break;case t.ui.keyCode.RIGHT:this.active&&!this.active.is(".ui-state-disabled")&&this.expand(e);break;case t.ui.keyCode.ENTER:case t.ui.keyCode.SPACE:this._activate(e);break;case t.ui.keyCode.ESCAPE:this.collapse(e);break;default:a=!1,s=this.previousFilter||"",o=!1,n=e.keyCode>=96&&105>=e.keyCode?""+(e.keyCode-96):String.fromCharCode(e.keyCode),clearTimeout(this.filterTimer),n===s?o=!0:n=s+n,i=this._filterMenuItems(n),i=o&&-1!==i.index(this.active.next())?this.active.nextAll(".ui-menu-item"):i,i.length||(n=String.fromCharCode(e.keyCode),i=this._filterMenuItems(n)),i.length?(this.focus(e,i),this.previousFilter=n,this.filterTimer=this._delay(function(){delete this.previousFilter},1e3)):delete this.previousFilter}a&&e.preventDefault()},_activate:function(t){this.active&&!this.active.is(".ui-state-disabled")&&(this.active.children("[aria-haspopup='true']").length?this.expand(t):this.select(t))},refresh:function(){var e,i,s,n,o,a=this,r=this.options.icons.submenu,l=this.element.find(this.options.menus);this._toggleClass("ui-menu-icons",null,!!this.element.find(".ui-icon").length),s=l.filter(":not(.ui-menu)").hide().attr({role:this.options.role,"aria-hidden":"true","aria-expanded":"false"}).each(function(){var e=t(this),i=e.prev(),s=t("<span>").data("ui-menu-submenu-caret",!0);a._addClass(s,"ui-menu-icon","ui-icon "+r),i.attr("aria-haspopup","true").prepend(s),e.attr("aria-labelledby",i.attr("id"))}),this._addClass(s,"ui-menu","ui-widget ui-widget-content ui-front"),e=l.add(this.element),i=e.find(this.options.items),i.not(".ui-menu-item").each(function(){var e=t(this);a._isDivider(e)&&a._addClass(e,"ui-menu-divider","ui-widget-content")}),n=i.not(".ui-menu-item, .ui-menu-divider"),o=n.children().not(".ui-menu").uniqueId().attr({tabIndex:-1,role:this._itemRole()}),this._addClass(n,"ui-menu-item")._addClass(o,"ui-menu-item-wrapper"),i.filter(".ui-state-disabled").attr("aria-disabled","true"),this.active&&!t.contains(this.element[0],this.active[0])&&this.blur()},_itemRole:function(){return{menu:"menuitem",listbox:"option"}[this.options.role]},_setOption:function(t,e){if("icons"===t){var i=this.element.find(".ui-menu-icon");this._removeClass(i,null,this.options.icons.submenu)._addClass(i,null,e.submenu)}this._super(t,e)},_setOptionDisabled:function(t){this._super(t),this.element.attr("aria-disabled",t+""),this._toggleClass(null,"ui-state-disabled",!!t)},focus:function(t,e){var i,s,n;this.blur(t,t&&"focus"===t.type),this._scrollIntoView(e),this.active=e.first(),s=this.active.children(".ui-menu-item-wrapper"),this._addClass(s,null,"ui-state-active"),this.options.role&&this.element.attr("aria-activedescendant",s.attr("id")),n=this.active.parent().closest(".ui-menu-item").children(".ui-menu-item-wrapper"),this._addClass(n,null,"ui-state-active"),t&&"keydown"===t.type?this._close():this.timer=this._delay(function(){this._close()},this.delay),i=e.children(".ui-menu"),i.length&&t&&/^mouse/.test(t.type)&&this._startOpening(i),this.activeMenu=e.parent(),this._trigger("focus",t,{item:e})},_scrollIntoView:function(e){var i,s,n,o,a,r;this._hasScroll()&&(i=parseFloat(t.css(this.activeMenu[0],"borderTopWidth"))||0,s=parseFloat(t.css(this.activeMenu[0],"paddingTop"))||0,n=e.offset().top-this.activeMenu.offset().top-i-s,o=this.activeMenu.scrollTop(),a=this.activeMenu.height(),r=e.outerHeight(),0>n?this.activeMenu.scrollTop(o+n):n+r>a&&this.activeMenu.scrollTop(o+n-a+r))},blur:function(t,e){e||clearTimeout(this.timer),this.active&&(this._removeClass(this.active.children(".ui-menu-item-wrapper"),null,"ui-state-active"),this._trigger("blur",t,{item:this.active}),this.active=null)},_startOpening:function(t){clearTimeout(this.timer),"true"===t.attr("aria-hidden")&&(this.timer=this._delay(function(){this._close(),this._open(t)},this.delay))},_open:function(e){var i=t.extend({of:this.active},this.options.position);clearTimeout(this.timer),this.element.find(".ui-menu").not(e.parents(".ui-menu")).hide().attr("aria-hidden","true"),e.show().removeAttr("aria-hidden").attr("aria-expanded","true").position(i)},collapseAll:function(e,i){clearTimeout(this.timer),this.timer=this._delay(function(){var s=i?this.element:t(e&&e.target).closest(this.element.find(".ui-menu"));s.length||(s=this.element),this._close(s),this.blur(e),this._removeClass(s.find(".ui-state-active"),null,"ui-state-active"),this.activeMenu=s},this.delay)},_close:function(t){t||(t=this.active?this.active.parent():this.element),t.find(".ui-menu").hide().attr("aria-hidden","true").attr("aria-expanded","false")},_closeOnDocumentClick:function(e){return!t(e.target).closest(".ui-menu").length},_isDivider:function(t){return!/[^\-\u2014\u2013\s]/.test(t.text())},collapse:function(t){var e=this.active&&this.active.parent().closest(".ui-menu-item",this.element);e&&e.length&&(this._close(),this.focus(t,e))},expand:function(t){var e=this.active&&this.active.children(".ui-menu ").find(this.options.items).first();e&&e.length&&(this._open(e.parent()),this._delay(function(){this.focus(t,e)}))},next:function(t){this._move("next","first",t)},previous:function(t){this._move("prev","last",t)},isFirstItem:function(){return this.active&&!this.active.prevAll(".ui-menu-item").length},isLastItem:function(){return this.active&&!this.active.nextAll(".ui-menu-item").length},_move:function(t,e,i){var s;this.active&&(s="first"===t||"last"===t?this.active["first"===t?"prevAll":"nextAll"](".ui-menu-item").eq(-1):this.active[t+"All"](".ui-menu-item").eq(0)),s&&s.length&&this.active||(s=this.activeMenu.find(this.options.items)[e]()),this.focus(i,s)},nextPage:function(e){var i,s,n;return this.active?(this.isLastItem()||(this._hasScroll()?(s=this.active.offset().top,n=this.element.height(),this.active.nextAll(".ui-menu-item").each(function(){return i=t(this),0>i.offset().top-s-n}),this.focus(e,i)):this.focus(e,this.activeMenu.find(this.options.items)[this.active?"last":"first"]())),void 0):(this.next(e),void 0)},previousPage:function(e){var i,s,n;return this.active?(this.isFirstItem()||(this._hasScroll()?(s=this.active.offset().top,n=this.element.height(),this.active.prevAll(".ui-menu-item").each(function(){return i=t(this),i.offset().top-s+n>0}),this.focus(e,i)):this.focus(e,this.activeMenu.find(this.options.items).first())),void 0):(this.next(e),void 0)},_hasScroll:function(){return this.element.outerHeight()<this.element.prop("scrollHeight")},select:function(e){this.active=this.active||t(e.target).closest(".ui-menu-item");var i={item:this.active};this.active.has(".ui-menu").length||this.collapseAll(e,!0),this._trigger("select",e,i)},_filterMenuItems:function(e){var i=e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&"),s=RegExp("^"+i,"i");return this.activeMenu.find(this.options.items).filter(".ui-menu-item").filter(function(){return s.test(t.trim(t(this).children(".ui-menu-item-wrapper").text()))})}}),t.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());var c=!1;t(document).on("mouseup",function(){c=!1}),t.widget("ui.mouse",{version:"1.12.1",options:{cancel:"input, textarea, button, select, option",distance:1,delay:0},_mouseInit:function(){var e=this;this.element.on("mousedown."+this.widgetName,function(t){return e._mouseDown(t)}).on("click."+this.widgetName,function(i){return!0===t.data(i.target,e.widgetName+".preventClickEvent")?(t.removeData(i.target,e.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):void 0}),this.started=!1},_mouseDestroy:function(){this.element.off("."+this.widgetName),this._mouseMoveDelegate&&this.document.off("mousemove."+this.widgetName,this._mouseMoveDelegate).off("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(e){if(!c){this._mouseMoved=!1,this._mouseStarted&&this._mouseUp(e),this._mouseDownEvent=e;var i=this,s=1===e.which,n="string"==typeof this.options.cancel&&e.target.nodeName?t(e.target).closest(this.options.cancel).length:!1;return s&&!n&&this._mouseCapture(e)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){i.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(e)!==!1,!this._mouseStarted)?(e.preventDefault(),!0):(!0===t.data(e.target,this.widgetName+".preventClickEvent")&&t.removeData(e.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(t){return i._mouseMove(t)},this._mouseUpDelegate=function(t){return i._mouseUp(t)},this.document.on("mousemove."+this.widgetName,this._mouseMoveDelegate).on("mouseup."+this.widgetName,this._mouseUpDelegate),e.preventDefault(),c=!0,!0)):!0}},_mouseMove:function(e){if(this._mouseMoved){if(t.ui.ie&&(!document.documentMode||9>document.documentMode)&&!e.button)return this._mouseUp(e);if(!e.which)if(e.originalEvent.altKey||e.originalEvent.ctrlKey||e.originalEvent.metaKey||e.originalEvent.shiftKey)this.ignoreMissingWhich=!0;else if(!this.ignoreMissingWhich)return this._mouseUp(e)}return(e.which||e.button)&&(this._mouseMoved=!0),this._mouseStarted?(this._mouseDrag(e),e.preventDefault()):(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,e)!==!1,this._mouseStarted?this._mouseDrag(e):this._mouseUp(e)),!this._mouseStarted)
},_mouseUp:function(e){this.document.off("mousemove."+this.widgetName,this._mouseMoveDelegate).off("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,e.target===this._mouseDownEvent.target&&t.data(e.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(e)),this._mouseDelayTimer&&(clearTimeout(this._mouseDelayTimer),delete this._mouseDelayTimer),this.ignoreMissingWhich=!1,c=!1,e.preventDefault()},_mouseDistanceMet:function(t){return Math.max(Math.abs(this._mouseDownEvent.pageX-t.pageX),Math.abs(this._mouseDownEvent.pageY-t.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}}),t.widget("ui.selectmenu",[t.ui.formResetMixin,{version:"1.12.1",defaultElement:"<select>",options:{appendTo:null,classes:{"ui-selectmenu-button-open":"ui-corner-top","ui-selectmenu-button-closed":"ui-corner-all"},disabled:null,icons:{button:"ui-icon-triangle-1-s"},position:{my:"left top",at:"left bottom",collision:"none"},width:!1,change:null,close:null,focus:null,open:null,select:null},_create:function(){var e=this.element.uniqueId().attr("id");this.ids={element:e,button:e+"-button",menu:e+"-menu"},this._drawButton(),this._drawMenu(),this._bindFormResetHandler(),this._rendered=!1,this.menuItems=t()},_drawButton:function(){var e,i=this,s=this._parseOption(this.element.find("option:selected"),this.element[0].selectedIndex);this.labels=this.element.labels().attr("for",this.ids.button),this._on(this.labels,{click:function(t){this.button.focus(),t.preventDefault()}}),this.element.hide(),this.button=t("<span>",{tabindex:this.options.disabled?-1:0,id:this.ids.button,role:"combobox","aria-expanded":"false","aria-autocomplete":"list","aria-owns":this.ids.menu,"aria-haspopup":"true",title:this.element.attr("title")}).insertAfter(this.element),this._addClass(this.button,"ui-selectmenu-button ui-selectmenu-button-closed","ui-button ui-widget"),e=t("<span>").appendTo(this.button),this._addClass(e,"ui-selectmenu-icon","ui-icon "+this.options.icons.button),this.buttonItem=this._renderButtonItem(s).appendTo(this.button),this.options.width!==!1&&this._resizeButton(),this._on(this.button,this._buttonEvents),this.button.one("focusin",function(){i._rendered||i._refreshMenu()})},_drawMenu:function(){var e=this;this.menu=t("<ul>",{"aria-hidden":"true","aria-labelledby":this.ids.button,id:this.ids.menu}),this.menuWrap=t("<div>").append(this.menu),this._addClass(this.menuWrap,"ui-selectmenu-menu","ui-front"),this.menuWrap.appendTo(this._appendTo()),this.menuInstance=this.menu.menu({classes:{"ui-menu":"ui-corner-bottom"},role:"listbox",select:function(t,i){t.preventDefault(),e._setSelection(),e._select(i.item.data("ui-selectmenu-item"),t)},focus:function(t,i){var s=i.item.data("ui-selectmenu-item");null!=e.focusIndex&&s.index!==e.focusIndex&&(e._trigger("focus",t,{item:s}),e.isOpen||e._select(s,t)),e.focusIndex=s.index,e.button.attr("aria-activedescendant",e.menuItems.eq(s.index).attr("id"))}}).menu("instance"),this.menuInstance._off(this.menu,"mouseleave"),this.menuInstance._closeOnDocumentClick=function(){return!1},this.menuInstance._isDivider=function(){return!1}},refresh:function(){this._refreshMenu(),this.buttonItem.replaceWith(this.buttonItem=this._renderButtonItem(this._getSelectedItem().data("ui-selectmenu-item")||{})),null===this.options.width&&this._resizeButton()},_refreshMenu:function(){var t,e=this.element.find("option");this.menu.empty(),this._parseOptions(e),this._renderMenu(this.menu,this.items),this.menuInstance.refresh(),this.menuItems=this.menu.find("li").not(".ui-selectmenu-optgroup").find(".ui-menu-item-wrapper"),this._rendered=!0,e.length&&(t=this._getSelectedItem(),this.menuInstance.focus(null,t),this._setAria(t.data("ui-selectmenu-item")),this._setOption("disabled",this.element.prop("disabled")))},open:function(t){this.options.disabled||(this._rendered?(this._removeClass(this.menu.find(".ui-state-active"),null,"ui-state-active"),this.menuInstance.focus(null,this._getSelectedItem())):this._refreshMenu(),this.menuItems.length&&(this.isOpen=!0,this._toggleAttr(),this._resizeMenu(),this._position(),this._on(this.document,this._documentClick),this._trigger("open",t)))},_position:function(){this.menuWrap.position(t.extend({of:this.button},this.options.position))},close:function(t){this.isOpen&&(this.isOpen=!1,this._toggleAttr(),this.range=null,this._off(this.document),this._trigger("close",t))},widget:function(){return this.button},menuWidget:function(){return this.menu},_renderButtonItem:function(e){var i=t("<span>");return this._setText(i,e.label),this._addClass(i,"ui-selectmenu-text"),i},_renderMenu:function(e,i){var s=this,n="";t.each(i,function(i,o){var a;o.optgroup!==n&&(a=t("<li>",{text:o.optgroup}),s._addClass(a,"ui-selectmenu-optgroup","ui-menu-divider"+(o.element.parent("optgroup").prop("disabled")?" ui-state-disabled":"")),a.appendTo(e),n=o.optgroup),s._renderItemData(e,o)})},_renderItemData:function(t,e){return this._renderItem(t,e).data("ui-selectmenu-item",e)},_renderItem:function(e,i){var s=t("<li>"),n=t("<div>",{title:i.element.attr("title")});return i.disabled&&this._addClass(s,null,"ui-state-disabled"),this._setText(n,i.label),s.append(n).appendTo(e)},_setText:function(t,e){e?t.text(e):t.html("&#160;")},_move:function(t,e){var i,s,n=".ui-menu-item";this.isOpen?i=this.menuItems.eq(this.focusIndex).parent("li"):(i=this.menuItems.eq(this.element[0].selectedIndex).parent("li"),n+=":not(.ui-state-disabled)"),s="first"===t||"last"===t?i["first"===t?"prevAll":"nextAll"](n).eq(-1):i[t+"All"](n).eq(0),s.length&&this.menuInstance.focus(e,s)},_getSelectedItem:function(){return this.menuItems.eq(this.element[0].selectedIndex).parent("li")},_toggle:function(t){this[this.isOpen?"close":"open"](t)},_setSelection:function(){var t;this.range&&(window.getSelection?(t=window.getSelection(),t.removeAllRanges(),t.addRange(this.range)):this.range.select(),this.button.focus())},_documentClick:{mousedown:function(e){this.isOpen&&(t(e.target).closest(".ui-selectmenu-menu, #"+t.ui.escapeSelector(this.ids.button)).length||this.close(e))}},_buttonEvents:{mousedown:function(){var t;window.getSelection?(t=window.getSelection(),t.rangeCount&&(this.range=t.getRangeAt(0))):this.range=document.selection.createRange()},click:function(t){this._setSelection(),this._toggle(t)},keydown:function(e){var i=!0;switch(e.keyCode){case t.ui.keyCode.TAB:case t.ui.keyCode.ESCAPE:this.close(e),i=!1;break;case t.ui.keyCode.ENTER:this.isOpen&&this._selectFocusedItem(e);break;case t.ui.keyCode.UP:e.altKey?this._toggle(e):this._move("prev",e);break;case t.ui.keyCode.DOWN:e.altKey?this._toggle(e):this._move("next",e);break;case t.ui.keyCode.SPACE:this.isOpen?this._selectFocusedItem(e):this._toggle(e);break;case t.ui.keyCode.LEFT:this._move("prev",e);break;case t.ui.keyCode.RIGHT:this._move("next",e);break;case t.ui.keyCode.HOME:case t.ui.keyCode.PAGE_UP:this._move("first",e);break;case t.ui.keyCode.END:case t.ui.keyCode.PAGE_DOWN:this._move("last",e);break;default:this.menu.trigger(e),i=!1}i&&e.preventDefault()}},_selectFocusedItem:function(t){var e=this.menuItems.eq(this.focusIndex).parent("li");e.hasClass("ui-state-disabled")||this._select(e.data("ui-selectmenu-item"),t)},_select:function(t,e){var i=this.element[0].selectedIndex;this.element[0].selectedIndex=t.index,this.buttonItem.replaceWith(this.buttonItem=this._renderButtonItem(t)),this._setAria(t),this._trigger("select",e,{item:t}),t.index!==i&&this._trigger("change",e,{item:t}),this.close(e)},_setAria:function(t){var e=this.menuItems.eq(t.index).attr("id");this.button.attr({"aria-labelledby":e,"aria-activedescendant":e}),this.menu.attr("aria-activedescendant",e)},_setOption:function(t,e){if("icons"===t){var i=this.button.find("span.ui-icon");this._removeClass(i,null,this.options.icons.button)._addClass(i,null,e.button)}this._super(t,e),"appendTo"===t&&this.menuWrap.appendTo(this._appendTo()),"width"===t&&this._resizeButton()},_setOptionDisabled:function(t){this._super(t),this.menuInstance.option("disabled",t),this.button.attr("aria-disabled",t),this._toggleClass(this.button,null,"ui-state-disabled",t),this.element.prop("disabled",t),t?(this.button.attr("tabindex",-1),this.close()):this.button.attr("tabindex",0)},_appendTo:function(){var e=this.options.appendTo;return e&&(e=e.jquery||e.nodeType?t(e):this.document.find(e).eq(0)),e&&e[0]||(e=this.element.closest(".ui-front, dialog")),e.length||(e=this.document[0].body),e},_toggleAttr:function(){this.button.attr("aria-expanded",this.isOpen),this._removeClass(this.button,"ui-selectmenu-button-"+(this.isOpen?"closed":"open"))._addClass(this.button,"ui-selectmenu-button-"+(this.isOpen?"open":"closed"))._toggleClass(this.menuWrap,"ui-selectmenu-open",null,this.isOpen),this.menu.attr("aria-hidden",!this.isOpen)},_resizeButton:function(){var t=this.options.width;return t===!1?(this.button.css("width",""),void 0):(null===t&&(t=this.element.show().outerWidth(),this.element.hide()),this.button.outerWidth(t),void 0)},_resizeMenu:function(){this.menu.outerWidth(Math.max(this.button.outerWidth(),this.menu.width("").outerWidth()+1))},_getCreateOptions:function(){var t=this._super();return t.disabled=this.element.prop("disabled"),t},_parseOptions:function(e){var i=this,s=[];e.each(function(e,n){s.push(i._parseOption(t(n),e))}),this.items=s},_parseOption:function(t,e){var i=t.parent("optgroup");return{element:t,index:e,value:t.val(),label:t.text(),optgroup:i.attr("label")||"",disabled:i.prop("disabled")||t.prop("disabled")}},_destroy:function(){this._unbindFormResetHandler(),this.menuWrap.remove(),this.button.remove(),this.element.show(),this.element.removeUniqueId(),this.labels.attr("for",this.ids.element)}}]),t.widget("ui.slider",t.ui.mouse,{version:"1.12.1",widgetEventPrefix:"slide",options:{animate:!1,classes:{"ui-slider":"ui-corner-all","ui-slider-handle":"ui-corner-all","ui-slider-range":"ui-corner-all ui-widget-header"},distance:0,max:100,min:0,orientation:"horizontal",range:!1,step:1,value:0,values:null,change:null,slide:null,start:null,stop:null},numPages:5,_create:function(){this._keySliding=!1,this._mouseSliding=!1,this._animateOff=!0,this._handleIndex=null,this._detectOrientation(),this._mouseInit(),this._calculateNewMax(),this._addClass("ui-slider ui-slider-"+this.orientation,"ui-widget ui-widget-content"),this._refresh(),this._animateOff=!1},_refresh:function(){this._createRange(),this._createHandles(),this._setupEvents(),this._refreshValue()},_createHandles:function(){var e,i,s=this.options,n=this.element.find(".ui-slider-handle"),o="<span tabindex='0'></span>",a=[];for(i=s.values&&s.values.length||1,n.length>i&&(n.slice(i).remove(),n=n.slice(0,i)),e=n.length;i>e;e++)a.push(o);this.handles=n.add(t(a.join("")).appendTo(this.element)),this._addClass(this.handles,"ui-slider-handle","ui-state-default"),this.handle=this.handles.eq(0),this.handles.each(function(e){t(this).data("ui-slider-handle-index",e).attr("tabIndex",0)})},_createRange:function(){var e=this.options;e.range?(e.range===!0&&(e.values?e.values.length&&2!==e.values.length?e.values=[e.values[0],e.values[0]]:t.isArray(e.values)&&(e.values=e.values.slice(0)):e.values=[this._valueMin(),this._valueMin()]),this.range&&this.range.length?(this._removeClass(this.range,"ui-slider-range-min ui-slider-range-max"),this.range.css({left:"",bottom:""})):(this.range=t("<div>").appendTo(this.element),this._addClass(this.range,"ui-slider-range")),("min"===e.range||"max"===e.range)&&this._addClass(this.range,"ui-slider-range-"+e.range)):(this.range&&this.range.remove(),this.range=null)},_setupEvents:function(){this._off(this.handles),this._on(this.handles,this._handleEvents),this._hoverable(this.handles),this._focusable(this.handles)},_destroy:function(){this.handles.remove(),this.range&&this.range.remove(),this._mouseDestroy()},_mouseCapture:function(e){var i,s,n,o,a,r,l,h,c=this,u=this.options;return u.disabled?!1:(this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()},this.elementOffset=this.element.offset(),i={x:e.pageX,y:e.pageY},s=this._normValueFromMouse(i),n=this._valueMax()-this._valueMin()+1,this.handles.each(function(e){var i=Math.abs(s-c.values(e));(n>i||n===i&&(e===c._lastChangedValue||c.values(e)===u.min))&&(n=i,o=t(this),a=e)}),r=this._start(e,a),r===!1?!1:(this._mouseSliding=!0,this._handleIndex=a,this._addClass(o,null,"ui-state-active"),o.trigger("focus"),l=o.offset(),h=!t(e.target).parents().addBack().is(".ui-slider-handle"),this._clickOffset=h?{left:0,top:0}:{left:e.pageX-l.left-o.width()/2,top:e.pageY-l.top-o.height()/2-(parseInt(o.css("borderTopWidth"),10)||0)-(parseInt(o.css("borderBottomWidth"),10)||0)+(parseInt(o.css("marginTop"),10)||0)},this.handles.hasClass("ui-state-hover")||this._slide(e,a,s),this._animateOff=!0,!0))},_mouseStart:function(){return!0},_mouseDrag:function(t){var e={x:t.pageX,y:t.pageY},i=this._normValueFromMouse(e);return this._slide(t,this._handleIndex,i),!1},_mouseStop:function(t){return this._removeClass(this.handles,null,"ui-state-active"),this._mouseSliding=!1,this._stop(t,this._handleIndex),this._change(t,this._handleIndex),this._handleIndex=null,this._clickOffset=null,this._animateOff=!1,!1},_detectOrientation:function(){this.orientation="vertical"===this.options.orientation?"vertical":"horizontal"},_normValueFromMouse:function(t){var e,i,s,n,o;return"horizontal"===this.orientation?(e=this.elementSize.width,i=t.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)):(e=this.elementSize.height,i=t.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)),s=i/e,s>1&&(s=1),0>s&&(s=0),"vertical"===this.orientation&&(s=1-s),n=this._valueMax()-this._valueMin(),o=this._valueMin()+s*n,this._trimAlignValue(o)},_uiHash:function(t,e,i){var s={handle:this.handles[t],handleIndex:t,value:void 0!==e?e:this.value()};return this._hasMultipleValues()&&(s.value=void 0!==e?e:this.values(t),s.values=i||this.values()),s},_hasMultipleValues:function(){return this.options.values&&this.options.values.length},_start:function(t,e){return this._trigger("start",t,this._uiHash(e))},_slide:function(t,e,i){var s,n,o=this.value(),a=this.values();this._hasMultipleValues()&&(n=this.values(e?0:1),o=this.values(e),2===this.options.values.length&&this.options.range===!0&&(i=0===e?Math.min(n,i):Math.max(n,i)),a[e]=i),i!==o&&(s=this._trigger("slide",t,this._uiHash(e,i,a)),s!==!1&&(this._hasMultipleValues()?this.values(e,i):this.value(i)))},_stop:function(t,e){this._trigger("stop",t,this._uiHash(e))},_change:function(t,e){this._keySliding||this._mouseSliding||(this._lastChangedValue=e,this._trigger("change",t,this._uiHash(e)))},value:function(t){return arguments.length?(this.options.value=this._trimAlignValue(t),this._refreshValue(),this._change(null,0),void 0):this._value()},values:function(e,i){var s,n,o;if(arguments.length>1)return this.options.values[e]=this._trimAlignValue(i),this._refreshValue(),this._change(null,e),void 0;if(!arguments.length)return this._values();if(!t.isArray(arguments[0]))return this._hasMultipleValues()?this._values(e):this.value();for(s=this.options.values,n=arguments[0],o=0;s.length>o;o+=1)s[o]=this._trimAlignValue(n[o]),this._change(null,o);this._refreshValue()},_setOption:function(e,i){var s,n=0;switch("range"===e&&this.options.range===!0&&("min"===i?(this.options.value=this._values(0),this.options.values=null):"max"===i&&(this.options.value=this._values(this.options.values.length-1),this.options.values=null)),t.isArray(this.options.values)&&(n=this.options.values.length),this._super(e,i),e){case"orientation":this._detectOrientation(),this._removeClass("ui-slider-horizontal ui-slider-vertical")._addClass("ui-slider-"+this.orientation),this._refreshValue(),this.options.range&&this._refreshRange(i),this.handles.css("horizontal"===i?"bottom":"left","");break;case"value":this._animateOff=!0,this._refreshValue(),this._change(null,0),this._animateOff=!1;break;case"values":for(this._animateOff=!0,this._refreshValue(),s=n-1;s>=0;s--)this._change(null,s);this._animateOff=!1;break;case"step":case"min":case"max":this._animateOff=!0,this._calculateNewMax(),this._refreshValue(),this._animateOff=!1;break;case"range":this._animateOff=!0,this._refresh(),this._animateOff=!1}},_setOptionDisabled:function(t){this._super(t),this._toggleClass(null,"ui-state-disabled",!!t)},_value:function(){var t=this.options.value;return t=this._trimAlignValue(t)},_values:function(t){var e,i,s;if(arguments.length)return e=this.options.values[t],e=this._trimAlignValue(e);if(this._hasMultipleValues()){for(i=this.options.values.slice(),s=0;i.length>s;s+=1)i[s]=this._trimAlignValue(i[s]);return i}return[]},_trimAlignValue:function(t){if(this._valueMin()>=t)return this._valueMin();if(t>=this._valueMax())return this._valueMax();var e=this.options.step>0?this.options.step:1,i=(t-this._valueMin())%e,s=t-i;return 2*Math.abs(i)>=e&&(s+=i>0?e:-e),parseFloat(s.toFixed(5))},_calculateNewMax:function(){var t=this.options.max,e=this._valueMin(),i=this.options.step,s=Math.round((t-e)/i)*i;t=s+e,t>this.options.max&&(t-=i),this.max=parseFloat(t.toFixed(this._precision()))},_precision:function(){var t=this._precisionOf(this.options.step);return null!==this.options.min&&(t=Math.max(t,this._precisionOf(this.options.min))),t},_precisionOf:function(t){var e=""+t,i=e.indexOf(".");return-1===i?0:e.length-i-1},_valueMin:function(){return this.options.min},_valueMax:function(){return this.max},_refreshRange:function(t){"vertical"===t&&this.range.css({width:"",left:""}),"horizontal"===t&&this.range.css({height:"",bottom:""})},_refreshValue:function(){var e,i,s,n,o,a=this.options.range,r=this.options,l=this,h=this._animateOff?!1:r.animate,c={};this._hasMultipleValues()?this.handles.each(function(s){i=100*((l.values(s)-l._valueMin())/(l._valueMax()-l._valueMin())),c["horizontal"===l.orientation?"left":"bottom"]=i+"%",t(this).stop(1,1)[h?"animate":"css"](c,r.animate),l.options.range===!0&&("horizontal"===l.orientation?(0===s&&l.range.stop(1,1)[h?"animate":"css"]({left:i+"%"},r.animate),1===s&&l.range[h?"animate":"css"]({width:i-e+"%"},{queue:!1,duration:r.animate})):(0===s&&l.range.stop(1,1)[h?"animate":"css"]({bottom:i+"%"},r.animate),1===s&&l.range[h?"animate":"css"]({height:i-e+"%"},{queue:!1,duration:r.animate}))),e=i}):(s=this.value(),n=this._valueMin(),o=this._valueMax(),i=o!==n?100*((s-n)/(o-n)):0,c["horizontal"===this.orientation?"left":"bottom"]=i+"%",this.handle.stop(1,1)[h?"animate":"css"](c,r.animate),"min"===a&&"horizontal"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({width:i+"%"},r.animate),"max"===a&&"horizontal"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({width:100-i+"%"},r.animate),"min"===a&&"vertical"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({height:i+"%"},r.animate),"max"===a&&"vertical"===this.orientation&&this.range.stop(1,1)[h?"animate":"css"]({height:100-i+"%"},r.animate))},_handleEvents:{keydown:function(e){var i,s,n,o,a=t(e.target).data("ui-slider-handle-index");switch(e.keyCode){case t.ui.keyCode.HOME:case t.ui.keyCode.END:case t.ui.keyCode.PAGE_UP:case t.ui.keyCode.PAGE_DOWN:case t.ui.keyCode.UP:case t.ui.keyCode.RIGHT:case t.ui.keyCode.DOWN:case t.ui.keyCode.LEFT:if(e.preventDefault(),!this._keySliding&&(this._keySliding=!0,this._addClass(t(e.target),null,"ui-state-active"),i=this._start(e,a),i===!1))return}switch(o=this.options.step,s=n=this._hasMultipleValues()?this.values(a):this.value(),e.keyCode){case t.ui.keyCode.HOME:n=this._valueMin();break;case t.ui.keyCode.END:n=this._valueMax();break;case t.ui.keyCode.PAGE_UP:n=this._trimAlignValue(s+(this._valueMax()-this._valueMin())/this.numPages);break;case t.ui.keyCode.PAGE_DOWN:n=this._trimAlignValue(s-(this._valueMax()-this._valueMin())/this.numPages);break;case t.ui.keyCode.UP:case t.ui.keyCode.RIGHT:if(s===this._valueMax())return;n=this._trimAlignValue(s+o);break;case t.ui.keyCode.DOWN:case t.ui.keyCode.LEFT:if(s===this._valueMin())return;n=this._trimAlignValue(s-o)}this._slide(e,a,n)},keyup:function(e){var i=t(e.target).data("ui-slider-handle-index");this._keySliding&&(this._keySliding=!1,this._stop(e,i),this._change(e,i),this._removeClass(t(e.target),null,"ui-state-active"))}}})});
/**
 * jQuery JSON plugin 2.4.0
 *
 * @author Brantley Harris, 2009-2011
 * @author Timo Tijhof, 2011-2014
 * @source This plugin is heavily influenced by MochiKit's serializeJSON, which is
 *         copyrighted 2005 by Bob Ippolito.
 * @source Brantley Harris wrote this plugin. It is based somewhat on the JSON.org
 *         website's http://www.json.org/json2.js, which proclaims:
 *         "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 *         I uphold.
 * @license MIT License <http://opensource.org/licenses/MIT>
 */
(function ($) {
    'use strict';

    var escape = /["\\\x00-\x1f\x7f-\x9f]/g,
        meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        hasOwn = Object.prototype.hasOwnProperty;

    /**
     * jQuery.toJSON
     * Converts the given argument into a JSON representation.
     *
     * @param o {Mixed} The json-serializable *thing* to be converted
     *
     * If an object has a toJSON prototype, that will be used to get the representation.
     * Non-integer/string keys are skipped in the object, as are keys that point to a
     * function.
     *
     */
    $.toJSON = typeof JSON === 'object' && JSON.stringify ? JSON.stringify : function (o) {
        if (o === null) {
            return 'null';
        }

        var pairs, k, name, val,
            type = $.type(o);

        if (type === 'undefined') {
            return undefined;
        }

        // Also covers instantiated Number and Boolean objects,
        // which are typeof 'object' but thanks to $.type, we
        // catch them here. I don't know whether it is right
        // or wrong that instantiated primitives are not
        // exported to JSON as an {"object":..}.
        // We choose this path because that's what the browsers did.
        if (type === 'number' || type === 'boolean') {
            return String(o);
        }
        if (type === 'string') {
            return $.quoteString(o);
        }
        if (typeof o.toJSON === 'function') {
            return $.toJSON(o.toJSON());
        }
        if (type === 'date') {
            var month = o.getUTCMonth() + 1,
                day = o.getUTCDate(),
                year = o.getUTCFullYear(),
                hours = o.getUTCHours(),
                minutes = o.getUTCMinutes(),
                seconds = o.getUTCSeconds(),
                milli = o.getUTCMilliseconds();

            if (month < 10) {
                month = '0' + month;
            }
            if (day < 10) {
                day = '0' + day;
            }
            if (hours < 10) {
                hours = '0' + hours;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            if (milli < 100) {
                milli = '0' + milli;
            }
            if (milli < 10) {
                milli = '0' + milli;
            }
            return '"' + year + '-' + month + '-' + day + 'T' +
                hours + ':' + minutes + ':' + seconds +
                '.' + milli + 'Z"';
        }

        pairs = [];

        if ($.isArray(o)) {
            for (k = 0; k < o.length; k++) {
                pairs.push($.toJSON(o[k]) || 'null');
            }
            return '[' + pairs.join(',') + ']';
        }

        // Any other object (plain object, RegExp, ..)
        // Need to do typeof instead of $.type, because we also
        // want to catch non-plain objects.
        if (typeof o === 'object') {
            for (k in o) {
                // Only include own properties,
                // Filter out inherited prototypes
                if (hasOwn.call(o, k)) {
                    // Keys must be numerical or string. Skip others
                    type = typeof k;
                    if (type === 'number') {
                        name = '"' + k + '"';
                    } else if (type === 'string') {
                        name = $.quoteString(k);
                    } else {
                        continue;
                    }
                    type = typeof o[k];

                    // Invalid values like these return undefined
                    // from toJSON, however those object members
                    // shouldn't be included in the JSON string at all.
                    if (type !== 'function' && type !== 'undefined') {
                        val = $.toJSON(o[k]);
                        pairs.push(name + ':' + val);
                    }
                }
            }
            return '{' + pairs.join(',') + '}';
        }
    };

    /**
     * jQuery.evalJSON
     * Evaluates a given json string.
     *
     * @param str {String}
     */
    $.evalJSON = typeof JSON === 'object' && JSON.parse ? JSON.parse : function (str) {
        /*jshint evil: true */
        return eval('(' + str + ')');
    };

    /**
     * jQuery.secureEvalJSON
     * Evals JSON in a way that is *more* secure.
     *
     * @param str {String}
     */
    $.secureEvalJSON = typeof JSON === 'object' && JSON.parse ? JSON.parse : function (str) {
        var filtered =
            str
                .replace(/\\["\\\/bfnrtu]/g, '@')
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                .replace(/(?:^|:|,)(?:\s*\[)+/g, '');

        if (/^[\],:{}\s]*$/.test(filtered)) {
            /*jshint evil: true */
            return eval('(' + str + ')');
        }
        throw new SyntaxError('Error parsing JSON, source is not valid.');
    };

    /**
     * jQuery.quoteString
     * Returns a string-repr of a string, escaping quotes intelligently.
     * Mostly a support function for toJSON.
     * Examples:
     * >>> jQuery.quoteString('apple')
     * "apple"
     *
     * >>> jQuery.quoteString('"Where are we going?", she asked.')
     * "\"Where are we going?\", she asked."
     */
    $.quoteString = function (str) {
        if (str.match(escape)) {
            return '"' + str.replace(escape, function (a) {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"';
        }
        return '"' + str + '"';
    };

}(jQuery));
/**
 * Swiper 4.1.6
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * http://www.idangero.us/swiper/
 *
 * Copyright 2014-2018 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: February 11, 2018
 */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.Swiper=t()}(this,function(){"use strict";var e="undefined"==typeof document?{body:{},addEventListener:function(){},removeEventListener:function(){},activeElement:{blur:function(){},nodeName:""},querySelector:function(){return null},querySelectorAll:function(){return[]},getElementById:function(){return null},createEvent:function(){return{initEvent:function(){}}},createElement:function(){return{children:[],childNodes:[],style:{},setAttribute:function(){},getElementsByTagName:function(){return[]}}},location:{hash:""}}:document,t="undefined"==typeof window?{document:e,navigator:{userAgent:""},location:{},history:{},CustomEvent:function(){return this},addEventListener:function(){},removeEventListener:function(){},getComputedStyle:function(){return{getPropertyValue:function(){return""}}},Image:function(){},Date:function(){},screen:{},setTimeout:function(){},clearTimeout:function(){}}:window,i=function(e){for(var t=0;t<e.length;t+=1)this[t]=e[t];return this.length=e.length,this};function s(s,a){var r=[],n=0;if(s&&!a&&s instanceof i)return s;if(s)if("string"==typeof s){var o,l,d=s.trim();if(d.indexOf("<")>=0&&d.indexOf(">")>=0){var h="div";for(0===d.indexOf("<li")&&(h="ul"),0===d.indexOf("<tr")&&(h="tbody"),0!==d.indexOf("<td")&&0!==d.indexOf("<th")||(h="tr"),0===d.indexOf("<tbody")&&(h="table"),0===d.indexOf("<option")&&(h="select"),(l=e.createElement(h)).innerHTML=d,n=0;n<l.childNodes.length;n+=1)r.push(l.childNodes[n])}else for(o=a||"#"!==s[0]||s.match(/[ .<>:~]/)?(a||e).querySelectorAll(s.trim()):[e.getElementById(s.trim().split("#")[1])],n=0;n<o.length;n+=1)o[n]&&r.push(o[n])}else if(s.nodeType||s===t||s===e)r.push(s);else if(s.length>0&&s[0].nodeType)for(n=0;n<s.length;n+=1)r.push(s[n]);return new i(r)}function a(e){for(var t=[],i=0;i<e.length;i+=1)-1===t.indexOf(e[i])&&t.push(e[i]);return t}s.fn=i.prototype,s.Class=i,s.Dom7=i;"resize scroll".split(" ");var r={addClass:function(e){if(void 0===e)return this;for(var t=e.split(" "),i=0;i<t.length;i+=1)for(var s=0;s<this.length;s+=1)void 0!==this[s].classList&&this[s].classList.add(t[i]);return this},removeClass:function(e){for(var t=e.split(" "),i=0;i<t.length;i+=1)for(var s=0;s<this.length;s+=1)void 0!==this[s].classList&&this[s].classList.remove(t[i]);return this},hasClass:function(e){return!!this[0]&&this[0].classList.contains(e)},toggleClass:function(e){for(var t=e.split(" "),i=0;i<t.length;i+=1)for(var s=0;s<this.length;s+=1)void 0!==this[s].classList&&this[s].classList.toggle(t[i]);return this},attr:function(e,t){var i=arguments;if(1===arguments.length&&"string"==typeof e)return this[0]?this[0].getAttribute(e):void 0;for(var s=0;s<this.length;s+=1)if(2===i.length)this[s].setAttribute(e,t);else for(var a in e)this[s][a]=e[a],this[s].setAttribute(a,e[a]);return this},removeAttr:function(e){for(var t=0;t<this.length;t+=1)this[t].removeAttribute(e);return this},data:function(e,t){var i;if(void 0!==t){for(var s=0;s<this.length;s+=1)(i=this[s]).dom7ElementDataStorage||(i.dom7ElementDataStorage={}),i.dom7ElementDataStorage[e]=t;return this}if(i=this[0]){if(i.dom7ElementDataStorage&&e in i.dom7ElementDataStorage)return i.dom7ElementDataStorage[e];var a=i.getAttribute("data-"+e);return a||void 0}},transform:function(e){for(var t=0;t<this.length;t+=1){var i=this[t].style;i.webkitTransform=e,i.transform=e}return this},transition:function(e){"string"!=typeof e&&(e+="ms");for(var t=0;t<this.length;t+=1){var i=this[t].style;i.webkitTransitionDuration=e,i.transitionDuration=e}return this},on:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var i,a=e[0],r=e[1],n=e[2],o=e[3];function l(e){var t=e.target;if(t){var i=e.target.dom7EventData||[];if(i.unshift(e),s(t).is(r))n.apply(t,i);else for(var a=s(t).parents(),o=0;o<a.length;o+=1)s(a[o]).is(r)&&n.apply(a[o],i)}}function d(e){var t=e&&e.target?e.target.dom7EventData||[]:[];t.unshift(e),n.apply(this,t)}"function"==typeof e[1]&&(a=(i=e)[0],n=i[1],o=i[2],r=void 0),o||(o=!1);for(var h,p=a.split(" "),c=0;c<this.length;c+=1){var u=this[c];if(r)for(h=0;h<p.length;h+=1)u.dom7LiveListeners||(u.dom7LiveListeners=[]),u.dom7LiveListeners.push({type:a,listener:n,proxyListener:l}),u.addEventListener(p[h],l,o);else for(h=0;h<p.length;h+=1)u.dom7Listeners||(u.dom7Listeners=[]),u.dom7Listeners.push({type:a,listener:n,proxyListener:d}),u.addEventListener(p[h],d,o)}return this},off:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var i,s=e[0],a=e[1],r=e[2],n=e[3];"function"==typeof e[1]&&(s=(i=e)[0],r=i[1],n=i[2],a=void 0),n||(n=!1);for(var o=s.split(" "),l=0;l<o.length;l+=1)for(var d=0;d<this.length;d+=1){var h=this[d];if(a){if(h.dom7LiveListeners)for(var p=0;p<h.dom7LiveListeners.length;p+=1)r?h.dom7LiveListeners[p].listener===r&&h.removeEventListener(o[l],h.dom7LiveListeners[p].proxyListener,n):h.dom7LiveListeners[p].type===o[l]&&h.removeEventListener(o[l],h.dom7LiveListeners[p].proxyListener,n)}else if(h.dom7Listeners)for(var c=0;c<h.dom7Listeners.length;c+=1)r?h.dom7Listeners[c].listener===r&&h.removeEventListener(o[l],h.dom7Listeners[c].proxyListener,n):h.dom7Listeners[c].type===o[l]&&h.removeEventListener(o[l],h.dom7Listeners[c].proxyListener,n)}return this},trigger:function(){for(var i=[],s=arguments.length;s--;)i[s]=arguments[s];for(var a=i[0].split(" "),r=i[1],n=0;n<a.length;n+=1)for(var o=0;o<this.length;o+=1){var l=void 0;try{l=new t.CustomEvent(a[n],{detail:r,bubbles:!0,cancelable:!0})}catch(t){(l=e.createEvent("Event")).initEvent(a[n],!0,!0),l.detail=r}this[o].dom7EventData=i.filter(function(e,t){return t>0}),this[o].dispatchEvent(l),this[o].dom7EventData=[],delete this[o].dom7EventData}return this},transitionEnd:function(e){var t,i=["webkitTransitionEnd","transitionend"],s=this;function a(r){if(r.target===this)for(e.call(this,r),t=0;t<i.length;t+=1)s.off(i[t],a)}if(e)for(t=0;t<i.length;t+=1)s.on(i[t],a);return this},outerWidth:function(e){if(this.length>0){if(e){var t=this.styles();return this[0].offsetWidth+parseFloat(t.getPropertyValue("margin-right"))+parseFloat(t.getPropertyValue("margin-left"))}return this[0].offsetWidth}return null},outerHeight:function(e){if(this.length>0){if(e){var t=this.styles();return this[0].offsetHeight+parseFloat(t.getPropertyValue("margin-top"))+parseFloat(t.getPropertyValue("margin-bottom"))}return this[0].offsetHeight}return null},offset:function(){if(this.length>0){var i=this[0],s=i.getBoundingClientRect(),a=e.body,r=i.clientTop||a.clientTop||0,n=i.clientLeft||a.clientLeft||0,o=i===t?t.scrollY:i.scrollTop,l=i===t?t.scrollX:i.scrollLeft;return{top:s.top+o-r,left:s.left+l-n}}return null},css:function(e,i){var s;if(1===arguments.length){if("string"!=typeof e){for(s=0;s<this.length;s+=1)for(var a in e)this[s].style[a]=e[a];return this}if(this[0])return t.getComputedStyle(this[0],null).getPropertyValue(e)}if(2===arguments.length&&"string"==typeof e){for(s=0;s<this.length;s+=1)this[s].style[e]=i;return this}return this},each:function(e){if(!e)return this;for(var t=0;t<this.length;t+=1)if(!1===e.call(this[t],t,this[t]))return this;return this},html:function(e){if(void 0===e)return this[0]?this[0].innerHTML:void 0;for(var t=0;t<this.length;t+=1)this[t].innerHTML=e;return this},text:function(e){if(void 0===e)return this[0]?this[0].textContent.trim():null;for(var t=0;t<this.length;t+=1)this[t].textContent=e;return this},is:function(a){var r,n,o=this[0];if(!o||void 0===a)return!1;if("string"==typeof a){if(o.matches)return o.matches(a);if(o.webkitMatchesSelector)return o.webkitMatchesSelector(a);if(o.msMatchesSelector)return o.msMatchesSelector(a);for(r=s(a),n=0;n<r.length;n+=1)if(r[n]===o)return!0;return!1}if(a===e)return o===e;if(a===t)return o===t;if(a.nodeType||a instanceof i){for(r=a.nodeType?[a]:a,n=0;n<r.length;n+=1)if(r[n]===o)return!0;return!1}return!1},index:function(){var e,t=this[0];if(t){for(e=0;null!==(t=t.previousSibling);)1===t.nodeType&&(e+=1);return e}},eq:function(e){if(void 0===e)return this;var t,s=this.length;return new i(e>s-1?[]:e<0?(t=s+e)<0?[]:[this[t]]:[this[e]])},append:function(){for(var t,s=[],a=arguments.length;a--;)s[a]=arguments[a];for(var r=0;r<s.length;r+=1){t=s[r];for(var n=0;n<this.length;n+=1)if("string"==typeof t){var o=e.createElement("div");for(o.innerHTML=t;o.firstChild;)this[n].appendChild(o.firstChild)}else if(t instanceof i)for(var l=0;l<t.length;l+=1)this[n].appendChild(t[l]);else this[n].appendChild(t)}return this},prepend:function(t){var s,a;for(s=0;s<this.length;s+=1)if("string"==typeof t){var r=e.createElement("div");for(r.innerHTML=t,a=r.childNodes.length-1;a>=0;a-=1)this[s].insertBefore(r.childNodes[a],this[s].childNodes[0])}else if(t instanceof i)for(a=0;a<t.length;a+=1)this[s].insertBefore(t[a],this[s].childNodes[0]);else this[s].insertBefore(t,this[s].childNodes[0]);return this},next:function(e){return this.length>0?e?this[0].nextElementSibling&&s(this[0].nextElementSibling).is(e)?new i([this[0].nextElementSibling]):new i([]):this[0].nextElementSibling?new i([this[0].nextElementSibling]):new i([]):new i([])},nextAll:function(e){var t=[],a=this[0];if(!a)return new i([]);for(;a.nextElementSibling;){var r=a.nextElementSibling;e?s(r).is(e)&&t.push(r):t.push(r),a=r}return new i(t)},prev:function(e){if(this.length>0){var t=this[0];return e?t.previousElementSibling&&s(t.previousElementSibling).is(e)?new i([t.previousElementSibling]):new i([]):t.previousElementSibling?new i([t.previousElementSibling]):new i([])}return new i([])},prevAll:function(e){var t=[],a=this[0];if(!a)return new i([]);for(;a.previousElementSibling;){var r=a.previousElementSibling;e?s(r).is(e)&&t.push(r):t.push(r),a=r}return new i(t)},parent:function(e){for(var t=[],i=0;i<this.length;i+=1)null!==this[i].parentNode&&(e?s(this[i].parentNode).is(e)&&t.push(this[i].parentNode):t.push(this[i].parentNode));return s(a(t))},parents:function(e){for(var t=[],i=0;i<this.length;i+=1)for(var r=this[i].parentNode;r;)e?s(r).is(e)&&t.push(r):t.push(r),r=r.parentNode;return s(a(t))},closest:function(e){var t=this;return void 0===e?new i([]):(t.is(e)||(t=t.parents(e).eq(0)),t)},find:function(e){for(var t=[],s=0;s<this.length;s+=1)for(var a=this[s].querySelectorAll(e),r=0;r<a.length;r+=1)t.push(a[r]);return new i(t)},children:function(e){for(var t=[],r=0;r<this.length;r+=1)for(var n=this[r].childNodes,o=0;o<n.length;o+=1)e?1===n[o].nodeType&&s(n[o]).is(e)&&t.push(n[o]):1===n[o].nodeType&&t.push(n[o]);return new i(a(t))},remove:function(){for(var e=0;e<this.length;e+=1)this[e].parentNode&&this[e].parentNode.removeChild(this[e]);return this},add:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var i,a;for(i=0;i<e.length;i+=1){var r=s(e[i]);for(a=0;a<r.length;a+=1)this[this.length]=r[a],this.length+=1}return this},styles:function(){return this[0]?t.getComputedStyle(this[0],null):{}}};Object.keys(r).forEach(function(e){s.fn[e]=r[e]});var n,o,l,d={deleteProps:function(e){var t=e;Object.keys(t).forEach(function(e){try{t[e]=null}catch(e){}try{delete t[e]}catch(e){}})},nextTick:function(e,t){return void 0===t&&(t=0),setTimeout(e,t)},now:function(){return Date.now()},getTranslate:function(e,i){var s,a,r;void 0===i&&(i="x");var n=t.getComputedStyle(e,null);return t.WebKitCSSMatrix?((a=n.transform||n.webkitTransform).split(",").length>6&&(a=a.split(", ").map(function(e){return e.replace(",",".")}).join(", ")),r=new t.WebKitCSSMatrix("none"===a?"":a)):s=(r=n.MozTransform||n.OTransform||n.MsTransform||n.msTransform||n.transform||n.getPropertyValue("transform").replace("translate(","matrix(1, 0, 0, 1,")).toString().split(","),"x"===i&&(a=t.WebKitCSSMatrix?r.m41:16===s.length?parseFloat(s[12]):parseFloat(s[4])),"y"===i&&(a=t.WebKitCSSMatrix?r.m42:16===s.length?parseFloat(s[13]):parseFloat(s[5])),a||0},parseUrlQuery:function(e){var i,s,a,r,n={},o=e||t.location.href;if("string"==typeof o&&o.length)for(r=(s=(o=o.indexOf("?")>-1?o.replace(/\S*\?/,""):"").split("&").filter(function(e){return""!==e})).length,i=0;i<r;i+=1)a=s[i].replace(/#\S+/g,"").split("="),n[decodeURIComponent(a[0])]=void 0===a[1]?void 0:decodeURIComponent(a[1])||"";return n},isObject:function(e){return"object"==typeof e&&null!==e&&e.constructor&&e.constructor===Object},extend:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];for(var i=Object(e[0]),s=1;s<e.length;s+=1){var a=e[s];if(void 0!==a&&null!==a)for(var r=Object.keys(Object(a)),n=0,o=r.length;n<o;n+=1){var l=r[n],h=Object.getOwnPropertyDescriptor(a,l);void 0!==h&&h.enumerable&&(d.isObject(i[l])&&d.isObject(a[l])?d.extend(i[l],a[l]):!d.isObject(i[l])&&d.isObject(a[l])?(i[l]={},d.extend(i[l],a[l])):i[l]=a[l])}}return i}},h=(l=e.createElement("div"),{touch:t.Modernizr&&!0===t.Modernizr.touch||!!("ontouchstart"in t||t.DocumentTouch&&e instanceof t.DocumentTouch),pointerEvents:!(!t.navigator.pointerEnabled&&!t.PointerEvent),prefixedPointerEvents:!!t.navigator.msPointerEnabled,transition:(o=l.style,"transition"in o||"webkitTransition"in o||"MozTransition"in o),transforms3d:t.Modernizr&&!0===t.Modernizr.csstransforms3d||(n=l.style,"webkitPerspective"in n||"MozPerspective"in n||"OPerspective"in n||"MsPerspective"in n||"perspective"in n),flexbox:function(){for(var e=l.style,t="alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient".split(" "),i=0;i<t.length;i+=1)if(t[i]in e)return!0;return!1}(),observer:"MutationObserver"in t||"WebkitMutationObserver"in t,passiveListener:function(){var e=!1;try{var i=Object.defineProperty({},"passive",{get:function(){e=!0}});t.addEventListener("testPassiveListener",null,i)}catch(e){}return e}(),gestures:"ongesturestart"in t}),p=function(e){void 0===e&&(e={});var t=this;t.params=e,t.eventsListeners={},t.params&&t.params.on&&Object.keys(t.params.on).forEach(function(e){t.on(e,t.params.on[e])})},c={components:{configurable:!0}};p.prototype.on=function(e,t){var i=this;return"function"!=typeof t?i:(e.split(" ").forEach(function(e){i.eventsListeners[e]||(i.eventsListeners[e]=[]),i.eventsListeners[e].push(t)}),i)},p.prototype.once=function(e,t){var i=this;if("function"!=typeof t)return i;return i.on(e,function s(){for(var a=[],r=arguments.length;r--;)a[r]=arguments[r];t.apply(i,a),i.off(e,s)})},p.prototype.off=function(e,t){var i=this;return e.split(" ").forEach(function(e){void 0===t?i.eventsListeners[e]=[]:i.eventsListeners[e].forEach(function(s,a){s===t&&i.eventsListeners[e].splice(a,1)})}),i},p.prototype.emit=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var i,s,a,r=this;return r.eventsListeners?("string"==typeof e[0]||Array.isArray(e[0])?(i=e[0],s=e.slice(1,e.length),a=r):(i=e[0].events,s=e[0].data,a=e[0].context||r),(Array.isArray(i)?i:i.split(" ")).forEach(function(e){if(r.eventsListeners[e]){var t=[];r.eventsListeners[e].forEach(function(e){t.push(e)}),t.forEach(function(e){e.apply(a,s)})}}),r):r},p.prototype.useModulesParams=function(e){var t=this;t.modules&&Object.keys(t.modules).forEach(function(i){var s=t.modules[i];s.params&&d.extend(e,s.params)})},p.prototype.useModules=function(e){void 0===e&&(e={});var t=this;t.modules&&Object.keys(t.modules).forEach(function(i){var s=t.modules[i],a=e[i]||{};s.instance&&Object.keys(s.instance).forEach(function(e){var i=s.instance[e];t[e]="function"==typeof i?i.bind(t):i}),s.on&&t.on&&Object.keys(s.on).forEach(function(e){t.on(e,s.on[e])}),s.create&&s.create.bind(t)(a)})},c.components.set=function(e){this.use&&this.use(e)},p.installModule=function(e){for(var t=[],i=arguments.length-1;i-- >0;)t[i]=arguments[i+1];var s=this;s.prototype.modules||(s.prototype.modules={});var a=e.name||Object.keys(s.prototype.modules).length+"_"+d.now();return s.prototype.modules[a]=e,e.proto&&Object.keys(e.proto).forEach(function(t){s.prototype[t]=e.proto[t]}),e.static&&Object.keys(e.static).forEach(function(t){s[t]=e.static[t]}),e.install&&e.install.apply(s,t),s},p.use=function(e){for(var t=[],i=arguments.length-1;i-- >0;)t[i]=arguments[i+1];var s=this;return Array.isArray(e)?(e.forEach(function(e){return s.installModule(e)}),s):s.installModule.apply(s,[e].concat(t))},Object.defineProperties(p,c);var u={updateSize:function(){var e,t,i=this.$el;e=void 0!==this.params.width?this.params.width:i[0].clientWidth,t=void 0!==this.params.height?this.params.height:i[0].clientHeight,0===e&&this.isHorizontal()||0===t&&this.isVertical()||(e=e-parseInt(i.css("padding-left"),10)-parseInt(i.css("padding-right"),10),t=t-parseInt(i.css("padding-top"),10)-parseInt(i.css("padding-bottom"),10),d.extend(this,{width:e,height:t,size:this.isHorizontal()?e:t}))},updateSlides:function(){var e=this.params,t=this.$wrapperEl,i=this.size,s=this.rtl,a=this.wrongRTL,r=t.children("."+this.params.slideClass),n=this.virtual&&e.virtual.enabled?this.virtual.slides.length:r.length,o=[],l=[],p=[],c=e.slidesOffsetBefore;"function"==typeof c&&(c=e.slidesOffsetBefore.call(this));var u=e.slidesOffsetAfter;"function"==typeof u&&(u=e.slidesOffsetAfter.call(this));var v=n,f=this.snapGrid.length,m=this.snapGrid.length,g=e.spaceBetween,b=-c,w=0,y=0;if(void 0!==i){var x,E;"string"==typeof g&&g.indexOf("%")>=0&&(g=parseFloat(g.replace("%",""))/100*i),this.virtualSize=-g,s?r.css({marginLeft:"",marginTop:""}):r.css({marginRight:"",marginBottom:""}),e.slidesPerColumn>1&&(x=Math.floor(n/e.slidesPerColumn)===n/this.params.slidesPerColumn?n:Math.ceil(n/e.slidesPerColumn)*e.slidesPerColumn,"auto"!==e.slidesPerView&&"row"===e.slidesPerColumnFill&&(x=Math.max(x,e.slidesPerView*e.slidesPerColumn)));for(var T,S=e.slidesPerColumn,C=x/S,M=C-(e.slidesPerColumn*C-n),z=0;z<n;z+=1){E=0;var P=r.eq(z);if(e.slidesPerColumn>1){var k=void 0,$=void 0,L=void 0;"column"===e.slidesPerColumnFill?(L=z-($=Math.floor(z/S))*S,($>M||$===M&&L===S-1)&&(L+=1)>=S&&(L=0,$+=1),k=$+L*x/S,P.css({"-webkit-box-ordinal-group":k,"-moz-box-ordinal-group":k,"-ms-flex-order":k,"-webkit-order":k,order:k})):$=z-(L=Math.floor(z/C))*C,P.css("margin-"+(this.isHorizontal()?"top":"left"),0!==L&&e.spaceBetween&&e.spaceBetween+"px").attr("data-swiper-column",$).attr("data-swiper-row",L)}"none"!==P.css("display")&&("auto"===e.slidesPerView?(E=this.isHorizontal()?P.outerWidth(!0):P.outerHeight(!0),e.roundLengths&&(E=Math.floor(E))):(E=(i-(e.slidesPerView-1)*g)/e.slidesPerView,e.roundLengths&&(E=Math.floor(E)),r[z]&&(this.isHorizontal()?r[z].style.width=E+"px":r[z].style.height=E+"px")),r[z]&&(r[z].swiperSlideSize=E),p.push(E),e.centeredSlides?(b=b+E/2+w/2+g,0===w&&0!==z&&(b=b-i/2-g),0===z&&(b=b-i/2-g),Math.abs(b)<.001&&(b=0),y%e.slidesPerGroup==0&&o.push(b),l.push(b)):(y%e.slidesPerGroup==0&&o.push(b),l.push(b),b=b+E+g),this.virtualSize+=E+g,w=E,y+=1)}if(this.virtualSize=Math.max(this.virtualSize,i)+u,s&&a&&("slide"===e.effect||"coverflow"===e.effect)&&t.css({width:this.virtualSize+e.spaceBetween+"px"}),h.flexbox&&!e.setWrapperSize||(this.isHorizontal()?t.css({width:this.virtualSize+e.spaceBetween+"px"}):t.css({height:this.virtualSize+e.spaceBetween+"px"})),e.slidesPerColumn>1&&(this.virtualSize=(E+e.spaceBetween)*x,this.virtualSize=Math.ceil(this.virtualSize/e.slidesPerColumn)-e.spaceBetween,this.isHorizontal()?t.css({width:this.virtualSize+e.spaceBetween+"px"}):t.css({height:this.virtualSize+e.spaceBetween+"px"}),e.centeredSlides)){T=[];for(var I=0;I<o.length;I+=1)o[I]<this.virtualSize+o[0]&&T.push(o[I]);o=T}if(!e.centeredSlides){T=[];for(var D=0;D<o.length;D+=1)o[D]<=this.virtualSize-i&&T.push(o[D]);o=T,Math.floor(this.virtualSize-i)-Math.floor(o[o.length-1])>1&&o.push(this.virtualSize-i)}0===o.length&&(o=[0]),0!==e.spaceBetween&&(this.isHorizontal()?s?r.css({marginLeft:g+"px"}):r.css({marginRight:g+"px"}):r.css({marginBottom:g+"px"})),d.extend(this,{slides:r,snapGrid:o,slidesGrid:l,slidesSizesGrid:p}),n!==v&&this.emit("slidesLengthChange"),o.length!==f&&(this.params.watchOverflow&&this.checkOverflow(),this.emit("snapGridLengthChange")),l.length!==m&&this.emit("slidesGridLengthChange"),(e.watchSlidesProgress||e.watchSlidesVisibility)&&this.updateSlidesOffset()}},updateAutoHeight:function(){var e,t=[],i=0;if("auto"!==this.params.slidesPerView&&this.params.slidesPerView>1)for(e=0;e<Math.ceil(this.params.slidesPerView);e+=1){var s=this.activeIndex+e;if(s>this.slides.length)break;t.push(this.slides.eq(s)[0])}else t.push(this.slides.eq(this.activeIndex)[0]);for(e=0;e<t.length;e+=1)if(void 0!==t[e]){var a=t[e].offsetHeight;i=a>i?a:i}i&&this.$wrapperEl.css("height",i+"px")},updateSlidesOffset:function(){for(var e=this.slides,t=0;t<e.length;t+=1)e[t].swiperSlideOffset=this.isHorizontal()?e[t].offsetLeft:e[t].offsetTop},updateSlidesProgress:function(e){void 0===e&&(e=this.translate||0);var t=this.params,i=this.slides,s=this.rtl;if(0!==i.length){void 0===i[0].swiperSlideOffset&&this.updateSlidesOffset();var a=-e;s&&(a=e),i.removeClass(t.slideVisibleClass);for(var r=0;r<i.length;r+=1){var n=i[r],o=(a+(t.centeredSlides?this.minTranslate():0)-n.swiperSlideOffset)/(n.swiperSlideSize+t.spaceBetween);if(t.watchSlidesVisibility){var l=-(a-n.swiperSlideOffset),d=l+this.slidesSizesGrid[r];(l>=0&&l<this.size||d>0&&d<=this.size||l<=0&&d>=this.size)&&i.eq(r).addClass(t.slideVisibleClass)}n.progress=s?-o:o}}},updateProgress:function(e){void 0===e&&(e=this.translate||0);var t=this.params,i=this.maxTranslate()-this.minTranslate(),s=this.progress,a=this.isBeginning,r=this.isEnd,n=a,o=r;0===i?(s=0,a=!0,r=!0):(a=(s=(e-this.minTranslate())/i)<=0,r=s>=1),d.extend(this,{progress:s,isBeginning:a,isEnd:r}),(t.watchSlidesProgress||t.watchSlidesVisibility)&&this.updateSlidesProgress(e),a&&!n&&this.emit("reachBeginning toEdge"),r&&!o&&this.emit("reachEnd toEdge"),(n&&!a||o&&!r)&&this.emit("fromEdge"),this.emit("progress",s)},updateSlidesClasses:function(){var e,t=this.slides,i=this.params,s=this.$wrapperEl,a=this.activeIndex,r=this.realIndex,n=this.virtual&&i.virtual.enabled;t.removeClass(i.slideActiveClass+" "+i.slideNextClass+" "+i.slidePrevClass+" "+i.slideDuplicateActiveClass+" "+i.slideDuplicateNextClass+" "+i.slideDuplicatePrevClass),(e=n?this.$wrapperEl.find("."+i.slideClass+'[data-swiper-slide-index="'+a+'"]'):t.eq(a)).addClass(i.slideActiveClass),i.loop&&(e.hasClass(i.slideDuplicateClass)?s.children("."+i.slideClass+":not(."+i.slideDuplicateClass+')[data-swiper-slide-index="'+r+'"]').addClass(i.slideDuplicateActiveClass):s.children("."+i.slideClass+"."+i.slideDuplicateClass+'[data-swiper-slide-index="'+r+'"]').addClass(i.slideDuplicateActiveClass));var o=e.nextAll("."+i.slideClass).eq(0).addClass(i.slideNextClass);i.loop&&0===o.length&&(o=t.eq(0)).addClass(i.slideNextClass);var l=e.prevAll("."+i.slideClass).eq(0).addClass(i.slidePrevClass);i.loop&&0===l.length&&(l=t.eq(-1)).addClass(i.slidePrevClass),i.loop&&(o.hasClass(i.slideDuplicateClass)?s.children("."+i.slideClass+":not(."+i.slideDuplicateClass+')[data-swiper-slide-index="'+o.attr("data-swiper-slide-index")+'"]').addClass(i.slideDuplicateNextClass):s.children("."+i.slideClass+"."+i.slideDuplicateClass+'[data-swiper-slide-index="'+o.attr("data-swiper-slide-index")+'"]').addClass(i.slideDuplicateNextClass),l.hasClass(i.slideDuplicateClass)?s.children("."+i.slideClass+":not(."+i.slideDuplicateClass+')[data-swiper-slide-index="'+l.attr("data-swiper-slide-index")+'"]').addClass(i.slideDuplicatePrevClass):s.children("."+i.slideClass+"."+i.slideDuplicateClass+'[data-swiper-slide-index="'+l.attr("data-swiper-slide-index")+'"]').addClass(i.slideDuplicatePrevClass))},updateActiveIndex:function(e){var t,i=this.rtl?this.translate:-this.translate,s=this.slidesGrid,a=this.snapGrid,r=this.params,n=this.activeIndex,o=this.realIndex,l=this.snapIndex,h=e;if(void 0===h){for(var p=0;p<s.length;p+=1)void 0!==s[p+1]?i>=s[p]&&i<s[p+1]-(s[p+1]-s[p])/2?h=p:i>=s[p]&&i<s[p+1]&&(h=p+1):i>=s[p]&&(h=p);r.normalizeSlideIndex&&(h<0||void 0===h)&&(h=0)}if((t=a.indexOf(i)>=0?a.indexOf(i):Math.floor(h/r.slidesPerGroup))>=a.length&&(t=a.length-1),h!==n){var c=parseInt(this.slides.eq(h).attr("data-swiper-slide-index")||h,10);d.extend(this,{snapIndex:t,realIndex:c,previousIndex:n,activeIndex:h}),this.emit("activeIndexChange"),this.emit("snapIndexChange"),o!==c&&this.emit("realIndexChange"),this.emit("slideChange")}else t!==l&&(this.snapIndex=t,this.emit("snapIndexChange"))},updateClickedSlide:function(e){var t=this.params,i=s(e.target).closest("."+t.slideClass)[0],a=!1;if(i)for(var r=0;r<this.slides.length;r+=1)this.slides[r]===i&&(a=!0);if(!i||!a)return this.clickedSlide=void 0,void(this.clickedIndex=void 0);this.clickedSlide=i,this.virtual&&this.params.virtual.enabled?this.clickedIndex=parseInt(s(i).attr("data-swiper-slide-index"),10):this.clickedIndex=s(i).index(),t.slideToClickedSlide&&void 0!==this.clickedIndex&&this.clickedIndex!==this.activeIndex&&this.slideToClickedSlide()}},v={getTranslate:function(e){void 0===e&&(e=this.isHorizontal()?"x":"y");var t=this.params,i=this.rtl,s=this.translate,a=this.$wrapperEl;if(t.virtualTranslate)return i?-s:s;var r=d.getTranslate(a[0],e);return i&&(r=-r),r||0},setTranslate:function(e,t){var i=this.rtl,s=this.params,a=this.$wrapperEl,r=this.progress,n=0,o=0;this.isHorizontal()?n=i?-e:e:o=e,s.roundLengths&&(n=Math.floor(n),o=Math.floor(o)),s.virtualTranslate||(h.transforms3d?a.transform("translate3d("+n+"px, "+o+"px, 0px)"):a.transform("translate("+n+"px, "+o+"px)")),this.translate=this.isHorizontal()?n:o;var l=this.maxTranslate()-this.minTranslate();(0===l?0:(e-this.minTranslate())/l)!==r&&this.updateProgress(e),this.emit("setTranslate",this.translate,t)},minTranslate:function(){return-this.snapGrid[0]},maxTranslate:function(){return-this.snapGrid[this.snapGrid.length-1]}},f={setTransition:function(e,t){this.$wrapperEl.transition(e),this.emit("setTransition",e,t)},transitionStart:function(e,t){void 0===e&&(e=!0);var i=this.activeIndex,s=this.params,a=this.previousIndex;s.autoHeight&&this.updateAutoHeight();var r=t;if(r||(r=i>a?"next":i<a?"prev":"reset"),this.emit("transitionStart"),e&&i!==a){if("reset"===r)return void this.emit("slideResetTransitionStart");this.emit("slideChangeTransitionStart"),"next"===r?this.emit("slideNextTransitionStart"):this.emit("slidePrevTransitionStart")}},transitionEnd:function(e,t){void 0===e&&(e=!0);var i=this.activeIndex,s=this.previousIndex;this.animating=!1,this.setTransition(0);var a=t;if(a||(a=i>s?"next":i<s?"prev":"reset"),this.emit("transitionEnd"),e&&i!==s){if("reset"===a)return void this.emit("slideResetTransitionEnd");this.emit("slideChangeTransitionEnd"),"next"===a?this.emit("slideNextTransitionEnd"):this.emit("slidePrevTransitionEnd")}}},m={slideTo:function(e,t,i,s){void 0===e&&(e=0),void 0===t&&(t=this.params.speed),void 0===i&&(i=!0);var a=this,r=e;r<0&&(r=0);var n=a.params,o=a.snapGrid,l=a.slidesGrid,d=a.previousIndex,p=a.activeIndex,c=a.rtl,u=a.$wrapperEl;if(a.animating&&n.preventIntercationOnTransition)return!1;var v=Math.floor(r/n.slidesPerGroup);v>=o.length&&(v=o.length-1),(p||n.initialSlide||0)===(d||0)&&i&&a.emit("beforeSlideChangeStart");var f,m=-o[v];if(a.updateProgress(m),n.normalizeSlideIndex)for(var g=0;g<l.length;g+=1)-Math.floor(100*m)>=Math.floor(100*l[g])&&(r=g);if(a.initialized&&r!==p){if(!a.allowSlideNext&&m<a.translate&&m<a.minTranslate())return!1;if(!a.allowSlidePrev&&m>a.translate&&m>a.maxTranslate()&&(p||0)!==r)return!1}return f=r>p?"next":r<p?"prev":"reset",c&&-m===a.translate||!c&&m===a.translate?(a.updateActiveIndex(r),n.autoHeight&&a.updateAutoHeight(),a.updateSlidesClasses(),"slide"!==n.effect&&a.setTranslate(m),"reset"!==f&&(a.transitionStart(i,f),a.transitionEnd(i,f)),!1):(0!==t&&h.transition?(a.setTransition(t),a.setTranslate(m),a.updateActiveIndex(r),a.updateSlidesClasses(),a.emit("beforeTransitionStart",t,s),a.transitionStart(i,f),a.animating||(a.animating=!0,u.transitionEnd(function(){a&&!a.destroyed&&a.transitionEnd(i,f)}))):(a.setTransition(0),a.setTranslate(m),a.updateActiveIndex(r),a.updateSlidesClasses(),a.emit("beforeTransitionStart",t,s),a.transitionStart(i,f),a.transitionEnd(i,f)),!0)},slideToLoop:function(e,t,i,s){void 0===e&&(e=0),void 0===t&&(t=this.params.speed),void 0===i&&(i=!0);var a=e;return this.params.loop&&(a+=this.loopedSlides),this.slideTo(a,t,i,s)},slideNext:function(e,t,i){void 0===e&&(e=this.params.speed),void 0===t&&(t=!0);var s=this.params,a=this.animating;return s.loop?!a&&(this.loopFix(),this._clientLeft=this.$wrapperEl[0].clientLeft,this.slideTo(this.activeIndex+s.slidesPerGroup,e,t,i)):this.slideTo(this.activeIndex+s.slidesPerGroup,e,t,i)},slidePrev:function(e,t,i){void 0===e&&(e=this.params.speed),void 0===t&&(t=!0);var s=this.params,a=this.animating;return s.loop?!a&&(this.loopFix(),this._clientLeft=this.$wrapperEl[0].clientLeft,this.slideTo(this.activeIndex-1,e,t,i)):this.slideTo(this.activeIndex-1,e,t,i)},slideReset:function(e,t,i){void 0===e&&(e=this.params.speed),void 0===t&&(t=!0);return this.slideTo(this.activeIndex,e,t,i)},slideToClickedSlide:function(){var e,t=this,i=t.params,a=t.$wrapperEl,r="auto"===i.slidesPerView?t.slidesPerViewDynamic():i.slidesPerView,n=t.clickedIndex;if(i.loop){if(t.animating)return;e=parseInt(s(t.clickedSlide).attr("data-swiper-slide-index"),10),i.centeredSlides?n<t.loopedSlides-r/2||n>t.slides.length-t.loopedSlides+r/2?(t.loopFix(),n=a.children("."+i.slideClass+'[data-swiper-slide-index="'+e+'"]:not(.'+i.slideDuplicateClass+")").eq(0).index(),d.nextTick(function(){t.slideTo(n)})):t.slideTo(n):n>t.slides.length-r?(t.loopFix(),n=a.children("."+i.slideClass+'[data-swiper-slide-index="'+e+'"]:not(.'+i.slideDuplicateClass+")").eq(0).index(),d.nextTick(function(){t.slideTo(n)})):t.slideTo(n)}else t.slideTo(n)}},g={loopCreate:function(){var t=this,i=t.params,a=t.$wrapperEl;a.children("."+i.slideClass+"."+i.slideDuplicateClass).remove();var r=a.children("."+i.slideClass);if(i.loopFillGroupWithBlank){var n=i.slidesPerGroup-r.length%i.slidesPerGroup;if(n!==i.slidesPerGroup){for(var o=0;o<n;o+=1){var l=s(e.createElement("div")).addClass(i.slideClass+" "+i.slideBlankClass);a.append(l)}r=a.children("."+i.slideClass)}}"auto"!==i.slidesPerView||i.loopedSlides||(i.loopedSlides=r.length),t.loopedSlides=parseInt(i.loopedSlides||i.slidesPerView,10),t.loopedSlides+=i.loopAdditionalSlides,t.loopedSlides>r.length&&(t.loopedSlides=r.length);var d=[],h=[];r.each(function(e,i){var a=s(i);e<t.loopedSlides&&h.push(i),e<r.length&&e>=r.length-t.loopedSlides&&d.push(i),a.attr("data-swiper-slide-index",e)});for(var p=0;p<h.length;p+=1)a.append(s(h[p].cloneNode(!0)).addClass(i.slideDuplicateClass));for(var c=d.length-1;c>=0;c-=1)a.prepend(s(d[c].cloneNode(!0)).addClass(i.slideDuplicateClass))},loopFix:function(){var e,t=this.params,i=this.activeIndex,s=this.slides,a=this.loopedSlides,r=this.allowSlidePrev,n=this.allowSlideNext,o=this.snapGrid,l=this.rtl;this.allowSlidePrev=!0,this.allowSlideNext=!0;var d=-o[i]-this.getTranslate();i<a?(e=s.length-3*a+i,e+=a,this.slideTo(e,0,!1,!0)&&0!==d&&this.setTranslate((l?-this.translate:this.translate)-d)):("auto"===t.slidesPerView&&i>=2*a||i>s.length-2*t.slidesPerView)&&(e=-s.length+i+a,e+=a,this.slideTo(e,0,!1,!0)&&0!==d&&this.setTranslate((l?-this.translate:this.translate)-d));this.allowSlidePrev=r,this.allowSlideNext=n},loopDestroy:function(){var e=this.$wrapperEl,t=this.params,i=this.slides;e.children("."+t.slideClass+"."+t.slideDuplicateClass).remove(),i.removeAttr("data-swiper-slide-index")}},b={setGrabCursor:function(e){if(!h.touch&&this.params.simulateTouch){var t=this.el;t.style.cursor="move",t.style.cursor=e?"-webkit-grabbing":"-webkit-grab",t.style.cursor=e?"-moz-grabbin":"-moz-grab",t.style.cursor=e?"grabbing":"grab"}},unsetGrabCursor:function(){h.touch||(this.el.style.cursor="")}},w={appendSlide:function(e){var t=this.$wrapperEl,i=this.params;if(i.loop&&this.loopDestroy(),"object"==typeof e&&"length"in e)for(var s=0;s<e.length;s+=1)e[s]&&t.append(e[s]);else t.append(e);i.loop&&this.loopCreate(),i.observer&&h.observer||this.update()},prependSlide:function(e){var t=this.params,i=this.$wrapperEl,s=this.activeIndex;t.loop&&this.loopDestroy();var a=s+1;if("object"==typeof e&&"length"in e){for(var r=0;r<e.length;r+=1)e[r]&&i.prepend(e[r]);a=s+e.length}else i.prepend(e);t.loop&&this.loopCreate(),t.observer&&h.observer||this.update(),this.slideTo(a,0,!1)},removeSlide:function(e){var t=this.params,i=this.$wrapperEl,s=this.activeIndex;t.loop&&(this.loopDestroy(),this.slides=i.children("."+t.slideClass));var a,r=s;if("object"==typeof e&&"length"in e){for(var n=0;n<e.length;n+=1)a=e[n],this.slides[a]&&this.slides.eq(a).remove(),a<r&&(r-=1);r=Math.max(r,0)}else a=e,this.slides[a]&&this.slides.eq(a).remove(),a<r&&(r-=1),r=Math.max(r,0);t.loop&&this.loopCreate(),t.observer&&h.observer||this.update(),t.loop?this.slideTo(r+this.loopedSlides,0,!1):this.slideTo(r,0,!1)},removeAllSlides:function(){for(var e=[],t=0;t<this.slides.length;t+=1)e.push(t);this.removeSlide(e)}},y=function(){var i=t.navigator.userAgent,s={ios:!1,android:!1,androidChrome:!1,desktop:!1,windows:!1,iphone:!1,ipod:!1,ipad:!1,cordova:t.cordova||t.phonegap,phonegap:t.cordova||t.phonegap},a=i.match(/(Windows Phone);?[\s\/]+([\d.]+)?/),r=i.match(/(Android);?[\s\/]+([\d.]+)?/),n=i.match(/(iPad).*OS\s([\d_]+)/),o=i.match(/(iPod)(.*OS\s([\d_]+))?/),l=!n&&i.match(/(iPhone\sOS|iOS)\s([\d_]+)/);if(a&&(s.os="windows",s.osVersion=a[2],s.windows=!0),r&&!a&&(s.os="android",s.osVersion=r[2],s.android=!0,s.androidChrome=i.toLowerCase().indexOf("chrome")>=0),(n||l||o)&&(s.os="ios",s.ios=!0),l&&!o&&(s.osVersion=l[2].replace(/_/g,"."),s.iphone=!0),n&&(s.osVersion=n[2].replace(/_/g,"."),s.ipad=!0),o&&(s.osVersion=o[3]?o[3].replace(/_/g,"."):null,s.iphone=!0),s.ios&&s.osVersion&&i.indexOf("Version/")>=0&&"10"===s.osVersion.split(".")[0]&&(s.osVersion=i.toLowerCase().split("version/")[1].split(" ")[0]),s.desktop=!(s.os||s.android||s.webView),s.webView=(l||n||o)&&i.match(/.*AppleWebKit(?!.*Safari)/i),s.os&&"ios"===s.os){var d=s.osVersion.split("."),h=e.querySelector('meta[name="viewport"]');s.minimalUi=!s.webView&&(o||l)&&(1*d[0]==7?1*d[1]>=1:1*d[0]>7)&&h&&h.getAttribute("content").indexOf("minimal-ui")>=0}return s.pixelRatio=t.devicePixelRatio||1,s}(),x=function(i){var a=this.touchEventsData,r=this.params,n=this.touches;if(!this.animating||!r.preventIntercationOnTransition){var o=i;if(o.originalEvent&&(o=o.originalEvent),a.isTouchEvent="touchstart"===o.type,(a.isTouchEvent||!("which"in o)||3!==o.which)&&(!a.isTouched||!a.isMoved))if(r.noSwiping&&s(o.target).closest(r.noSwipingSelector?r.noSwipingSelector:"."+r.noSwipingClass)[0])this.allowClick=!0;else if(!r.swipeHandler||s(o).closest(r.swipeHandler)[0]){n.currentX="touchstart"===o.type?o.targetTouches[0].pageX:o.pageX,n.currentY="touchstart"===o.type?o.targetTouches[0].pageY:o.pageY;var l=n.currentX,h=n.currentY;if(!(y.ios&&!y.cordova&&r.iOSEdgeSwipeDetection&&l<=r.iOSEdgeSwipeThreshold&&l>=t.screen.width-r.iOSEdgeSwipeThreshold)){if(d.extend(a,{isTouched:!0,isMoved:!1,allowTouchCallbacks:!0,isScrolling:void 0,startMoving:void 0}),n.startX=l,n.startY=h,a.touchStartTime=d.now(),this.allowClick=!0,this.updateSize(),this.swipeDirection=void 0,r.threshold>0&&(a.allowThresholdMove=!1),"touchstart"!==o.type){var p=!0;s(o.target).is(a.formElements)&&(p=!1),e.activeElement&&s(e.activeElement).is(a.formElements)&&e.activeElement!==o.target&&e.activeElement.blur(),p&&this.allowTouchMove&&o.preventDefault()}this.emit("touchStart",o)}}}},E=function(t){var i=this.touchEventsData,a=this.params,r=this.touches,n=this.rtl,o=t;if(o.originalEvent&&(o=o.originalEvent),i.isTouched){if(!i.isTouchEvent||"mousemove"!==o.type){var l="touchmove"===o.type?o.targetTouches[0].pageX:o.pageX,h="touchmove"===o.type?o.targetTouches[0].pageY:o.pageY;if(o.preventedByNestedSwiper)return r.startX=l,void(r.startY=h);if(!this.allowTouchMove)return this.allowClick=!1,void(i.isTouched&&(d.extend(r,{startX:l,startY:h,currentX:l,currentY:h}),i.touchStartTime=d.now()));if(i.isTouchEvent&&a.touchReleaseOnEdges&&!a.loop)if(this.isVertical()){if(h<r.startY&&this.translate<=this.maxTranslate()||h>r.startY&&this.translate>=this.minTranslate())return i.isTouched=!1,void(i.isMoved=!1)}else if(l<r.startX&&this.translate<=this.maxTranslate()||l>r.startX&&this.translate>=this.minTranslate())return;if(i.isTouchEvent&&e.activeElement&&o.target===e.activeElement&&s(o.target).is(i.formElements))return i.isMoved=!0,void(this.allowClick=!1);if(i.allowTouchCallbacks&&this.emit("touchMove",o),!(o.targetTouches&&o.targetTouches.length>1)){r.currentX=l,r.currentY=h;var p,c=r.currentX-r.startX,u=r.currentY-r.startY;if(void 0===i.isScrolling)this.isHorizontal()&&r.currentY===r.startY||this.isVertical()&&r.currentX===r.startX?i.isScrolling=!1:c*c+u*u>=25&&(p=180*Math.atan2(Math.abs(u),Math.abs(c))/Math.PI,i.isScrolling=this.isHorizontal()?p>a.touchAngle:90-p>a.touchAngle);if(i.isScrolling&&this.emit("touchMoveOpposite",o),"undefined"==typeof startMoving&&(r.currentX===r.startX&&r.currentY===r.startY||(i.startMoving=!0)),i.isScrolling)i.isTouched=!1;else if(i.startMoving){this.allowClick=!1,o.preventDefault(),a.touchMoveStopPropagation&&!a.nested&&o.stopPropagation(),i.isMoved||(a.loop&&this.loopFix(),i.startTranslate=this.getTranslate(),this.setTransition(0),this.animating&&this.$wrapperEl.trigger("webkitTransitionEnd transitionend"),i.allowMomentumBounce=!1,!a.grabCursor||!0!==this.allowSlideNext&&!0!==this.allowSlidePrev||this.setGrabCursor(!0),this.emit("sliderFirstMove",o)),this.emit("sliderMove",o),i.isMoved=!0;var v=this.isHorizontal()?c:u;r.diff=v,v*=a.touchRatio,n&&(v=-v),this.swipeDirection=v>0?"prev":"next",i.currentTranslate=v+i.startTranslate;var f=!0,m=a.resistanceRatio;if(a.touchReleaseOnEdges&&(m=0),v>0&&i.currentTranslate>this.minTranslate()?(f=!1,a.resistance&&(i.currentTranslate=this.minTranslate()-1+Math.pow(-this.minTranslate()+i.startTranslate+v,m))):v<0&&i.currentTranslate<this.maxTranslate()&&(f=!1,a.resistance&&(i.currentTranslate=this.maxTranslate()+1-Math.pow(this.maxTranslate()-i.startTranslate-v,m))),f&&(o.preventedByNestedSwiper=!0),!this.allowSlideNext&&"next"===this.swipeDirection&&i.currentTranslate<i.startTranslate&&(i.currentTranslate=i.startTranslate),!this.allowSlidePrev&&"prev"===this.swipeDirection&&i.currentTranslate>i.startTranslate&&(i.currentTranslate=i.startTranslate),a.threshold>0){if(!(Math.abs(v)>a.threshold||i.allowThresholdMove))return void(i.currentTranslate=i.startTranslate);if(!i.allowThresholdMove)return i.allowThresholdMove=!0,r.startX=r.currentX,r.startY=r.currentY,i.currentTranslate=i.startTranslate,void(r.diff=this.isHorizontal()?r.currentX-r.startX:r.currentY-r.startY)}a.followFinger&&((a.freeMode||a.watchSlidesProgress||a.watchSlidesVisibility)&&(this.updateActiveIndex(),this.updateSlidesClasses()),a.freeMode&&(0===i.velocities.length&&i.velocities.push({position:r[this.isHorizontal()?"startX":"startY"],time:i.touchStartTime}),i.velocities.push({position:r[this.isHorizontal()?"currentX":"currentY"],time:d.now()})),this.updateProgress(i.currentTranslate),this.setTranslate(i.currentTranslate))}}}}else i.startMoving&&i.isScrolling&&this.emit("touchMoveOpposite",o)},T=function(e){var t=this,i=t.touchEventsData,s=t.params,a=t.touches,r=t.rtl,n=t.$wrapperEl,o=t.slidesGrid,l=t.snapGrid,h=e;if(h.originalEvent&&(h=h.originalEvent),i.allowTouchCallbacks&&t.emit("touchEnd",h),i.allowTouchCallbacks=!1,!i.isTouched)return i.isMoved&&s.grabCursor&&t.setGrabCursor(!1),i.isMoved=!1,void(i.startMoving=!1);s.grabCursor&&i.isMoved&&i.isTouched&&(!0===t.allowSlideNext||!0===t.allowSlidePrev)&&t.setGrabCursor(!1);var p,c=d.now(),u=c-i.touchStartTime;if(t.allowClick&&(t.updateClickedSlide(h),t.emit("tap",h),u<300&&c-i.lastClickTime>300&&(i.clickTimeout&&clearTimeout(i.clickTimeout),i.clickTimeout=d.nextTick(function(){t&&!t.destroyed&&t.emit("click",h)},300)),u<300&&c-i.lastClickTime<300&&(i.clickTimeout&&clearTimeout(i.clickTimeout),t.emit("doubleTap",h))),i.lastClickTime=d.now(),d.nextTick(function(){t.destroyed||(t.allowClick=!0)}),!i.isTouched||!i.isMoved||!t.swipeDirection||0===a.diff||i.currentTranslate===i.startTranslate)return i.isTouched=!1,i.isMoved=!1,void(i.startMoving=!1);if(i.isTouched=!1,i.isMoved=!1,i.startMoving=!1,p=s.followFinger?r?t.translate:-t.translate:-i.currentTranslate,s.freeMode){if(p<-t.minTranslate())return void t.slideTo(t.activeIndex);if(p>-t.maxTranslate())return void(t.slides.length<l.length?t.slideTo(l.length-1):t.slideTo(t.slides.length-1));if(s.freeModeMomentum){if(i.velocities.length>1){var v=i.velocities.pop(),f=i.velocities.pop(),m=v.position-f.position,g=v.time-f.time;t.velocity=m/g,t.velocity/=2,Math.abs(t.velocity)<s.freeModeMinimumVelocity&&(t.velocity=0),(g>150||d.now()-v.time>300)&&(t.velocity=0)}else t.velocity=0;t.velocity*=s.freeModeMomentumVelocityRatio,i.velocities.length=0;var b=1e3*s.freeModeMomentumRatio,w=t.velocity*b,y=t.translate+w;r&&(y=-y);var x,E=!1,T=20*Math.abs(t.velocity)*s.freeModeMomentumBounceRatio;if(y<t.maxTranslate())s.freeModeMomentumBounce?(y+t.maxTranslate()<-T&&(y=t.maxTranslate()-T),x=t.maxTranslate(),E=!0,i.allowMomentumBounce=!0):y=t.maxTranslate();else if(y>t.minTranslate())s.freeModeMomentumBounce?(y-t.minTranslate()>T&&(y=t.minTranslate()+T),x=t.minTranslate(),E=!0,i.allowMomentumBounce=!0):y=t.minTranslate();else if(s.freeModeSticky){for(var S,C=0;C<l.length;C+=1)if(l[C]>-y){S=C;break}y=-(y=Math.abs(l[S]-y)<Math.abs(l[S-1]-y)||"next"===t.swipeDirection?l[S]:l[S-1])}if(0!==t.velocity)b=r?Math.abs((-y-t.translate)/t.velocity):Math.abs((y-t.translate)/t.velocity);else if(s.freeModeSticky)return void t.slideReset();s.freeModeMomentumBounce&&E?(t.updateProgress(x),t.setTransition(b),t.setTranslate(y),t.transitionStart(!0,t.swipeDirection),t.animating=!0,n.transitionEnd(function(){t&&!t.destroyed&&i.allowMomentumBounce&&(t.emit("momentumBounce"),t.setTransition(s.speed),t.setTranslate(x),n.transitionEnd(function(){t&&!t.destroyed&&t.transitionEnd()}))})):t.velocity?(t.updateProgress(y),t.setTransition(b),t.setTranslate(y),t.transitionStart(!0,t.swipeDirection),t.animating||(t.animating=!0,n.transitionEnd(function(){t&&!t.destroyed&&t.transitionEnd()}))):t.updateProgress(y),t.updateActiveIndex(),t.updateSlidesClasses()}(!s.freeModeMomentum||u>=s.longSwipesMs)&&(t.updateProgress(),t.updateActiveIndex(),t.updateSlidesClasses())}else{for(var M=0,z=t.slidesSizesGrid[0],P=0;P<o.length;P+=s.slidesPerGroup)void 0!==o[P+s.slidesPerGroup]?p>=o[P]&&p<o[P+s.slidesPerGroup]&&(M=P,z=o[P+s.slidesPerGroup]-o[P]):p>=o[P]&&(M=P,z=o[o.length-1]-o[o.length-2]);var k=(p-o[M])/z;if(u>s.longSwipesMs){if(!s.longSwipes)return void t.slideTo(t.activeIndex);"next"===t.swipeDirection&&(k>=s.longSwipesRatio?t.slideTo(M+s.slidesPerGroup):t.slideTo(M)),"prev"===t.swipeDirection&&(k>1-s.longSwipesRatio?t.slideTo(M+s.slidesPerGroup):t.slideTo(M))}else{if(!s.shortSwipes)return void t.slideTo(t.activeIndex);"next"===t.swipeDirection&&t.slideTo(M+s.slidesPerGroup),"prev"===t.swipeDirection&&t.slideTo(M)}}},S=function(){var e=this.params,t=this.el;if(!t||0!==t.offsetWidth){e.breakpoints&&this.setBreakpoint();var i=this.allowSlideNext,s=this.allowSlidePrev;if(this.allowSlideNext=!0,this.allowSlidePrev=!0,this.updateSize(),this.updateSlides(),e.freeMode){var a=Math.min(Math.max(this.translate,this.maxTranslate()),this.minTranslate());this.setTranslate(a),this.updateActiveIndex(),this.updateSlidesClasses(),e.autoHeight&&this.updateAutoHeight()}else this.updateSlidesClasses(),("auto"===e.slidesPerView||e.slidesPerView>1)&&this.isEnd&&!this.params.centeredSlides?this.slideTo(this.slides.length-1,0,!1,!0):this.slideTo(this.activeIndex,0,!1,!0);this.allowSlidePrev=s,this.allowSlideNext=i}},C=function(e){this.allowClick||(this.params.preventClicks&&e.preventDefault(),this.params.preventClicksPropagation&&this.animating&&(e.stopPropagation(),e.stopImmediatePropagation()))};var M={attachEvents:function(){var t=this.params,i=this.touchEvents,s=this.el,a=this.wrapperEl;this.onTouchStart=x.bind(this),this.onTouchMove=E.bind(this),this.onTouchEnd=T.bind(this),this.onClick=C.bind(this);var r="container"===t.touchEventsTarget?s:a,n=!!t.nested;if(h.touch||!h.pointerEvents&&!h.prefixedPointerEvents){if(h.touch){var o=!("touchstart"!==i.start||!h.passiveListener||!t.passiveListeners)&&{passive:!0,capture:!1};r.addEventListener(i.start,this.onTouchStart,o),r.addEventListener(i.move,this.onTouchMove,h.passiveListener?{passive:!1,capture:n}:n),r.addEventListener(i.end,this.onTouchEnd,o)}(t.simulateTouch&&!y.ios&&!y.android||t.simulateTouch&&!h.touch&&y.ios)&&(r.addEventListener("mousedown",this.onTouchStart,!1),e.addEventListener("mousemove",this.onTouchMove,n),e.addEventListener("mouseup",this.onTouchEnd,!1))}else r.addEventListener(i.start,this.onTouchStart,!1),e.addEventListener(i.move,this.onTouchMove,n),e.addEventListener(i.end,this.onTouchEnd,!1);(t.preventClicks||t.preventClicksPropagation)&&r.addEventListener("click",this.onClick,!0),this.on("resize observerUpdate",S)},detachEvents:function(){var t=this.params,i=this.touchEvents,s=this.el,a=this.wrapperEl,r="container"===t.touchEventsTarget?s:a,n=!!t.nested;if(h.touch||!h.pointerEvents&&!h.prefixedPointerEvents){if(h.touch){var o=!("onTouchStart"!==i.start||!h.passiveListener||!t.passiveListeners)&&{passive:!0,capture:!1};r.removeEventListener(i.start,this.onTouchStart,o),r.removeEventListener(i.move,this.onTouchMove,n),r.removeEventListener(i.end,this.onTouchEnd,o)}(t.simulateTouch&&!y.ios&&!y.android||t.simulateTouch&&!h.touch&&y.ios)&&(r.removeEventListener("mousedown",this.onTouchStart,!1),e.removeEventListener("mousemove",this.onTouchMove,n),e.removeEventListener("mouseup",this.onTouchEnd,!1))}else r.removeEventListener(i.start,this.onTouchStart,!1),e.removeEventListener(i.move,this.onTouchMove,n),e.removeEventListener(i.end,this.onTouchEnd,!1);(t.preventClicks||t.preventClicksPropagation)&&r.removeEventListener("click",this.onClick,!0),this.off("resize observerUpdate",S)}},z={setBreakpoint:function(){var e=this.activeIndex,t=this.loopedSlides;void 0===t&&(t=0);var i=this.params,s=i.breakpoints;if(s&&(!s||0!==Object.keys(s).length)){var a=this.getBreakpoint(s);if(a&&this.currentBreakpoint!==a){var r=a in s?s[a]:this.originalParams,n=i.loop&&r.slidesPerView!==i.slidesPerView;d.extend(this.params,r),d.extend(this,{allowTouchMove:this.params.allowTouchMove,allowSlideNext:this.params.allowSlideNext,allowSlidePrev:this.params.allowSlidePrev}),this.currentBreakpoint=a,n&&(this.loopDestroy(),this.loopCreate(),this.updateSlides(),this.slideTo(e-t+this.loopedSlides,0,!1)),this.emit("breakpoint",r)}}},getBreakpoint:function(e){if(e){var i=!1,s=[];Object.keys(e).forEach(function(e){s.push(e)}),s.sort(function(e,t){return parseInt(e,10)-parseInt(t,10)});for(var a=0;a<s.length;a+=1){var r=s[a];r>=t.innerWidth&&!i&&(i=r)}return i||"max"}}},P=function(){return{isIE:!!t.navigator.userAgent.match(/Trident/g)||!!t.navigator.userAgent.match(/MSIE/g),isSafari:(e=t.navigator.userAgent.toLowerCase(),e.indexOf("safari")>=0&&e.indexOf("chrome")<0&&e.indexOf("android")<0),isUiWebView:/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(t.navigator.userAgent)};var e}();var k={init:!0,direction:"horizontal",touchEventsTarget:"container",initialSlide:0,speed:300,preventIntercationOnTransition:!1,iOSEdgeSwipeDetection:!1,iOSEdgeSwipeThreshold:20,freeMode:!1,freeModeMomentum:!0,freeModeMomentumRatio:1,freeModeMomentumBounce:!0,freeModeMomentumBounceRatio:1,freeModeMomentumVelocityRatio:1,freeModeSticky:!1,freeModeMinimumVelocity:.02,autoHeight:!1,setWrapperSize:!1,virtualTranslate:!1,effect:"slide",breakpoints:void 0,spaceBetween:0,slidesPerView:1,slidesPerColumn:1,slidesPerColumnFill:"column",slidesPerGroup:1,centeredSlides:!1,slidesOffsetBefore:0,slidesOffsetAfter:0,normalizeSlideIndex:!0,watchOverflow:!1,roundLengths:!1,touchRatio:1,touchAngle:45,simulateTouch:!0,shortSwipes:!0,longSwipes:!0,longSwipesRatio:.5,longSwipesMs:300,followFinger:!0,allowTouchMove:!0,threshold:0,touchMoveStopPropagation:!0,touchReleaseOnEdges:!1,uniqueNavElements:!0,resistance:!0,resistanceRatio:.85,watchSlidesProgress:!1,watchSlidesVisibility:!1,grabCursor:!1,preventClicks:!0,preventClicksPropagation:!0,slideToClickedSlide:!1,preloadImages:!0,updateOnImagesReady:!0,loop:!1,loopAdditionalSlides:0,loopedSlides:null,loopFillGroupWithBlank:!1,allowSlidePrev:!0,allowSlideNext:!0,swipeHandler:null,noSwiping:!0,noSwipingClass:"swiper-no-swiping",noSwipingSelector:null,passiveListeners:!0,containerModifierClass:"swiper-container-",slideClass:"swiper-slide",slideBlankClass:"swiper-slide-invisible-blank",slideActiveClass:"swiper-slide-active",slideDuplicateActiveClass:"swiper-slide-duplicate-active",slideVisibleClass:"swiper-slide-visible",slideDuplicateClass:"swiper-slide-duplicate",slideNextClass:"swiper-slide-next",slideDuplicateNextClass:"swiper-slide-duplicate-next",slidePrevClass:"swiper-slide-prev",slideDuplicatePrevClass:"swiper-slide-duplicate-prev",wrapperClass:"swiper-wrapper",runCallbacksOnInit:!0},$={update:u,translate:v,transition:f,slide:m,loop:g,grabCursor:b,manipulation:w,events:M,breakpoints:z,checkOverflow:{checkOverflow:function(){var e=this.isLocked;this.isLocked=1===this.snapGrid.length,this.allowTouchMove=!this.isLocked,e&&e!==this.isLocked&&(this.isEnd=!1,this.navigation.update())}},classes:{addClasses:function(){var e=this.classNames,t=this.params,i=this.rtl,s=this.$el,a=[];a.push(t.direction),t.freeMode&&a.push("free-mode"),h.flexbox||a.push("no-flexbox"),t.autoHeight&&a.push("autoheight"),i&&a.push("rtl"),t.slidesPerColumn>1&&a.push("multirow"),y.android&&a.push("android"),y.ios&&a.push("ios"),P.isIE&&(h.pointerEvents||h.prefixedPointerEvents)&&a.push("wp8-"+t.direction),a.forEach(function(i){e.push(t.containerModifierClass+i)}),s.addClass(e.join(" "))},removeClasses:function(){var e=this.$el,t=this.classNames;e.removeClass(t.join(" "))}},images:{loadImage:function(e,i,s,a,r,n){var o;function l(){n&&n()}e.complete&&r?l():i?((o=new t.Image).onload=l,o.onerror=l,a&&(o.sizes=a),s&&(o.srcset=s),i&&(o.src=i)):l()},preloadImages:function(){var e=this;function t(){void 0!==e&&null!==e&&e&&!e.destroyed&&(void 0!==e.imagesLoaded&&(e.imagesLoaded+=1),e.imagesLoaded===e.imagesToLoad.length&&(e.params.updateOnImagesReady&&e.update(),e.emit("imagesReady")))}e.imagesToLoad=e.$el.find("img");for(var i=0;i<e.imagesToLoad.length;i+=1){var s=e.imagesToLoad[i];e.loadImage(s,s.currentSrc||s.getAttribute("src"),s.srcset||s.getAttribute("srcset"),s.sizes||s.getAttribute("sizes"),!0,t)}}}},L={},I=function(e){function t(){for(var i,a,r,n=[],o=arguments.length;o--;)n[o]=arguments[o];1===n.length&&n[0].constructor&&n[0].constructor===Object?a=n[0]:(i=(r=n)[0],a=r[1]);a||(a={}),a=d.extend({},a),i&&!a.el&&(a.el=i),e.call(this,a),Object.keys($).forEach(function(e){Object.keys($[e]).forEach(function(i){t.prototype[i]||(t.prototype[i]=$[e][i])})});var l=this;void 0===l.modules&&(l.modules={}),Object.keys(l.modules).forEach(function(e){var t=l.modules[e];if(t.params){var i=Object.keys(t.params)[0],s=t.params[i];if("object"!=typeof s)return;if(!(i in a&&"enabled"in s))return;!0===a[i]&&(a[i]={enabled:!0}),"object"!=typeof a[i]||"enabled"in a[i]||(a[i].enabled=!0),a[i]||(a[i]={enabled:!1})}});var p=d.extend({},k);l.useModulesParams(p),l.params=d.extend({},p,L,a),l.originalParams=d.extend({},l.params),l.passedParams=d.extend({},a),l.$=s;var c=s(l.params.el);if(i=c[0]){if(c.length>1){var u=[];return c.each(function(e,i){var s=d.extend({},a,{el:i});u.push(new t(s))}),u}i.swiper=l,c.data("swiper",l);var v,f,m=c.children("."+l.params.wrapperClass);return d.extend(l,{$el:c,el:i,$wrapperEl:m,wrapperEl:m[0],classNames:[],slides:s(),slidesGrid:[],snapGrid:[],slidesSizesGrid:[],isHorizontal:function(){return"horizontal"===l.params.direction},isVertical:function(){return"vertical"===l.params.direction},rtl:"horizontal"===l.params.direction&&("rtl"===i.dir.toLowerCase()||"rtl"===c.css("direction")),wrongRTL:"-webkit-box"===m.css("display"),activeIndex:0,realIndex:0,isBeginning:!0,isEnd:!1,translate:0,progress:0,velocity:0,animating:!1,allowSlideNext:l.params.allowSlideNext,allowSlidePrev:l.params.allowSlidePrev,touchEvents:(v=["touchstart","touchmove","touchend"],f=["mousedown","mousemove","mouseup"],h.pointerEvents?f=["pointerdown","pointermove","pointerup"]:h.prefixedPointerEvents&&(f=["MSPointerDown","MSPointerMove","MSPointerUp"]),l.touchEventsTouch={start:v[0],move:v[1],end:v[2]},l.touchEventsDesktop={start:f[0],move:f[1],end:f[2]},h.touch||!l.params.simulateTouch?l.touchEventsTouch:l.touchEventsDesktop),touchEventsData:{isTouched:void 0,isMoved:void 0,allowTouchCallbacks:void 0,touchStartTime:void 0,isScrolling:void 0,currentTranslate:void 0,startTranslate:void 0,allowThresholdMove:void 0,formElements:"input, select, option, textarea, button, video",lastClickTime:d.now(),clickTimeout:void 0,velocities:[],allowMomentumBounce:void 0,isTouchEvent:void 0,startMoving:void 0},allowClick:!0,allowTouchMove:l.params.allowTouchMove,touches:{startX:0,startY:0,currentX:0,currentY:0,diff:0},imagesToLoad:[],imagesLoaded:0}),l.useModules(),l.params.init&&l.init(),l}}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var i={extendedDefaults:{configurable:!0},defaults:{configurable:!0},Class:{configurable:!0},$:{configurable:!0}};return t.prototype.slidesPerViewDynamic=function(){var e=this.params,t=this.slides,i=this.slidesGrid,s=this.size,a=this.activeIndex,r=1;if(e.centeredSlides){for(var n,o=t[a].swiperSlideSize,l=a+1;l<t.length;l+=1)t[l]&&!n&&(r+=1,(o+=t[l].swiperSlideSize)>s&&(n=!0));for(var d=a-1;d>=0;d-=1)t[d]&&!n&&(r+=1,(o+=t[d].swiperSlideSize)>s&&(n=!0))}else for(var h=a+1;h<t.length;h+=1)i[h]-i[a]<s&&(r+=1);return r},t.prototype.update=function(){var e=this;e&&!e.destroyed&&(e.updateSize(),e.updateSlides(),e.updateProgress(),e.updateSlidesClasses(),e.params.freeMode?(t(),e.params.autoHeight&&e.updateAutoHeight()):(("auto"===e.params.slidesPerView||e.params.slidesPerView>1)&&e.isEnd&&!e.params.centeredSlides?e.slideTo(e.slides.length-1,0,!1,!0):e.slideTo(e.activeIndex,0,!1,!0))||t(),e.emit("update"));function t(){var t=e.rtl?-1*e.translate:e.translate,i=Math.min(Math.max(t,e.maxTranslate()),e.minTranslate());e.setTranslate(i),e.updateActiveIndex(),e.updateSlidesClasses()}},t.prototype.init=function(){this.initialized||(this.emit("beforeInit"),this.params.breakpoints&&this.setBreakpoint(),this.addClasses(),this.params.loop&&this.loopCreate(),this.updateSize(),this.updateSlides(),this.params.watchOverflow&&this.checkOverflow(),this.params.grabCursor&&this.setGrabCursor(),this.params.preloadImages&&this.preloadImages(),this.params.loop?this.slideTo(this.params.initialSlide+this.loopedSlides,0,this.params.runCallbacksOnInit):this.slideTo(this.params.initialSlide,0,this.params.runCallbacksOnInit),this.attachEvents(),this.initialized=!0,this.emit("init"))},t.prototype.destroy=function(e,t){void 0===e&&(e=!0),void 0===t&&(t=!0);var i=this,s=i.params,a=i.$el,r=i.$wrapperEl,n=i.slides;i.emit("beforeDestroy"),i.initialized=!1,i.detachEvents(),s.loop&&i.loopDestroy(),t&&(i.removeClasses(),a.removeAttr("style"),r.removeAttr("style"),n&&n.length&&n.removeClass([s.slideVisibleClass,s.slideActiveClass,s.slideNextClass,s.slidePrevClass].join(" ")).removeAttr("style").removeAttr("data-swiper-slide-index").removeAttr("data-swiper-column").removeAttr("data-swiper-row")),i.emit("destroy"),Object.keys(i.eventsListeners).forEach(function(e){i.off(e)}),!1!==e&&(i.$el[0].swiper=null,i.$el.data("swiper",null),d.deleteProps(i)),i.destroyed=!0},t.extendDefaults=function(e){d.extend(L,e)},i.extendedDefaults.get=function(){return L},i.defaults.get=function(){return k},i.Class.get=function(){return e},i.$.get=function(){return s},Object.defineProperties(t,i),t}(p),D={name:"device",proto:{device:y},static:{device:y}},O={name:"support",proto:{support:h},static:{support:h}},A={name:"browser",proto:{browser:P},static:{browser:P}},H={name:"resize",create:function(){var e=this;d.extend(e,{resize:{resizeHandler:function(){e&&!e.destroyed&&e.initialized&&(e.emit("beforeResize"),e.emit("resize"))},orientationChangeHandler:function(){e&&!e.destroyed&&e.initialized&&e.emit("orientationchange")}}})},on:{init:function(){t.addEventListener("resize",this.resize.resizeHandler),t.addEventListener("orientationchange",this.resize.orientationChangeHandler)},destroy:function(){t.removeEventListener("resize",this.resize.resizeHandler),t.removeEventListener("orientationchange",this.resize.orientationChangeHandler)}}},N={func:t.MutationObserver||t.WebkitMutationObserver,attach:function(e,t){void 0===t&&(t={});var i=this,s=new(0,N.func)(function(e){e.forEach(function(e){i.emit("observerUpdate",e)})});s.observe(e,{attributes:void 0===t.attributes||t.attributes,childList:void 0===t.childList||t.childList,characterData:void 0===t.characterData||t.characterData}),i.observer.observers.push(s)},init:function(){if(h.observer&&this.params.observer){if(this.params.observeParents)for(var e=this.$el.parents(),t=0;t<e.length;t+=1)this.observer.attach(e[t]);this.observer.attach(this.$el[0],{childList:!1}),this.observer.attach(this.$wrapperEl[0],{attributes:!1})}},destroy:function(){this.observer.observers.forEach(function(e){e.disconnect()}),this.observer.observers=[]}},X={name:"observer",params:{observer:!1,observeParents:!1},create:function(){d.extend(this,{observer:{init:N.init.bind(this),attach:N.attach.bind(this),destroy:N.destroy.bind(this),observers:[]}})},on:{init:function(){this.observer.init()},destroy:function(){this.observer.destroy()}}},Y={update:function(e){var t=this,i=t.params,s=i.slidesPerView,a=i.slidesPerGroup,r=i.centeredSlides,n=t.virtual,o=n.from,l=n.to,h=n.slides,p=n.slidesGrid,c=n.renderSlide,u=n.offset;t.updateActiveIndex();var v,f,m,g=t.activeIndex||0;v=t.rtl&&t.isHorizontal()?"right":t.isHorizontal()?"left":"top",r?(f=Math.floor(s/2)+a,m=Math.floor(s/2)+a):(f=s+(a-1),m=a);var b=Math.max((g||0)-m,0),w=Math.min((g||0)+f,h.length-1),y=(t.slidesGrid[b]||0)-(t.slidesGrid[0]||0);function x(){t.updateSlides(),t.updateProgress(),t.updateSlidesClasses(),t.lazy&&t.params.lazy.enabled&&t.lazy.load()}if(d.extend(t.virtual,{from:b,to:w,offset:y,slidesGrid:t.slidesGrid}),o===b&&l===w&&!e)return t.slidesGrid!==p&&y!==u&&t.slides.css(v,y+"px"),void t.updateProgress();if(t.params.virtual.renderExternal)return t.params.virtual.renderExternal.call(t,{offset:y,from:b,to:w,slides:function(){for(var e=[],t=b;t<=w;t+=1)e.push(h[t]);return e}()}),void x();var E=[],T=[];if(e)t.$wrapperEl.find("."+t.params.slideClass).remove();else for(var S=o;S<=l;S+=1)(S<b||S>w)&&t.$wrapperEl.find("."+t.params.slideClass+'[data-swiper-slide-index="'+S+'"]').remove();for(var C=0;C<h.length;C+=1)C>=b&&C<=w&&(void 0===l||e?T.push(C):(C>l&&T.push(C),C<o&&E.push(C)));T.forEach(function(e){t.$wrapperEl.append(c(h[e],e))}),E.sort(function(e,t){return e<t}).forEach(function(e){t.$wrapperEl.prepend(c(h[e],e))}),t.$wrapperEl.children(".swiper-slide").css(v,y+"px"),x()},renderSlide:function(e,t){var i=this.params.virtual;if(i.cache&&this.virtual.cache[t])return this.virtual.cache[t];var a=i.renderSlide?s(i.renderSlide.call(this,e,t)):s('<div class="'+this.params.slideClass+'" data-swiper-slide-index="'+t+'">'+e+"</div>");return a.attr("data-swiper-slide-index")||a.attr("data-swiper-slide-index",t),i.cache&&(this.virtual.cache[t]=a),a},appendSlide:function(e){this.virtual.slides.push(e),this.virtual.update(!0)},prependSlide:function(e){if(this.virtual.slides.unshift(e),this.params.virtual.cache){var t=this.virtual.cache,i={};Object.keys(t).forEach(function(e){i[e+1]=t[e]}),this.virtual.cache=i}this.virtual.update(!0),this.slideNext(0)}},B={name:"virtual",params:{virtual:{enabled:!1,slides:[],cache:!0,renderSlide:null,renderExternal:null}},create:function(){d.extend(this,{virtual:{update:Y.update.bind(this),appendSlide:Y.appendSlide.bind(this),prependSlide:Y.prependSlide.bind(this),renderSlide:Y.renderSlide.bind(this),slides:this.params.virtual.slides,cache:{}}})},on:{beforeInit:function(){if(this.params.virtual.enabled){this.classNames.push(this.params.containerModifierClass+"virtual");var e={watchSlidesProgress:!0};d.extend(this.params,e),d.extend(this.originalParams,e),this.virtual.update()}},setTranslate:function(){this.params.virtual.enabled&&this.virtual.update()}}},G={handle:function(i){var s=i;s.originalEvent&&(s=s.originalEvent);var a=s.keyCode||s.charCode;if(!this.allowSlideNext&&(this.isHorizontal()&&39===a||this.isVertical()&&40===a))return!1;if(!this.allowSlidePrev&&(this.isHorizontal()&&37===a||this.isVertical()&&38===a))return!1;if(!(s.shiftKey||s.altKey||s.ctrlKey||s.metaKey||e.activeElement&&e.activeElement.nodeName&&("input"===e.activeElement.nodeName.toLowerCase()||"textarea"===e.activeElement.nodeName.toLowerCase()))){if(this.params.keyboard.onlyInViewport&&(37===a||39===a||38===a||40===a)){var r=!1;if(this.$el.parents("."+this.params.slideClass).length>0&&0===this.$el.parents("."+this.params.slideActiveClass).length)return;var n=t.innerWidth,o=t.innerHeight,l=this.$el.offset();this.rtl&&(l.left-=this.$el[0].scrollLeft);for(var d=[[l.left,l.top],[l.left+this.width,l.top],[l.left,l.top+this.height],[l.left+this.width,l.top+this.height]],h=0;h<d.length;h+=1){var p=d[h];p[0]>=0&&p[0]<=n&&p[1]>=0&&p[1]<=o&&(r=!0)}if(!r)return}this.isHorizontal()?(37!==a&&39!==a||(s.preventDefault?s.preventDefault():s.returnValue=!1),(39===a&&!this.rtl||37===a&&this.rtl)&&this.slideNext(),(37===a&&!this.rtl||39===a&&this.rtl)&&this.slidePrev()):(38!==a&&40!==a||(s.preventDefault?s.preventDefault():s.returnValue=!1),40===a&&this.slideNext(),38===a&&this.slidePrev()),this.emit("keyPress",a)}},enable:function(){this.keyboard.enabled||(s(e).on("keydown",this.keyboard.handle),this.keyboard.enabled=!0)},disable:function(){this.keyboard.enabled&&(s(e).off("keydown",this.keyboard.handle),this.keyboard.enabled=!1)}},V={name:"keyboard",params:{keyboard:{enabled:!1,onlyInViewport:!0}},create:function(){d.extend(this,{keyboard:{enabled:!1,enable:G.enable.bind(this),disable:G.disable.bind(this),handle:G.handle.bind(this)}})},on:{init:function(){this.params.keyboard.enabled&&this.keyboard.enable()},destroy:function(){this.keyboard.enabled&&this.keyboard.disable()}}};var R={lastScrollTime:d.now(),event:t.navigator.userAgent.indexOf("firefox")>-1?"DOMMouseScroll":function(){var t="onwheel"in e;if(!t){var i=e.createElement("div");i.setAttribute("onwheel","return;"),t="function"==typeof i.onwheel}return!t&&e.implementation&&e.implementation.hasFeature&&!0!==e.implementation.hasFeature("","")&&(t=e.implementation.hasFeature("Events.wheel","3.0")),t}()?"wheel":"mousewheel",normalize:function(e){var t=0,i=0,s=0,a=0;return"detail"in e&&(i=e.detail),"wheelDelta"in e&&(i=-e.wheelDelta/120),"wheelDeltaY"in e&&(i=-e.wheelDeltaY/120),"wheelDeltaX"in e&&(t=-e.wheelDeltaX/120),"axis"in e&&e.axis===e.HORIZONTAL_AXIS&&(t=i,i=0),s=10*t,a=10*i,"deltaY"in e&&(a=e.deltaY),"deltaX"in e&&(s=e.deltaX),(s||a)&&e.deltaMode&&(1===e.deltaMode?(s*=40,a*=40):(s*=800,a*=800)),s&&!t&&(t=s<1?-1:1),a&&!i&&(i=a<1?-1:1),{spinX:t,spinY:i,pixelX:s,pixelY:a}},handle:function(e){var i=e,s=this,a=s.params.mousewheel;i.originalEvent&&(i=i.originalEvent);var r=0,n=s.rtl?-1:1,o=R.normalize(i);if(a.forceToAxis)if(s.isHorizontal()){if(!(Math.abs(o.pixelX)>Math.abs(o.pixelY)))return!0;r=o.pixelX*n}else{if(!(Math.abs(o.pixelY)>Math.abs(o.pixelX)))return!0;r=o.pixelY}else r=Math.abs(o.pixelX)>Math.abs(o.pixelY)?-o.pixelX*n:-o.pixelY;if(0===r)return!0;if(a.invert&&(r=-r),s.params.freeMode){var l=s.getTranslate()+r*a.sensitivity,h=s.isBeginning,p=s.isEnd;if(l>=s.minTranslate()&&(l=s.minTranslate()),l<=s.maxTranslate()&&(l=s.maxTranslate()),s.setTransition(0),s.setTranslate(l),s.updateProgress(),s.updateActiveIndex(),s.updateSlidesClasses(),(!h&&s.isBeginning||!p&&s.isEnd)&&s.updateSlidesClasses(),s.params.freeModeSticky&&(clearTimeout(s.mousewheel.timeout),s.mousewheel.timeout=d.nextTick(function(){s.slideReset()},300)),s.emit("scroll",i),s.params.autoplay&&s.params.autoplayDisableOnInteraction&&s.stopAutoplay(),l===s.minTranslate()||l===s.maxTranslate())return!0}else{if(d.now()-s.mousewheel.lastScrollTime>60)if(r<0)if(s.isEnd&&!s.params.loop||s.animating){if(a.releaseOnEdges)return!0}else s.slideNext(),s.emit("scroll",i);else if(s.isBeginning&&!s.params.loop||s.animating){if(a.releaseOnEdges)return!0}else s.slidePrev(),s.emit("scroll",i);s.mousewheel.lastScrollTime=(new t.Date).getTime()}return i.preventDefault?i.preventDefault():i.returnValue=!1,!1},enable:function(){if(!R.event)return!1;if(this.mousewheel.enabled)return!1;var e=this.$el;return"container"!==this.params.mousewheel.eventsTarged&&(e=s(this.params.mousewheel.eventsTarged)),e.on(R.event,this.mousewheel.handle),this.mousewheel.enabled=!0,!0},disable:function(){if(!R.event)return!1;if(!this.mousewheel.enabled)return!1;var e=this.$el;return"container"!==this.params.mousewheel.eventsTarged&&(e=s(this.params.mousewheel.eventsTarged)),e.off(R.event,this.mousewheel.handle),this.mousewheel.enabled=!1,!0}},F={update:function(){var e=this.params.navigation;if(!this.params.loop){var t=this.navigation,i=t.$nextEl,s=t.$prevEl;s&&s.length>0&&(this.isBeginning?s.addClass(e.disabledClass):s.removeClass(e.disabledClass),s[this.params.watchOverflow&&this.isLocked?"addClass":"removeClass"](e.lockClass)),i&&i.length>0&&(this.isEnd?i.addClass(e.disabledClass):i.removeClass(e.disabledClass),i[this.params.watchOverflow&&this.isLocked?"addClass":"removeClass"](e.lockClass))}},init:function(){var e,t,i=this,a=i.params.navigation;(a.nextEl||a.prevEl)&&(a.nextEl&&(e=s(a.nextEl),i.params.uniqueNavElements&&"string"==typeof a.nextEl&&e.length>1&&1===i.$el.find(a.nextEl).length&&(e=i.$el.find(a.nextEl))),a.prevEl&&(t=s(a.prevEl),i.params.uniqueNavElements&&"string"==typeof a.prevEl&&t.length>1&&1===i.$el.find(a.prevEl).length&&(t=i.$el.find(a.prevEl))),e&&e.length>0&&e.on("click",function(e){e.preventDefault(),i.isEnd&&!i.params.loop||i.slideNext()}),t&&t.length>0&&t.on("click",function(e){e.preventDefault(),i.isBeginning&&!i.params.loop||i.slidePrev()}),d.extend(i.navigation,{$nextEl:e,nextEl:e&&e[0],$prevEl:t,prevEl:t&&t[0]}))},destroy:function(){var e=this.navigation,t=e.$nextEl,i=e.$prevEl;t&&t.length&&(t.off("click"),t.removeClass(this.params.navigation.disabledClass)),i&&i.length&&(i.off("click"),i.removeClass(this.params.navigation.disabledClass))}},W={update:function(){var e=this.rtl,t=this.params.pagination;if(t.el&&this.pagination.el&&this.pagination.$el&&0!==this.pagination.$el.length){var i,a=this.virtual&&this.params.virtual.enabled?this.virtual.slides.length:this.slides.length,r=this.pagination.$el,n=this.params.loop?Math.ceil((a-2*this.loopedSlides)/this.params.slidesPerGroup):this.snapGrid.length;if(this.params.loop?((i=Math.ceil((this.activeIndex-this.loopedSlides)/this.params.slidesPerGroup))>a-1-2*this.loopedSlides&&(i-=a-2*this.loopedSlides),i>n-1&&(i-=n),i<0&&"bullets"!==this.params.paginationType&&(i=n+i)):i=void 0!==this.snapIndex?this.snapIndex:this.activeIndex||0,"bullets"===t.type&&this.pagination.bullets&&this.pagination.bullets.length>0){var o,l,d,h=this.pagination.bullets;if(t.dynamicBullets&&(this.pagination.bulletSize=h.eq(0)[this.isHorizontal()?"outerWidth":"outerHeight"](!0),r.css(this.isHorizontal()?"width":"height",this.pagination.bulletSize*(t.dynamicMainBullets+4)+"px"),t.dynamicMainBullets>1&&void 0!==this.previousIndex&&(i>this.previousIndex&&this.pagination.dynamicBulletIndex<t.dynamicMainBullets-1?this.pagination.dynamicBulletIndex+=1:i<this.previousIndex&&this.pagination.dynamicBulletIndex>0&&(this.pagination.dynamicBulletIndex-=1)),o=i-this.pagination.dynamicBulletIndex,d=((l=o+(t.dynamicMainBullets-1))+o)/2),h.removeClass(t.bulletActiveClass+" "+t.bulletActiveClass+"-next "+t.bulletActiveClass+"-next-next "+t.bulletActiveClass+"-prev "+t.bulletActiveClass+"-prev-prev "+t.bulletActiveClass+"-main"),r.length>1)h.each(function(e,a){var r=s(a),n=r.index();n===i&&r.addClass(t.bulletActiveClass),t.dynamicBullets&&(n>=o&&n<=l&&r.addClass(t.bulletActiveClass+"-main"),n===o&&r.prev().addClass(t.bulletActiveClass+"-prev").prev().addClass(t.bulletActiveClass+"-prev-prev"),n===l&&r.next().addClass(t.bulletActiveClass+"-next").next().addClass(t.bulletActiveClass+"-next-next"))});else if(h.eq(i).addClass(t.bulletActiveClass),t.dynamicBullets){for(var p=h.eq(o),c=h.eq(l),u=o;u<=l;u+=1)h.eq(u).addClass(t.bulletActiveClass+"-main");p.prev().addClass(t.bulletActiveClass+"-prev").prev().addClass(t.bulletActiveClass+"-prev-prev"),c.next().addClass(t.bulletActiveClass+"-next").next().addClass(t.bulletActiveClass+"-next-next")}if(t.dynamicBullets){var v=Math.min(h.length,t.dynamicMainBullets+4),f=(this.pagination.bulletSize*v-this.pagination.bulletSize)/2-d*this.pagination.bulletSize,m=e?"right":"left";h.css(this.isHorizontal()?m:"top",f+"px")}}if("fraction"===t.type&&(r.find("."+t.currentClass).text(i+1),r.find("."+t.totalClass).text(n)),"progressbar"===t.type){var g=(i+1)/n,b=g,w=1;this.isHorizontal()||(w=g,b=1),r.find("."+t.progressbarFillClass).transform("translate3d(0,0,0) scaleX("+b+") scaleY("+w+")").transition(this.params.speed)}"custom"===t.type&&t.renderCustom?(r.html(t.renderCustom(this,i+1,n)),this.emit("paginationRender",this,r[0])):this.emit("paginationUpdate",this,r[0]),r[this.params.watchOverflow&&this.isLocked?"addClass":"removeClass"](t.lockClass)}},render:function(){var e=this.params.pagination;if(e.el&&this.pagination.el&&this.pagination.$el&&0!==this.pagination.$el.length){var t=this.virtual&&this.params.virtual.enabled?this.virtual.slides.length:this.slides.length,i=this.pagination.$el,s="";if("bullets"===e.type){for(var a=this.params.loop?Math.ceil((t-2*this.loopedSlides)/this.params.slidesPerGroup):this.snapGrid.length,r=0;r<a;r+=1)e.renderBullet?s+=e.renderBullet.call(this,r,e.bulletClass):s+="<"+e.bulletElement+' class="'+e.bulletClass+'"></'+e.bulletElement+">";i.html(s),this.pagination.bullets=i.find("."+e.bulletClass)}"fraction"===e.type&&(s=e.renderFraction?e.renderFraction.call(this,e.currentClass,e.totalClass):'<span class="'+e.currentClass+'"></span> / <span class="'+e.totalClass+'"></span>',i.html(s)),"progressbar"===e.type&&(s=e.renderProgressbar?e.renderProgressbar.call(this,e.progressbarFillClass):'<span class="'+e.progressbarFillClass+'"></span>',i.html(s)),"custom"!==e.type&&this.emit("paginationRender",this.pagination.$el[0])}},init:function(){var e=this,t=e.params.pagination;if(t.el){var i=s(t.el);0!==i.length&&(e.params.uniqueNavElements&&"string"==typeof t.el&&i.length>1&&1===e.$el.find(t.el).length&&(i=e.$el.find(t.el)),"bullets"===t.type&&t.clickable&&i.addClass(t.clickableClass),i.addClass(t.modifierClass+t.type),"bullets"===t.type&&t.dynamicBullets&&(i.addClass(""+t.modifierClass+t.type+"-dynamic"),e.pagination.dynamicBulletIndex=0,t.dynamicMainBullets<1&&(t.dynamicMainBullets=1)),t.clickable&&i.on("click","."+t.bulletClass,function(t){t.preventDefault();var i=s(this).index()*e.params.slidesPerGroup;e.params.loop&&(i+=e.loopedSlides),e.slideTo(i)}),d.extend(e.pagination,{$el:i,el:i[0]}))}},destroy:function(){var e=this.params.pagination;if(e.el&&this.pagination.el&&this.pagination.$el&&0!==this.pagination.$el.length){var t=this.pagination.$el;t.removeClass(e.hiddenClass),t.removeClass(e.modifierClass+e.type),this.pagination.bullets&&this.pagination.bullets.removeClass(e.bulletActiveClass),e.clickable&&t.off("click","."+e.bulletClass)}}},q={setTranslate:function(){if(this.params.scrollbar.el&&this.scrollbar.el){var e=this.scrollbar,t=this.rtl,i=this.progress,s=e.dragSize,a=e.trackSize,r=e.$dragEl,n=e.$el,o=this.params.scrollbar,l=s,d=(a-s)*i;t&&this.isHorizontal()?(d=-d)>0?(l=s-d,d=0):-d+s>a&&(l=a+d):d<0?(l=s+d,d=0):d+s>a&&(l=a-d),this.isHorizontal()?(h.transforms3d?r.transform("translate3d("+d+"px, 0, 0)"):r.transform("translateX("+d+"px)"),r[0].style.width=l+"px"):(h.transforms3d?r.transform("translate3d(0px, "+d+"px, 0)"):r.transform("translateY("+d+"px)"),r[0].style.height=l+"px"),o.hide&&(clearTimeout(this.scrollbar.timeout),n[0].style.opacity=1,this.scrollbar.timeout=setTimeout(function(){n[0].style.opacity=0,n.transition(400)},1e3))}},setTransition:function(e){this.params.scrollbar.el&&this.scrollbar.el&&this.scrollbar.$dragEl.transition(e)},updateSize:function(){if(this.params.scrollbar.el&&this.scrollbar.el){var e=this.scrollbar,t=e.$dragEl,i=e.$el;t[0].style.width="",t[0].style.height="";var s,a=this.isHorizontal()?i[0].offsetWidth:i[0].offsetHeight,r=this.size/this.virtualSize,n=r*(a/this.size);s="auto"===this.params.scrollbar.dragSize?a*r:parseInt(this.params.scrollbar.dragSize,10),this.isHorizontal()?t[0].style.width=s+"px":t[0].style.height=s+"px",i[0].style.display=r>=1?"none":"",this.params.scrollbarHide&&(i[0].style.opacity=0),d.extend(e,{trackSize:a,divider:r,moveDivider:n,dragSize:s}),e.$el[this.params.watchOverflow&&this.isLocked?"addClass":"removeClass"](this.params.scrollbar.lockClass)}},setDragPosition:function(e){var t,i=this.scrollbar,s=i.$el,a=i.dragSize,r=i.trackSize;t=((this.isHorizontal()?"touchstart"===e.type||"touchmove"===e.type?e.targetTouches[0].pageX:e.pageX||e.clientX:"touchstart"===e.type||"touchmove"===e.type?e.targetTouches[0].pageY:e.pageY||e.clientY)-s.offset()[this.isHorizontal()?"left":"top"]-a/2)/(r-a),t=Math.max(Math.min(t,1),0),this.rtl&&(t=1-t);var n=this.minTranslate()+(this.maxTranslate()-this.minTranslate())*t;this.updateProgress(n),this.setTranslate(n),this.updateActiveIndex(),this.updateSlidesClasses()},onDragStart:function(e){var t=this.params.scrollbar,i=this.scrollbar,s=this.$wrapperEl,a=i.$el,r=i.$dragEl;this.scrollbar.isTouched=!0,e.preventDefault(),e.stopPropagation(),s.transition(100),r.transition(100),i.setDragPosition(e),clearTimeout(this.scrollbar.dragTimeout),a.transition(0),t.hide&&a.css("opacity",1),this.emit("scrollbarDragStart",e)},onDragMove:function(e){var t=this.scrollbar,i=this.$wrapperEl,s=t.$el,a=t.$dragEl;this.scrollbar.isTouched&&(e.preventDefault?e.preventDefault():e.returnValue=!1,t.setDragPosition(e),i.transition(0),s.transition(0),a.transition(0),this.emit("scrollbarDragMove",e))},onDragEnd:function(e){var t=this.params.scrollbar,i=this.scrollbar.$el;this.scrollbar.isTouched&&(this.scrollbar.isTouched=!1,t.hide&&(clearTimeout(this.scrollbar.dragTimeout),this.scrollbar.dragTimeout=d.nextTick(function(){i.css("opacity",0),i.transition(400)},1e3)),this.emit("scrollbarDragEnd",e),t.snapOnRelease&&this.slideReset())},enableDraggable:function(){if(this.params.scrollbar.el){var t=this.scrollbar,i=this.touchEvents,s=this.touchEventsDesktop,a=this.params,r=t.$el[0],n=!(!h.passiveListener||!a.passiveListener)&&{passive:!1,capture:!1},o=!(!h.passiveListener||!a.passiveListener)&&{passive:!0,capture:!1};h.touch||!h.pointerEvents&&!h.prefixedPointerEvents?(h.touch&&(r.addEventListener(i.start,this.scrollbar.onDragStart,n),r.addEventListener(i.move,this.scrollbar.onDragMove,n),r.addEventListener(i.end,this.scrollbar.onDragEnd,o)),(a.simulateTouch&&!y.ios&&!y.android||a.simulateTouch&&!h.touch&&y.ios)&&(r.addEventListener("mousedown",this.scrollbar.onDragStart,n),e.addEventListener("mousemove",this.scrollbar.onDragMove,n),e.addEventListener("mouseup",this.scrollbar.onDragEnd,o))):(r.addEventListener(s.start,this.scrollbar.onDragStart,n),e.addEventListener(s.move,this.scrollbar.onDragMove,n),e.addEventListener(s.end,this.scrollbar.onDragEnd,o))}},disableDraggable:function(){if(this.params.scrollbar.el){var t=this.scrollbar,i=this.touchEvents,s=this.touchEventsDesktop,a=this.params,r=t.$el[0],n=!(!h.passiveListener||!a.passiveListener)&&{passive:!1,capture:!1},o=!(!h.passiveListener||!a.passiveListener)&&{passive:!0,capture:!1};h.touch||!h.pointerEvents&&!h.prefixedPointerEvents?(h.touch&&(r.removeEventListener(i.start,this.scrollbar.onDragStart,n),r.removeEventListener(i.move,this.scrollbar.onDragMove,n),r.removeEventListener(i.end,this.scrollbar.onDragEnd,o)),(a.simulateTouch&&!y.ios&&!y.android||a.simulateTouch&&!h.touch&&y.ios)&&(r.removeEventListener("mousedown",this.scrollbar.onDragStart,n),e.removeEventListener("mousemove",this.scrollbar.onDragMove,n),e.removeEventListener("mouseup",this.scrollbar.onDragEnd,o))):(r.removeEventListener(s.start,this.scrollbar.onDragStart,n),e.removeEventListener(s.move,this.scrollbar.onDragMove,n),e.removeEventListener(s.end,this.scrollbar.onDragEnd,o))}},init:function(){if(this.params.scrollbar.el){var e=this.scrollbar,t=this.$el,i=this.params.scrollbar,a=s(i.el);this.params.uniqueNavElements&&"string"==typeof i.el&&a.length>1&&1===t.find(i.el).length&&(a=t.find(i.el));var r=a.find("."+this.params.scrollbar.dragClass);0===r.length&&(r=s('<div class="'+this.params.scrollbar.dragClass+'"></div>'),a.append(r)),d.extend(e,{$el:a,el:a[0],$dragEl:r,dragEl:r[0]}),i.draggable&&e.enableDraggable()}},destroy:function(){this.scrollbar.disableDraggable()}},j={setTransform:function(e,t){var i=this.rtl,a=s(e),r=i?-1:1,n=a.attr("data-swiper-parallax")||"0",o=a.attr("data-swiper-parallax-x"),l=a.attr("data-swiper-parallax-y"),d=a.attr("data-swiper-parallax-scale"),h=a.attr("data-swiper-parallax-opacity");if(o||l?(o=o||"0",l=l||"0"):this.isHorizontal()?(o=n,l="0"):(l=n,o="0"),o=o.indexOf("%")>=0?parseInt(o,10)*t*r+"%":o*t*r+"px",l=l.indexOf("%")>=0?parseInt(l,10)*t+"%":l*t+"px",void 0!==h&&null!==h){var p=h-(h-1)*(1-Math.abs(t));a[0].style.opacity=p}if(void 0===d||null===d)a.transform("translate3d("+o+", "+l+", 0px)");else{var c=d-(d-1)*(1-Math.abs(t));a.transform("translate3d("+o+", "+l+", 0px) scale("+c+")")}},setTranslate:function(){var e=this,t=e.$el,i=e.slides,a=e.progress,r=e.snapGrid;t.children("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(t,i){e.parallax.setTransform(i,a)}),i.each(function(t,i){var n=i.progress;e.params.slidesPerGroup>1&&"auto"!==e.params.slidesPerView&&(n+=Math.ceil(t/2)-a*(r.length-1)),n=Math.min(Math.max(n,-1),1),s(i).find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(t,i){e.parallax.setTransform(i,n)})})},setTransition:function(e){void 0===e&&(e=this.params.speed);this.$el.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(t,i){var a=s(i),r=parseInt(a.attr("data-swiper-parallax-duration"),10)||e;0===e&&(r=0),a.transition(r)})}},K={getDistanceBetweenTouches:function(e){if(e.targetTouches.length<2)return 1;var t=e.targetTouches[0].pageX,i=e.targetTouches[0].pageY,s=e.targetTouches[1].pageX,a=e.targetTouches[1].pageY;return Math.sqrt(Math.pow(s-t,2)+Math.pow(a-i,2))},onGestureStart:function(e){var t=this.params.zoom,i=this.zoom,a=i.gesture;if(i.fakeGestureTouched=!1,i.fakeGestureMoved=!1,!h.gestures){if("touchstart"!==e.type||"touchstart"===e.type&&e.targetTouches.length<2)return;i.fakeGestureTouched=!0,a.scaleStart=K.getDistanceBetweenTouches(e)}a.$slideEl&&a.$slideEl.length||(a.$slideEl=s(e.target).closest(".swiper-slide"),0===a.$slideEl.length&&(a.$slideEl=this.slides.eq(this.activeIndex)),a.$imageEl=a.$slideEl.find("img, svg, canvas"),a.$imageWrapEl=a.$imageEl.parent("."+t.containerClass),a.maxRatio=a.$imageWrapEl.attr("data-swiper-zoom")||t.maxRatio,0!==a.$imageWrapEl.length)?(a.$imageEl.transition(0),this.zoom.isScaling=!0):a.$imageEl=void 0},onGestureChange:function(e){var t=this.params.zoom,i=this.zoom,s=i.gesture;if(!h.gestures){if("touchmove"!==e.type||"touchmove"===e.type&&e.targetTouches.length<2)return;i.fakeGestureMoved=!0,s.scaleMove=K.getDistanceBetweenTouches(e)}s.$imageEl&&0!==s.$imageEl.length&&(h.gestures?this.zoom.scale=e.scale*i.currentScale:i.scale=s.scaleMove/s.scaleStart*i.currentScale,i.scale>s.maxRatio&&(i.scale=s.maxRatio-1+Math.pow(i.scale-s.maxRatio+1,.5)),i.scale<t.minRatio&&(i.scale=t.minRatio+1-Math.pow(t.minRatio-i.scale+1,.5)),s.$imageEl.transform("translate3d(0,0,0) scale("+i.scale+")"))},onGestureEnd:function(e){var t=this.params.zoom,i=this.zoom,s=i.gesture;if(!h.gestures){if(!i.fakeGestureTouched||!i.fakeGestureMoved)return;if("touchend"!==e.type||"touchend"===e.type&&e.changedTouches.length<2&&!y.android)return;i.fakeGestureTouched=!1,i.fakeGestureMoved=!1}s.$imageEl&&0!==s.$imageEl.length&&(i.scale=Math.max(Math.min(i.scale,s.maxRatio),t.minRatio),s.$imageEl.transition(this.params.speed).transform("translate3d(0,0,0) scale("+i.scale+")"),i.currentScale=i.scale,i.isScaling=!1,1===i.scale&&(s.$slideEl=void 0))},onTouchStart:function(e){var t=this.zoom,i=t.gesture,s=t.image;i.$imageEl&&0!==i.$imageEl.length&&(s.isTouched||(y.android&&e.preventDefault(),s.isTouched=!0,s.touchesStart.x="touchstart"===e.type?e.targetTouches[0].pageX:e.pageX,s.touchesStart.y="touchstart"===e.type?e.targetTouches[0].pageY:e.pageY))},onTouchMove:function(e){var t=this.zoom,i=t.gesture,s=t.image,a=t.velocity;if(i.$imageEl&&0!==i.$imageEl.length&&(this.allowClick=!1,s.isTouched&&i.$slideEl)){s.isMoved||(s.width=i.$imageEl[0].offsetWidth,s.height=i.$imageEl[0].offsetHeight,s.startX=d.getTranslate(i.$imageWrapEl[0],"x")||0,s.startY=d.getTranslate(i.$imageWrapEl[0],"y")||0,i.slideWidth=i.$slideEl[0].offsetWidth,i.slideHeight=i.$slideEl[0].offsetHeight,i.$imageWrapEl.transition(0),this.rtl&&(s.startX=-s.startX),this.rtl&&(s.startY=-s.startY));var r=s.width*t.scale,n=s.height*t.scale;if(!(r<i.slideWidth&&n<i.slideHeight)){if(s.minX=Math.min(i.slideWidth/2-r/2,0),s.maxX=-s.minX,s.minY=Math.min(i.slideHeight/2-n/2,0),s.maxY=-s.minY,s.touchesCurrent.x="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,s.touchesCurrent.y="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY,!s.isMoved&&!t.isScaling){if(this.isHorizontal()&&(Math.floor(s.minX)===Math.floor(s.startX)&&s.touchesCurrent.x<s.touchesStart.x||Math.floor(s.maxX)===Math.floor(s.startX)&&s.touchesCurrent.x>s.touchesStart.x))return void(s.isTouched=!1);if(!this.isHorizontal()&&(Math.floor(s.minY)===Math.floor(s.startY)&&s.touchesCurrent.y<s.touchesStart.y||Math.floor(s.maxY)===Math.floor(s.startY)&&s.touchesCurrent.y>s.touchesStart.y))return void(s.isTouched=!1)}e.preventDefault(),e.stopPropagation(),s.isMoved=!0,s.currentX=s.touchesCurrent.x-s.touchesStart.x+s.startX,s.currentY=s.touchesCurrent.y-s.touchesStart.y+s.startY,s.currentX<s.minX&&(s.currentX=s.minX+1-Math.pow(s.minX-s.currentX+1,.8)),s.currentX>s.maxX&&(s.currentX=s.maxX-1+Math.pow(s.currentX-s.maxX+1,.8)),s.currentY<s.minY&&(s.currentY=s.minY+1-Math.pow(s.minY-s.currentY+1,.8)),s.currentY>s.maxY&&(s.currentY=s.maxY-1+Math.pow(s.currentY-s.maxY+1,.8)),a.prevPositionX||(a.prevPositionX=s.touchesCurrent.x),a.prevPositionY||(a.prevPositionY=s.touchesCurrent.y),a.prevTime||(a.prevTime=Date.now()),a.x=(s.touchesCurrent.x-a.prevPositionX)/(Date.now()-a.prevTime)/2,a.y=(s.touchesCurrent.y-a.prevPositionY)/(Date.now()-a.prevTime)/2,Math.abs(s.touchesCurrent.x-a.prevPositionX)<2&&(a.x=0),Math.abs(s.touchesCurrent.y-a.prevPositionY)<2&&(a.y=0),a.prevPositionX=s.touchesCurrent.x,a.prevPositionY=s.touchesCurrent.y,a.prevTime=Date.now(),i.$imageWrapEl.transform("translate3d("+s.currentX+"px, "+s.currentY+"px,0)")}}},onTouchEnd:function(){var e=this.zoom,t=e.gesture,i=e.image,s=e.velocity;if(t.$imageEl&&0!==t.$imageEl.length){if(!i.isTouched||!i.isMoved)return i.isTouched=!1,void(i.isMoved=!1);i.isTouched=!1,i.isMoved=!1;var a=300,r=300,n=s.x*a,o=i.currentX+n,l=s.y*r,d=i.currentY+l;0!==s.x&&(a=Math.abs((o-i.currentX)/s.x)),0!==s.y&&(r=Math.abs((d-i.currentY)/s.y));var h=Math.max(a,r);i.currentX=o,i.currentY=d;var p=i.width*e.scale,c=i.height*e.scale;i.minX=Math.min(t.slideWidth/2-p/2,0),i.maxX=-i.minX,i.minY=Math.min(t.slideHeight/2-c/2,0),i.maxY=-i.minY,i.currentX=Math.max(Math.min(i.currentX,i.maxX),i.minX),i.currentY=Math.max(Math.min(i.currentY,i.maxY),i.minY),t.$imageWrapEl.transition(h).transform("translate3d("+i.currentX+"px, "+i.currentY+"px,0)")}},onTransitionEnd:function(){var e=this.zoom,t=e.gesture;t.$slideEl&&this.previousIndex!==this.activeIndex&&(t.$imageEl.transform("translate3d(0,0,0) scale(1)"),t.$imageWrapEl.transform("translate3d(0,0,0)"),t.$slideEl=void 0,t.$imageEl=void 0,t.$imageWrapEl=void 0,e.scale=1,e.currentScale=1)},toggle:function(e){var t=this.zoom;t.scale&&1!==t.scale?t.out():t.in(e)},in:function(e){var t,i,a,r,n,o,l,d,h,p,c,u,v,f,m,g,b=this.zoom,w=this.params.zoom,y=b.gesture,x=b.image;(y.$slideEl||(y.$slideEl=this.clickedSlide?s(this.clickedSlide):this.slides.eq(this.activeIndex),y.$imageEl=y.$slideEl.find("img, svg, canvas"),y.$imageWrapEl=y.$imageEl.parent("."+w.containerClass)),y.$imageEl&&0!==y.$imageEl.length)&&(y.$slideEl.addClass(""+w.zoomedSlideClass),void 0===x.touchesStart.x&&e?(t="touchend"===e.type?e.changedTouches[0].pageX:e.pageX,i="touchend"===e.type?e.changedTouches[0].pageY:e.pageY):(t=x.touchesStart.x,i=x.touchesStart.y),b.scale=y.$imageWrapEl.attr("data-swiper-zoom")||w.maxRatio,b.currentScale=y.$imageWrapEl.attr("data-swiper-zoom")||w.maxRatio,e?(m=y.$slideEl[0].offsetWidth,g=y.$slideEl[0].offsetHeight,a=y.$slideEl.offset().left+m/2-t,r=y.$slideEl.offset().top+g/2-i,l=y.$imageEl[0].offsetWidth,d=y.$imageEl[0].offsetHeight,h=l*b.scale,p=d*b.scale,v=-(c=Math.min(m/2-h/2,0)),f=-(u=Math.min(g/2-p/2,0)),n=a*b.scale,o=r*b.scale,n<c&&(n=c),n>v&&(n=v),o<u&&(o=u),o>f&&(o=f)):(n=0,o=0),y.$imageWrapEl.transition(300).transform("translate3d("+n+"px, "+o+"px,0)"),y.$imageEl.transition(300).transform("translate3d(0,0,0) scale("+b.scale+")"))},out:function(){var e=this.zoom,t=this.params.zoom,i=e.gesture;i.$slideEl||(i.$slideEl=this.clickedSlide?s(this.clickedSlide):this.slides.eq(this.activeIndex),i.$imageEl=i.$slideEl.find("img, svg, canvas"),i.$imageWrapEl=i.$imageEl.parent("."+t.containerClass)),i.$imageEl&&0!==i.$imageEl.length&&(e.scale=1,e.currentScale=1,i.$imageWrapEl.transition(300).transform("translate3d(0,0,0)"),i.$imageEl.transition(300).transform("translate3d(0,0,0) scale(1)"),i.$slideEl.removeClass(""+t.zoomedSlideClass),i.$slideEl=void 0)},enable:function(){var e=this.zoom;if(!e.enabled){e.enabled=!0;var t=!("touchstart"!==this.touchEvents.start||!h.passiveListener||!this.params.passiveListeners)&&{passive:!0,capture:!1};h.gestures?(this.$wrapperEl.on("gesturestart",".swiper-slide",e.onGestureStart,t),this.$wrapperEl.on("gesturechange",".swiper-slide",e.onGestureChange,t),this.$wrapperEl.on("gestureend",".swiper-slide",e.onGestureEnd,t)):"touchstart"===this.touchEvents.start&&(this.$wrapperEl.on(this.touchEvents.start,".swiper-slide",e.onGestureStart,t),this.$wrapperEl.on(this.touchEvents.move,".swiper-slide",e.onGestureChange,t),this.$wrapperEl.on(this.touchEvents.end,".swiper-slide",e.onGestureEnd,t)),this.$wrapperEl.on(this.touchEvents.move,"."+this.params.zoom.containerClass,e.onTouchMove)}},disable:function(){var e=this.zoom;if(e.enabled){this.zoom.enabled=!1;var t=!("touchstart"!==this.touchEvents.start||!h.passiveListener||!this.params.passiveListeners)&&{passive:!0,capture:!1};h.gestures?(this.$wrapperEl.off("gesturestart",".swiper-slide",e.onGestureStart,t),this.$wrapperEl.off("gesturechange",".swiper-slide",e.onGestureChange,t),this.$wrapperEl.off("gestureend",".swiper-slide",e.onGestureEnd,t)):"touchstart"===this.touchEvents.start&&(this.$wrapperEl.off(this.touchEvents.start,".swiper-slide",e.onGestureStart,t),this.$wrapperEl.off(this.touchEvents.move,".swiper-slide",e.onGestureChange,t),this.$wrapperEl.off(this.touchEvents.end,".swiper-slide",e.onGestureEnd,t)),this.$wrapperEl.off(this.touchEvents.move,"."+this.params.zoom.containerClass,e.onTouchMove)}}},U={loadInSlide:function(e,t){void 0===t&&(t=!0);var i=this,a=i.params.lazy;if(void 0!==e&&0!==i.slides.length){var r=i.virtual&&i.params.virtual.enabled?i.$wrapperEl.children("."+i.params.slideClass+'[data-swiper-slide-index="'+e+'"]'):i.slides.eq(e),n=r.find("."+a.elementClass+":not(."+a.loadedClass+"):not(."+a.loadingClass+")");!r.hasClass(a.elementClass)||r.hasClass(a.loadedClass)||r.hasClass(a.loadingClass)||(n=n.add(r[0])),0!==n.length&&n.each(function(e,n){var o=s(n);o.addClass(a.loadingClass);var l=o.attr("data-background"),d=o.attr("data-src"),h=o.attr("data-srcset"),p=o.attr("data-sizes");i.loadImage(o[0],d||l,h,p,!1,function(){if(void 0!==i&&null!==i&&i&&(!i||i.params)&&!i.destroyed){if(l?(o.css("background-image",'url("'+l+'")'),o.removeAttr("data-background")):(h&&(o.attr("srcset",h),o.removeAttr("data-srcset")),p&&(o.attr("sizes",p),o.removeAttr("data-sizes")),d&&(o.attr("src",d),o.removeAttr("data-src"))),o.addClass(a.loadedClass).removeClass(a.loadingClass),r.find("."+a.preloaderClass).remove(),i.params.loop&&t){var e=r.attr("data-swiper-slide-index");if(r.hasClass(i.params.slideDuplicateClass)){var s=i.$wrapperEl.children('[data-swiper-slide-index="'+e+'"]:not(.'+i.params.slideDuplicateClass+")");i.lazy.loadInSlide(s.index(),!1)}else{var n=i.$wrapperEl.children("."+i.params.slideDuplicateClass+'[data-swiper-slide-index="'+e+'"]');i.lazy.loadInSlide(n.index(),!1)}}i.emit("lazyImageReady",r[0],o[0])}}),i.emit("lazyImageLoad",r[0],o[0])})}},load:function(){var e=this,t=e.$wrapperEl,i=e.params,a=e.slides,r=e.activeIndex,n=e.virtual&&i.virtual.enabled,o=i.lazy,l=i.slidesPerView;function d(e){if(n){if(t.children("."+i.slideClass+'[data-swiper-slide-index="'+e+'"]').length)return!0}else if(a[e])return!0;return!1}function h(e){return n?s(e).attr("data-swiper-slide-index"):s(e).index()}if("auto"===l&&(l=0),e.lazy.initialImageLoaded||(e.lazy.initialImageLoaded=!0),e.params.watchSlidesVisibility)t.children("."+i.slideVisibleClass).each(function(t,i){var a=n?s(i).attr("data-swiper-slide-index"):s(i).index();e.lazy.loadInSlide(a)});else if(l>1)for(var p=r;p<r+l;p+=1)d(p)&&e.lazy.loadInSlide(p);else e.lazy.loadInSlide(r);if(o.loadPrevNext)if(l>1||o.loadPrevNextAmount&&o.loadPrevNextAmount>1){for(var c=o.loadPrevNextAmount,u=l,v=Math.min(r+u+Math.max(c,u),a.length),f=Math.max(r-Math.max(u,c),0),m=r+l;m<v;m+=1)d(m)&&e.lazy.loadInSlide(m);for(var g=f;g<r;g+=1)d(g)&&e.lazy.loadInSlide(g)}else{var b=t.children("."+i.slideNextClass);b.length>0&&e.lazy.loadInSlide(h(b));var w=t.children("."+i.slidePrevClass);w.length>0&&e.lazy.loadInSlide(h(w))}}},_={LinearSpline:function(e,t){var i,s,a,r,n,o=function(e,t){for(s=-1,i=e.length;i-s>1;)e[a=i+s>>1]<=t?s=a:i=a;return i};return this.x=e,this.y=t,this.lastIndex=e.length-1,this.interpolate=function(e){return e?(n=o(this.x,e),r=n-1,(e-this.x[r])*(this.y[n]-this.y[r])/(this.x[n]-this.x[r])+this.y[r]):0},this},getInterpolateFunction:function(e){this.controller.spline||(this.controller.spline=this.params.loop?new _.LinearSpline(this.slidesGrid,e.slidesGrid):new _.LinearSpline(this.snapGrid,e.snapGrid))},setTranslate:function(e,t){var i,s,a=this,r=a.controller.control;function n(e){var t=e.rtl&&"horizontal"===e.params.direction?-a.translate:a.translate;"slide"===a.params.controller.by&&(a.controller.getInterpolateFunction(e),s=-a.controller.spline.interpolate(-t)),s&&"container"!==a.params.controller.by||(i=(e.maxTranslate()-e.minTranslate())/(a.maxTranslate()-a.minTranslate()),s=(t-a.minTranslate())*i+e.minTranslate()),a.params.controller.inverse&&(s=e.maxTranslate()-s),e.updateProgress(s),e.setTranslate(s,a),e.updateActiveIndex(),e.updateSlidesClasses()}if(Array.isArray(r))for(var o=0;o<r.length;o+=1)r[o]!==t&&r[o]instanceof I&&n(r[o]);else r instanceof I&&t!==r&&n(r)},setTransition:function(e,t){var i,s=this,a=s.controller.control;function r(t){t.setTransition(e,s),0!==e&&(t.transitionStart(),t.$wrapperEl.transitionEnd(function(){a&&(t.params.loop&&"slide"===s.params.controller.by&&t.loopFix(),t.transitionEnd())}))}if(Array.isArray(a))for(i=0;i<a.length;i+=1)a[i]!==t&&a[i]instanceof I&&r(a[i]);else a instanceof I&&t!==a&&r(a)}},Z={makeElFocusable:function(e){return e.attr("tabIndex","0"),e},addElRole:function(e,t){return e.attr("role",t),e},addElLabel:function(e,t){return e.attr("aria-label",t),e},disableEl:function(e){return e.attr("aria-disabled",!0),e},enableEl:function(e){return e.attr("aria-disabled",!1),e},onEnterKey:function(e){var t=this.params.a11y;if(13===e.keyCode){var i=s(e.target);this.navigation&&this.navigation.$nextEl&&i.is(this.navigation.$nextEl)&&(this.isEnd&&!this.params.loop||this.slideNext(),this.isEnd?this.a11y.notify(t.lastSlideMessage):this.a11y.notify(t.nextSlideMessage)),this.navigation&&this.navigation.$prevEl&&i.is(this.navigation.$prevEl)&&(this.isBeginning&&!this.params.loop||this.slidePrev(),this.isBeginning?this.a11y.notify(t.firstSlideMessage):this.a11y.notify(t.prevSlideMessage)),this.pagination&&i.is("."+this.params.pagination.bulletClass)&&i[0].click()}},notify:function(e){var t=this.a11y.liveRegion;0!==t.length&&(t.html(""),t.html(e))},updateNavigation:function(){if(!this.params.loop){var e=this.navigation,t=e.$nextEl,i=e.$prevEl;i&&i.length>0&&(this.isBeginning?this.a11y.disableEl(i):this.a11y.enableEl(i)),t&&t.length>0&&(this.isEnd?this.a11y.disableEl(t):this.a11y.enableEl(t))}},updatePagination:function(){var e=this,t=e.params.a11y;e.pagination&&e.params.pagination.clickable&&e.pagination.bullets&&e.pagination.bullets.length&&e.pagination.bullets.each(function(i,a){var r=s(a);e.a11y.makeElFocusable(r),e.a11y.addElRole(r,"button"),e.a11y.addElLabel(r,t.paginationBulletMessage.replace(/{{index}}/,r.index()+1))})},init:function(){this.$el.append(this.a11y.liveRegion);var e,t,i=this.params.a11y;this.navigation&&this.navigation.$nextEl&&(e=this.navigation.$nextEl),this.navigation&&this.navigation.$prevEl&&(t=this.navigation.$prevEl),e&&(this.a11y.makeElFocusable(e),this.a11y.addElRole(e,"button"),this.a11y.addElLabel(e,i.nextSlideMessage),e.on("keydown",this.a11y.onEnterKey)),t&&(this.a11y.makeElFocusable(t),this.a11y.addElRole(t,"button"),this.a11y.addElLabel(t,i.prevSlideMessage),t.on("keydown",this.a11y.onEnterKey)),this.pagination&&this.params.pagination.clickable&&this.pagination.bullets&&this.pagination.bullets.length&&this.pagination.$el.on("keydown","."+this.params.pagination.bulletClass,this.a11y.onEnterKey)},destroy:function(){var e,t;this.a11y.liveRegion&&this.a11y.liveRegion.length>0&&this.a11y.liveRegion.remove(),this.navigation&&this.navigation.$nextEl&&(e=this.navigation.$nextEl),this.navigation&&this.navigation.$prevEl&&(t=this.navigation.$prevEl),e&&e.off("keydown",this.a11y.onEnterKey),t&&t.off("keydown",this.a11y.onEnterKey),this.pagination&&this.params.pagination.clickable&&this.pagination.bullets&&this.pagination.bullets.length&&this.pagination.$el.off("keydown","."+this.params.pagination.bulletClass,this.a11y.onEnterKey)}},Q={init:function(){if(this.params.history){if(!t.history||!t.history.pushState)return this.params.history.enabled=!1,void(this.params.hashNavigation.enabled=!0);var e=this.history;e.initialized=!0,e.paths=Q.getPathValues(),(e.paths.key||e.paths.value)&&(e.scrollToSlide(0,e.paths.value,this.params.runCallbacksOnInit),this.params.history.replaceState||t.addEventListener("popstate",this.history.setHistoryPopState))}},destroy:function(){this.params.history.replaceState||t.removeEventListener("popstate",this.history.setHistoryPopState)},setHistoryPopState:function(){this.history.paths=Q.getPathValues(),this.history.scrollToSlide(this.params.speed,this.history.paths.value,!1)},getPathValues:function(){var e=t.location.pathname.slice(1).split("/").filter(function(e){return""!==e}),i=e.length;return{key:e[i-2],value:e[i-1]}},setHistory:function(e,i){if(this.history.initialized&&this.params.history.enabled){var s=this.slides.eq(i),a=Q.slugify(s.attr("data-history"));t.location.pathname.includes(e)||(a=e+"/"+a);var r=t.history.state;r&&r.value===a||(this.params.history.replaceState?t.history.replaceState({value:a},null,a):t.history.pushState({value:a},null,a))}},slugify:function(e){return e.toString().toLowerCase().replace(/\s+/g,"-").replace(/[^\w-]+/g,"").replace(/--+/g,"-").replace(/^-+/,"").replace(/-+$/,"")},scrollToSlide:function(e,t,i){if(t)for(var s=0,a=this.slides.length;s<a;s+=1){var r=this.slides.eq(s);if(Q.slugify(r.attr("data-history"))===t&&!r.hasClass(this.params.slideDuplicateClass)){var n=r.index();this.slideTo(n,e,i)}}else this.slideTo(0,e,i)}},J={onHashCange:function(){var t=e.location.hash.replace("#","");t!==this.slides.eq(this.activeIndex).attr("data-hash")&&this.slideTo(this.$wrapperEl.children("."+this.params.slideClass+'[data-hash="'+t+'"]').index())},setHash:function(){if(this.hashNavigation.initialized&&this.params.hashNavigation.enabled)if(this.params.hashNavigation.replaceState&&t.history&&t.history.replaceState)t.history.replaceState(null,null,"#"+this.slides.eq(this.activeIndex).attr("data-hash")||"");else{var i=this.slides.eq(this.activeIndex),s=i.attr("data-hash")||i.attr("data-history");e.location.hash=s||""}},init:function(){if(!(!this.params.hashNavigation.enabled||this.params.history&&this.params.history.enabled)){this.hashNavigation.initialized=!0;var i=e.location.hash.replace("#","");if(i)for(var a=0,r=this.slides.length;a<r;a+=1){var n=this.slides.eq(a);if((n.attr("data-hash")||n.attr("data-history"))===i&&!n.hasClass(this.params.slideDuplicateClass)){var o=n.index();this.slideTo(o,0,this.params.runCallbacksOnInit,!0)}}this.params.hashNavigation.watchState&&s(t).on("hashchange",this.hashNavigation.onHashCange)}},destroy:function(){this.params.hashNavigation.watchState&&s(t).off("hashchange",this.hashNavigation.onHashCange)}},ee={run:function(){var e=this,t=e.slides.eq(e.activeIndex),i=e.params.autoplay.delay;t.attr("data-swiper-autoplay")&&(i=t.attr("data-swiper-autoplay")||e.params.autoplay.delay),e.autoplay.timeout=d.nextTick(function(){e.params.autoplay.reverseDirection?e.params.loop?(e.loopFix(),e.slidePrev(e.params.speed,!0,!0),e.emit("autoplay")):e.isBeginning?e.params.autoplay.stopOnLastSlide?e.autoplay.stop():(e.slideTo(e.slides.length-1,e.params.speed,!0,!0),e.emit("autoplay")):(e.slidePrev(e.params.speed,!0,!0),e.emit("autoplay")):e.params.loop?(e.loopFix(),e.slideNext(e.params.speed,!0,!0),e.emit("autoplay")):e.isEnd?e.params.autoplay.stopOnLastSlide?e.autoplay.stop():(e.slideTo(0,e.params.speed,!0,!0),e.emit("autoplay")):(e.slideNext(e.params.speed,!0,!0),e.emit("autoplay"))},i)},start:function(){return void 0===this.autoplay.timeout&&(!this.autoplay.running&&(this.autoplay.running=!0,this.emit("autoplayStart"),this.autoplay.run(),!0))},stop:function(){return!!this.autoplay.running&&(void 0!==this.autoplay.timeout&&(this.autoplay.timeout&&(clearTimeout(this.autoplay.timeout),this.autoplay.timeout=void 0),this.autoplay.running=!1,this.emit("autoplayStop"),!0))},pause:function(e){var t=this;t.autoplay.running&&(t.autoplay.paused||(t.autoplay.timeout&&clearTimeout(t.autoplay.timeout),t.autoplay.paused=!0,0!==e&&t.params.autoplay.waitForTransition?t.$wrapperEl.transitionEnd(function(){t&&!t.destroyed&&(t.autoplay.paused=!1,t.autoplay.running?t.autoplay.run():t.autoplay.stop())}):(t.autoplay.paused=!1,t.autoplay.run())))}},te={setTranslate:function(){for(var e=this.slides,t=0;t<e.length;t+=1){var i=this.slides.eq(t),s=-i[0].swiperSlideOffset;this.params.virtualTranslate||(s-=this.translate);var a=0;this.isHorizontal()||(a=s,s=0);var r=this.params.fadeEffect.crossFade?Math.max(1-Math.abs(i[0].progress),0):1+Math.min(Math.max(i[0].progress,-1),0);i.css({opacity:r}).transform("translate3d("+s+"px, "+a+"px, 0px)")}},setTransition:function(e){var t=this,i=t.slides,s=t.$wrapperEl;if(i.transition(e),t.params.virtualTranslate&&0!==e){var a=!1;i.transitionEnd(function(){if(!a&&t&&!t.destroyed){a=!0,t.animating=!1;for(var e=["webkitTransitionEnd","transitionend"],i=0;i<e.length;i+=1)s.trigger(e[i])}})}}},ie={setTranslate:function(){var e,t=this.$el,i=this.$wrapperEl,a=this.slides,r=this.width,n=this.height,o=this.rtl,l=this.size,d=this.params.cubeEffect,h=this.isHorizontal(),p=this.virtual&&this.params.virtual.enabled,c=0;d.shadow&&(h?(0===(e=i.find(".swiper-cube-shadow")).length&&(e=s('<div class="swiper-cube-shadow"></div>'),i.append(e)),e.css({height:r+"px"})):0===(e=t.find(".swiper-cube-shadow")).length&&(e=s('<div class="swiper-cube-shadow"></div>'),t.append(e)));for(var u=0;u<a.length;u+=1){var v=a.eq(u),f=u;p&&(f=parseInt(v.attr("data-swiper-slide-index"),10));var m=90*f,g=Math.floor(m/360);o&&(m=-m,g=Math.floor(-m/360));var b=Math.max(Math.min(v[0].progress,1),-1),w=0,y=0,x=0;f%4==0?(w=4*-g*l,x=0):(f-1)%4==0?(w=0,x=4*-g*l):(f-2)%4==0?(w=l+4*g*l,x=l):(f-3)%4==0&&(w=-l,x=3*l+4*l*g),o&&(w=-w),h||(y=w,w=0);var E="rotateX("+(h?0:-m)+"deg) rotateY("+(h?m:0)+"deg) translate3d("+w+"px, "+y+"px, "+x+"px)";if(b<=1&&b>-1&&(c=90*f+90*b,o&&(c=90*-f-90*b)),v.transform(E),d.slideShadows){var T=h?v.find(".swiper-slide-shadow-left"):v.find(".swiper-slide-shadow-top"),S=h?v.find(".swiper-slide-shadow-right"):v.find(".swiper-slide-shadow-bottom");0===T.length&&(T=s('<div class="swiper-slide-shadow-'+(h?"left":"top")+'"></div>'),v.append(T)),0===S.length&&(S=s('<div class="swiper-slide-shadow-'+(h?"right":"bottom")+'"></div>'),v.append(S)),T.length&&(T[0].style.opacity=Math.max(-b,0)),S.length&&(S[0].style.opacity=Math.max(b,0))}}if(i.css({"-webkit-transform-origin":"50% 50% -"+l/2+"px","-moz-transform-origin":"50% 50% -"+l/2+"px","-ms-transform-origin":"50% 50% -"+l/2+"px","transform-origin":"50% 50% -"+l/2+"px"}),d.shadow)if(h)e.transform("translate3d(0px, "+(r/2+d.shadowOffset)+"px, "+-r/2+"px) rotateX(90deg) rotateZ(0deg) scale("+d.shadowScale+")");else{var C=Math.abs(c)-90*Math.floor(Math.abs(c)/90),M=1.5-(Math.sin(2*C*Math.PI/360)/2+Math.cos(2*C*Math.PI/360)/2),z=d.shadowScale,k=d.shadowScale/M,$=d.shadowOffset;e.transform("scale3d("+z+", 1, "+k+") translate3d(0px, "+(n/2+$)+"px, "+-n/2/k+"px) rotateX(-90deg)")}var L=P.isSafari||P.isUiWebView?-l/2:0;i.transform("translate3d(0px,0,"+L+"px) rotateX("+(this.isHorizontal()?0:c)+"deg) rotateY("+(this.isHorizontal()?-c:0)+"deg)")},setTransition:function(e){var t=this.$el;this.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e),this.params.cubeEffect.shadow&&!this.isHorizontal()&&t.find(".swiper-cube-shadow").transition(e)}},se={setTranslate:function(){for(var e=this.slides,t=0;t<e.length;t+=1){var i=e.eq(t),a=i[0].progress;this.params.flipEffect.limitRotation&&(a=Math.max(Math.min(i[0].progress,1),-1));var r=-180*a,n=0,o=-i[0].swiperSlideOffset,l=0;if(this.isHorizontal()?this.rtl&&(r=-r):(l=o,o=0,n=-r,r=0),i[0].style.zIndex=-Math.abs(Math.round(a))+e.length,this.params.flipEffect.slideShadows){var d=this.isHorizontal()?i.find(".swiper-slide-shadow-left"):i.find(".swiper-slide-shadow-top"),h=this.isHorizontal()?i.find(".swiper-slide-shadow-right"):i.find(".swiper-slide-shadow-bottom");0===d.length&&(d=s('<div class="swiper-slide-shadow-'+(this.isHorizontal()?"left":"top")+'"></div>'),i.append(d)),0===h.length&&(h=s('<div class="swiper-slide-shadow-'+(this.isHorizontal()?"right":"bottom")+'"></div>'),i.append(h)),d.length&&(d[0].style.opacity=Math.max(-a,0)),h.length&&(h[0].style.opacity=Math.max(a,0))}i.transform("translate3d("+o+"px, "+l+"px, 0px) rotateX("+n+"deg) rotateY("+r+"deg)")}},setTransition:function(e){var t=this,i=t.slides,s=t.activeIndex,a=t.$wrapperEl;if(i.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e),t.params.virtualTranslate&&0!==e){var r=!1;i.eq(s).transitionEnd(function(){if(!r&&t&&!t.destroyed){r=!0,t.animating=!1;for(var e=["webkitTransitionEnd","transitionend"],i=0;i<e.length;i+=1)a.trigger(e[i])}})}}},ae={setTranslate:function(){for(var e=this.width,t=this.height,i=this.slides,a=this.$wrapperEl,r=this.slidesSizesGrid,n=this.params.coverflowEffect,o=this.isHorizontal(),l=this.translate,d=o?e/2-l:t/2-l,p=o?n.rotate:-n.rotate,c=n.depth,u=0,v=i.length;u<v;u+=1){var f=i.eq(u),m=r[u],g=(d-f[0].swiperSlideOffset-m/2)/m*n.modifier,b=o?p*g:0,w=o?0:p*g,y=-c*Math.abs(g),x=o?0:n.stretch*g,E=o?n.stretch*g:0;Math.abs(E)<.001&&(E=0),Math.abs(x)<.001&&(x=0),Math.abs(y)<.001&&(y=0),Math.abs(b)<.001&&(b=0),Math.abs(w)<.001&&(w=0);var T="translate3d("+E+"px,"+x+"px,"+y+"px)  rotateX("+w+"deg) rotateY("+b+"deg)";if(f.transform(T),f[0].style.zIndex=1-Math.abs(Math.round(g)),n.slideShadows){var S=o?f.find(".swiper-slide-shadow-left"):f.find(".swiper-slide-shadow-top"),C=o?f.find(".swiper-slide-shadow-right"):f.find(".swiper-slide-shadow-bottom");0===S.length&&(S=s('<div class="swiper-slide-shadow-'+(o?"left":"top")+'"></div>'),f.append(S)),0===C.length&&(C=s('<div class="swiper-slide-shadow-'+(o?"right":"bottom")+'"></div>'),f.append(C)),S.length&&(S[0].style.opacity=g>0?g:0),C.length&&(C[0].style.opacity=-g>0?-g:0)}}(h.pointerEvents||h.prefixedPointerEvents)&&(a[0].style.perspectiveOrigin=d+"px 50%")},setTransition:function(e){this.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e)}},re=[D,O,A,H,X,B,V,{name:"mousewheel",params:{mousewheel:{enabled:!1,releaseOnEdges:!1,invert:!1,forceToAxis:!1,sensitivity:1,eventsTarged:"container"}},create:function(){d.extend(this,{mousewheel:{enabled:!1,enable:R.enable.bind(this),disable:R.disable.bind(this),handle:R.handle.bind(this),lastScrollTime:d.now()}})},on:{init:function(){this.params.mousewheel.enabled&&this.mousewheel.enable()},destroy:function(){this.mousewheel.enabled&&this.mousewheel.disable()}}},{name:"navigation",params:{navigation:{nextEl:null,prevEl:null,hideOnClick:!1,disabledClass:"swiper-button-disabled",hiddenClass:"swiper-button-hidden",lockClass:"swiper-button-lock"}},create:function(){d.extend(this,{navigation:{init:F.init.bind(this),update:F.update.bind(this),destroy:F.destroy.bind(this)}})},on:{init:function(){this.navigation.init(),this.navigation.update()},toEdge:function(){this.navigation.update()},fromEdge:function(){this.navigation.update()},destroy:function(){this.navigation.destroy()},click:function(e){var t=this.navigation,i=t.$nextEl,a=t.$prevEl;!this.params.navigation.hideOnClick||s(e.target).is(a)||s(e.target).is(i)||(i&&i.toggleClass(this.params.navigation.hiddenClass),a&&a.toggleClass(this.params.navigation.hiddenClass))}}},{name:"pagination",params:{pagination:{el:null,bulletElement:"span",clickable:!1,hideOnClick:!1,renderBullet:null,renderProgressbar:null,renderFraction:null,renderCustom:null,type:"bullets",dynamicBullets:!1,dynamicMainBullets:1,bulletClass:"swiper-pagination-bullet",bulletActiveClass:"swiper-pagination-bullet-active",modifierClass:"swiper-pagination-",currentClass:"swiper-pagination-current",totalClass:"swiper-pagination-total",hiddenClass:"swiper-pagination-hidden",progressbarFillClass:"swiper-pagination-progressbar-fill",clickableClass:"swiper-pagination-clickable",lockClass:"swiper-pagination-lock"}},create:function(){d.extend(this,{pagination:{init:W.init.bind(this),render:W.render.bind(this),update:W.update.bind(this),destroy:W.destroy.bind(this),dynamicBulletIndex:0}})},on:{init:function(){this.pagination.init(),this.pagination.render(),this.pagination.update()},activeIndexChange:function(){this.params.loop?this.pagination.update():void 0===this.snapIndex&&this.pagination.update()},snapIndexChange:function(){this.params.loop||this.pagination.update()},slidesLengthChange:function(){this.params.loop&&(this.pagination.render(),this.pagination.update())},snapGridLengthChange:function(){this.params.loop||(this.pagination.render(),this.pagination.update())},destroy:function(){this.pagination.destroy()},click:function(e){this.params.pagination.el&&this.params.pagination.hideOnClick&&this.pagination.$el.length>0&&!s(e.target).hasClass(this.params.pagination.bulletClass)&&this.pagination.$el.toggleClass(this.params.pagination.hiddenClass)}}},{name:"scrollbar",params:{scrollbar:{el:null,dragSize:"auto",hide:!1,draggable:!1,snapOnRelease:!0,lockClass:"swiper-scrollbar-lock",dragClass:"swiper-scrollbar-drag"}},create:function(){d.extend(this,{scrollbar:{init:q.init.bind(this),destroy:q.destroy.bind(this),updateSize:q.updateSize.bind(this),setTranslate:q.setTranslate.bind(this),setTransition:q.setTransition.bind(this),enableDraggable:q.enableDraggable.bind(this),disableDraggable:q.disableDraggable.bind(this),setDragPosition:q.setDragPosition.bind(this),onDragStart:q.onDragStart.bind(this),onDragMove:q.onDragMove.bind(this),onDragEnd:q.onDragEnd.bind(this),isTouched:!1,timeout:null,dragTimeout:null}})},on:{init:function(){this.scrollbar.init(),this.scrollbar.updateSize(),this.scrollbar.setTranslate()},update:function(){this.scrollbar.updateSize()},resize:function(){this.scrollbar.updateSize()},observerUpdate:function(){this.scrollbar.updateSize()},setTranslate:function(){this.scrollbar.setTranslate()},setTransition:function(e){this.scrollbar.setTransition(e)},destroy:function(){this.scrollbar.destroy()}}},{name:"parallax",params:{parallax:{enabled:!1}},create:function(){d.extend(this,{parallax:{setTransform:j.setTransform.bind(this),setTranslate:j.setTranslate.bind(this),setTransition:j.setTransition.bind(this)}})},on:{beforeInit:function(){this.params.parallax.enabled&&(this.params.watchSlidesProgress=!0)},init:function(){this.params.parallax&&this.parallax.setTranslate()},setTranslate:function(){this.params.parallax&&this.parallax.setTranslate()},setTransition:function(e){this.params.parallax&&this.parallax.setTransition(e)}}},{name:"zoom",params:{zoom:{enabled:!1,maxRatio:3,minRatio:1,toggle:!0,containerClass:"swiper-zoom-container",zoomedSlideClass:"swiper-slide-zoomed"}},create:function(){var e=this,t={enabled:!1,scale:1,currentScale:1,isScaling:!1,gesture:{$slideEl:void 0,slideWidth:void 0,slideHeight:void 0,$imageEl:void 0,$imageWrapEl:void 0,maxRatio:3},image:{isTouched:void 0,isMoved:void 0,currentX:void 0,currentY:void 0,minX:void 0,minY:void 0,maxX:void 0,maxY:void 0,width:void 0,height:void 0,startX:void 0,startY:void 0,touchesStart:{},touchesCurrent:{}},velocity:{x:void 0,y:void 0,prevPositionX:void 0,prevPositionY:void 0,prevTime:void 0}};"onGestureStart onGestureChange onGestureEnd onTouchStart onTouchMove onTouchEnd onTransitionEnd toggle enable disable in out".split(" ").forEach(function(i){t[i]=K[i].bind(e)}),d.extend(e,{zoom:t})},on:{init:function(){this.params.zoom.enabled&&this.zoom.enable()},destroy:function(){this.zoom.disable()},touchStart:function(e){this.zoom.enabled&&this.zoom.onTouchStart(e)},touchEnd:function(e){this.zoom.enabled&&this.zoom.onTouchEnd(e)},doubleTap:function(e){this.params.zoom.enabled&&this.zoom.enabled&&this.params.zoom.toggle&&this.zoom.toggle(e)},transitionEnd:function(){this.zoom.enabled&&this.params.zoom.enabled&&this.zoom.onTransitionEnd()}}},{name:"lazy",params:{lazy:{enabled:!1,loadPrevNext:!1,loadPrevNextAmount:1,loadOnTransitionStart:!1,elementClass:"swiper-lazy",loadingClass:"swiper-lazy-loading",loadedClass:"swiper-lazy-loaded",preloaderClass:"swiper-lazy-preloader"}},create:function(){d.extend(this,{lazy:{initialImageLoaded:!1,load:U.load.bind(this),loadInSlide:U.loadInSlide.bind(this)}})},on:{beforeInit:function(){this.params.lazy.enabled&&this.params.preloadImages&&(this.params.preloadImages=!1)},init:function(){this.params.lazy.enabled&&!this.params.loop&&0===this.params.initialSlide&&this.lazy.load()},scroll:function(){this.params.freeMode&&!this.params.freeModeSticky&&this.lazy.load()},resize:function(){this.params.lazy.enabled&&this.lazy.load()},scrollbarDragMove:function(){this.params.lazy.enabled&&this.lazy.load()},transitionStart:function(){this.params.lazy.enabled&&(this.params.lazy.loadOnTransitionStart||!this.params.lazy.loadOnTransitionStart&&!this.lazy.initialImageLoaded)&&this.lazy.load()},transitionEnd:function(){this.params.lazy.enabled&&!this.params.lazy.loadOnTransitionStart&&this.lazy.load()}}},{name:"controller",params:{controller:{control:void 0,inverse:!1,by:"slide"}},create:function(){d.extend(this,{controller:{control:this.params.controller.control,getInterpolateFunction:_.getInterpolateFunction.bind(this),setTranslate:_.setTranslate.bind(this),setTransition:_.setTransition.bind(this)}})},on:{update:function(){this.controller.control&&this.controller.spline&&(this.controller.spline=void 0,delete this.controller.spline)},resize:function(){this.controller.control&&this.controller.spline&&(this.controller.spline=void 0,delete this.controller.spline)},observerUpdate:function(){this.controller.control&&this.controller.spline&&(this.controller.spline=void 0,delete this.controller.spline)},setTranslate:function(e,t){this.controller.control&&this.controller.setTranslate(e,t)},setTransition:function(e,t){this.controller.control&&this.controller.setTransition(e,t)}}},{name:"a11y",params:{a11y:{enabled:!1,notificationClass:"swiper-notification",prevSlideMessage:"Previous slide",nextSlideMessage:"Next slide",firstSlideMessage:"This is the first slide",lastSlideMessage:"This is the last slide",paginationBulletMessage:"Go to slide {{index}}"}},create:function(){var e=this;d.extend(e,{a11y:{liveRegion:s('<span class="'+e.params.a11y.notificationClass+'" aria-live="assertive" aria-atomic="true"></span>')}}),Object.keys(Z).forEach(function(t){e.a11y[t]=Z[t].bind(e)})},on:{init:function(){this.params.a11y.enabled&&(this.a11y.init(),this.a11y.updateNavigation())},toEdge:function(){this.params.a11y.enabled&&this.a11y.updateNavigation()},fromEdge:function(){this.params.a11y.enabled&&this.a11y.updateNavigation()},paginationUpdate:function(){this.params.a11y.enabled&&this.a11y.updatePagination()},destroy:function(){this.params.a11y.enabled&&this.a11y.destroy()}}},{name:"history",params:{history:{enabled:!1,replaceState:!1,key:"slides"}},create:function(){d.extend(this,{history:{init:Q.init.bind(this),setHistory:Q.setHistory.bind(this),setHistoryPopState:Q.setHistoryPopState.bind(this),scrollToSlide:Q.scrollToSlide.bind(this),destroy:Q.destroy.bind(this)}})},on:{init:function(){this.params.history.enabled&&this.history.init()},destroy:function(){this.params.history.enabled&&this.history.destroy()},transitionEnd:function(){this.history.initialized&&this.history.setHistory(this.params.history.key,this.activeIndex)}}},{name:"hash-navigation",params:{hashNavigation:{enabled:!1,replaceState:!1,watchState:!1}},create:function(){d.extend(this,{hashNavigation:{initialized:!1,init:J.init.bind(this),destroy:J.destroy.bind(this),setHash:J.setHash.bind(this),onHashCange:J.onHashCange.bind(this)}})},on:{init:function(){this.params.hashNavigation.enabled&&this.hashNavigation.init()},destroy:function(){this.params.hashNavigation.enabled&&this.hashNavigation.destroy()},transitionEnd:function(){this.hashNavigation.initialized&&this.hashNavigation.setHash()}}},{name:"autoplay",params:{autoplay:{enabled:!1,delay:3e3,waitForTransition:!0,disableOnInteraction:!0,stopOnLastSlide:!1,reverseDirection:!1}},create:function(){d.extend(this,{autoplay:{running:!1,paused:!1,run:ee.run.bind(this),start:ee.start.bind(this),stop:ee.stop.bind(this),pause:ee.pause.bind(this)}})},on:{init:function(){this.params.autoplay.enabled&&this.autoplay.start()},beforeTransitionStart:function(e,t){this.autoplay.running&&(t||!this.params.autoplay.disableOnInteraction?this.autoplay.pause(e):this.autoplay.stop())},sliderFirstMove:function(){this.autoplay.running&&(this.params.autoplay.disableOnInteraction?this.autoplay.stop():this.autoplay.pause())},destroy:function(){this.autoplay.running&&this.autoplay.stop()}}},{name:"effect-fade",params:{fadeEffect:{crossFade:!1}},create:function(){d.extend(this,{fadeEffect:{setTranslate:te.setTranslate.bind(this),setTransition:te.setTransition.bind(this)}})},on:{beforeInit:function(){if("fade"===this.params.effect){this.classNames.push(this.params.containerModifierClass+"fade");var e={slidesPerView:1,slidesPerColumn:1,slidesPerGroup:1,watchSlidesProgress:!0,spaceBetween:0,virtualTranslate:!0};d.extend(this.params,e),d.extend(this.originalParams,e)}},setTranslate:function(){"fade"===this.params.effect&&this.fadeEffect.setTranslate()},setTransition:function(e){"fade"===this.params.effect&&this.fadeEffect.setTransition(e)}}},{name:"effect-cube",params:{cubeEffect:{slideShadows:!0,shadow:!0,shadowOffset:20,shadowScale:.94}},create:function(){d.extend(this,{cubeEffect:{setTranslate:ie.setTranslate.bind(this),setTransition:ie.setTransition.bind(this)}})},on:{beforeInit:function(){if("cube"===this.params.effect){this.classNames.push(this.params.containerModifierClass+"cube"),this.classNames.push(this.params.containerModifierClass+"3d");var e={slidesPerView:1,slidesPerColumn:1,slidesPerGroup:1,watchSlidesProgress:!0,resistanceRatio:0,spaceBetween:0,centeredSlides:!1,virtualTranslate:!0};d.extend(this.params,e),d.extend(this.originalParams,e)}},setTranslate:function(){"cube"===this.params.effect&&this.cubeEffect.setTranslate()},setTransition:function(e){"cube"===this.params.effect&&this.cubeEffect.setTransition(e)}}},{name:"effect-flip",params:{flipEffect:{slideShadows:!0,limitRotation:!0}},create:function(){d.extend(this,{flipEffect:{setTranslate:se.setTranslate.bind(this),setTransition:se.setTransition.bind(this)}})},on:{beforeInit:function(){if("flip"===this.params.effect){this.classNames.push(this.params.containerModifierClass+"flip"),this.classNames.push(this.params.containerModifierClass+"3d");var e={slidesPerView:1,slidesPerColumn:1,slidesPerGroup:1,watchSlidesProgress:!0,spaceBetween:0,virtualTranslate:!0};d.extend(this.params,e),d.extend(this.originalParams,e)}},setTranslate:function(){"flip"===this.params.effect&&this.flipEffect.setTranslate()},setTransition:function(e){"flip"===this.params.effect&&this.flipEffect.setTransition(e)}}},{name:"effect-coverflow",params:{coverflowEffect:{rotate:50,stretch:0,depth:100,modifier:1,slideShadows:!0}},create:function(){d.extend(this,{coverflowEffect:{setTranslate:ae.setTranslate.bind(this),setTransition:ae.setTransition.bind(this)}})},on:{beforeInit:function(){"coverflow"===this.params.effect&&(this.classNames.push(this.params.containerModifierClass+"coverflow"),this.classNames.push(this.params.containerModifierClass+"3d"),this.params.watchSlidesProgress=!0,this.originalParams.watchSlidesProgress=!0)},setTranslate:function(){"coverflow"===this.params.effect&&this.coverflowEffect.setTranslate()},setTransition:function(e){"coverflow"===this.params.effect&&this.coverflowEffect.setTransition(e)}}}];return void 0===I.use&&(I.use=I.Class.use,I.installModule=I.Class.installModule),I.use(re),I});
//# sourceMappingURL=swiper.min.js.map
(function($){
	$.fn.validationEngineLanguage = function(){
	};
	$.validationEngineLanguage = {
		newLang: function(){
			$.validationEngineLanguage.allRules = {
				"required": { // Add your regex rules here, you can take telephone as an example
					"regex": "none",
					"alertText": "* This field is required",
					"alertTextCheckboxMultiple": "* Please select an option",
					"alertTextCheckboxe": "* This checkbox is required",
					"alertTextDateRange": "* Both date range fields are required"
				},
				"dateRange": {
					"regex": "none",
					"alertText": "* Invalid ",
					"alertText2": "Date Range"
				},
				"dateTimeRange": {
					"regex": "none",
					"alertText": "* Invalid ",
					"alertText2": "Date Time Range"
				},
				"minSize": {
					"regex": "none",
					"alertText": "* Minimum ",
					"alertText2": " characters allowed"
				},
				"maxSize": {
					"regex": "none",
					"alertText": "* Maximum ",
					"alertText2": " characters allowed"
				},
				"groupRequired": {
					"regex": "none",
					"alertText": "* You must fill one of the following fields"
				},
				"min": {
					"regex": "none",
					"alertText": "* Minimum value is "
				},
				"max": {
					"regex": "none",
					"alertText": "* Maximum value is "
				},
				"past": {
					"regex": "none",
					"alertText": "* Date prior to "
				},
				"future": {
					"regex": "none",
					"alertText": "* Date past "
				},
				"maxCheckbox": {
					"regex": "none",
					"alertText": "* Maximum ",
					"alertText2": " options allowed"
				},
				"minCheckbox": {
					"regex": "none",
					"alertText": "* Please select ",
					"alertText2": " options"
				},
				"equals": {
					"regex": "none",
					"alertText": "* Fields do not match"
				},
				"telephone": {
					// credit: jquery.h5validate.js / orefalo
					"regex": /^([\+][0-9]{1,3}[ \.\-])?([\(]{1}[0-9]{2,6}[\)])?([0-9 \.\-\/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/,
					"alertText": "* Invalid phone number"
				},
				"email": {
					// Shamelessly lifted from Scott Gonzalez via the Bassistance Validation plugin http://projects.scottsplayground.com/email_address_validation/
					"regex": /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
					"alertText": "* Invalid email address"
				},
				"integer": {
					"regex": /^[\-\+]?\d+$/,
					"alertText": "* Not a valid integer"
				},
				"number": {
					// Number, including positive, negative, and floating decimal. credit: orefalo
					"regex": /^[\-\+]?(([0-9]+)([\.,]([0-9]+))?|([\.,]([0-9]+))?)$/,
					"alertText": "* Invalid floating decimal number"
				},
				"date": {
					"regex": /^(0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-]\d{4}$/,
					"alertText": "* Invalid date, must be in MM/DD/YYYY format"
				},
				"ipv4": {
					"regex": /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/,
					"alertText": "* Invalid IP address"
				},
				"url": {
					"regex": /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
					"alertText": "* Invalid URL"
				},
				"onlyNumber": {
					"regex": /^[0-9\ ]+$/,
					"alertText": "* Numbers only"
				},
				"onlyLetter": {
					"regex": /^[a-zA-Z\ \']+$/,
					"alertText": "* Letters only"
				},
				"noSpecialCaracters": {
					"regex": /^[0-9a-zA-Z]+$/,
					"alertText": "* No special characters allowed"
				},
				// --- CUSTOM RULES -- Those are specific to the demos, they can be removed or changed to your likings
				"ajaxUserCall": {
					"url": "ajaxValidateFieldUser",
					// you may want to pass extra data on the ajax call
					"extraData": "name=eric",
					"alertText": "* This user is already taken",
					"alertTextLoad": "* Validating, please wait"
				},
				"ajaxUserCallPhp": {
					"url": "phpajax/ajaxValidateFieldUser.php",
					// you may want to pass extra data on the ajax call
					"extraData": "name=eric",
					// if you provide an "alertTextOk", it will show as a green prompt when the field validates
					"alertTextOk": "* This username is available",
					"alertText": "* This user is already taken",
					"alertTextLoad": "* Validating, please wait"
				},
				"ajaxNameCall": {
					// remote json service location
					"url": "ajaxValidateFieldName",
					// error
					"alertText": "* This name is already taken",
					// if you provide an "alertTextOk", it will show as a green prompt when the field validates
					"alertTextOk": "* This name is available",
					// speaks by itself
					"alertTextLoad": "* Validating, please wait"
				},
				"ajaxNameCallPhp": {
					// remote json service location
					"url": "phpajax/ajaxValidateFieldName.php",
					// error
					"alertText": "* This name is already taken",
					// speaks by itself
					"alertTextLoad": "* Validating, please wait"
				},
				"validate2fields": {
					"alertText": "* Please input HELLO"
				},
				//tls warning:homegrown not fielded
				"dateFormat":{
					"regex": /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(?:(?:0?[1-9]|1[0-2])(\/|-)(?:0?[1-9]|1\d|2[0-8]))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(0?2(\/|-)29)(\/|-)(?:(?:0[48]00|[13579][26]00|[2468][048]00)|(?:\d\d)?(?:0[48]|[2468][048]|[13579][26]))$/,
					"alertText": "* Invalid Date"
				},
				//tls warning:homegrown not fielded
				"dateTimeFormat": {
					"regex": /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1}$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^((1[012]|0?[1-9]){1}\/(0?[1-9]|[12][0-9]|3[01]){1}\/\d{2,4}\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1})$/,
					"alertText": "* Invalid Date or Date Format",
					"alertText2": "Expected Format: ",
					"alertText3": "mm/dd/yyyy hh:mm:ss AM|PM or ",
					"alertText4": "yyyy-mm-dd hh:mm:ss AM|PM"
				}
			};

		}
	};

	$.validationEngineLanguage.newLang();

})(jQuery);
/*
 * Inline Form Validation Engine 2.6.2, jQuery plugin
 *
 * Copyright(c) 2010, Cedric Dugas
 * http://www.position-absolute.com
 *
 * 2.0 Rewrite by Olivier Refalo
 * http://www.crionics.com
 *
 * Form validation engine allowing custom regex rules to be added.
 * Licensed under the MIT License
 */
 (function($) {

	"use strict";

	var methods = {

		/**
		* Kind of the constructor, called before any action
		* @param {Map} user options
		*/
		init: function(options) {
			var form = this;
			if (!form.data('jqv') || form.data('jqv') == null ) {
				options = methods._saveOptions(form, options);
				// bind all formError elements to close on click
				$(document).on("click", ".formError", function() {
					$(this).fadeOut(150, function() {
						// remove prompt once invisible
						$(this).closest('.formError').remove();
					});
				});
			}
			return this;
		 },
		/**
		* Attachs jQuery.validationEngine to form.submit and field.blur events
		* Takes an optional params: a list of options
		* ie. jQuery("#formID1").validationEngine('attach', {promptPosition : "centerRight"});
		*/
		attach: function(userOptions) {

			var form = this;
			var options;

			if(userOptions)
				options = methods._saveOptions(form, userOptions);
			else
				options = form.data('jqv');

			options.validateAttribute = (form.find("[data-validation-engine*=validate]").length) ? "data-validation-engine" : "class";
			if (options.binded) {

				// delegate fields
				form.on(options.validationEventTrigger, "["+options.validateAttribute+"*=validate]:not([type=checkbox]):not([type=radio]):not(.datepicker)", methods._onFieldEvent);
				form.on("click", "["+options.validateAttribute+"*=validate][type=checkbox],["+options.validateAttribute+"*=validate][type=radio]", methods._onFieldEvent);
				form.on(options.validationEventTrigger,"["+options.validateAttribute+"*=validate][class*=datepicker]", {"delay": 300}, methods._onFieldEvent);
			}
			if (options.autoPositionUpdate) {
				$(window).bind("resize", {
					"noAnimation": true,
					"formElem": form
				}, methods.updatePromptsPosition);
			}
			form.on("click","a[data-validation-engine-skip], a[class*='validate-skip'], button[data-validation-engine-skip], button[class*='validate-skip'], input[data-validation-engine-skip], input[class*='validate-skip']", methods._submitButtonClick);
			form.removeData('jqv_submitButton');

			// bind form.submit
			form.on("submit", methods._onSubmitEvent);
			return this;
		},
		/**
		* Unregisters any bindings that may point to jQuery.validaitonEngine
		*/
		detach: function() {

			var form = this;
			var options = form.data('jqv');

			// unbind fields
			form.off(options.validationEventTrigger, "["+options.validateAttribute+"*=validate]:not([type=checkbox]):not([type=radio]):not(.datepicker)", methods._onFieldEvent);
			form.off("click", "["+options.validateAttribute+"*=validate][type=checkbox],["+options.validateAttribute+"*=validate][type=radio]", methods._onFieldEvent);
			form.off(options.validationEventTrigger,"["+options.validateAttribute+"*=validate][class*=datepicker]", methods._onFieldEvent);

			// unbind form.submit
			form.off("submit", methods._onSubmitEvent);
			form.removeData('jqv');

			form.off("click", "a[data-validation-engine-skip], a[class*='validate-skip'], button[data-validation-engine-skip], button[class*='validate-skip'], input[data-validation-engine-skip], input[class*='validate-skip']", methods._submitButtonClick);
			form.removeData('jqv_submitButton');

			if (options.autoPositionUpdate)
				$(window).off("resize", methods.updatePromptsPosition);

			return this;
		},
		/**
		* Validates either a form or a list of fields, shows prompts accordingly.
		* Note: There is no ajax form validation with this method, only field ajax validation are evaluated
		*
		* @return true if the form validates, false if it fails
		*/
		validate: function(userOptions) {
			var element = $(this);
			var valid = null;
			var options;

			if (element.is("form") || element.hasClass("validationEngineContainer")) {
				if (element.hasClass('validating')) {
					// form is already validating.
					// Should abort old validation and start new one. I don't know how to implement it.
					return false;
				} else {
					element.addClass('validating');
					if(userOptions)
						options = methods._saveOptions(element, userOptions);
					else
						options = element.data('jqv');
					var valid = methods._validateFields(this);

					// If the form doesn't validate, clear the 'validating' class before the user has a chance to submit again
					setTimeout(function(){
						element.removeClass('validating');
					}, 100);
					if (valid && options.onSuccess) {
						options.onSuccess();
					} else if (!valid && options.onFailure) {
						options.onFailure();
					}
				}
			} else if (element.is('form') || element.hasClass('validationEngineContainer')) {
				element.removeClass('validating');
			} else {
				// field validation
		                var form = element.closest('form, .validationEngineContainer');
		                options = (form.data('jqv')) ? form.data('jqv') : $.validationEngine.defaults;
		                valid = methods._validateField(element, options);

		                if (valid && options.onFieldSuccess)
		                    options.onFieldSuccess();
		                else if (options.onFieldFailure && options.InvalidFields.length > 0) {
		                    options.onFieldFailure();
		                }

		                return !valid;
			}
			if(options.onValidationComplete) {
				// !! ensures that an undefined return is interpreted as return false but allows a onValidationComplete() to possibly return true and have form continue processing
				return !!options.onValidationComplete(form, valid);
			}
			return valid;
		},
		/**
		*  Redraw prompts position, useful when you change the DOM state when validating
		*/
		updatePromptsPosition: function(event) {

			if (event && this == window) {
				var form = event.data.formElem;
				var noAnimation = event.data.noAnimation;
			}
			else
				var form = $(this.closest('form, .validationEngineContainer'));

			var options = form.data('jqv');
			// No option, take default one
			if (!options)
				options = methods._saveOptions(form, options);
			form.find('['+options.validateAttribute+'*=validate]').not(":disabled").each(function(){
				var field = $(this);
				if (options.prettySelect && field.is(":hidden"))
				  field = form.find("#" + options.usePrefix + field.attr('id') + options.useSuffix);
				var prompt = methods._getPrompt(field);
				var promptText = $(prompt).find(".formErrorContent").html();

				if(prompt)
					methods._updatePrompt(field, $(prompt), promptText, undefined, false, options, noAnimation);
			});
			return this;
		},
		/**
		* Displays a prompt on a element.
		* Note that the element needs an id!
		*
		* @param {String} promptText html text to display type
		* @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
		* @param {String} possible values topLeft, topRight, bottomLeft, centerRight, bottomRight
		*/
		showPrompt: function(promptText, type, promptPosition, showArrow) {
			var form = this.closest('form, .validationEngineContainer');
			var options = form.data('jqv');
			// No option, take default one
			if(!options)
				options = methods._saveOptions(this, options);
			if(promptPosition)
				options.promptPosition=promptPosition;
			options.showArrow = showArrow==true;

			methods._showPrompt(this, promptText, type, false, options);
			return this;
		},
		/**
		* Closes form error prompts, CAN be invidual
		*/
		hide: function() {
			 var form = $(this).closest('form, .validationEngineContainer');
			 var options = form.data('jqv');
			 // No option, take default one
			 if (!options)
				options = methods._saveOptions(form, options);
			 var fadeDuration = (options && options.fadeDuration) ? options.fadeDuration : 0.3;
			 var closingtag;

			 if(form.is("form") || form.hasClass("validationEngineContainer")) {
				 closingtag = "parentForm"+methods._getClassName($(form).attr("id"));
			 } else {
				 closingtag = methods._getClassName($(form).attr("id")) +"formError";
			 }
			 $('.'+closingtag).fadeTo(fadeDuration, 0, function() {
				 $(this).closest('.formError').remove();
			 });
			 return this;
		 },
		 /**
		 * Closes all error prompts on the page
		 */
		 hideAll: function() {
			 var form = this;
			 var options = form.data('jqv');
			 var duration = options ? options.fadeDuration:300;
			 $('.formError').fadeTo(duration, 0, function() {
				 $(this).closest('.formError').remove();
			 });
			 return this;
		 },
		/**
		* Typically called when user exists a field using tab or a mouse click, triggers a field
		* validation
		*/
		_onFieldEvent: function(event) {
			var field = $(this);
			var form = field.closest('form, .validationEngineContainer');
			var options = form.data('jqv');
			// No option, take default one
			if (!options)
				options = methods._saveOptions(form, options);
			options.eventTrigger = "field";

            if (options.notEmpty == true){

                if(field.val().length > 0){
                    // validate the current field
                    window.setTimeout(function() {
                        methods._validateField(field, options);
                    }, (event.data) ? event.data.delay : 0);

                }

            }else{

                // validate the current field
                window.setTimeout(function() {
                    methods._validateField(field, options);
                }, (event.data) ? event.data.delay : 0);

            }




		},
		/**
		* Called when the form is submited, shows prompts accordingly
		*
		* @param {jqObject}
		*            form
		* @return false if form submission needs to be cancelled
		*/
		_onSubmitEvent: function() {
			var form = $(this);
			var options = form.data('jqv');

			//check if it is trigger from skipped button
			if (form.data("jqv_submitButton")){
				var submitButton = $("#" + form.data("jqv_submitButton"));
				if (submitButton){
					if (submitButton.length > 0){
						if (submitButton.hasClass("validate-skip") || submitButton.attr("data-validation-engine-skip") == "true")
							return true;
					}
				}
			}

			options.eventTrigger = "submit";

			// validate each field
			// (- skip field ajax validation, not necessary IF we will perform an ajax form validation)
			var r=methods._validateFields(form);

			if (r && options.ajaxFormValidation) {
				methods._validateFormWithAjax(form, options);
				// cancel form auto-submission - process with async call onAjaxFormComplete
				return false;
			}

			if(options.onValidationComplete) {
				// !! ensures that an undefined return is interpreted as return false but allows a onValidationComplete() to possibly return true and have form continue processing
				return !!options.onValidationComplete(form, r);
			}
			return r;
		},
		/**
		* Return true if the ajax field validations passed so far
		* @param {Object} options
		* @return true, is all ajax validation passed so far (remember ajax is async)
		*/
		_checkAjaxStatus: function(options) {
			var status = true;
			$.each(options.ajaxValidCache, function(key, value) {
				if (!value) {
					status = false;
					// break the each
					return false;
				}
			});
			return status;
		},

		/**
		* Return true if the ajax field is validated
		* @param {String} fieldid
		* @param {Object} options
		* @return true, if validation passed, false if false or doesn't exist
		*/
		_checkAjaxFieldStatus: function(fieldid, options) {
			return options.ajaxValidCache[fieldid] == true;
		},
		/**
		* Validates form fields, shows prompts accordingly
		*
		* @param {jqObject}
		*            form
		* @param {skipAjaxFieldValidation}
		*            boolean - when set to true, ajax field validation is skipped, typically used when the submit button is clicked
		*
		* @return true if form is valid, false if not, undefined if ajax form validation is done
		*/
		_validateFields: function(form) {
			var options = form.data('jqv');

			// this variable is set to true if an error is found
			var errorFound = false;

			// Trigger hook, start validation
			form.trigger("jqv.form.validating");
			// first, evaluate status of non ajax fields
			var first_err=null;
			form.find('['+options.validateAttribute+'*=validate]').not(":disabled").each( function() {
				var field = $(this);
				var names = [];
				if ($.inArray(field.attr('name'), names) < 0) {
					errorFound |= methods._validateField(field, options);
					if (errorFound && first_err==null)
						if (field.is(":hidden") && options.prettySelect)
							first_err = field = form.find("#" + options.usePrefix + methods._jqSelector(field.attr('id')) + options.useSuffix);
						else {

							//Check if we need to adjust what element to show the prompt on
							//and and such scroll to instead
							if(field.data('jqv-prompt-at') instanceof jQuery ){
								field = field.data('jqv-prompt-at');
							} else if(field.data('jqv-prompt-at')) {
								field = $(field.data('jqv-prompt-at'));
							}
							first_err=field;
						}
					if (options.doNotShowAllErrosOnSubmit)
						return false;
					names.push(field.attr('name'));

					//if option set, stop checking validation rules after one error is found
					if(options.showOneMessage == true && errorFound){
						return false;
					}
				}
			});

			// second, check to see if all ajax calls completed ok
			// errorFound |= !methods._checkAjaxStatus(options);

			// third, check status and scroll the container accordingly
			form.trigger("jqv.form.result", [errorFound]);

			if (errorFound) {
				if (options.scroll) {
					var destination=first_err.offset().top;
					var fixleft = first_err.offset().left;

					//prompt positioning adjustment support. Usage: positionType:Xshift,Yshift (for ex.: bottomLeft:+20 or bottomLeft:-20,+10)
					var positionType=options.promptPosition;
					if (typeof(positionType)=='string' && positionType.indexOf(":")!=-1)
						positionType=positionType.substring(0,positionType.indexOf(":"));

					if (positionType!="bottomRight" && positionType!="bottomLeft") {
						var prompt_err= methods._getPrompt(first_err);
						if (prompt_err) {
							destination=prompt_err.offset().top;
						}
					}

					// Offset the amount the page scrolls by an amount in px to accomodate fixed elements at top of page
					if (options.scrollOffset) {
						destination -= options.scrollOffset;
					}

					// get the position of the first error, there should be at least one, no need to check this
					//var destination = form.find(".formError:not('.greenPopup'):first").offset().top;
					if (options.isOverflown) {
						var overflowDIV = $(options.overflownDIV);
						if(!overflowDIV.length) return false;
						var scrollContainerScroll = overflowDIV.scrollTop();
						var scrollContainerPos = -parseInt(overflowDIV.offset().top);

						destination += scrollContainerScroll + scrollContainerPos - 5;
						var scrollContainer = $(options.overflownDIV).filter(":not(:animated)");

						scrollContainer.animate({ scrollTop: destination }, 1100, function(){
							if(options.focusFirstField) first_err.focus();
						});

					} else {
						$("html, body").animate({
							scrollTop: destination
						}, 1100, function(){
							if(options.focusFirstField) first_err.focus();
						});
						$("html, body").animate({scrollLeft: fixleft},1100)
					}

				} else if(options.focusFirstField)
					first_err.focus();
				return false;
			}
			return true;
		},
		/**
		* This method is called to perform an ajax form validation.
		* During this process all the (field, value) pairs are sent to the server which returns a list of invalid fields or true
		*
		* @param {jqObject} form
		* @param {Map} options
		*/
		_validateFormWithAjax: function(form, options) {

			var data = form.serialize();
									var type = (options.ajaxFormValidationMethod) ? options.ajaxFormValidationMethod : "GET";
			var url = (options.ajaxFormValidationURL) ? options.ajaxFormValidationURL : form.attr("action");
									var dataType = (options.dataType) ? options.dataType : "json";
			$.ajax({
				type: type,
				url: url,
				cache: false,
				dataType: dataType,
				data: data,
				form: form,
				methods: methods,
				options: options,
				beforeSend: function() {
					return options.onBeforeAjaxFormValidation(form, options);
				},
				error: function(data, transport) {
					if (options.onFailure) {
						options.onFailure(data, transport);
					} else {
						methods._ajaxError(data, transport);
					}
				},
				success: function(json) {
					if ((dataType == "json") && (json !== true)) {
						// getting to this case doesn't necessary means that the form is invalid
						// the server may return green or closing prompt actions
						// this flag helps figuring it out
						var errorInForm=false;
						for (var i = 0; i < json.length; i++) {
							var value = json[i];

							var errorFieldId = value[0];
							var errorField = $($("#" + errorFieldId)[0]);

							// make sure we found the element
							if (errorField.length == 1) {

								// promptText or selector
								var msg = value[2];
								// if the field is valid
								if (value[1] == true) {

									if (msg == ""  || !msg){
										// if for some reason, status==true and error="", just close the prompt
										methods._closePrompt(errorField);
									} else {
										// the field is valid, but we are displaying a green prompt
										if (options.allrules[msg]) {
											var txt = options.allrules[msg].alertTextOk;
											if (txt)
												msg = txt;
										}
										if (options.showPrompts) methods._showPrompt(errorField, msg, "pass", false, options, true);
									}
								} else {
									// the field is invalid, show the red error prompt
									errorInForm|=true;
									if (options.allrules[msg]) {
										var txt = options.allrules[msg].alertText;
										if (txt)
											msg = txt;
									}
									if(options.showPrompts) methods._showPrompt(errorField, msg, "", false, options, true);
								}
							}
						}
						options.onAjaxFormComplete(!errorInForm, form, json, options);
					} else
						options.onAjaxFormComplete(true, form, json, options);

				}
			});

		},
		/**
		* Validates field, shows prompts accordingly
		*
		* @param {jqObject}
		*            field
		* @param {Array[String]}
		*            field's validation rules
		* @param {Map}
		*            user options
		* @return false if field is valid (It is inversed for *fields*, it return false on validate and true on errors.)
		*/
		_validateField: function(field, options, skipAjaxValidation) {
			if (!field.attr("id")) {
				field.attr("id", "form-validation-field-" + $.validationEngine.fieldIdCounter);
				++$.validationEngine.fieldIdCounter;
			}

			if(field.hasClass(options.ignoreFieldsWithClass))
				return false;

           if (!options.validateNonVisibleFields && (field.is(":hidden") && !options.prettySelect || field.parent().is(":hidden")))
				return false;

			var rulesParsing = field.attr(options.validateAttribute);
			var getRules = /validate\[(.*)\]/.exec(rulesParsing);

			if (!getRules)
				return false;
			var str = getRules[1];
			var rules = str.split(/\[|,|\]/);

			// true if we ran the ajax validation, tells the logic to stop messing with prompts
			var isAjaxValidator = false;
			var fieldName = field.attr("name");
			var promptText = "";
			var promptType = "";
			var required = false;
			var limitErrors = false;
			options.isError = false;
			options.showArrow = options.showArrow ==true;

			// If the programmer wants to limit the amount of error messages per field,
			if (options.maxErrorsPerField > 0) {
				limitErrors = true;
			}

			var form = $(field.closest("form, .validationEngineContainer"));
			// Fix for adding spaces in the rules
			for (var i = 0; i < rules.length; i++) {
				rules[i] = rules[i].toString().replace(" ", "");//.toString to worked on IE8
				// Remove any parsing errors
				if (rules[i] === '') {
					delete rules[i];
				}
			}

			for (var i = 0, field_errors = 0; i < rules.length; i++) {

				// If we are limiting errors, and have hit the max, break
				if (limitErrors && field_errors >= options.maxErrorsPerField) {
					// If we haven't hit a required yet, check to see if there is one in the validation rules for this
					// field and that it's index is greater or equal to our current index
					if (!required) {
						var have_required = $.inArray('required', rules);
						required = (have_required != -1 &&  have_required >= i);
					}
					break;
				}


				var errorMsg = undefined;
				switch (rules[i]) {

					case "required":
						required = true;
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._required);
						break;
					case "custom":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._custom);
						break;
					case "groupRequired":
						// Check is its the first of group, if not, reload validation with first field
						// AND continue normal validation on present field
						var classGroup = "["+options.validateAttribute+"*=" +rules[i + 1] +"]";
						var firstOfGroup = form.find(classGroup).eq(0);
						if(firstOfGroup[0] != field[0]){

							methods._validateField(firstOfGroup, options, skipAjaxValidation);
							options.showArrow = true;

						}
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._groupRequired);
						if(errorMsg)  required = true;
						options.showArrow = false;
						break;
					case "ajax":
						// AJAX defaults to returning it's loading message
						errorMsg = methods._ajax(field, rules, i, options);
						if (errorMsg) {
							promptType = "load";
						}
						break;
					case "minSize":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._minSize);
						break;
					case "maxSize":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._maxSize);
						break;
					case "min":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._min);
						break;
					case "max":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._max);
						break;
					case "past":
						errorMsg = methods._getErrorMessage(form, field,rules[i], rules, i, options, methods._past);
						break;
					case "future":
						errorMsg = methods._getErrorMessage(form, field,rules[i], rules, i, options, methods._future);
						break;
					case "dateRange":
						var classGroup = "["+options.validateAttribute+"*=" + rules[i + 1] + "]";
						options.firstOfGroup = form.find(classGroup).eq(0);
						options.secondOfGroup = form.find(classGroup).eq(1);

						//if one entry out of the pair has value then proceed to run through validation
						if (options.firstOfGroup[0].value || options.secondOfGroup[0].value) {
							errorMsg = methods._getErrorMessage(form, field,rules[i], rules, i, options, methods._dateRange);
						}
						if (errorMsg) required = true;
						options.showArrow = false;
						break;

					case "dateTimeRange":
						var classGroup = "["+options.validateAttribute+"*=" + rules[i + 1] + "]";
						options.firstOfGroup = form.find(classGroup).eq(0);
						options.secondOfGroup = form.find(classGroup).eq(1);

						//if one entry out of the pair has value then proceed to run through validation
						if (options.firstOfGroup[0].value || options.secondOfGroup[0].value) {
							errorMsg = methods._getErrorMessage(form, field,rules[i], rules, i, options, methods._dateTimeRange);
						}
						if (errorMsg) required = true;
						options.showArrow = false;
						break;
					case "maxCheckbox":
						field = $(form.find("input[name='" + fieldName + "']"));
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._maxCheckbox);
						break;
					case "minCheckbox":
						field = $(form.find("input[name='" + fieldName + "']"));
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._minCheckbox);
						break;
					case "equals":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._equals);
						break;
					case "funcCall":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._funcCall);
						break;
					case "creditCard":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._creditCard);
						break;
					case "condRequired":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._condRequired);
						if (errorMsg !== undefined) {
							required = true;
						}
						break;
					case "funcCallRequired":
						errorMsg = methods._getErrorMessage(form, field, rules[i], rules, i, options, methods._funcCallRequired);
						if (errorMsg !== undefined) {
							required = true;
						}
						break;

					default:
				}

				var end_validation = false;

				// If we were passed back an message object, check what the status was to determine what to do
				if (typeof errorMsg == "object") {
					switch (errorMsg.status) {
						case "_break":
							end_validation = true;
							break;
						// If we have an error message, set errorMsg to the error message
						case "_error":
							errorMsg = errorMsg.message;
							break;
						// If we want to throw an error, but not show a prompt, return early with true
						case "_error_no_prompt":
							return true;
							break;
						// Anything else we continue on
						default:
							break;
					}
				}

				//funcCallRequired, first in rules, and has error, skip anything else
				if( i==0 && str.indexOf('funcCallRequired')==0 && errorMsg !== undefined ){
					if(promptText != '') {
						promptText += "<br/>";
					}
					promptText += errorMsg;
					options.isError=true;
					field_errors++;
					end_validation=true;
				}

				// If it has been specified that validation should end now, break
				if (end_validation) {
					break;
				}

				// If we have a string, that means that we have an error, so add it to the error message.
				if (typeof errorMsg == 'string') {
					if(promptText != '') {
						promptText += "<br/>";
					}
					promptText += errorMsg;
					options.isError = true;
					field_errors++;
				}
			}
			// If the rules required is not added, an empty field is not validated
			//the 3rd condition is added so that even empty password fields should be equal
			//otherwise if one is filled and another left empty, the "equal" condition would fail
			//which does not make any sense
			if(!required && !(field.val()) && field.val().length < 1 && $.inArray('equals', rules) < 0) options.isError = false;

			// Hack for radio/checkbox group button, the validation go into the
			// first radio/checkbox of the group
			var fieldType = field.prop("type");
			var positionType=field.data("promptPosition") || options.promptPosition;

			if ((fieldType == "radio" || fieldType == "checkbox") && form.find("input[name='" + fieldName + "']").length > 1) {
				if(positionType === 'inline') {
					field = $(form.find("input[name='" + fieldName + "'][type!=hidden]:last"));
				} else {
				field = $(form.find("input[name='" + fieldName + "'][type!=hidden]:first"));
				}
				options.showArrow = options.showArrowOnRadioAndCheckbox;
			}

			if(field.is(":hidden") && options.prettySelect) {
				field = form.find("#" + options.usePrefix + methods._jqSelector(field.attr('id')) + options.useSuffix);
			}

			if (options.isError && options.showPrompts){
				methods._showPrompt(field, promptText, promptType, false, options);
			}else{
				if (!isAjaxValidator) methods._closePrompt(field);
			}

			if (!isAjaxValidator) {
				field.trigger("jqv.field.result", [field, options.isError, promptText]);
			}

			/* Record error */
			var errindex = $.inArray(field[0], options.InvalidFields);
			if (errindex == -1) {
				if (options.isError)
				options.InvalidFields.push(field[0]);
			} else if (!options.isError) {
				options.InvalidFields.splice(errindex, 1);
			}

			methods._handleStatusCssClasses(field, options);

			/* run callback function for each field */
			if (options.isError && options.onFieldFailure)
				options.onFieldFailure(field);

			if (!options.isError && options.onFieldSuccess)
				options.onFieldSuccess(field);

			return options.isError;
		},
		/**
		* Handling css classes of fields indicating result of validation
		*
		* @param {jqObject}
		*            field
		* @param {Array[String]}
		*            field's validation rules
		* @private
		*/
		_handleStatusCssClasses: function(field, options) {
			/* remove all classes */
			if(options.addSuccessCssClassToField)
				field.removeClass(options.addSuccessCssClassToField);

			if(options.addFailureCssClassToField)
				field.removeClass(options.addFailureCssClassToField);

			/* Add classes */
			if (options.addSuccessCssClassToField && !options.isError)
				field.addClass(options.addSuccessCssClassToField);

			if (options.addFailureCssClassToField && options.isError)
				field.addClass(options.addFailureCssClassToField);
		},

		 /********************
		  * _getErrorMessage
		  *
		  * @param form
		  * @param field
		  * @param rule
		  * @param rules
		  * @param i
		  * @param options
		  * @param originalValidationMethod
		  * @return {*}
		  * @private
		  */
		 _getErrorMessage:function (form, field, rule, rules, i, options, originalValidationMethod) {
			 // If we are using the custon validation type, build the index for the rule.
			 // Otherwise if we are doing a function call, make the call and return the object
			 // that is passed back.
	 		 var rule_index = jQuery.inArray(rule, rules);
			 if (rule === "custom" || rule === "funcCall" || rule === "funcCallRequired") {
				 var custom_validation_type = rules[rule_index + 1];
				 rule = rule + "[" + custom_validation_type + "]";
				 // Delete the rule from the rules array so that it doesn't try to call the
			    // same rule over again
			    delete(rules[rule_index]);
			 }
			 // Change the rule to the composite rule, if it was different from the original
			 var alteredRule = rule;


			 var element_classes = (field.attr("data-validation-engine")) ? field.attr("data-validation-engine") : field.attr("class");
			 var element_classes_array = element_classes.split(" ");

			 // Call the original validation method. If we are dealing with dates or checkboxes, also pass the form
			 var errorMsg;
			 if (rule == "future" || rule == "past"  || rule == "maxCheckbox" || rule == "minCheckbox") {
				 errorMsg = originalValidationMethod(form, field, rules, i, options);
			 } else {
				 errorMsg = originalValidationMethod(field, rules, i, options);
			 }

			 // If the original validation method returned an error and we have a custom error message,
			 // return the custom message instead. Otherwise return the original error message.
			 if (errorMsg != undefined) {
				 var custom_message = methods._getCustomErrorMessage($(field), element_classes_array, alteredRule, options);
				 if (custom_message) errorMsg = custom_message;
			 }
			 return errorMsg;

		 },
		 _getCustomErrorMessage:function (field, classes, rule, options) {
			var custom_message = false;
			var validityProp = /^custom\[.*\]$/.test(rule) ? methods._validityProp["custom"] : methods._validityProp[rule];
			 // If there is a validityProp for this rule, check to see if the field has an attribute for it
			if (validityProp != undefined) {
				custom_message = field.attr("data-errormessage-"+validityProp);
				// If there was an error message for it, return the message
				if (custom_message != undefined)
					return custom_message;
			}
			custom_message = field.attr("data-errormessage");
			 // If there is an inline custom error message, return it
			if (custom_message != undefined)
				return custom_message;
			var id = '#' + field.attr("id");
			// If we have custom messages for the element's id, get the message for the rule from the id.
			// Otherwise, if we have custom messages for the element's classes, use the first class message we find instead.
			if (typeof options.custom_error_messages[id] != "undefined" &&
				typeof options.custom_error_messages[id][rule] != "undefined" ) {
						  custom_message = options.custom_error_messages[id][rule]['message'];
			} else if (classes.length > 0) {
				for (var i = 0; i < classes.length && classes.length > 0; i++) {
					 var element_class = "." + classes[i];
					if (typeof options.custom_error_messages[element_class] != "undefined" &&
						typeof options.custom_error_messages[element_class][rule] != "undefined") {
							custom_message = options.custom_error_messages[element_class][rule]['message'];
							break;
					}
				}
			}
			if (!custom_message &&
				typeof options.custom_error_messages[rule] != "undefined" &&
				typeof options.custom_error_messages[rule]['message'] != "undefined"){
					 custom_message = options.custom_error_messages[rule]['message'];
			 }
			 return custom_message;
		 },
		 _validityProp: {
			 "required": "value-missing",
			 "custom": "custom-error",
			 "groupRequired": "value-missing",
			 "ajax": "custom-error",
			 "minSize": "range-underflow",
			 "maxSize": "range-overflow",
			 "min": "range-underflow",
			 "max": "range-overflow",
			 "past": "type-mismatch",
			 "future": "type-mismatch",
			 "dateRange": "type-mismatch",
			 "dateTimeRange": "type-mismatch",
			 "maxCheckbox": "range-overflow",
			 "minCheckbox": "range-underflow",
			 "equals": "pattern-mismatch",
			 "funcCall": "custom-error",
			 "funcCallRequired": "custom-error",
			 "creditCard": "pattern-mismatch",
			 "condRequired": "value-missing"
		 },
		/**
		* Required validation
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @param {bool} condRequired flag when method is used for internal purpose in condRequired check
		* @return an error string if validation failed
		*/
		_required: function(field, rules, i, options, condRequired) {
			switch (field.prop("type")) {
				case "radio":
				case "checkbox":
					// new validation style to only check dependent field
					if (condRequired) {
						if (!field.prop('checked')) {
							return options.allrules[rules[i]].alertTextCheckboxMultiple;
						}
						break;
					}
					// old validation style
					var form = field.closest("form, .validationEngineContainer");
					var name = field.attr("name");
					if (form.find("input[name='" + name + "']:checked").length == 0) {
						if (form.find("input[name='" + name + "']:visible").length == 1)
							return options.allrules[rules[i]].alertTextCheckboxe;
						else
							return options.allrules[rules[i]].alertTextCheckboxMultiple;
					}
					break;
				case "text":
				case "password":
				case "textarea":
				case "file":
				case "select-one":
				case "select-multiple":
				default:
					var field_val      = $.trim( field.val()                               );
					var dv_placeholder = $.trim( field.attr("data-validation-placeholder") );
					var placeholder    = $.trim( field.attr("placeholder")                 );
					if (
						   ( !field_val                                    )
						|| ( dv_placeholder && field_val == dv_placeholder )
						|| ( placeholder    && field_val == placeholder    )
					) {
						return options.allrules[rules[i]].alertText;
					}
					break;
			}
		},
		/**
		* Validate that 1 from the group field is required
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_groupRequired: function(field, rules, i, options) {
			var classGroup = "["+options.validateAttribute+"*=" +rules[i + 1] +"]";
			var isValid = false;
			// Check all fields from the group
			field.closest("form, .validationEngineContainer").find(classGroup).each(function(){
				if(!methods._required($(this), rules, i, options)){
					isValid = true;
					return false;
				}
			});

			if(!isValid) {
		  return options.allrules[rules[i]].alertText;
		}
		},
		/**
		* Validate rules
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_custom: function(field, rules, i, options) {
			var customRule = rules[i + 1];
			var rule = options.allrules[customRule];
			var fn;
			if(!rule) {
				alert("jqv:custom rule not found - "+customRule);
				return;
			}

			if(rule["regex"]) {
				 var ex=rule.regex;
					if(!ex) {
						alert("jqv:custom regex not found - "+customRule);
						return;
					}
					var pattern = new RegExp(ex);

					if (!pattern.test(field.val())) return options.allrules[customRule].alertText;

			} else if(rule["func"]) {
				fn = rule["func"];

				if (typeof(fn) !== "function") {
					alert("jqv:custom parameter 'function' is no function - "+customRule);
						return;
				}

				if (!fn(field, rules, i, options))
					return options.allrules[customRule].alertText;
			} else {
				alert("jqv:custom type not allowed "+customRule);
					return;
			}
		},
		/**
		* Validate custom function outside of the engine scope
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_funcCall: function(field, rules, i, options) {
			var functionName = rules[i + 1];
			var fn;
			if(functionName.indexOf('.') >-1)
			{
				var namespaces = functionName.split('.');
				var scope = window;
				while(namespaces.length)
				{
					scope = scope[namespaces.shift()];
				}
				fn = scope;
			}
			else
				fn = window[functionName] || options.customFunctions[functionName];
			if (typeof(fn) == 'function')
				return fn(field, rules, i, options);

		},
		_funcCallRequired: function(field, rules, i, options) {
			return methods._funcCall(field,rules,i,options);
		},
		/**
		* Field match
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_equals: function(field, rules, i, options) {
			var equalsField = rules[i + 1];

			if (field.val() != $("#" + equalsField).val())
				return options.allrules.equals.alertText;
		},
		/**
		* Check the maximum size (in characters)
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_maxSize: function(field, rules, i, options) {
			var max = rules[i + 1];
			var len = field.val().length;

			if (len > max) {
				var rule = options.allrules.maxSize;
				return rule.alertText + max + rule.alertText2;
			}
		},
		/**
		* Check the minimum size (in characters)
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_minSize: function(field, rules, i, options) {
			var min = rules[i + 1];
			var len = field.val().length;

			if (len < min) {
				var rule = options.allrules.minSize;
				return rule.alertText + min + rule.alertText2;
			}
		},
		/**
		* Check number minimum value
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_min: function(field, rules, i, options) {
			var min = parseFloat(rules[i + 1]);
			var len = parseFloat(field.val());

			if (len < min) {
				var rule = options.allrules.min;
				if (rule.alertText2) return rule.alertText + min + rule.alertText2;
				return rule.alertText + min;
			}
		},
		/**
		* Check number maximum value
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_max: function(field, rules, i, options) {
			var max = parseFloat(rules[i + 1]);
			var len = parseFloat(field.val());

			if (len >max ) {
				var rule = options.allrules.max;
				if (rule.alertText2) return rule.alertText + max + rule.alertText2;
				//orefalo: to review, also do the translations
				return rule.alertText + max;
			}
		},
		/**
		* Checks date is in the past
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_past: function(form, field, rules, i, options) {

			var p=rules[i + 1];
			var fieldAlt = $(form.find("*[name='" + p.replace(/^#+/, '') + "']"));
			var pdate;

			if (p.toLowerCase() == "now") {
				pdate = new Date();
			} else if (undefined != fieldAlt.val()) {
				if (fieldAlt.is(":disabled"))
					return;
				pdate = methods._parseDate(fieldAlt.val());
			} else {
				pdate = methods._parseDate(p);
			}
			var vdate = methods._parseDate(field.val());

			if (vdate > pdate ) {
				var rule = options.allrules.past;
				if (rule.alertText2) return rule.alertText + methods._dateToString(pdate) + rule.alertText2;
				return rule.alertText + methods._dateToString(pdate);
			}
		},
		/**
		* Checks date is in the future
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_future: function(form, field, rules, i, options) {

			var p=rules[i + 1];
			var fieldAlt = $(form.find("*[name='" + p.replace(/^#+/, '') + "']"));
			var pdate;

			if (p.toLowerCase() == "now") {
				pdate = new Date();
			} else if (undefined != fieldAlt.val()) {
				if (fieldAlt.is(":disabled"))
					return;
				pdate = methods._parseDate(fieldAlt.val());
			} else {
				pdate = methods._parseDate(p);
			}
			var vdate = methods._parseDate(field.val());

			if (vdate < pdate ) {
				var rule = options.allrules.future;
				if (rule.alertText2)
					return rule.alertText + methods._dateToString(pdate) + rule.alertText2;
				return rule.alertText + methods._dateToString(pdate);
			}
		},
		/**
		* Checks if valid date
		*
		* @param {string} date string
		* @return a bool based on determination of valid date
		*/
		_isDate: function (value) {
			var dateRegEx = new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(?:(?:0?[1-9]|1[0-2])(\/|-)(?:0?[1-9]|1\d|2[0-8]))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(0?2(\/|-)29)(\/|-)(?:(?:0[48]00|[13579][26]00|[2468][048]00)|(?:\d\d)?(?:0[48]|[2468][048]|[13579][26]))$/);
			return dateRegEx.test(value);
		},
		/**
		* Checks if valid date time
		*
		* @param {string} date string
		* @return a bool based on determination of valid date time
		*/
		_isDateTime: function (value){
			var dateTimeRegEx = new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1}$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^((1[012]|0?[1-9]){1}\/(0?[1-9]|[12][0-9]|3[01]){1}\/\d{2,4}\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1})$/);
			return dateTimeRegEx.test(value);
		},
		//Checks if the start date is before the end date
		//returns true if end is later than start
		_dateCompare: function (start, end) {
			return (new Date(start.toString()) < new Date(end.toString()));
		},
		/**
		* Checks date range
		*
		* @param {jqObject} first field name
		* @param {jqObject} second field name
		* @return an error string if validation failed
		*/
		_dateRange: function (field, rules, i, options) {
			//are not both populated
			if ((!options.firstOfGroup[0].value && options.secondOfGroup[0].value) || (options.firstOfGroup[0].value && !options.secondOfGroup[0].value)) {
				return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
			}

			//are not both dates
			if (!methods._isDate(options.firstOfGroup[0].value) || !methods._isDate(options.secondOfGroup[0].value)) {
				return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
			}

			//are both dates but range is off
			if (!methods._dateCompare(options.firstOfGroup[0].value, options.secondOfGroup[0].value)) {
				return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
			}
		},
		/**
		* Checks date time range
		*
		* @param {jqObject} first field name
		* @param {jqObject} second field name
		* @return an error string if validation failed
		*/
		_dateTimeRange: function (field, rules, i, options) {
			//are not both populated
			if ((!options.firstOfGroup[0].value && options.secondOfGroup[0].value) || (options.firstOfGroup[0].value && !options.secondOfGroup[0].value)) {
				return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
			}
			//are not both dates
			if (!methods._isDateTime(options.firstOfGroup[0].value) || !methods._isDateTime(options.secondOfGroup[0].value)) {
				return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
			}
			//are both dates but range is off
			if (!methods._dateCompare(options.firstOfGroup[0].value, options.secondOfGroup[0].value)) {
				return options.allrules[rules[i]].alertText + options.allrules[rules[i]].alertText2;
			}
		},
		/**
		* Max number of checkbox selected
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_maxCheckbox: function(form, field, rules, i, options) {

			var nbCheck = rules[i + 1];
			var groupname = field.attr("name");
			var groupSize = form.find("input[name='" + groupname + "']:checked").length;
			if (groupSize > nbCheck) {
				options.showArrow = false;
				if (options.allrules.maxCheckbox.alertText2)
					 return options.allrules.maxCheckbox.alertText + " " + nbCheck + " " + options.allrules.maxCheckbox.alertText2;
				return options.allrules.maxCheckbox.alertText;
			}
		},
		/**
		* Min number of checkbox selected
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_minCheckbox: function(form, field, rules, i, options) {

			var nbCheck = rules[i + 1];
			var groupname = field.attr("name");
			var groupSize = form.find("input[name='" + groupname + "']:checked").length;
			if (groupSize < nbCheck) {
				options.showArrow = false;
				return options.allrules.minCheckbox.alertText + " " + nbCheck + " " + options.allrules.minCheckbox.alertText2;
			}
		},
		/**
		* Checks that it is a valid credit card number according to the
		* Luhn checksum algorithm.
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return an error string if validation failed
		*/
		_creditCard: function(field, rules, i, options) {
			//spaces and dashes may be valid characters, but must be stripped to calculate the checksum.
			var valid = false, cardNumber = field.val().replace(/ +/g, '').replace(/-+/g, '');

			var numDigits = cardNumber.length;
			if (numDigits >= 14 && numDigits <= 16 && parseInt(cardNumber) > 0) {

				var sum = 0, i = numDigits - 1, pos = 1, digit, luhn = new String();
				do {
					digit = parseInt(cardNumber.charAt(i));
					luhn += (pos++ % 2 == 0) ? digit * 2 : digit;
				} while (--i >= 0)

				for (i = 0; i < luhn.length; i++) {
					sum += parseInt(luhn.charAt(i));
				}
				valid = sum % 10 == 0;
			}
			if (!valid) return options.allrules.creditCard.alertText;
		},
		/**
		* Ajax field validation
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		*            user options
		* @return nothing! the ajax validator handles the prompts itself
		*/
		 _ajax: function(field, rules, i, options) {

			 var errorSelector = rules[i + 1];
			 var rule = options.allrules[errorSelector];
			 var extraData = rule.extraData;
			 var extraDataDynamic = rule.extraDataDynamic;
			 var data = {
				"fieldId" : field.attr("id"),
				"fieldValue" : field.val()
			 };

			 if (typeof extraData === "object") {
				$.extend(data, extraData);
			 } else if (typeof extraData === "string") {
				var tempData = extraData.split("&");
				for(var i = 0; i < tempData.length; i++) {
					var values = tempData[i].split("=");
					if (values[0] && values[0]) {
						data[values[0]] = values[1];
					}
				}
			 }

			 if (extraDataDynamic) {
				 var tmpData = [];
				 var domIds = String(extraDataDynamic).split(",");
				 for (var i = 0; i < domIds.length; i++) {
					 var id = domIds[i];
					 if ($(id).length) {
						 var inputValue = field.closest("form, .validationEngineContainer").find(id).val();
						 var keyValue = id.replace('#', '') + '=' + escape(inputValue);
						 data[id.replace('#', '')] = inputValue;
					 }
				 }
			 }

			 // If a field change event triggered this we want to clear the cache for this ID
			 if (options.eventTrigger == "field") {
				delete(options.ajaxValidCache[field.attr("id")]);
			 }

			 // If there is an error or if the the field is already validated, do not re-execute AJAX
			 if (!options.isError && !methods._checkAjaxFieldStatus(field.attr("id"), options)) {
				 $.ajax({
					 type: options.ajaxFormValidationMethod,
					 url: rule.url,
					 cache: false,
					 dataType: "json",
					 data: data,
					 field: field,
					 rule: rule,
					 methods: methods,
					 options: options,
					 beforeSend: function() {},
					 error: function(data, transport) {
						if (options.onFailure) {
							options.onFailure(data, transport);
						} else {
							methods._ajaxError(data, transport);
						}
					 },
					 success: function(json) {

						 // asynchronously called on success, data is the json answer from the server
						 var errorFieldId = json[0];
						 //var errorField = $($("#" + errorFieldId)[0]);
						 var errorField = $("#"+ errorFieldId).eq(0);

						 // make sure we found the element
						 if (errorField.length == 1) {
							 var status = json[1];
							 // read the optional msg from the server
							 var msg = json[2];
							 if (!status) {
								 // Houston we got a problem - display an red prompt
								 options.ajaxValidCache[errorFieldId] = false;
								 options.isError = true;

								 // resolve the msg prompt
								 if(msg) {
									 if (options.allrules[msg]) {
										 var txt = options.allrules[msg].alertText;
										 if (txt) {
											msg = txt;
							}
									 }
								 }
								 else
									msg = rule.alertText;

								 if (options.showPrompts) methods._showPrompt(errorField, msg, "", true, options);
							 } else {
								 options.ajaxValidCache[errorFieldId] = true;

								 // resolves the msg prompt
								 if(msg) {
									 if (options.allrules[msg]) {
										 var txt = options.allrules[msg].alertTextOk;
										 if (txt) {
											msg = txt;
							}
									 }
								 }
								 else
								 msg = rule.alertTextOk;

								 if (options.showPrompts) {
									 // see if we should display a green prompt
									 if (msg)
										methods._showPrompt(errorField, msg, "pass", true, options);
									 else
										methods._closePrompt(errorField);
								}

								 // If a submit form triggered this, we want to re-submit the form
								 if (options.eventTrigger == "submit")
									field.closest("form").submit();
							 }
						 }
						 errorField.trigger("jqv.field.result", [errorField, options.isError, msg]);
					 }
				 });

				 return rule.alertTextLoad;
			 }
		 },
		/**
		* Common method to handle ajax errors
		*
		* @param {Object} data
		* @param {Object} transport
		*/
		_ajaxError: function(data, transport) {
			if(data.status == 0 && transport == null)
				alert("The page is not served from a server! ajax call failed");
			else if(typeof console != "undefined")
				console.log("Ajax error: " + data.status + " " + transport);
		},
		/**
		* date -> string
		*
		* @param {Object} date
		*/
		_dateToString: function(date) {
			return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
		},
		/**
		* Parses an ISO date
		* @param {String} d
		*/
		_parseDate: function(d) {

			var dateParts = d.split("-");
			if(dateParts==d)
				dateParts = d.split("/");
			if(dateParts==d) {
				dateParts = d.split(".");
				return new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
			}
			return new Date(dateParts[0], (dateParts[1] - 1) ,dateParts[2]);
		},
		/**
		* Builds or updates a prompt with the given information
		*
		* @param {jqObject} field
		* @param {String} promptText html text to display type
		* @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
		* @param {boolean} ajaxed - use to mark fields than being validated with ajax
		* @param {Map} options user options
		*/
		 _showPrompt: function(field, promptText, type, ajaxed, options, ajaxform) {
		 	//Check if we need to adjust what element to show the prompt on
			if(field.data('jqv-prompt-at') instanceof jQuery ){
				field = field.data('jqv-prompt-at');
			} else if(field.data('jqv-prompt-at')) {
				field = $(field.data('jqv-prompt-at'));
			}

			 var prompt = methods._getPrompt(field);
			 // The ajax submit errors are not see has an error in the form,
			 // When the form errors are returned, the engine see 2 bubbles, but those are ebing closed by the engine at the same time
			 // Because no error was found befor submitting
			 if(ajaxform) prompt = false;
			 // Check that there is indded text
			 if($.trim(promptText)){
				 if (prompt)
					methods._updatePrompt(field, prompt, promptText, type, ajaxed, options);
				 else
					methods._buildPrompt(field, promptText, type, ajaxed, options);
			}
		 },
		/**
		* Builds and shades a prompt for the given field.
		*
		* @param {jqObject} field
		* @param {String} promptText html text to display type
		* @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
		* @param {boolean} ajaxed - use to mark fields than being validated with ajax
		* @param {Map} options user options
		*/
		_buildPrompt: function(field, promptText, type, ajaxed, options) {

			// create the prompt
			var prompt = $('<div>');
			prompt.addClass(methods._getClassName(field.attr("id")) + "formError");
			// add a class name to identify the parent form of the prompt
			prompt.addClass("parentForm"+methods._getClassName(field.closest('form, .validationEngineContainer').attr("id")));
			prompt.addClass("formError");

			switch (type) {
				case "pass":
					prompt.addClass("greenPopup");
					break;
				case "load":
					prompt.addClass("blackPopup");
					break;
				default:
					/* it has error  */
					//alert("unknown popup type:"+type);
			}
			if (ajaxed)
				prompt.addClass("ajaxed");

			// create the prompt content
			var promptContent = $('<div>').addClass("formErrorContent").html(promptText).appendTo(prompt);

			// determine position type
			var positionType=field.data("promptPosition") || options.promptPosition;

			// create the css arrow pointing at the field
			// note that there is no triangle on max-checkbox and radio
			if (options.showArrow) {
				var arrow = $('<div>').addClass("formErrorArrow");

				//prompt positioning adjustment support. Usage: positionType:Xshift,Yshift (for ex.: bottomLeft:+20 or bottomLeft:-20,+10)
				if (typeof(positionType)=='string')
				{
					var pos=positionType.indexOf(":");
					if(pos!=-1)
						positionType=positionType.substring(0,pos);
				}

				switch (positionType) {
					case "bottomLeft":
					case "bottomRight":
						prompt.find(".formErrorContent").before(arrow);
						arrow.addClass("formErrorArrowBottom").html('<div class="line1"><!-- --></div><div class="line2"><!-- --></div><div class="line3"><!-- --></div><div class="line4"><!-- --></div><div class="line5"><!-- --></div><div class="line6"><!-- --></div><div class="line7"><!-- --></div><div class="line8"><!-- --></div><div class="line9"><!-- --></div><div class="line10"><!-- --></div>');
						break;
					case "topLeft":
					case "topRight":
						arrow.html('<div class="line10"><!-- --></div><div class="line9"><!-- --></div><div class="line8"><!-- --></div><div class="line7"><!-- --></div><div class="line6"><!-- --></div><div class="line5"><!-- --></div><div class="line4"><!-- --></div><div class="line3"><!-- --></div><div class="line2"><!-- --></div><div class="line1"><!-- --></div>');
						prompt.append(arrow);
						break;
				}
			}
			// Add custom prompt class
			if (options.addPromptClass)
				prompt.addClass(options.addPromptClass);

            // Add custom prompt class defined in element
            var requiredOverride = field.attr('data-required-class');
            if(requiredOverride !== undefined) {
                prompt.addClass(requiredOverride);
            } else {
                if(options.prettySelect) {
                    if($('#' + field.attr('id')).next().is('select')) {
                        var prettyOverrideClass = $('#' + field.attr('id').substr(options.usePrefix.length).substring(options.useSuffix.length)).attr('data-required-class');
                        if(prettyOverrideClass !== undefined) {
                            prompt.addClass(prettyOverrideClass);
                        }
                    }
                }
            }

			prompt.css({
				"opacity": 0
			});
			if(positionType === 'inline') {
				prompt.addClass("inline");
				if(typeof field.attr('data-prompt-target') !== 'undefined' && $('#'+field.attr('data-prompt-target')).length > 0) {
					prompt.appendTo($('#'+field.attr('data-prompt-target')));
				} else {
					field.after(prompt);
				}
			} else {
				field.before(prompt);
			}

			var pos = methods._calculatePosition(field, prompt, options);
			// Support RTL layouts by @yasser_lotfy ( Yasser Lotfy )
			if ($('body').hasClass('rtl')) {
				prompt.css({
					'position': positionType === 'inline' ? 'relative' : 'absolute',
					"top": pos.callerTopPosition,
					"left": "initial",
					"right": pos.callerleftPosition,
					"marginTop": pos.marginTopSize,
					"opacity": 0
				}).data("callerField", field);
		    	} else {
				prompt.css({
					'position': positionType === 'inline' ? 'relative' : 'absolute',
					"top": pos.callerTopPosition,
					"left": pos.callerleftPosition,
					"right": "initial",
					"marginTop": pos.marginTopSize,
					"opacity": 0
				}).data("callerField", field);
		    	}


			if (options.autoHidePrompt) {
				setTimeout(function(){
					prompt.animate({
						"opacity": 0
					},function(){
						prompt.closest('.formError').remove();
					});
				}, options.autoHideDelay);
			}
			return prompt.animate({
				"opacity": 0.87
			});
		},
		/**
		* Updates the prompt text field - the field for which the prompt
		* @param {jqObject} field
		* @param {String} promptText html text to display type
		* @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
		* @param {boolean} ajaxed - use to mark fields than being validated with ajax
		* @param {Map} options user options
		*/
		_updatePrompt: function(field, prompt, promptText, type, ajaxed, options, noAnimation) {

			if (prompt) {
				if (typeof type !== "undefined") {
					if (type == "pass")
						prompt.addClass("greenPopup");
					else
						prompt.removeClass("greenPopup");

					if (type == "load")
						prompt.addClass("blackPopup");
					else
						prompt.removeClass("blackPopup");
				}
				if (ajaxed)
					prompt.addClass("ajaxed");
				else
					prompt.removeClass("ajaxed");

				prompt.find(".formErrorContent").html(promptText);

				var pos = methods._calculatePosition(field, prompt, options);
				// Support RTL layouts by @yasser_lotfy ( Yasser Lotfy )
				if ($('body').hasClass('rtl')) {
					var css = {"top": pos.callerTopPosition,
					"left": "initial",
					"right": pos.callerleftPosition,
					"marginTop": pos.marginTopSize,
					"opacity": 0.87};
				} else {
					var css = {"top": pos.callerTopPosition,
					"left": pos.callerleftPosition,
					"right": "initial",
					"marginTop": pos.marginTopSize,
					"opacity": 0.87};
				}

                prompt.css({
                    "opacity": 0,
                    "display": "block"
                });

				if (noAnimation)
					prompt.css(css);
				else
					prompt.animate(css);
			}
		},
		/**
		* Closes the prompt associated with the given field
		*
		* @param {jqObject}
		*            field
		*/
		 _closePrompt: function(field) {
			 var prompt = methods._getPrompt(field);
			 if (prompt)
				 prompt.fadeTo("fast", 0, function() {
					 prompt.closest('.formError').remove();
				 });
		 },
		 closePrompt: function(field) {
			 return methods._closePrompt(field);
		 },
		/**
		* Returns the error prompt matching the field if any
		*
		* @param {jqObject}
		*            field
		* @return undefined or the error prompt (jqObject)
		*/
		_getPrompt: function(field) {
				var formId = $(field).closest('form, .validationEngineContainer').attr('id');
			var className = methods._getClassName(field.attr("id")) + "formError";
				var match = $("." + methods._escapeExpression(className) + '.parentForm' + methods._getClassName(formId))[0];
			if (match)
			return $(match);
		},
		/**
		  * Returns the escapade classname
		  *
		  * @param {selector}
		  *            className
		  */
		  _escapeExpression: function (selector) {
			  return selector.replace(/([#;&,\.\+\*\~':"\!\^$\[\]\(\)=>\|])/g, "\\$1");
		  },
		/**
		 * returns true if we are in a RTLed document
		 *
		 * @param {jqObject} field
		 */
		isRTL: function(field)
		{
			var $document = $(document);
			var $body = $('body');
			var rtl =
				(field && field.hasClass('rtl')) ||
				(field && (field.attr('dir') || '').toLowerCase()==='rtl') ||
				$document.hasClass('rtl') ||
				($document.attr('dir') || '').toLowerCase()==='rtl' ||
				$body.hasClass('rtl') ||
				($body.attr('dir') || '').toLowerCase()==='rtl';
			return Boolean(rtl);
		},
		/**
		* Calculates prompt position
		*
		* @param {jqObject}
		*            field
		* @param {jqObject}
		*            the prompt
		* @param {Map}
		*            options
		* @return positions
		*/
		_calculatePosition: function (field, promptElmt, options) {

			var promptTopPosition, promptleftPosition, marginTopSize;
			var fieldWidth 	= field.width();
			var fieldLeft 	= field.position().left;
			var fieldTop 	=  field.position().top;
			var fieldHeight 	=  field.height();
			var promptHeight = promptElmt.height();


			// is the form contained in an overflown container?
			promptTopPosition = promptleftPosition = 0;
			// compensation for the arrow
			marginTopSize = -promptHeight;


			//prompt positioning adjustment support
			//now you can adjust prompt position
			//usage: positionType:Xshift,Yshift
			//for example:
			//   bottomLeft:+20 means bottomLeft position shifted by 20 pixels right horizontally
			//   topRight:20, -15 means topRight position shifted by 20 pixels to right and 15 pixels to top
			//You can use +pixels, - pixels. If no sign is provided than + is default.
			var positionType=field.data("promptPosition") || options.promptPosition;
			var shift1="";
			var shift2="";
			var shiftX=0;
			var shiftY=0;
			if (typeof(positionType)=='string') {
				//do we have any position adjustments ?
				if (positionType.indexOf(":")!=-1) {
					shift1=positionType.substring(positionType.indexOf(":")+1);
					positionType=positionType.substring(0,positionType.indexOf(":"));

					//if any advanced positioning will be needed (percents or something else) - parser should be added here
					//for now we use simple parseInt()

					//do we have second parameter?
					if (shift1.indexOf(",") !=-1) {
						shift2=shift1.substring(shift1.indexOf(",") +1);
						shift1=shift1.substring(0,shift1.indexOf(","));
						shiftY=parseInt(shift2);
						if (isNaN(shiftY)) shiftY=0;
					};

					shiftX=parseInt(shift1);
					if (isNaN(shift1)) shift1=0;

				};
			};


			switch (positionType) {
				default:
				case "topRight":
					promptleftPosition +=  fieldLeft + fieldWidth - 27;
					promptTopPosition +=  fieldTop;
					break;

				case "topLeft":
					promptTopPosition +=  fieldTop;
					promptleftPosition += fieldLeft;
					break;

				case "centerRight":
					promptTopPosition = fieldTop+4;
					marginTopSize = 0;
					promptleftPosition= fieldLeft + field.outerWidth(true)+5;
					break;
				case "centerLeft":
					promptleftPosition = fieldLeft - (promptElmt.width() + 2);
					promptTopPosition = fieldTop+4;
					marginTopSize = 0;

					break;

				case "bottomLeft":
					promptTopPosition = fieldTop + field.height() + 5;
					marginTopSize = 0;
					promptleftPosition = fieldLeft;
					break;
				case "bottomRight":
					promptleftPosition = fieldLeft + fieldWidth - 27;
					promptTopPosition =  fieldTop +  field.height() + 5;
					marginTopSize = 0;
					break;
				case "inline":
					promptleftPosition = 0;
					promptTopPosition = 0;
					marginTopSize = 0;
			};



			//apply adjusments if any
			promptleftPosition += shiftX;
			promptTopPosition  += shiftY;

			return {
				"callerTopPosition": promptTopPosition + "px",
				"callerleftPosition": promptleftPosition + "px",
				"marginTopSize": marginTopSize + "px"
			};
		},
		/**
		* Saves the user options and variables in the form.data
		*
		* @param {jqObject}
		*            form - the form where the user option should be saved
		* @param {Map}
		*            options - the user options
		* @return the user options (extended from the defaults)
		*/
		 _saveOptions: function(form, options) {

			 // is there a language localisation ?
			 if ($.validationEngineLanguage)
			 var allRules = $.validationEngineLanguage.allRules;
			 else
			 $.error("jQuery.validationEngine rules are not loaded, plz add localization files to the page");
			 // --- Internals DO NOT TOUCH or OVERLOAD ---
			 // validation rules and i18
			 $.validationEngine.defaults.allrules = allRules;

			 var userOptions = $.extend(true,{},$.validationEngine.defaults,options);

			 form.data('jqv', userOptions);
			 return userOptions;
		 },

		 /**
		 * Removes forbidden characters from class name
		 * @param {String} className
		 */
		 _getClassName: function(className) {
			 if(className)
				 return className.replace(/:/g, "_").replace(/\./g, "_");
					  },
		/**
		 * Escape special character for jQuery selector
		 * http://totaldev.com/content/escaping-characters-get-valid-jquery-id
		 * @param {String} selector
		 */
		 _jqSelector: function(str){
			return str.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
		},
		/**
		* Conditionally required field
		*
		* @param {jqObject} field
		* @param {Array[String]} rules
		* @param {int} i rules index
		* @param {Map}
		* user options
		* @return an error string if validation failed
		*/
		_condRequired: function(field, rules, i, options) {
			var idx, dependingField;

			for(idx = (i + 1); idx < rules.length; idx++) {
				dependingField = jQuery("#" + rules[idx]).first();

				/* Use _required for determining wether dependingField has a value.
				 * There is logic there for handling all field types, and default value; so we won't replicate that here
				 * Indicate this special use by setting the last parameter to true so we only validate the dependingField on chackboxes and radio buttons (#462)
				 */
				if (dependingField.length && methods._required(dependingField, ["required"], 0, options, true) == undefined) {
					/* We now know any of the depending fields has a value,
					 * so we can validate this field as per normal required code
					 */
					return methods._required(field, ["required"], 0, options);
				}
			}
		},

	    _submitButtonClick: function(event) {
	        var button = $(this);
	        var form = button.closest('form, .validationEngineContainer');
	        form.data("jqv_submitButton", button.attr("id"));
	    }
		  };

	 /**
	 * Plugin entry point.
	 * You may pass an action as a parameter or a list of options.
	 * if none, the init and attach methods are being called.
	 * Remember: if you pass options, the attached method is NOT called automatically
	 *
	 * @param {String}
	 *            method (optional) action
	 */
	 $.fn.validationEngine = function(method) {

		 var form = $(this);
		 if(!form[0]) return form;  // stop here if the form does not exist

		 if (typeof(method) == 'string' && method.charAt(0) != '_' && methods[method]) {

			 // make sure init is called once
			 if(method != "showPrompt" && method != "hide" && method != "hideAll")
			 methods.init.apply(form);

			 return methods[method].apply(form, Array.prototype.slice.call(arguments, 1));
		 } else if (typeof method == 'object' || !method) {

			 // default constructor with or without arguments
			 methods.init.apply(form, arguments);
			 return methods.attach.apply(form);
		 } else {
			 $.error('Method ' + method + ' does not exist in jQuery.validationEngine');
		 }
	};



	// LEAK GLOBAL OPTIONS
	$.validationEngine= {fieldIdCounter: 0,defaults:{

		// Name of the event triggering field validation
		validationEventTrigger: "blur",
		// Automatically scroll viewport to the first error
		scroll: true,
		// Focus on the first input
		focusFirstField:true,
		// Show prompts, set to false to disable prompts
		showPrompts: true,
		// Should we attempt to validate non-visible input fields contained in the form? (Useful in cases of tabbed containers, e.g. jQuery-UI tabs)
		validateNonVisibleFields: false,
		// ignore the validation for fields with this specific class (Useful in cases of tabbed containers AND hidden fields we don't want to validate)
		ignoreFieldsWithClass: 'ignoreMe',
		// Opening box position, possible locations are: topLeft,
		// topRight, bottomLeft, centerRight, bottomRight, inline
		// inline gets inserted after the validated field or into an element specified in data-prompt-target
		promptPosition: "topRight",
		bindMethod:"bind",
		// internal, automatically set to true when it parse a _ajax rule
		inlineAjax: false,
		// if set to true, the form data is sent asynchronously via ajax to the form.action url (get)
		ajaxFormValidation: false,
		// The url to send the submit ajax validation (default to action)
		ajaxFormValidationURL: false,
		// HTTP method used for ajax validation
		ajaxFormValidationMethod: 'get',
		// Ajax form validation callback method: boolean onComplete(form, status, errors, options)
		// retuns false if the form.submit event needs to be canceled.
		onAjaxFormComplete: $.noop,
		// called right before the ajax call, may return false to cancel
		onBeforeAjaxFormValidation: $.noop,
		// Stops form from submitting and execute function assiciated with it
		onValidationComplete: false,

		// Used when you have a form fields too close and the errors messages are on top of other disturbing viewing messages
		doNotShowAllErrosOnSubmit: false,
		// Object where you store custom messages to override the default error messages
		custom_error_messages:{},
		// true if you want to validate the input fields on blur event
		binded: true,
		// set to true if you want to validate the input fields on blur only if the field it's not empty
		notEmpty: false,
		// set to true, when the prompt arrow needs to be displayed
		showArrow: true,
		// set to false, determines if the prompt arrow should be displayed when validating
		// checkboxes and radio buttons
		showArrowOnRadioAndCheckbox: false,
		// did one of the validation fail ? kept global to stop further ajax validations
		isError: false,
		// Limit how many displayed errors a field can have
		maxErrorsPerField: false,

		// Caches field validation status, typically only bad status are created.
		// the array is used during ajax form validation to detect issues early and prevent an expensive submit
		ajaxValidCache: {},
		// Auto update prompt position after window resize
		autoPositionUpdate: false,

		InvalidFields: [],
		onFieldSuccess: false,
		onFieldFailure: false,
		onSuccess: false,
		onFailure: false,
		validateAttribute: "class",
		addSuccessCssClassToField: "",
		addFailureCssClassToField: "",

		// Auto-hide prompt
		autoHidePrompt: false,
		// Delay before auto-hide
		autoHideDelay: 10000,
		// Fade out duration while hiding the validations
		fadeDuration: 300,
	 // Use Prettify select library
	 prettySelect: false,
	 // Add css class on prompt
	 addPromptClass : "",
	 // Custom ID uses prefix
	 usePrefix: "",
	 // Custom ID uses suffix
	 useSuffix: "",
	 // Only show one message per error prompt
	 showOneMessage: false
	}};
	$(function(){$.validationEngine.defaults.promptPosition = methods.isRTL()?'topLeft':"topRight"});
})(jQuery);
/**
 * what-input - A global utility for tracking the current input method (mouse, keyboard or touch).
 * @version v5.0.1
 * @link https://github.com/ten1seven/what-input
 * @license MIT
 */
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("whatInput",[],t):"object"==typeof exports?exports.whatInput=t():e.whatInput=t()}(this,function(){return function(e){function t(o){if(n[o])return n[o].exports;var i=n[o]={exports:{},id:o,loaded:!1};return e[o].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t){"use strict";e.exports=function(){var e=document.documentElement,t=null,n="initial",o=n,i=["input","select","textarea"],r=[],u=[16,17,18,91,93],d={keydown:"keyboard",keyup:"keyboard",mousedown:"mouse",mousemove:"mouse",MSPointerDown:"pointer",MSPointerMove:"pointer",pointerdown:"pointer",pointermove:"pointer",touchstart:"touch"},a=!1,s=!1,c={x:null,y:null},p={2:"touch",3:"touch",4:"mouse"},w=!1;try{var f=Object.defineProperty({},"passive",{get:function(){w=!0}});window.addEventListener("test",null,f)}catch(e){}var v=function(){var e=!!w&&{passive:!0};window.PointerEvent?(window.addEventListener("pointerdown",l),window.addEventListener("pointermove",h)):window.MSPointerEvent?(window.addEventListener("MSPointerDown",l),window.addEventListener("MSPointerMove",h)):(window.addEventListener("mousedown",l),window.addEventListener("mousemove",h),"ontouchstart"in window&&(window.addEventListener("touchstart",L,e),window.addEventListener("touchend",L))),window.addEventListener(b(),h,e),window.addEventListener("keydown",l),window.addEventListener("keyup",l),window.addEventListener("focusin",y),window.addEventListener("focusout",E)},l=function(e){if(!a){var t=e.which,r=d[e.type];"pointer"===r&&(r=x(e));var s="keyboard"===r&&t&&-1===u.indexOf(t)||"mouse"===r||"touch"===r;if(n!==r&&s&&(n=r,m("input")),o!==r&&s){var c=document.activeElement;c&&c.nodeName&&-1===i.indexOf(c.nodeName.toLowerCase())&&(o=r,m("intent"))}}},m=function(t){e.setAttribute("data-what"+t,"input"===t?n:o),g(t)},h=function(e){if(k(e),!a&&!s){var t=d[e.type];"pointer"===t&&(t=x(e)),o!==t&&(o=t,m("intent"))}},y=function(n){t=n.target.nodeName.toLowerCase(),e.setAttribute("data-whatelement",t),n.target.classList.length&&e.setAttribute("data-whatclasses",n.target.classList.toString().replace(" ",","))},E=function(){t=null,e.removeAttribute("data-whatelement"),e.removeAttribute("data-whatclasses")},L=function(e){"touchstart"===e.type?(a=!1,l(e)):a=!0},x=function(e){return"number"==typeof e.pointerType?p[e.pointerType]:"pen"===e.pointerType?"touch":e.pointerType},b=function(){return"onwheel"in document.createElement("div")?"wheel":void 0!==document.onmousewheel?"mousewheel":"DOMMouseScroll"},g=function(e){for(var t=0,i=r.length;t<i;t++)r[t].type===e&&r[t].fn.call(void 0,"input"===e?n:o)},M=function(e){for(var t=0,n=r.length;t<n;t++)if(r[t].fn===e)return t},k=function(e){c.x!==e.screenX||c.y!==e.screenY?(s=!1,c.x=e.screenX,c.y=e.screenY):s=!0};return"addEventListener"in window&&Array.prototype.indexOf&&function(){d[b()]="mouse",v(),m("input"),m("intent")}(),{ask:function(e){return"intent"===e?o:n},element:function(){return t},ignoreKeys:function(e){u=e},registerOnChange:function(e,t){r.push({fn:e,type:t||"input"})},unRegisterOnChange:function(e){var t=M(e);t&&r.splice(t,1)}}}()}])});
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
"use strict";
const fs = require("fs");
const path = require("path");
const generateBuilders = require("./generators/generateBuilders");
const generateValidators = require("./generators/generateValidators");
const generateAsserts = require("./generators/generateAsserts");
const generateConstants = require("./generators/generateConstants");
const format = require("./utils/formatCode");

const baseDir = path.join(__dirname, "../src");

function writeFile(content, location) {
  const file = path.join(baseDir, location);

  try {
    fs.mkdirSync(path.dirname(file));
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }

  fs.writeFileSync(file, format(content, file));
}

console.log("Generating @babel/types dynamic functions");

writeFile(generateBuilders(), "builders/generated/index.js");
writeFile(generateValidators(), "validators/generated/index.js");
writeFile(generateAsserts(), "asserts/generated/index.js");
writeFile(generateConstants(), "constants/generated/index.js");

"use strict";
const definitions = require("../../lib/definitions");

function addAssertHelper(type) {
  return `export function assert${type}(node: Object, opts?: Object = {}): void {
    assert("${type}", node, opts) }
  `;
}

module.exports = function generateAsserts() {
  let output = `// @flow
/*
 * This file is auto-generated! Do not modify it directly.
 * To re-generate run 'make build'
 */
import is from "../../validators/is";

function assert(type: string, node: Object, opts?: Object): void {
  if (!is(type, node, opts)) {
    throw new Error(
      \`Expected type "\${type}" with option \${JSON.stringify(opts)}, but instead got "\${node.type}".\`,
    );
  }
}\n\n`;

  Object.keys(definitions.VISITOR_KEYS).forEach(type => {
    output += addAssertHelper(type);
  });

  Object.keys(definitions.FLIPPED_ALIAS_KEYS).forEach(type => {
    output += addAssertHelper(type);
  });

  Object.keys(definitions.DEPRECATED_KEYS).forEach(type => {
    const newType = definitions.DEPRECATED_KEYS[type];
    output += `export function assert${type}(node: Object, opts: Object): void {
  console.trace("The node type ${type} has been renamed to ${newType}");
  assert("${type}", node, opts);
}\n`;
  });

  return output;
};

"use strict";
const definitions = require("../../lib/definitions");
const formatBuilderName = require("../utils/formatBuilderName");
const lowerFirst = require("../utils/lowerFirst");

module.exports = function generateBuilders() {
  let output = `// @flow
/*
 * This file is auto-generated! Do not modify it directly.
 * To re-generate run 'make build'
 */
import builder from "../builder";\n\n`;

  Object.keys(definitions.BUILDER_KEYS).forEach(type => {
    output += `export function ${type}(...args: Array<any>): Object { return builder("${type}", ...args); }
export { ${type} as ${formatBuilderName(type)} };\n`;

    // This is needed for backwards compatibility.
    // It should be removed in the next major version.
    // JSXIdentifier -> jSXIdentifier
    if (/^[A-Z]{2}/.test(type)) {
      output += `export { ${type} as ${lowerFirst(type)} }\n`;
    }
  });

  Object.keys(definitions.DEPRECATED_KEYS).forEach(type => {
    const newType = definitions.DEPRECATED_KEYS[type];
    output += `export function ${type}(...args: Array<any>): Object {
  console.trace("The node type ${type} has been renamed to ${newType}");
  return ${type}("${type}", ...args);
}
export { ${type} as ${formatBuilderName(type)} };\n`;

    // This is needed for backwards compatibility.
    // It should be removed in the next major version.
    // JSXIdentifier -> jSXIdentifier
    if (/^[A-Z]{2}/.test(type)) {
      output += `export { ${type} as ${lowerFirst(type)} }\n`;
    }
  });

  return output;
};

"use strict";
const definitions = require("../../lib/definitions");

module.exports = function generateConstants() {
  let output = `// @flow
/*
 * This file is auto-generated! Do not modify it directly.
 * To re-generate run 'make build'
 */
import { FLIPPED_ALIAS_KEYS } from "../../definitions";\n\n`;

  Object.keys(definitions.FLIPPED_ALIAS_KEYS).forEach(type => {
    output += `export const ${type.toUpperCase()}_TYPES = FLIPPED_ALIAS_KEYS["${type}"];\n`;
  });

  return output;
};

"use strict";
const definitions = require("../../lib/definitions");

function addIsHelper(type, aliasKeys, deprecated) {
  const targetType = JSON.stringify(type);
  let aliasSource = "";
  if (aliasKeys) {
    aliasSource =
      " || " +
      aliasKeys.map(JSON.stringify).join(" === nodeType || ") +
      " === nodeType";
  }

  return `export function is${type}(node: Object, opts?: Object): boolean {
    ${deprecated || ""}
    if (!node) return false;

    const nodeType = node.type;
    if (nodeType === ${targetType}${aliasSource}) {
      if (typeof opts === "undefined") {
        return true;
      } else {
        return shallowEqual(node, opts);
      }
    }

    return false;
  }
  `;
}

module.exports = function generateValidators() {
  let output = `// @flow
/*
 * This file is auto-generated! Do not modify it directly.
 * To re-generate run 'make build'
 */
import shallowEqual from "../../utils/shallowEqual";\n\n`;

  Object.keys(definitions.VISITOR_KEYS).forEach(type => {
    output += addIsHelper(type);
  });

  Object.keys(definitions.FLIPPED_ALIAS_KEYS).forEach(type => {
    output += addIsHelper(type, definitions.FLIPPED_ALIAS_KEYS[type]);
  });

  Object.keys(definitions.DEPRECATED_KEYS).forEach(type => {
    const newType = definitions.DEPRECATED_KEYS[type];
    const deprecated = `console.trace("The node type ${type} has been renamed to ${newType}");`;
    output += addIsHelper(type, null, deprecated);
  });

  return output;
};

"use strict";

const toLowerCase = Function.call.bind("".toLowerCase);

module.exports = function formatBuilderName(type) {
  // FunctionExpression -> functionExpression
  // JSXIdentifier -> jsxIdentifier
  return type.replace(/^([A-Z](?=[a-z])|[A-Z]+(?=[A-Z]))/, toLowerCase);
};

"use strict";
const prettier = require("prettier");

module.exports = function formatCode(code, filename) {
  filename = filename || __filename;
  const prettierConfig = prettier.resolveConfig.sync(filename);

  return prettier.format(code, prettierConfig);
};

"use strict";
module.exports = function lowerFirst(string) {
  return string[0].toLowerCase() + string.slice(1);
};

const definitions = require("../src/definitions");
const flatMap = require("array.prototype.flatmap");
const {
  typeSignature,
  iterateProps,
  mapProps,
  filterProps,
  unique
} = require("./util");

const stdout = process.stdout;

const jsTypes = ["string", "number", "boolean"];

const quote = value => `"${value}"`;

function params(fields) {
  const optionalDefault = field => (field.default ? ` = ${field.default}` : "");
  return mapProps(fields)
    .map(field => `${typeSignature(field)}${optionalDefault(field)}`)
    .join(",");
}

function assertParamType({ assertNodeType, array, name, type }) {
  if (array) {
    // TODO - assert contents of array?
    return `assert(typeof ${name} === "object" && typeof ${name}.length !== "undefined")\n`;
  } else {
    if (jsTypes.includes(type)) {
      return `assert(
          typeof ${name} === "${type}",
          "Argument ${name} must be of type ${type}, given: " + typeof ${name}
      )`;
    }

    if (assertNodeType === true) {
      return `assert(
        ${name}.type === "${type}",
        "Argument ${name} must be of type ${type}, given: " + ${name}.type
      )`;
    }

    return "";
  }
}

function assertParam(meta) {
  const paramAssertion = assertParamType(meta);

  if (paramAssertion === "") {
    return "";
  }

  if (meta.maybe || meta.optional) {
    return `
      if (${meta.name} !== null && ${meta.name} !== undefined) {
        ${paramAssertion};
      }
    `;
  } else {
    return paramAssertion;
  }
}

function assertParams(fields) {
  return mapProps(fields)
    .map(assertParam)
    .join("\n");
}

function buildObject(typeDef) {
  const optionalField = meta => {
    if (meta.array) {
      // omit optional array properties if the constructor function was supplied
      // with an empty array
      return `
        if (typeof ${meta.name} !== "undefined" && ${meta.name}.length > 0) {
          node.${meta.name} = ${meta.name};
        }
      `;
    } else if (meta.type === "Object") {
      // omit optional object properties if they have no keys
      return `
        if (typeof ${meta.name} !== "undefined" && Object.keys(${
        meta.name
      }).length !== 0) {
          node.${meta.name} = ${meta.name};
        }
      `;
    } else if (meta.type === "boolean") {
      // omit optional boolean properties if they are not true
      return `
        if (${meta.name} === true) {
          node.${meta.name} = true;
        }
      `;
    } else {
      return `
        if (typeof ${meta.name} !== "undefined") {
          node.${meta.name} = ${meta.name};
        }
      `;
    }
  };

  const fields = mapProps(typeDef.fields)
    .filter(f => !f.optional && !f.constant)
    .map(f => f.name);

  const constants = mapProps(typeDef.fields)
    .filter(f => f.constant)
    .map(f => `${f.name}: "${f.value}"`);

  return `
    const node: ${typeDef.flowTypeName || typeDef.name} = {
      type: "${typeDef.name}",
      ${constants.concat(fields).join(",")}
    }

    ${mapProps(typeDef.fields)
      .filter(f => f.optional)
      .map(optionalField)
      .join("")}
  `;
}

function lowerCamelCase(name) {
  return name.substring(0, 1).toLowerCase() + name.substring(1);
}

function generate() {
  stdout.write(`
    // @flow

    // THIS FILE IS AUTOGENERATED
    // see scripts/generateNodeUtils.js

    import { assert } from "mamacro";

    function isTypeOf(t: string) {
      return (n: Node) => n.type === t;
    }

    function assertTypeOf(t: string) {
      return (n: Node) => assert(n.type === t);
    }
  `);

  // Node builders
  iterateProps(definitions, typeDefinition => {
    stdout.write(`
      export function ${lowerCamelCase(typeDefinition.name)} (
        ${params(filterProps(typeDefinition.fields, f => !f.constant))}
      ): ${typeDefinition.name} {

        ${assertParams(filterProps(typeDefinition.fields, f => !f.constant))}
        ${buildObject(typeDefinition)} 

        return node;
      }
    `);
  });

  // Node testers
  iterateProps(definitions, typeDefinition => {
    stdout.write(`
      export const is${typeDefinition.name} =
        isTypeOf("${typeDefinition.name}");
    `);
  });

  // Node union type testers
  const unionTypes = unique(
    flatMap(mapProps(definitions).filter(d => d.unionType), d => d.unionType)
  );
  unionTypes.forEach(unionType => {
    stdout.write(
      `
      export const is${unionType} = (node: Node) => ` +
        mapProps(definitions)
          .filter(d => d.unionType && d.unionType.includes(unionType))
          .map(d => `is${d.name}(node) `)
          .join("||") +
        ";\n\n"
    );
  });

  // Node assertion
  iterateProps(definitions, typeDefinition => {
    stdout.write(`
      export const assert${typeDefinition.name} =
        assertTypeOf("${typeDefinition.name}");
    `);
  });

  // a map from node type to its set of union types
  stdout.write(
    `
    export const unionTypesMap = {` +
      mapProps(definitions)
        .filter(d => d.unionType)
        .map(t => `"${t.name}": [${t.unionType.map(quote).join(",")}]\n`) +
      `};
      `
  );

  // an array of all node and union types
  stdout.write(
    `
    export const nodeAndUnionTypes = [` +
      mapProps(definitions)
        .map(t => `"${t.name}"`)
        .concat(unionTypes.map(quote))
        .join(",") +
      `];`
  );
}

generate();

const definitions = require("../src/definitions");
const flatMap = require("array.prototype.flatmap");
const { typeSignature, mapProps, iterateProps, unique } = require("./util");

const stdout = process.stdout;

function params(fields) {
  return mapProps(fields)
    .map(typeSignature)
    .join(",");
}

function generate() {
  stdout.write(`
    // @flow
    /* eslint no-unused-vars: off */

    // THIS FILE IS AUTOGENERATED
    // see scripts/generateTypeDefinitions.js
  `);

  // generate union types
  const unionTypes = unique(
    flatMap(mapProps(definitions).filter(d => d.unionType), d => d.unionType)
  );
  unionTypes.forEach(unionType => {
    stdout.write(
      `type ${unionType} = ` +
        mapProps(definitions)
          .filter(d => d.unionType && d.unionType.includes(unionType))
          .map(d => d.name)
          .join("|") +
        ";\n\n"
    );
  });

  // generate the type definitions
  iterateProps(definitions, typeDef => {
    stdout.write(`type ${typeDef.name} = {
        ...BaseNode,
        type: "${typeDef.name}",
        ${params(typeDef.fields)}
      };\n\n`);
  });
}

generate();

function iterateProps(obj, iterator) {
  Object.keys(obj).forEach(key => iterator({ ...obj[key], name: key }));
}

function mapProps(obj) {
  return Object.keys(obj).map(key => ({ ...obj[key], name: key }));
}

function filterProps(obj, filter) {
  const ret = {};
  Object.keys(obj).forEach(key => {
    if (filter(obj[key])) {
      ret[key] = obj[key];
    }
  });
  return ret;
}

function typeSignature(meta) {
  const type = meta.array ? `Array<${meta.type}>` : meta.type;
  if (meta.optional) {
    return `${meta.name}?: ${type}`;
  } else if (meta.maybe) {
    return `${meta.name}: ?${type}`;
  } else {
    return `${meta.name}: ${type}`;
  }
}

const unique = items => Array.from(new Set(items));

module.exports = {
  iterateProps,
  mapProps,
  filterProps,
  typeSignature,
  unique
};

'use strict';

var fs = require('fs')
  , path = require('path')
  , browserify = require('browserify')
  , uglify = require('uglify-js');

var pkg = process.argv[2]
  , standalone = process.argv[3]
  , compress = process.argv[4];

var packageDir = path.join(__dirname, '..');
if (pkg != '.') packageDir = path.join(packageDir, 'node_modules', pkg);

var json = require(path.join(packageDir, 'package.json'));

var distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

var bOpts = {};
if (standalone) bOpts.standalone = standalone;

browserify(bOpts)
.require(path.join(packageDir, json.main), {expose: json.name})
.bundle(function (err, buf) {
  if (err) {
    console.error('browserify error:', err);
    process.exit(1);
  }

  var outputFile = path.join(distDir, json.name);
  var uglifyOpts = {
    warnings: true,
    compress: {},
    output: {
      preamble: '/* ' + json.name + ' ' + json.version + ': ' + json.description + ' */'
    }
  };
  if (compress) {
    var compressOpts = compress.split(',');
    for (var i=0, il = compressOpts.length; i<il; ++i) {
      var pair = compressOpts[i].split('=');
      uglifyOpts.compress[pair[0]] = pair.length < 1 || pair[1] != 'false';
    }
  }
  if (standalone) {
    uglifyOpts.sourceMap = {
      filename: json.name + '.min.js',
      url: json.name + '.min.js.map'
    };
  }

  var result = uglify.minify(buf.toString(), uglifyOpts);
  fs.writeFileSync(outputFile + '.min.js', result.code);
  if (result.map) fs.writeFileSync(outputFile + '.min.js.map', result.map);
  if (standalone) fs.writeFileSync(outputFile + '.bundle.js', buf);
  if (result.warnings) {
    for (var j=0, jl = result.warnings.length; j<jl; ++j)
      console.warn('UglifyJS warning:', result.warnings[j]);
  }
});

//compile doT templates to js functions
'use strict';

var glob = require('glob')
  , fs = require('fs')
  , path = require('path')
  , doT = require('dot')
  , beautify = require('js-beautify').js_beautify;

var defsRootPath = process.argv[2] || path.join(__dirname, '../lib');

var defs = {};
var defFiles = glob.sync('./dot/**/*.def', { cwd: defsRootPath });
defFiles.forEach(function (f) {
  var name = path.basename(f, '.def');
  defs[name] = fs.readFileSync(path.join(defsRootPath, f));
});

var filesRootPath = process.argv[3] || path.join(__dirname, '../lib');
var files = glob.sync('./dot/**/*.jst', { cwd: filesRootPath });

var dotjsPath = path.join(filesRootPath, './dotjs');
try { fs.mkdirSync(dotjsPath); } catch(e) {}

console.log('\n\nCompiling:');

var FUNCTION_NAME = /function\s+anonymous\s*\(it[^)]*\)\s*{/;
var OUT_EMPTY_STRING = /out\s*\+=\s*'\s*';/g;
var ISTANBUL = /'(istanbul[^']+)';/g;
var ERROR_KEYWORD = /\$errorKeyword/g;
var ERROR_KEYWORD_OR = /\$errorKeyword\s+\|\|/g;
var VARS = [
  '$errs', '$valid', '$lvl', '$data', '$dataLvl',
  '$errorKeyword', '$closingBraces', '$schemaPath',
  '$validate'
];

files.forEach(function (f) {
  var keyword = path.basename(f, '.jst');
  var targetPath = path.join(dotjsPath, keyword + '.js');
  var template = fs.readFileSync(path.join(filesRootPath, f));
  var code = doT.compile(template, defs);
  code = code.toString()
             .replace(OUT_EMPTY_STRING, '')
             .replace(FUNCTION_NAME, 'function generate_' + keyword + '(it, $keyword, $ruleType) {')
             .replace(ISTANBUL, '/* $1 */');
  removeAlwaysFalsyInOr();
  VARS.forEach(removeUnusedVar);
  code = "'use strict';\nmodule.exports = " + code;
  code = beautify(code, { indent_size: 2 }) + '\n';
  fs.writeFileSync(targetPath, code);
  console.log('compiled', keyword);

  function removeUnusedVar(v) {
    v = v.replace(/\$/g, '\\$$');
    var regexp = new RegExp(v + '[^A-Za-z0-9_$]', 'g');
    var count = occurrences(regexp);
    if (count == 1) {
      regexp = new RegExp('var\\s+' + v + '\\s*=[^;]+;|var\\s+' + v + ';');
      code = code.replace(regexp, '');
    }
  }

  function removeAlwaysFalsyInOr() {
    var countUsed = occurrences(ERROR_KEYWORD);
    var countOr = occurrences(ERROR_KEYWORD_OR);
    if (countUsed == countOr + 1) code = code.replace(ERROR_KEYWORD_OR, '');
  }

  function occurrences(regexp) {
    return (code.match(regexp) || []).length;
  }
});
