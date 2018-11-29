{function widget_navigation_current_default}
	<ul>
		{foreach $node->getChildren() as $childNode}
			<li>
                <a href="{$childNode->getLink()}" {if $childNode->isActive()} class="active"{/if}{if $childNode->getLink()->isNewWindow()} rel="external" target="_blank"{/if}>{$childNode->getName()}</a>

				{if count($childNode->getChildren()) && $childNode->isActive()}
					{widget_navigation_current_default node=$childNode}
				{/if}
			</li>
		{/foreach}
	</ul>
{/function}

{if isset($node) && count($node->getChildren())}
	<a href="{$node->getLink()}" class="submenu-root">{$node->getName()}</a>
	{widget_navigation_current_default node=$node}
{/if}