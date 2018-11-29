<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb">
		{foreach $breadcrumb as $value}
			{if $value@first}
				<a href="{site_url}" rel="index {foreach range(1,count($breadcrumb)-$value@index) as $v} up{/foreach}" itemprop="url"><span itemprop="title">{translate label="Home"}</span></a> &raquo;
			{/if}
			{if !$value@last}
				<span itemprop="child" itemscope itemtype="http://data-vocabulary.org/Breadcrumb">
				<a href="{$value->url}" rel="{foreach range(1,count($breadcrumb)-$value@index-1) as $v} up{/foreach}" itemprop="url"><span itemprop="title">{$value->name}</span></a> &raquo;
			{else}
				<span itemprop="child" itemscope itemtype="http://data-vocabulary.org/Breadcrumb">
				<a href="{$value->url}" itemprop="url"><span itemprop="title">{$value->name}</span></a>
			{/if}
		{/foreach}
		{foreach $breadcrumb as $value}</span>{/foreach}
</div>