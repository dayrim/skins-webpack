{extends file="./index.tpl"}

{block name="calendar-content"}

	<ul id="calendar-week">
		<li><span class="full">Sunday</span><span class="short">Sun</span></li>
		<li><span class="full">Monday</span><span class="short">Mon</span></li>
		<li><span class="full">Tuesday</span><span class="short">Tue</span></li>
		<li><span class="full">Wednesday</span><span class="short">Wed</span></li>
		<li><span class="full">Thursday</span><span class="short">Thu</span></li>
		<li><span class="full">Friday</span><span class="short">Fri</span></li>
		<li><span class="full">Saturday</span><span class="short">Sat</span></li>
	</ul>

	<ul id="calendar-days">
		{foreach $events_by_week as $week_data}
			{$week_classes = []}
			{foreach $week_data->events as $time => $daily_events}
				<li class="{$week_data->cell_class[$time]}">
					<time datetime="{$time|date_format:"%Y-%m-%d"}" class="date">
						<a href="{url data=['c' =>'calendar','a'=>'index','category'=>$category_slug,'year'=>{$time|date_format:"%Y"|trim},'month'=>{$time|date_format:"%m"|trim},'day'=>{$time|date_format:"%e"|trim},'calendarShow'=>'daily']}">
							{date('d', $time)}
						</a>
					</time>

					{foreach $week_data->event_spans as $pos => $es}
						{$event_data = $es[$time]}

						{$dlClass = ''}

						{if $event_data->skip}
							{*continue*}
							{if isset($week_classes[$event_data->event_id])}
								{$dlClass = preg_replace('/(\s*w\d+\s*)/', ' ', $week_classes[$event_data->event_id])}
							{/if}
						{else}
							{$dlClass = $week_data->event_class[$time][$event_data->event_id]}
							{$week_classes[$event_data->event_id] = $dlClass}
						{/if}

						{if !isset($event_data->event_id)}{continue}{/if}

						{$event = $events_by_id[$event_data->event_id]}

						<dl class="{if isset($week_data->event_class[$time][$event_data->event_id])}{$week_data->event_class[$time][$event_data->event_id]}{/if} {$dlClass} {if $event_data->skip}hide{/if}" data-eventid="{$event_data->event_id}">
							<dt><a href="{url data=['c' =>'calendar','a'=>'event','category'=>$event->category_slug,'event' => $event->slug]}">{$event->title}</a></dt>
							<dd>
								<h3>{$event->title}</h3>
								<abbr class="dtstart hide" title="{$event->start_date|date_format:'%Y-%m-%d'}">{$event->start_date|date_format:"%B %e, %Y"}</abbr>
								{if empty($event->recurring)}
									<abbr class="dtend hide" title="{$event->end_date|date_format:'%Y-%m-%d'}">{$event->end_date|date_format:"%B %e, %Y"}</abbr>
								{else}
									<abbr class="rrule hide" title="freq=weekly;byday={$event->recurring_str}{if $event->end_date};until={$event->end_date|date_format:'%Y-%m-%d'}{/if}">...</abbr>
								{/if}
								<abbr class="location hide">{$site_settings->state} {$site_settings->city}</abbr>
								{if $event->image_link}
									<a href="{url data=['c' =>'calendar','a'=>'event','category'=>$event->category_slug,'event' => $event->slug]}">
										<img src="{$event->image_link}" alt="{$event->image_alt}" />
									</a>
								{/if}
								<p class="read-more">{$event->introtext}</p>
								<a href="{url data=['c' =>'calendar','a'=>'event','category'=>$event->category_slug,'event' => $event->slug]}">Read more</a>
								<div class="triangle"><span></span></div>
							</dd>
						</dl>
					{/foreach}
				</li>
			{/foreach}
		{/foreach}
	</ul>

{/block}