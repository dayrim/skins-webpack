{extends file="./index.tpl"}

{block name="page-content"}
	<div class="page-content">

		<h1>{$item->title}</h1>
		{if $item->h2}<h2>{$item->h2}</h2>{/if}

		<div class="socials">
			{widget name="socialButton" action="facebook"}
			{widget name="socialButton" action="tweet"}
			{widget name="socialButton" action="gplus"}
		</div>

		<div class="special single-special" data-dtm-event="offer-click" data-dtm-offer-name="{$item->title}">
			{if isset($item->image_id)}
				<div class="background" style="background-image:url('{image id=$item->image_id size="768x300"}');"></div>
			{/if}
			{$item->descr}
			{if $item->extlink}
				<p>
					<a class="button" href="{$item->extlink}" target="_blank" rel="nofollow">{if $item->linktitle}{$item->linktitle}{else}{translate label="Book Package Online"}{/if}</a>
				</p>
			{/if}
		</div>

	</div>
{/block}
