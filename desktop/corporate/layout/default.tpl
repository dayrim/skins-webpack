<!DOCTYPE HTML>
<html lang="{if isset($language)}{$language->localization}{else}en-US{/if}" xmlns:og="http://opengraphprotocol.org/schema/" class="no-js {block name="layout-type"}{/block}">
	<head>
		{block name="meta"}
			{widget name="meta"}
			{widget name="opengraph"}
		{/block}

		<meta name="SKYPE_TOOLBAR" content="SKYPE_TOOLBAR_PARSER_COMPATIBLE">
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0">

		{block name="favicon"}
			<link href="{template_url}favicon.ico" rel="shortcut icon" type="image/x-icon">
		{/block}

		<style>
			{inline_css path="assets/desktop/styles/initial/styles.min.css" paths_to_replace=['../fonts/' => 'assets/desktop/fonts/', '../images/' => 'assets/desktop/images/']}
		</style>

		<script>
			var templateURL = '{template_url}',
				siteSettings = {
					name: {$hebs->site->title|json_encode},
					country: {$hebs->site->country_abbreviation|json_encode},
					state: {$hebs->site->state|json_encode},
					city: {$hebs->site->city|json_encode},
					adr: {$hebs->site->address|json_encode},
					zip: {$hebs->site->zip|json_encode},
					lat: {$hebs->site->lat|json_encode},
					lng: {$hebs->site->lng|json_encode},
					phone: {$hebs->site->phone|json_encode}
				},
				currentPropertyId = {$hebs->property->id|default:"null"},
				bookingEngineVars = {$hebs->booking->getBookingEngineVars()|json_encode};

			document.documentElement.classList.remove('no-js');
		</script>
	</head>
	<body>

		<header id="header">
			<a href="#content" id="skip-to-content">{translate label="Skip to Content (Press Enter)"}</a>

			<a class="logo" href="{site_url}">
				<img src="{template_url}assets/desktop/images/logo.png" alt="{$siteHotelName}">
			</a>

			<nav class="top-menu">
				{widget name="navigation" type="top"}
			</nav>
			<nav class="main-menu">
				{widget name="navigation" type="main" maxLevel="2"}
			</nav>
			<button id="mobile-navigation-trigger"><span class="smart-icon"><span></span><span></span><span></span>Menu</span></button>
		</header>

		<div id="mobile-navigation">
			<nav class="top-menu">
				{widget name="navigation" type="top"}
			</nav>
			<nav class="main-menu">
				{widget name="navigation" type="main" maxLevel="3" custom=["pluses" => "true", "expanded_states" => "true"]}
			</nav>
		</div>

		{block name="photos"}
			<div id="photos">
				{widget name="topimage"}
				<div class="booking-trigger button">Book Now</div>
			</div>
		{/block}

		{block name="booking"}
			<article id="booking">
				<div class="center-column">
					<form action="{site_url}booking" method="post" target="_blank">
						<div class="booking-close-button close"><span></span></div>
						<fieldset>
							<legend></legend>
							<div class="column dates">
								<label for="booking-dates">Dates:</label>
								<input type="text" id="booking-dates" value="">
								<div class="input-overlay"></div>
								<div id="booking-datepicker">
									<div class="arrival-departure-status">
										<div class="arrival visible" data-text="Select Arrival Date"></div>
										<div class="departure" data-text="Select Departure Date"></div>
									</div>
									<button class="ui-datepicker-prev ui-state-disabled" data-target="ui-datepicker-prev">{translate label="Previous month"}</button>
									<button class="ui-datepicker-next" data-target="ui-datepicker-next">{translate label="Next month"}</button>
								</div>
								<input type="hidden" id="booking-checkin" name="checkin" value="">
								<input type="hidden" id="booking-checkout" name="checkout" value="">
							</div>
							<div class="column adults">
								<label for="booking-adults">Adults:</label>
								<select id="booking-adults" name="adults">
									{for $adult=1 to 5}
										<option value="{$adult}" {if $adult == "1"}selected="selected"{/if}>{$adult}</option>
									{/for}
								</select>
								<div class="select-icon"></div>
							</div>
							<div class="column children">
								<label for="booking-children">Children:</label>
								<select id="booking-children" name="children">
									{for $child=0 to 4}
										<option value="{$child}" {if $child == "0"}selected="selected"{/if}>{$child}</option>
									{/for}
								</select>
								<div class="select-icon"></div>
							</div>
							<input type="submit" value="{translate label="Book Now"}" class="button" data-dtm-event="check-availability">
						</fieldset>
					</form>
				</div>
			</article>
		{/block}

		{block name="promos"}{/block}

		{block name="content-area"}
			{$this->layout()->content}
		{/block}

		<footer id="footer">
			<div class="center-column">
				<nav id="footer-menu">
					{widget name="navigation" type="footer"}
				</nav>
				<article id="footer-contacts">
					<h2>{$siteHotelName}</h2>
					<p>
						{if $hebs->site->address}{$hebs->site->address}<br>{/if}
						{if $hebs->site->city}{$hebs->site->city}<br>{/if}
						{if $hebs->site->state}{$hebs->site->state}<br>{/if}
						{if $hebs->site->zip}
							{$hebs->site->zip},
							{if $hebs->site->country_name}
								{$hebs->site->country_name}
							{/if}
							<br>
						{/if}
						{translate label="Phone:"} <a href="tel:{$hebs->site->phone|replace:' ':'-'}">{$hebs->site->phone}</a>
					</p>
				</article>
				<article id="newsletter">
					<h2>Stay Connected</h2>
					<form action="/stay-connected" method="post">
						<fieldset>
							<legend></legend>
							<label for="newsletter-email" class="screen-reader-only">{translate label="Please Enter Your Email"}</label>
							<input type="text" name="email" value="" id="newsletter-email" class="validate[required,custom[email]]" placeholder="{translate label="Please Enter Your Email"}">
							<input type="submit" class="button" value="Sign Up">
						</fieldset>
					</form>
				</article>
				{if $hebs->attributes->corporate->get('categories.social-links.attributes', [])|count}
					<ul class="socials">
						{foreach $hebs->attributes->corporate->get('categories.social-links.attributes', []) as $social_link}
							{if $social_link.value && $social_link.name}
								<li>
									<a class="{$social_link.key}" href="{$social_link.value}" target="_blank">{$social_link.name}</a>
								</li>
							{/if}
						{/foreach}
					</ul>
				{/if}
				<small class="copyright">&copy; {'Y'|date} {$siteHotelName}, Inc. All rights reserved.</small>
				<small class="credits">HOTEL WEBSITE DESIGN &amp; smartCMS<sup>&reg;</sup> BY <a href="http://www.hebsdigital.com/" target="_blank">HEBS DIGITAL</a></small>
			</div>
		</footer>


		{block name="omniture"}
			{widget name="omniture" code="$omniture" template="dtm"}
		{/block}

		{block name="assets"}
			<link rel="stylesheet" href="{asset path="assets/desktop/styles/styles.min.css" cdn=false}" async defer>
			<script src="{asset path="assets/desktop/scripts/scripts.min.js" cdn=false}"></script>
		{/block}

        {widget name="tags" action="footer"}

	</body>
</html>
