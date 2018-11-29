{if count($section->getElement('review'))}
	<section class="reviews-slideshow" class="fade-on-scroll">
		<div class="center-column">
			<h2>{$section->getElement('heading')->getContent()}</h2>
		</div>

		{if count($section->getElement('review')) > 1}
			<button class="slideshow-button previous">{translate label="Previous"}</button>
		{/if}

		<div class="slideshow">
			<div class="slideshow-wrapper">
				{foreach $section->getElement('review') as $review}
					<article class="slide">
						<h3>{$review->getElement('heading')->getContent()|trim}</h3>
						<div class="copy">{$review->getElement('content')->getContent()|trim}</div>
						<div class="name">{$review->getElement('name')->getContent()}</div>
					</article>
				{/foreach}
			</div>
		</div>

		{if count($section->getElement('review')) > 1}
			<button class="slideshow-button next">{translate label="Next"}</button>
		{/if}
	</section>
{/if}