{extends file="./index.tpl"}

{block name="page-content"}
	<div class="page-content">

		<h1>{$category->h1}</h1>
		{if $category->h2}<h2>{$category->h2}</h2>{/if}

		{$category->descr}

		{widget name="navigation" action="submenu" template="specials"}

		<div class="image-list specials">
			{foreach $specials as $item}
				{assign url {url data=['c'=>'specials', 'a'=>'index', 'specialsPath' => [$specialsPath, $item->slug]]}}
				<article class="image-list-item {if $item@index%2 == 0}odd{/if}" data-dtm-event="offer-click" data-dtm-offer-name="{$item->title}">
					{if isset($item->image_id)}<div class="background" style="background-image:url({image id=$item->image_id size="768x300"});"></div>{/if}
					<div class="description">
						<h3><a href="{$url}">{$item->title}</a></h3>
						<p>{$item->descr_short|nl2br}</p>
						<nav>
							<a class="button" href="{$url}">Read More</a>
							{if $item->extlink}
								<a class="button" href="{$item->extlink}" target="_blank" rel="nofollow">Book Package</a>
							{/if}
						</nav>
					</div>
				</article>
			{/foreach}
		</div>

	</div>
{/block}
