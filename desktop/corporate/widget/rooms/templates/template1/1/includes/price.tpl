{if $data->price && $data->price->enabled}
	{if $data->price->link}
		<a href="{$data->price->link}" class="price">{$data->price}</a>
	{else}
		<span class="price">{$data->price}</span>
	{/if}
{/if}