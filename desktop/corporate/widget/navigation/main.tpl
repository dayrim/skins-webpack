{function widget_menu_main level=1}
	<ul class="menu level-{$level} {if $level > 1}submenu{/if}">
		{if $level == 1}
			<li>
				<a href="{$data->getLink()}" {if $data->isCurrent()}class="active"{/if}>
					{$data->getName()}
				</a>
			</li>
		{/if}
		{foreach $data->getChildren() as $node}
			<li {if count($node->getChildren()) && $maxMenuLevel != $level}class="parent {if $custom["expanded_states"] && $node->isActive()}expanded{/if}"{/if}>

				{if $node->getView()}
					{widget name="navigation" action="node" node=$node template=$node->getView()}
				{else}
					<a href="{$node->getLink()}" {if $node->isActive()}class="active"{/if} {if $node->getLink()->isNewWindow()}target="_blank"{/if}>{$node->getName()}</a>
				{/if}

				{if $custom["pluses"] && count($node->getChildren()) && $maxMenuLevel != $level}
					<div class="plus">
						<div class="horizontal"></div>
						<div class="vertical"></div>
					</div>
				{/if}

				{if $maxMenuLevel > $level && count($node->getChildren())}
					{widget_menu_main data=$node level=$level+1}
				{/if}
			</li>
		{/foreach}
	</ul>
{/function}

{widget_menu_main data=$rootNode maxMenuLevel=$maxLevel}