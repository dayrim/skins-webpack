{extends file="../content/index.tpl"}

{block name="content-submenu"}{/block}

{block name="page-content"}
	<div class="page-content">

		<h1>{if $header}{$header}{else}Special Offers{/if}</h1>
		{if $subheader}<h2>{$subheader}</h2>{/if}
		{$content}

		{if is_array($categories)}

			{widget name="navigation" action="submenu" template="specials"}

			{if !empty($categories)}

				<div class="image-list specials">
					{foreach $categories as $value}
						<article class="image-list-item category {if $value@index%2 == 0}odd{/if}">
							{if isset($value->image_id)}<div class="background" style="background-image:url({image id=$value->image_id size="768x300"});"></div>{/if}
							<div class="description">
								<h3><a href="{url data=['c'=>'specials', 'a'=>'index', 'specialsPath' => [$value->slug]]}">{$value->title}</a></h3>

								{if $value->descr && preg_match("/<p>(.+?)<\/p>/si", $value->descr, $descr) && $value->descr|strip_tags|regex_replace:"/&#?[a-z0-9]+;/i":" "|strlen > 500}
									<p class="descr">
										{if isset($value->image_id)}
											{$descr[1]|truncate:350:"...":true}
										{else}
											{$descr[1]|truncate:590:"...":true}
										{/if}
									</p>
								{else}
									{$value->descr}
								{/if}

								<nav>
									<a class="button" href="{url data=['c'=>'specials', 'a'=>'index', 'specialsPath' => [$value->slug]]}">Click here to read more</a>
								</nav>
							</div>
						</article>
					{/foreach}
				</div>
			{/if}
		{/if}

		<div class="image-list">
			{foreach $specials as $value}
				<article class="image-list-item {if $value@index%2 == 0}odd{/if}" data-dtm-event="offer-click" data-dtm-offer-name="{$value->title}">
					{if isset($value->image_id)}<div class="background" style="background-image:url({image id=$value->image_id size="768x300"});"></div>{/if}
					<div class="description">
						<h3><a href="{url data=['c'=>'specials', 'a'=>'index', 'specialsPath' => [$value->slug]]}">{$value->title}</a></h3>
						<p>{$value->descr_short|nl2br}</p>
						<nav>
							<a class="button" href="{url data=['c'=>'specials', 'a'=>'index', 'specialsPath' => [$value->slug]]}">Read More</a>
							{if $value->extlink}
								<a class="button" href="{$value->extlink}" target="_blank" rel="nofollow">Book Package</a>
							{/if}
						</nav>
					</div>
				</article>
			{/foreach}
		</div>

	</div>
{/block}
