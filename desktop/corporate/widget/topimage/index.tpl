<div class="slideshow">
	{if $images|count > 1}
		<button class="slideshow-button previous">{translate label="Previous"}</button>
	{/if}

	<div class="slideshow-wrapper">
		{foreach $images as $image}
			{if $image->focal_point->x}{$focal_point_x = $image->focal_point->x}{else}{$focal_point_x = 50}{/if}
			{if $image->focal_point->y}{$focal_point_y = $image->focal_point->y}{else}{$focal_point_y = 50}{/if}
			<figure class="slide" style="background-position:{$image->focal_point->x}% {$image->focal_point->y}%; {if $image@first}background-image:url('{$image->path}');{/if}" data-background="{$image->path}">

				{if $image->title}
					<figcaption class="caption {$image->message_class}">
						{if $image->link}<a href="{$image->link}">{/if}

							{$marketing_message = explode('|', $image->title)}

							{foreach $marketing_message as $message}
								{$message}
							{/foreach}

						{if $image->link}</a>{/if}
						<div class="loading"></div>
					</figcaption>
				{/if}

				{if $image->link && !$image->title}
					<a href="{$image->link}" class="link-only">{$image->alt}</a>
				{/if}

				{if !$image->title}
					<div class="loading"></div>
				{/if}

			</figure>
		{/foreach}
	</div>

	{if $images|count > 1}
		<button class="slideshow-button next">{translate label="Next"}</button>
	{/if}
</div>

{block name="scroll-to-explore"}
	<div class="scroll-to-explore">Scroll to Explore</div>
{/block}