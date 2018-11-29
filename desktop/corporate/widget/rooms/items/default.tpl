<article class="rooms-entry"{if $room->categories} data-category="{foreach $room->categories as $category_id}{$category_id}{if !$category_id@last},{/if}{/foreach}"{else} data-category="0"{/if}>
	{if $room->image_link}
		<div class="thumbnail"><img src="{$room->image_link}" alt="{$room->name|escape}"></div>
	{/if}

	<div class="full-description">

		<h3>{$room->name|escape}</h3>
		<p>{$room->descr_short}</p>

		<nav>
			{if $room->file->path}<a href="{$room->file->path}">{translate label="Floorplan"}</a>{/if}
			{if $room->gallery}<a href="#" class="rooms-item-gallery" data-gallery-id="{$room->id}">{translate label="View Gallery"}</a>{/if}
			{if $room->link}<a href="{$room->link}" >{$room->link_title}</a>{/if}
		</nav>

	</div>

	<div class="description">

		{if $room->price->enabled && $room->price->price || $room->extlink}
			<div class="booking-info">

				{if $room->price->enabled && $room->price->price}
					{widget name="rooms" action="include" template="price" data=$room}
				{/if}

				{if $room->extlink}<a href="{$room->extlink}" class="button">{translate label="Book Now"}</a>{/if}
			</div>
		{/if}

		{widget name="rooms" action="include" template="features" data=$room}

	</div>

</article>