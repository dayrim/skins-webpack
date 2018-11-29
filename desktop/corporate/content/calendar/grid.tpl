<ul class="week-days">
	<li><span class="full">Sunday</span><span class="short">Sun</span></li>
	<li><span class="full">Monday</span><span class="short">Mon</span></li>
	<li><span class="full">Tuesday</span><span class="short">Tue</span></li>
	<li><span class="full">Wednesday</span><span class="short">Wed</span></li>
	<li><span class="full">Thursday</span><span class="short">Thu</span></li>
	<li><span class="full">Friday</span><span class="short">Fri</span></li>
	<li><span class="full">Saturday</span><span class="short">Sat</span></li>
</ul>
<ul class="week">
	{if 7 != {$currentTime|date_format:"%u"}}
		{assign var="startX" value="true"}
		{for $foo=1 to $currentTime|date_format:"%u"}
			<li>{$firstWeekDay|date_format:"%d"+$foo-1}</li>
		{/for}
	{/if}
	{foreach $events as $time => $daily_events}
		{if 7 == {$time|date_format:"%u"} && $startX}
			</ul>
			<ul class="week">
		{else}
			{assign var="startX" value="false"}
		{/if}
		<li>
			<dl>
				<dt>
					<a href="{url data=['c' =>'calendar','a'=>'index','category'=>$category_slug,'year'=>$year,'month'=>$month,'day'=>{$time|date_format:"%e"|trim},'calendarShow'=>'daily']}">{$time|date_format:"%e"|trim}</a>
				</dt>
				{foreach $daily_events as $event}
					<dd class="vevent">
						{if $event->image_link}
							<a href="{url data=['c' =>'calendar','a'=>'event','category'=>$event->category_slug,'event' => $event->slug]}">
								<img src="{$event->image_link}" alt="{$event->title}" />
							</a>
						{/if}
						<h3><a href="{url data=['c' =>'calendar','a'=>'event','category'=>$event->category_slug,'event' => $event->slug]}" class="url">{$event->title}</a></h3>
						<abbr class="dtstart hide" title="{$event->start_date|date_format:'%Y-%m-%d'}">{$event->start_date|date_format:"%B %e, %Y"}</abbr>
						{if !$event->recurring}
							<abbr class="dtend hide" title="{$event->end_date|date_format:'%Y-%m-%d'}">{$event->end_date|date_format:"%B %e, %Y"}</abbr>
							{else}
							<abbr class="rrule hide" title="freq=weekly;byday={$event->recurring_str}{if $event->end_date};until={$event->end_date|date_format:'%Y-%m-%d'}{/if}">...</abbr>
						{/if}
						<abbr class="location hide">{$site_settings->state} {$site_settings->city}</abbr>
						<p class="summary">{$event->introtext}</p>
					</dd>
				{/foreach}
			</dl>
		</li>
	{/foreach}

	{if 7 == $endDate|date_format:"%u"}
		{assign var="endX" value="0"}
		{else}
		{assign var="endX" value={$endDate|date_format:"%u"}}
	{/if}
	{for $foo=1 to 6 - $endX}
		<li>{$foo}</li>
	{/for}
</ul>