{if count($categories)}

	{strip}
		{* strip tag is important: fixes strange memory leak in production environment *}

		{$poiJSON_IDs = []}
		{foreach $categories as $category}
			{$poiJSON_IDs[$category@index] = $category['id']}
		{/foreach}

		{$poiJSON_ID = '_'|implode:$poiJSON_IDs}

		{$poiJSON = []}

		{if isset($data->hotels) && count($data->hotels)}
			{foreach $data->hotels as $hotel}
				{$poiJSON['hotels'][$hotel@index]['name']      = $hotel['title']}
				{$poiJSON['hotels'][$hotel@index]['address']   = $hotel['street_address']}
				{$poiJSON['hotels'][$hotel@index]['city']      = $hotel['city']}
				{$poiJSON['hotels'][$hotel@index]['state']     = $hotel['state']}
				{$poiJSON['hotels'][$hotel@index]['zip']       = $hotel['zip']}
				{$poiJSON['hotels'][$hotel@index]['phone']     = $hotel['phone']}
				{$poiJSON['hotels'][$hotel@index]['lat']       = $hotel['lat']}
				{$poiJSON['hotels'][$hotel@index]['lng']       = $hotel['lng']}
			{/foreach}
		{else}
			{$poiJSON['hotels'][0]['name']      = $hebs->site->title}
			{$poiJSON['hotels'][0]['address']   = $hebs->site->address}
			{$poiJSON['hotels'][0]['city']      = $hebs->site->city}
			{$poiJSON['hotels'][0]['state']     = $hebs->site->state}
			{$poiJSON['hotels'][0]['zip']       = $hebs->site->zip}
			{$poiJSON['hotels'][0]['country']   = $hebs->site->country_abbreviation}
			{$poiJSON['hotels'][0]['phone']     = $hebs->site->phone}
			{$poiJSON['hotels'][0]['lat']       = $hebs->site->lat}
			{$poiJSON['hotels'][0]['lng']       = $hebs->site->lng}
		{/if}

		{foreach $categories as $category}

			{$poiJSON['categories'][$category@index]['id']					= $category['id']}
			{$poiJSON['categories'][$category@index]['name']				= $category['name']}
			{$poiJSON['categories'][$category@index]['biggest-distance']    = 0}
			{$poiJSON['categories'][$category@index]['points']				= []}

			{if isset($category['points'])}
				{foreach $category['points'] as $point}
					{if $point['distance'] > $poiJSON['categories'][$category@index]['biggest-distance']}
						{$poiJSON['categories'][$category@index]['biggest-distance'] = $point['distance']}
					{/if}

					{if {file_exists path="assets/desktop/images/poi/{$category['slug']}.png"}}
						{$tempSlug = $category['slug']}
					{else}
						{$tempSlug = "pin"}
					{/if}

					{$poiJSON['categories'][$category@index]['points'][$point['id']]['id']				= $point['id']}
					{$poiJSON['categories'][$category@index]['points'][$point['id']]['category_id']		= $category['id']}
					{$poiJSON['categories'][$category@index]['points'][$point['id']]['pin_slug']		= $tempSlug}
					{$poiJSON['categories'][$category@index]['points'][$point['id']]['name']			= $point['name']|escape}
					{$poiJSON['categories'][$category@index]['points'][$point['id']]['address']			= $point['address']|escape}
					{$poiJSON['categories'][$category@index]['points'][$point['id']]['phone']			= $point['phone']|escape}
					{$poiJSON['categories'][$category@index]['points'][$point['id']]['descr']			= $point['descr']}
					{$poiJSON['categories'][$category@index]['points'][$point['id']]['distance']		= $point['distance']}
					{$poiJSON['categories'][$category@index]['points'][$point['id']]['link']			= $point['link']}
					{$poiJSON['categories'][$category@index]['points'][$point['id']]['url_name']		= $point['url_name']}
					{$poiJSON['categories'][$category@index]['points'][$point['id']]['image_link']		= $point['image_link']|default:''}
					{$poiJSON['categories'][$category@index]['points'][$point['id']]['lat']				= $point['lat']|escape}
					{$poiJSON['categories'][$category@index]['points'][$point['id']]['lng']				= $point['lng']|escape}

				{/foreach}
			{/if}

		{/foreach}

	{/strip}

	<script>
		var poiJSON = poiJSON || {};
		poiJSON['{$poiJSON_ID}'] = {$poiJSON|json_encode};
	</script>

	{block name="poi"}

		<section class="poi" data-poi-id="{$poiJSON_ID}">

			{if $categories|count}
				<div class="poi-overlay" data-overlay="false">
					{if count($categories) > 1}
						<nav class="category-selector">
							{foreach $categories as $category}
								{if !isset($category['points']) || !count($category['points'])}{continue}{/if}
								<button data-poi-category-index="{$category@index}" data-poi-category-id="{$category['id']}" class="button {if $category@index == 0}active{/if} icon-{$category['slug']}">{$category['name']}</button>
							{/foreach}
						</nav>
					{/if}

					<div class="poi-zoom">
						{translate label="Zoom:"}
						<button class="poi-zoom-button zoom-out">{translate label="Zoom Out"}</button>
						<button class="poi-zoom-button zoom-in">{translate label="Zoom In"}</button>
					</div>
				</div>
			{/if}

			<div class="poi-map google-map"></div>

		</section>

	{/block}

{/if}

{*
	POI widget usage:

	{widget name="poi" action="categories" id="1,2"}
	{widget name="poi" action="categories"}
	{widget name="poi" action="categories" id="1"}
	{widget name="poi" category_id="2" }
	{widget name="poi" action="classifiers" classifiers="bellevue"}
	{widget name="poi" action="classifiers" classifiers="bellevue" categories="restaurants"}
*}