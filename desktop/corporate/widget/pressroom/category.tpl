{if isset($categories) && count($categories)}
	{$published_categories = 0}
	{$category_children = 0}

	{foreach $categories as $category}
		{if $category->published}
			{$published_categories = $published_categories + 1}
			{if count($category->getPressReleases())}
				{$category_children = $category_children + 1}
			{/if}
		{/if}
	{/foreach}

	{if empty($order)}
		{$order["column"] = null}
		{$order["direction"] = "DESC"}
	{/if}

	{if $published_categories > 0 && $category_children > 0}
		<div class="pressroom">
			{if $category_children > 1} {* Multiple categories with All button *}

				<nav class="category-selector">
					<button class="button" data-category="0">{translate label="All"}</a></button>
					{foreach $categories as $category}
						{$data = $category->getPressReleases()}
						{if $category->published && count($data)}
							<button class="button" data-category="{$category->id}">{$category->title}</button>
						{/if}
					{/foreach}
				</nav>

				{widget name="pressroom" action="index" orderby=$order["column"] direction=$order["direction"]}

			{else} {* Only one category *}

				{$data = $categories[0]->getPressReleases()}
				{if $categories[0]->published && count($data)}
					{widget name="pressroom" action="index" category=$categories[0]->id orderby=$order["column"] direction=$order["direction"]}
				{/if}

			{/if}
		</div>
	{/if}
{/if}