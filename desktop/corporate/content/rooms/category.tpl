{extends file="./index.tpl"}

{block name="page-desription"}
	{if $category->h1}<h1>{$category->h1}</h1>{/if}
	{if $category->h2}<h2>{$category->h2}</h2>{/if}
	{$category->descr}
	{if $category->h1 || $category->h2 || $category->descr}<hr>{/if}
{/block}

{block name="categories"}{/block}