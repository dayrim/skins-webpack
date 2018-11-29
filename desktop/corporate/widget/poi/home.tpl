{extends file="index.tpl"}

{block name="poi"}

	<section id="home-poi" class="poi fade-on-scroll" data-poi-id="{$poiJSON_ID}">

		<div class="center-column">
			<h2>{translate label="What's Nearby"}</h2>
		</div>

		{if $categories|count}
			<div class="poi-overlay" data-overlay="false">
				<nav class="category-selector">
					{foreach $categories as $category}
						{if !count($category['points'])}{continue}{/if}
						<button data-poi-category-index="{$category@index}" data-poi-category-id="{$category['id']}" class="button {if $category@index == 0}active{/if} icon-{$category['slug']}">{$category['name']}</button>
					{/foreach}
				</nav>
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