<ul>
	{foreach $rootNode->getChildren() as $node}
		<li>
			{if $node->getView()}
				{widget name="navigation" action="node" node=$node template=$node->getView()}
			{else}
				<a href="{$node->getLink()}" {if $node->isActive()}class="active"{/if} {if $node->getLink()->isNewWindow()}target="_blank"{/if}>{$node->getName()}</a>
			{/if}
		</li>
	{/foreach}
</ul>