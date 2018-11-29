{if count($data)}
	<section id="promos" class="fade-on-scroll">
		<div class="slideshow">
			<div class="slideshow-wrapper">
				{foreach $data as $promo}
					<article class="promo" tabindex="-1" aria-hidden="true">
						<div class="inner-wrapper">
							<div class="thumbnail" {if $promo@index < 3}style="background-image:url({$promo->image_link});"{/if} data-background="{$promo->image_link}">
								{if !isset($hebs)}
									<img src="{$promo->image_link}" class="fs_image">
								{/if}
							</div>
							<div class="content">
								<h3 class="fs_title">{$promo->tile_name}</h3>

								<p class="fs_descr">{$promo->descr}</p>

								{if $promo->price && isset($hebs)}
									<div class="price">
										$<strong class="fs_price">{$promo->price}</strong> <span class="fs_price_copy">{$promo->lasttext}</span>
									</div>
								{/if}

								{if $promo->link_title}
									<a href="{$promo->link}" class="fs_link fs_link_title promo-button" data-dtm-event="promo-click" data-dtm-promo-type="special-offer" data-dtm-promo-name="{$promo->tile_name|escape}" data-dtm-position="header">{$promo->link_title}</a>
								{/if}
							</div>
						</div>
					</article>
				{/foreach}
			</div>
		</div>

		{if count($data) > 1}
			<div class="slideshow-pagination"></div>
		{/if}
	</section>
{/if}