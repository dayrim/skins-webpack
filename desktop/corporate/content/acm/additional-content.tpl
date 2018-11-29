{*
	Simplest ACM section to replicate "extract elements" approach. Consists of only one "editor" type element with "content" slug.
*}
<section class="additional-content">
	{$section->getElement('content')->getContent()}
</section>