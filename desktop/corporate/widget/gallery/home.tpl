{extends file="index.tpl"}

{block name="galleries"}
	{if isset($data) && count($data)}

		<article id="home-gallery" class="gallery fade-on-scroll">

			<div class="center-column">
				<h2>{translate label="Featured Photos"}</h2>
			</div>

			<div class="gallery-wrapper">
				{foreach $data as $gallery}
					{if $gallery->images|count > 0}
						{foreach $gallery->images as $image}
							{if $image@index == 5 && $hebs->attributes->corporate->get('attributes.home_page_gallery_link.value')}
								<span style="background-image:url({$image->thumb});" class="photo" data-gallery-id="{$gallery->id}" data-image-index="{$image@index}">
									<span class="text">
										{translate label="Featured Photos"}
										<a href="{$hebs->attributes->corporate->get('attributes.home_page_gallery_link.value')}" class="button transparent-white">{translate label="More Photos"}</a>
									</span>
								</span>
							{else}
								<button data-gallery-id="{$gallery->id}" data-gallery-json-key="{$galleryJSON_IDs}" data-image-index="{$image@index}" class="photo" style="background-image:url({$image->thumb});">Image {$image@index}. {$image->caption}</button>
							{/if}
							{if $image@index == 11}{break}{/if}
						{/foreach}
					{/if}
				{/foreach}
			</div>

			{if $hebs->attributes->corporate->get('attributes.home_page_gallery_link.value')}
				<a href="{$hebs->attributes->corporate->get('attributes.home_page_gallery_link.value')}" class="button all-photos">{translate label="More Photos"}</a>
			{/if}
		</article>

	{/if}
{/block}
