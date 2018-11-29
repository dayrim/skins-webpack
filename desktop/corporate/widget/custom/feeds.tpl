{$feeds_list = []}

{foreach $hebs->attributes->corporate->get('categories.feed-credentials.attributes', []) as $feed}
	{if !empty($feed.name) && !empty($feed.value)}
		{$feeds_list[$feed@index]['type'] = $feed.key|replace:'feed_':''}
		{$feeds_list[$feed@index]['name'] = $feed.name}
		{$feeds_list[$feed@index]['value'] = $feed.value}
	{/if}
{/foreach}

{if count($feeds_list)}
	<section id="feeds" class="loading all-feeds fade-on-scroll">
		<div class="center-column">
			<h2>{$hebs->attributes->corporate->get('attributes.homepage_feeds_header.value')}</h2>
		</div>

		<div class="loading"></div>

		<nav class="category-selector"></nav>

		<div class="feed-content">
			<div class="feed-items"></div>
			<div class="feed-controls"></div>
		</div>
	</section>

	<script>
		var feedCredentials = {$feeds_list|json_encode},
			blogTags = {json_encode($hebs->attributes->corporate->get('attributes.blogtags.value'))};
	</script>
{/if}
