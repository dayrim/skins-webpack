{$children = $rootNode->getChildren()}

{if count($children)}
    <section>
        {foreach $children as $node}
            {if !$node->getType()->isContent()}{continue}{/if}

            {$images = $node->getPage()->getTopImages()}
			{if !count($images)}{continue}{/if}

            <article>
                {$image = $images[0]}
                <img src="{image image=$image size='460x260'}" alt="">
                <a href="{$node->getLink()}">{translate label="View our"} {$node->getName()}</a>
            </article>
		{/foreach}
	</section>
{/if}
