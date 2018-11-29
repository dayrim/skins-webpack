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