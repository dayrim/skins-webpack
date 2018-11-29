<section class="homepage-additional-content">
	{foreach $section->getElement('content-block') as $block}
		<article {if !$block->getElement('image')}style="background-image:url({template_url}assets/desktop/images/logo.svg)"{/if} class="subpage {if $block@index % 2 != 0}even{/if} fade-on-scroll">
			{if $block->getElement('image')}
				<div class="thumb" style="background-image:url({image acm=$block->getElement('image')});"></div>
			{/if}
			<div class="headings">
				<h2>{$block->getElement('heading')->getContent()}</h2>
				<h3>{$block->getElement('subheading')->getContent()}</h3>
			</div>

			<div class="content-wrapper">
				<div class="copy">
					{$block->getElement('content')->getContent()}
				</div>

				<a href="{$block->getElement('link')->getUrl()}" class="button black" {if !$block->getElement('link')->isInternal()}target="_blank"{/if}>{$block->getElement('link')->getName()}</a>
			</div>
		</article>
	{/foreach}
</section>