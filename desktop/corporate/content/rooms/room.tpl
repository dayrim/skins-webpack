{extends file="./index.tpl"}

{block name="page-content"}
	<div class="page-content">

		<h1>{$room->h1}</h1>
		{if $room->h2}<h2>{$room->h2}</h2>{/if}

		<div class="room {if $room->image_link}img{/if}">

			<div class="thumbnail">
				<img src="{image id=$room->image_id cropping=$room->cropping size="730x411"}" alt="{$room->name|escape}">
			</div>

			{$room->descr}

			{function render_feature_li}
				{if $feat->element == 'text'}
					<li class="{$feat->slug|escape}">{{translate label=$feat->name}|escape}: {$feat->value|escape}</li>
				{else}
					<li class="{$feat->slug|escape}">{{translate label=$feat->name}|escape}</li>
				{/if}
			{/function}

			{if count($room->features->features)}
				<h4>{translate label="Features"}:</h4>
				<ul class="features">
					{foreach $room->features->features as $feature}
						{render_feature_li feat=$feature}
					{/foreach}
				</ul>
			{/if}

			{if count($room->features->amenities)}
				<h4>{translate label="Amenities"}:</h4>
				<ul class="amenities">
					{foreach $room->features->amenities as $amenity}
						{render_feature_li feat=$amenity}
					{/foreach}
				</ul>
			{/if}

			{*{if $room->price->price && $room->price->enabled}*}
			{*{if $room->price->link}*}
			{*<a href="{$room->price->link}" class="price">*}
			{*{else}*}
			{*<div class="price">*}
			{*{/if}*}
			{*<span class="prefix">{$room->price->prefix}</span>*}

			{*<span class="number">*}
			{*<span class="prefix">*}
			{*{if $room->price->currency_append == 0}{$room->price->currency}*}
			{*{else}{$room->price->price}{/if}*}
			{*</span>*}
			{*{if $room->price->currency_append == 1} {$room->price->currency}{else}{$room->price->price}{/if}*}
			{*</span>*}

			{*<span class="suffix">{$room->price->suffix}</span>*}
			{*{if $room->price->link}*}
			{*</a>*}
			{*{else}*}
			{*</div>*}
			{*{/if}*}
			{*{/if}*}

			<nav class="controls">
				{if $room->extlink}
					<a href="{$room->extlink}" data-dtm-event="check-availability" data-dtm-room-name="{$room->name|escape}" class="button" rel="external nofollow">{translate label="Book Room Online"}</a>
				{/if}
				{if isset($room->file->path) || $room->gallery}
					{if isset($room->file->path)}
						<a class="viewfloorplan button" href="{$room->file->path}" title="{$room->name|escape} - {translate label="Floor Plan"} ({$room->file->size|nicesize})">{translate label="Floor Plan"}</a>
					{/if}
				{/if}

			</nav>
		</div>

	</div>
{/block}
