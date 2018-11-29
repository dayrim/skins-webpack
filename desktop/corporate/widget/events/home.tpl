{if $data}
	<section id="events" class="fade-on-scroll">
		<div class="center-column">
			<h2><a href="{url data=['c' =>'calendar','a'=>'index', 'foreign'=>true]}">{translate label="Upcoming Events"}</a></h2>
		</div>

		<div class="slideshow">
			<div class="slideshow-wrapper">
				{foreach $data as $row}
					<article class="event">
						<div class="thumbnail {if !$row->image_uri}no-thumbnail{/if}" {if $row->image_uri}{if $row@index < 3}style="background-image:url({$row->image_uri});"{/if} data-background="{$row->image_uri}"{/if}></div>
						<time datetime="{$row->date|date_format:"%Y-%m-%d"}" class="date">
							<a href="{url data=['c' =>'calendar','a'=>'index', 'foreign'=>true]}/daily/{$row->date|date_format:"%Y"|trim}/{$row->date|date_format:"%m"|trim}/{$row->date|date_format:"%e"|trim}" tabindex="-1">
								{$row->date|date_format:"%d"} {$row->date|date_format:"%b"} {$row->date|date_format:"%y"}
							</a>
						</time>
						<div class="copy">
							<h3 id="event-title-{$row->id}">{$row->title}</h3>
							<p>{$row->introtext}</p>
						</div>
						<a href="{$row->event_link}" id="event-button-{$row->id}" aria-label="{$row->title}" class="button light-blue">{translate label="Read More"}</a>
					</article>
				{/foreach}
			</div>
		</div>

		{if count($data) > 1}
			<div class="slideshow-pagination"></div>
		{/if}
	</section>
{/if}