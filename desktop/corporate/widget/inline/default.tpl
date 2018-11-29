{if is_array($subitems) && count($subitems)}
    {foreach $subitems as $page}

        {*
            {$page['h1']}
            {$page['h2']}
            {$page['short_description']}
            {$page['url']}
        *}

    {/foreach}
{/if}