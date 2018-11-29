{if $data->price->price && $data->price->enabled}
	{if $data->price->link}
		<a href="{$data->price->link}" class="price">
	{else}
		<div class="price">
	{/if}
		<span class="prefix">{$data->price->prefix}</span>

		<span class="number">
			<span class="prefix">{if $data->price->currency_append == 0}{$data->price->currency}{else}{$data->price->price}{/if}</span>{if $data->price->currency_append == 1} {$data->price->currency}{else}{$data->price->price}{/if}
		</span>

		<span class="suffix">{$data->price->suffix}</span>
	{if $data->price->link}
		</a>
	{else}
		</div>
	{/if}
{/if}