{if isset($data) && count($data)}

	{* Optimized GalleryJSON *}
	{strip}
		{$galleryJSON_IDs = []}
		{foreach $data as $gallery}
			{$galleryJSON_IDs[] = $gallery->id}
		{/foreach}
		{$galleryJSON_IDs = '_'|implode:$galleryJSON_IDs}

		{$galleryJSON = []}

		{foreach $data as $gallery}
			{$galleryJSON[$gallery@index]['id'] = $gallery->id}
			{$galleryJSON[$gallery@index]['name'] = $gallery->name}

			{foreach $gallery->images as $image}
				{$galleryJSON[$gallery@index]['images'][$image@index]['thumb'] = $image->thumb}
				{if strpos($image->link, 'youtube.com') > 0 || strpos($image->link, 'youtu.be') > 0 || strpos($image->link, 'vimeo.com') > 0}
					{$link = str_replace('youtu.be/', 'youtube.com/watch?v=', $image->link)}
					{$galleryJSON[$gallery@index]['images'][$image@index]['video'] = $link}
					{$galleryJSON[$gallery@index]['images'][$image@index]['image'] = $image->full}
				{else}
					{$galleryJSON[$gallery@index]['images'][$image@index]['image'] = $image->full}
					{$galleryJSON[$gallery@index]['images'][$image@index]['link'] = $image->link}
				{/if}
				{$galleryJSON[$gallery@index]['images'][$image@index]['description'] = $image->caption}
			{/foreach}
		{/foreach}
	{/strip}

	{block name="galleries"}
		{if isset($data) && count($data)}

			<div class="galleries">
				{foreach $data as $gallery}
					{if $gallery->images|count > 0}
						{$image_info = $hebs->images->getImageById($gallery->images.0->image_id)}

						<article class="gallery" style="background-image:url('{$gallery->images.0->thumb}');">

							<h2>{$gallery->name}</h2>
							<h3>{$gallery->images|count} {str_plural('photo', $gallery->images|count)}</h3>

							<div class="description">
								<div class="centered">
									{if $gallery->description && preg_match("/<p>(.+?)<\/p>/si", $gallery->description, $descr) && $gallery->description|strip_tags|regex_replace:"/&#?[a-z0-9]+;/i":" "|strlen > 300}
										<p>{$descr[1]|truncate:300:"...":true}</p>
									{else}
										{$gallery->description}
									{/if}
									<nav>
										<button data-gallery-id="{$gallery->id}" data-gallery-json-key="{$galleryJSON_IDs}" class="transparent-white button view-gallery">{translate label="View Gallery"}</button>
									</nav>
								</div>
							</div>
						</article>

					{/if}
				{/foreach}
			</div>

		{/if}
	{/block}

	<script type="text/javascript">
		var galleryJSON = galleryJSON || {};
			galleryJSON['{$galleryJSON_IDs}'] = {$galleryJSON|json_encode};
	</script>
{/if}