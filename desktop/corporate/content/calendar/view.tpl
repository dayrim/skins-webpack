{extends file="./index.tpl"}

{block name="calendar-content"}

	<div class="page-content single-event">

		<h2>{$row->title}</h2>
		{if isset($row->h2)}
			<h3>{$row->h2}</h3>
		{/if}

		<div class="socials">
			{widget name="socialButton" action="facebook"}
			{widget name="socialButton" action="tweet"}
			{widget name="socialButton" action="gplus"}
		</div>

		<div class="wrapper">

			{if $row->image_link}
				<div class="background" style="background-image:url('{image id=$row->image_id size="768x300"}');"></div>
			{/if}

			<p class="dates">
				{if $row->start_date == $row->end_date}
					<small>{$row->start_date|date_format:"%A, %B %e, %Y"|trim}</small>
					<abbr class="dtstart hide" title="{$row->start_date|date_format:'%Y-%m-%d'}">{$row->start_date|date_format:"%B %e, %Y"}</abbr>
					<abbr class="location hide">{$siteHotelName}</abbr>
				{elseif !$row->end_date}
					<small><strong>From</strong> {$row->start_date|date_format:"%A, %B %e, %Y"}</small>
					<abbr class="dtstart hide" title="{$row->start_date|date_format:'%Y-%m-%d'}">{$row->start_date|date_format:"%B %e, %Y"}</abbr>
					<abbr class="location hide">{$siteHotelName}</abbr>
				{else}
					<small><strong>From</strong> {$row->start_date|date_format:"%A, %B %e, %Y"} <strong>to</strong> {$row->end_date|date_format:"%A, %B %e, %Y"}</small>
					<abbr class="dtstart hide" title="{$row->start_date|date_format:'%Y-%m-%d'}">{$row->start_date|date_format:"%B %e, %Y"}</abbr>
					<abbr class="dtend hide" title="{$row->end_date|date_format:'%Y-%m-%d'}">{$row->end_date|date_format:"%B %e, %Y"}</abbr>
					<abbr class="location hide">{$siteHotelName}</abbr>
				{/if}

				{if isset($row->recurring)}
				   <small>
					   <strong>Every</strong>
					   {foreach $dateRecurring as $value}
						   {$value}{if !$value@last}, {/if}
					   {/foreach}
				   </small>
					{if isset($recurring_str)}
						<abbr class="rrule hide" title="freq=weekly;byday={$row->recurring_str}{if $row->end_date};until={$row->end_date|date_format:'%Y-%m-%d'}{/if}">...</abbr>
					{/if}
				{/if}
			</p>

			{$row->descr}

			{if $row->attach}
				<p class="attachment">
					<strong>Attachment:</strong>
					<a href="{$row->attach}" target="_blank">{if $row->attachtitle}{$row->attachtitle}{else}Download Now!{/if}</a>
				</p>
			{/if}

			{if $row->extlink}
				<p><a class="button" href="{$row->extlink}" target="_blank">{if $row->linktitle}{$row->linktitle}{else}Book Now{/if}</a></p>
			{/if}

		</div>

	</div>

{/block}
