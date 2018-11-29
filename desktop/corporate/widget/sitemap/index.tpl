{function sitemap_menu}
	{if is_array($data)}
		<ul>
			{foreach $data as $value}
                <li>
					{strip}
						{if 'links' == $value->type}
							<a href="{$value->slug}" {if !$value->internal}target="_blank"{/if}>
						{else}
							<a href="{site_url full="1"}{$value->path}">
						{/if}
								{$value->name}
							</a>
						{if isset($value->short_description) && $value->short_description} — <em class="sitemap-description">{$value->short_description}</em>{/if}

						{if count($value->children)}
							{sitemap_menu data=$value->children}
						{/if}
					{/strip}
				</li>
			{/foreach}
		</ul>
	{/if}
{/function}

<div class="sitemap">
	{sitemap_menu data=$menu["top"]}
	<hr>
	{sitemap_menu data=$menu["main"]}
	<hr>
	{sitemap_menu data=$menu["footer"]}
</div>