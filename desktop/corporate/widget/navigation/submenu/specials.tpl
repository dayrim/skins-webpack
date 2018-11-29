{if count($node->getChildren())}
	<nav class="category-selector">
		<a href="{$node->getLink()}" class="button">All</a>
		{foreach $node->getChildren() as $childNode}
			<a href="{$childNode->getLink()}" class="button {if $childNode->isActive()}active{/if}">{$childNode->getName()}</a>
		{/foreach}
	</nav>
{/if}