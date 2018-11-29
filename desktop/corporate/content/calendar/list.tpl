{extends file="./index.tpl"}

{block name="calendar-content"}

	{if $events_total}
		{foreach $events as $time => $daily_events}
			{if $daily_events}
				<section class="image-list calendar page-content">

					<h2>
						<a href="{url data=['c' =>'calendar','a'=>'index','category'=>$category_slug,'year'=>$year,'month'=>$month,'day'=>{$time|date_format:"%e"|trim},'calendarShow'=>'daily']}">
							{$time|date_format:"%A, %B %e, %Y"|trim}
						</a>
					</h2>
					{foreach $daily_events as $event}

						<article class="image-list-item vevent {if $event@index%2 == 0}odd{/if}">

							{if $event->image_link}<div class="background" style="background-image:url({image id=$event->image_id size="350x300"});"></div>{/if}

							<div class="description">
								<h3><a href="{url data=['c' =>'calendar','a'=>'event','category'=>$event->category_slug,'event' => $event->slug]}">{$event->title}</a></h3>
								<abbr class="dtstart hide" title="{$event->start_date|date_format:'%Y-%m-%d'}">{$event->start_date|date_format:"%B %e, %Y"}</abbr>
								{if empty($event->recurring)}
									<abbr class="dtend hide" title="{$event->end_date|date_format:'%Y-%m-%d'}">{$event->end_date|date_format:"%B %e, %Y"}</abbr>
								{else}
									<abbr class="rrule hide" title="freq=weekly;byday={$event->recurring_str}{if $event->end_date};until={$event->end_date|date_format:'%Y-%m-%d'}{/if}">...</abbr>
								{/if}
								<abbr class="location hide">{$siteHotelName}</abbr>
								<p class="summary">{$event->introtext}</p>
								<a class="button" href="{url data=['c' =>'calendar','a'=>'event','category'=>$event->category_slug,'event' => $event->slug]}">Read More</a>
							</div>
						</article>

					{/foreach}
				</section>
			{/if}
		{/foreach}
	{else}
		<p class="no-events image-list-item">No events</p>
	{/if}

{/block}
