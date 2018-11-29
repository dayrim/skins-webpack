{if count($data)}

	<script type="text/javascript">
		var roomsJSON = roomsJSON || {};
		{foreach $data as $room}
			{if $room->gallery|count}
			roomsJSON[{$room->id}] = {};
			roomsJSON[{$room->id}]['images'] = [];
			{foreach $room->gallery as $image}
			roomsJSON[{$room->id}]['images'][{$image@index}] = {};
			roomsJSON[{$room->id}]['images'][{$image@index}]['full'] = "{$image->src_full}";
			roomsJSON[{$room->id}]['images'][{$image@index}]['caption'] = "{$image->caption}";
			roomsJSON[{$room->id}]['images'][{$image@index}]['thumb'] = "{$image->src_thumb}";
			roomsJSON[{$room->id}]['images'][{$image@index}]['retina'] = "{$image->src_retina}";
			{/foreach}
			{/if}
		{/foreach}
	</script>


	<div class="extract-element-from-content">
		<div class="rooms center-column">
			{foreach $data as $room}
				{if $room->layout}
					{widget name="rooms" action="item" data=$room}
				{else}
					<article class="rooms-entry{if $room->image_link} img{/if}"{if $room->categories} data-category="{foreach $room->categories as $category_id}{$category_id}{if !$category_id@last},{/if}{/foreach}"{else} data-category="0"{/if}>
						<div class="background" style="background-image:url({if $room->image_link}{$room->image_link}{elseif $hebs->attributes->corporate->get('attributes.rooms_default_image.value')}{image id=$hebs->attributes->corporate->get('attributes.rooms_default_image.value') size="1280x500"}{/if});">
							{if $room->extlink}<a href="{$room->extlink}" class="book-now">Book Now</a>{/if}

							{if $room->price}
								{widget name="rooms" action="include" template="price" data=$room}
							{/if}
						</div>

						<div class="description">
							<h3>{$room->name|escape}</h3>
							<p>{$room->descr_short|truncate:270}</p>
							{if $room->descr}
								<div class="full-description">
									<span class="close">Close</span>
									<div class="inner-wrapper">
										{$room->descr}
									</div>
								</div>
								<a href="#" class="expand-collapse expand" data-expand="Expand" data-collapse="Collapse"><span data-expand="&gt;" data-collapse="&lt;"></span></a>
							{/if}

							<nav>
								{$roomURL = {url data=['c'=>'rooms', 'foreign' => true, 'p'=> $hebs->property->id, 'a'=>'index', 'roomsPath' => [$room->slug]]}}
								{if $roomURL != "/{$room->slug}"}
									<a href="{$roomURL}" data-dtm-event="read-more" data-dtm-room-name="{$room->name|escape}">{translate label="Read More"}</a>
								{/if}
								{if $room->link}<a href="{$room->link}" data-dtm-event="read-more" data-dtm-room-name="{$room->name|escape}" class="button">{if $room->link_title}{$room->link_title}{else}Read More{/if}</a>{/if}
								{if $room->file->path}<a href="{$room->file->path}" class="button">Floorplan</a>{/if}
								{if $room->extlink}<a href="{$room->extlink}" data-dtm-event="check-availability" data-dtm-room-name="{$room->name|escape}" class="button book-now">Book Now</a>{/if}
								{if $room->gallery}
									<a href="#" class="rooms-item-gallery" data-gallery-id="{$room->id}">{translate label="Gallery"}</a>
								{/if}
							</nav>
						</div>
					</article>
				{/if}
			{/foreach}
		</div>
	</div>
{/if}
