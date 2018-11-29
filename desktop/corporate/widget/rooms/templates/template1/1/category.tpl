{if $categories}

	{$rooms_categories = 0}
	{foreach $categories as $category}
		{if count($category->rooms) > 0}
			{$rooms_categories = $rooms_categories + 1}
		{/if}
	{/foreach}

	<script type="text/javascript">
		var roomsJSON = roomsJSON || {};
		{foreach $rooms as $room}
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

		<div class="rooms page-content center-column">

			{if $rooms_categories > 1}
				<div class="categories-list">
					<button data-category="0" class="active">{translate label="All"}</button>
					{foreach $categories as $category}
						{if count($category->rooms)}
							<button data-category="{$category->id}">{$category->title}</button>
						{/if}
					{/foreach}
				</div>
			{/if}

			<div class="categories-descr">
				{foreach $categories as $category}
					{if $category->descr}
						<div class="category-descr" data-category="{$category->id}">
							{if $category->title}
								<h1>{$category->h1}</h1>
							{/if}
							{if $category->h2}
								<h2>{$category->h2}</h2>
							{/if}
							{$category->descr}
						</div>
					{/if}
				{/foreach}
			</div>

			{if count($rooms)}

				{foreach $rooms as $room}

					{if $room->layout}
						{widget name="rooms" action="item" data=$room}
					{else}
						<article class="rooms-entry{if !$room->price->enabled && $room->price->price && !$room->extlink} no-booking{/if}"{if $room->categories} data-category="{foreach $room->categories as $category_id}{$category_id}{if !$category_id@last},{/if}{/foreach}"{else} data-category="0"{/if}>
							{if $room->image_link}
								<div class="thumbnail">
									<img src="{$room->image_link}" alt="{$room->name|escape}">

									<nav>

										{if $room->price->enabled && $room->price->price}
											{widget name="rooms" action="include" template="price" data=$room}
										{/if}

										{if $room->extlink}<a href="{$room->extlink}" data-dtm-event="check-availability" data-dtm-room-name="{$room->name|escape}" class="button">{translate label="Book Now"}</a>{/if}
									</nav>
								</div>
							{/if}

							<div class="description">

								<h3>{$room->name|escape}</h3>

								{widget name="rooms" action="include" template="features" data=$room}

								<p>{$room->descr_short}</p>

								{if $room->price->enabled && $room->price->price || $room->extlink}
									<nav class="booking-info">

										{if $room->price->enabled && $room->price->price}
											{widget name="rooms" action="include" template="price" data=$room}
										{/if}

										{if $room->extlink}<a href="{$room->extlink}" data-dtm-event="check-availability" data-dtm-room-name="{$room->name|escape}" class="button">{translate label="Book Now"}</a>{/if}
									</nav>
								{/if}

								<nav class="links">
									{$roomURL = {url data=['c'=>'rooms', 'foreign' => true, 'p'=> $hebs->property->id, 'a'=>'index', 'roomsPath' => [$category->slug, $room->slug]]}}
									{if $roomURL != "/{$room->slug}"}
										<a href="{$roomURL}" data-dtm-event="read-more" data-dtm-room-name="{$room->name|escape}">{translate label="Read More"}</a>
									{/if}
									{if $room->file->path}<a href="{$room->file->path}">{translate label="Floorplan"}</a>{/if}
									{if $room->gallery}<a href="#" class="rooms-item-gallery" data-gallery-id="{$room->id}">{translate label="View Gallery"}</a>{/if}
									{if $room->link}<a href="{$room->link}" >{$room->link_title}</a>{/if}
								</nav>

							</div>

						</article>
					{/if}
				{/foreach}

			{/if}

		</div>

	</div>


{/if}