{block name="pressroom"}
	<div class="pressroom">
		{foreach $data as $press_release}
			{$image_link = $press_release->getImageLink()}

			<article class="pressroom-item {if $image_link}img{/if}" data-category="{$press_release->category_id}" {if $image_link}style="background-image:url('{image id=$press_release->image_id size="768x300"}');"{/if}>
				<div class="description">
					<h4>{$press_release->title}</h4>
					<time class="time">{$press_release->date|date_format:"%m"}.{$press_release->date|date_format:"%d"}.{$press_release->date|date_format:"%Y"}</time>
					{if $press_release->descr && preg_match("/<p>(.+?)<\/p>/si", $press_release->descr, $descr) && $press_release->descr|strip_tags|regex_replace:"/&#?[a-z0-9]+;/i":" "|strlen > 400}
						<p>{$descr[1]|truncate:400:"...":true}</p>
					{else}
						{$press_release->descr}
					{/if}
					{if $press_release->getFilePath() || $press_release->getImageGallery()}
						<nav>
							{if $press_release->getFilePath()}
								<a class="pdf" href="{$press_release->getFilePath()}">{translate label="Download PDF"} ({$press_release->getFileSize()|nicesize})</a>
							{/if}
							{if $press_release->getImageGallery()}
								<a href="#" class="button view-gallery" data-gallery-id="{$press_release->id}">{translate label="View Gallery"}</a>
							{/if}
						</nav>
					{/if}
				</div>
			</article>
		{/foreach}
	</div>
{/block}

{block name="pressroom-json"}
	{$pressroom_gallery = []}
	{if count($data)}
		{foreach $data as $press_release}
			{if $press_release->getImageGallery()}
				{foreach $press_release->getImageGallery() as $image}
					{$pressroom_gallery[$press_release->id]['images'][$image@index]['thumb'] = $image->src_thumb}
					{if strpos($image->url, 'youtube.com') > 0 || strpos($image->url, 'youtu.be') > 0 || strpos($image->url, 'vimeo.com') > 0}
						{$link = str_replace('youtu.be/', 'youtube.com/watch?v=', $image->url)}
						{$pressroom_gallery[$press_release->id]['images'][$image@index]['video'] = $link}
						{$pressroom_gallery[$press_release->id]['images'][$image@index]['image'] = $image->src_full}
					{else}
						{$pressroom_gallery[$press_release->id]['images'][$image@index]['image'] = $image->src_full}
						{$pressroom_gallery[$press_release->id]['images'][$image@index]['link'] = $image->url}
					{/if}
					{$pressroom_gallery[$press_release->id]['images'][$image@index]['description'] = $image->caption}
				{/foreach}
			{/if}
		{/foreach}
	{/if}

	<script type="text/javascript">
		var pressroomJSON = pressroomJSON || {},
			tempPressroomJSON = {$pressroom_gallery|@json_encode};

		for (i in tempPressroomJSON) {
			pressroomJSON[i] = tempPressroomJSON[i];
		}
	</script>
{/block}
