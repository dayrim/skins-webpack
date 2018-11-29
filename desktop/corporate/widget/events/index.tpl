{if $data}
	<section id="events">
		<h2>{translate label="Upcoming Events"}</h2>
		{foreach $data as $row}
			<article class="event">
				<h3 id="event-title-{$row->id}">{$row->title}</h3>
				<time datetime="{$row->date|date_format:"%Y-%m-%d"}" class="date">
					<a href="{url data=['c' =>'calendar','a'=>'index', 'foreign'=>true]}/daily/{$row->date|date_format:"%Y"|trim}/{$row->date|date_format:"%m"|trim}/{$row->date|date_format:"%e"|trim}">
						{$row->date|date_format:"%d"} <span>{$row->date|date_format:"%b"}</span>
					</a>
				</time>
				<p>{$row->introtext} <a href="{$row->event_link}" id="event-button-{$row->id}" aria-labelledby="event-button-{$row->id} event-title-{$row->id}">{translate label="Read more."}</a></p>
			</article>
		{/foreach}
		<a href="{url data=['c' =>'calendar','a'=>'index', 'foreign'=>true, 'p' => $hebs->property->id]}" class="button"><span>{translate label="More Events"}</span></a>
	</section>
{/if}