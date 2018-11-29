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