{extends file="../content/index.tpl"}

{block name="content-submenu"}{/block}

{block name="page-content"}
	<div class="page-content">

		{block name="page-desription"}

			{if $roomsSettings->homepage_header}<h1>{$roomsSettings->homepage_header}</h1>{/if}
			{if $roomsSettings->homepage_subheader}<h2>{$roomsSettings->homepage_subheader}</h2>{/if}
			{$roomsSettings->homepage_content}
			{if $roomsSettings->homepage_header || $roomsSettings->homepage_subheader || $roomsSettings->homepage_content}<hr>{/if}

		{/block}

		<div class="rooms">

			{block name="categories"}

				{$rooms_categories = 0}
				{foreach $categories as $category}
					{if count($category->rooms) > 0}
						{$rooms_categories = $rooms_categories + 1}
					{/if}
				{/foreach}

				{if $rooms_categories > 1}
					<div class="category-selector">
						<button data-category="0" class="button active">{translate label="All"}</button>
						{foreach $categories as $category}
							{if count($category->rooms)}
								<button data-category="{$category->id}" class="button">{$category->title}</button>
							{/if}
						{/foreach}
					</div>
				{/if}

				<div class="categories-descr">
					{foreach $categories as $category}
						{if $category->descr}
							<div class="category-descr" data-category="{$category->id}">
								{if !empty($category->h1)}
									<h1>{$category->h1}</h1>
								{/if}
								{if !empty($category->h2)}
									<h2>{$category->h2}</h2>
								{/if}
								{$category->descr}
							</div>
						{/if}
					{/foreach}
				</div>

			{/block}

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
											{if $room->price->link}
												<a href="{$room->price->link}" class="price">{$room->price}</a>
											{else}
												<span class="price">{$room->price}</span>
											{/if}
										{/if}

										{if $room->extlink}<a href="{$room->extlink}" data-dtm-event="check-availability" data-dtm-room-name="{$room->name|escape}" class="button">{translate label="Book Now"}</a>{/if}
									</nav>
								</div>
							{/if}

							<div class="description">

								<h3>{$room->name|escape}</h3>

								{function renderfeature}
									{if $feat->element == 'text'}
										<span class="{$feat->slug|escape}">{{translate label=$feat->name}|escape}: {$feat->value|escape}</span>
									{else}
										<span class="rooms-icon rooms-icon-{$feat->slug|escape}" title="{{translate label=$feat->name}|escape}"></span>
									{/if}
								{/function}

								{if count($room->features->features)}
									<div class="features">
										{foreach $room->features->features as $feature}
											{renderfeature feat=$feature}
										{/foreach}
									</div>
								{/if}

								{if count($room->features->amenities)}
									<div class="amenities">

										<div class="additional-list">
											{foreach $room->features->amenities as $amenity}
												{renderfeature feat=$amenity}
											{/foreach}
										</div>

										<div class="main-list">
											{foreach $room->features->amenities as $amenity}
												{renderfeature feat=$amenity}
											{/foreach}
										</div>

										<div class="toggle"></div>

									</div>
								{/if}

								<p>{$room->descr_short}</p>

								{if $room->price->enabled && $room->price->price || $room->extlink}
									<nav class="booking-info">

										{if $room->price->enabled && $room->price->price}
											{if $room->price->link}
												<a href="{$room->price->link}" class="price">{$room->price}</a>
											{else}
												<span class="price">{$room->price}</span>
											{/if}
										{/if}

										{if $room->extlink}<a href="{$room->extlink}" data-dtm-event="check-availability" data-dtm-room-name="{$room->name|escape}" class="button">{translate label="Book Now"}</a>{/if}
									</nav>
								{/if}

								<nav class="links">
									<a href="{url data=['c'=>'rooms', 'a'=>'index', 'roomsPath' => [$room->slug]]}" data-dtm-event="read-more" data-dtm-room-name="{$room->name|escape}">{translate label="Read More"}</a>
									{if isset($room->file) && $room->file->path}<a href="{$room->file->path}">{translate label="Floorplan"}</a>{/if}
									{if $room->gallery}<a href="#" class="rooms-item-gallery" data-gallery-id="{$room->id}">{translate label="View Gallery"}</a>{/if}
									{if $room->link && $room->link_title}<a href="{$room->link}">{$room->link_title}</a>{/if}
								</nav>

							</div>

						</article>
					{/if}
				{/foreach}

			{/if}

		</div>

		<script type="text/javascript">
			var roomsJSON = roomsJSON || {};
			{foreach $rooms as $room}
				{if $room->gallery|count}
					roomsJSON[{$room->id}] = {};
					roomsJSON[{$room->id}]['images'] = [];
					{foreach $room->gallery as $image}
						roomsJSON[{$room->id}]['images'][{$image@index}] = {};
						roomsJSON[{$room->id}]['images'][{$image@index}]['image'] = "{$image->src_full}";
						roomsJSON[{$room->id}]['images'][{$image@index}]['description'] = "{$image->caption}";
						roomsJSON[{$room->id}]['images'][{$image@index}]['thumb'] = "{$image->src_thumb}";
						roomsJSON[{$room->id}]['images'][{$image@index}]['retina'] = "{$image->src_retina}";
					{/foreach}
				{/if}
			{/foreach}
		</script>

	</div>
{/block}