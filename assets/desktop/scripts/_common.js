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