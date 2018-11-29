{extends file="../default.tpl"}

{block name="layout-type" append} home {/block}

{block name="promos"}
	{widget name="featured" position="a" action="list"}
{/block}