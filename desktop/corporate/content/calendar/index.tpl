{extends file="../content/index.tpl"}

{block name="content-submenu"}{/block}

{block name="page-content"}

	<div class="page-content">
		<h1>{if $config->homepage_header}{$config->homepage_header}{else}{translate label="Calendar of Events"}{/if}</h1>
		{if $config->homepage_subheader}<h2>{$config->homepage_subheader}</h2>{/if}
		{$config->homepage_content}
	</div>

{/block}

{block name="additional-content"}

	<div id="calendar" class="center-column {if $view == 'grid' || $view == 'timeline'}grid-view{elseif $view == 'list'}list-view{else}single-event{/if}">

		<div id="calendar-header">

			{if $view == 'grid' || $view == 'list' || $view == 'timeline'}
				<ul id="calendar-views" class="views">
					<li><a href="{url data=['c' =>'calendar','a'=>'index','calendarView'=>'grid','calendarShow'=>'monthly','year'=>$year,'month'=>$month, 'category'=>$category_slug]}" class="grid {if $view == 'grid' || $view == 'timeline'}active{/if}">{translate label="Grid View"}</a></li>
					<li><a href="{url data=['c' =>'calendar','a'=>'index','calendarView'=>'list','calendarShow'=>'monthly','year'=>$year,'month'=>$month,'category'=>$category_slug]}" class="list {if $view == 'list'}active{/if}">{translate label="List View"}</a></li>
				</ul>
			{/if}

			<ul id="calendar-links">
				<li><a href="{url data=['c'=>'calendar','a'=>'ical']}" class="ical" title="iCal">iCal</a></li>
				<li><a href="#" onclick="printCalendar();return false;" class="print" title="Print">{translate label="Print"}</a></li>
				<li><a href="{url data=['c'=>'calendar','a'=>'rss']}" class="rss" title="RSS">RSS</a></li>
			</ul>

			{if $view == 'grid' || $view == 'list' || $view == 'timeline'}
				<form action="" id="calendar-filter">
					<fieldset>
						<legend></legend>
						<label for="calendar-category-filter" class="screen-reader-only">{translate label="Show"}:</label>
						<select id="calendar-category-filter" onchange="window.location.href=$(this.options[this.selectedIndex]).attr('data-url')">
							<option value="0" data-url="
								{if $view == 'list'}
									{url data=['c' =>'calendar','a'=>'index','calendarView'=>'list','category'=>null]}
								{else}
									{url data=['c' =>'calendar','a'=>'index','category'=>null]}
								{/if}
							">{translate label="All Events"}</option>

							{foreach $categories as $value}
								<option value="{$value->id}"{if $category_id == $value->id} selected="selected"{/if} data-url="
									{if $view == 'list'}
										{url data=['c' =>'calendar','a'=>'index','calendarView'=>'list','calendarShow'=>$show,'year'=>$year,'month'=>$month,'day'=>$day,'category'=>$value->slug]}
									{else}
										{url data=['c' =>'calendar','a'=>'index','calendarShow'=>$show,'year'=>$year,'month'=>$month,'day'=>$day,'category'=>$value->slug]}
									{/if}
								">{$value->title}</option>
							{/foreach}
						</select>
					</fieldset>
				</form>
			{/if}

		</div>

		{if !$view}
			<div id="calendar-navigation">
				<div class="current-event">
					{if $show == 'monthly'}
						{$currentTime|date_format:"%B"}
					{elseif $show == 'weekly'}
						Schedule for Week {$currentTime|date_format:"%U"}
					{elseif $show == 'daily'}
						{$currentTime|date_format:"%A, %m/%d/%Y"}
					{else}
						{$row->title}
					{/if}
				</div>
				<ul>
					<li><a href="{$prevUrl}" class="prev">« Prev</a></li>
					<li><a href="{$nextUrl}" class="next">Next »</a></li>
				</ul>
			</div>
		{/if}

		<dl id="calendar-breadcrumb">
			<dt>{translate label="You are here"}:</dt>
			<dd>
				{widget name="breadcrumb"}
			</dd>
		</dl>

		{if $view == 'list' || $view == 'grid' || $view == 'timeline'}
			<ul id="calendar-year">
				{foreach $year_list as $ind => $y}
					<li class="y{$ind+1}{if $y->year == $year} active{/if}"><a href="{url data=['c' =>'calendar','a'=>'index','category'=>$category_slug,'year'=>$y->year,'month'=>1,'day'=>1,'calendarShow'=>'monthly']}">{$y->year}</a></li>
				{/foreach}
			</ul>

			<ul id="calendar-month">
				{foreach $month_list as $ind => $m}
					{if $view == 'grid' || $view == 'timeline'}
						{$liClass = ''}
						{$nextMonth = $month_list[min(11, $ind+1)]}
						{$prevMonth = $month_list[max(0, $ind-1)]}
						{if $m->selected}
							{$liClass = 'current'}
						{elseif $nextMonth->selected}
							{$liClass = 'prev'}
						{elseif $prevMonth->selected}
							{$liClass = 'next'}
						{/if}
						<li{if $liClass} class="{$liClass}"{/if}><a href="{url data=['c' =>'calendar','a'=>'index','category'=>$category_slug,'year'=>$m->year,'month'=>$m->month,'day'=>1,'calendarView'=>'grid','calendarShow'=>'monthly']}" class="{if $m->selected}active{/if}{if $m->border} border_line{/if}">{$m->name}</a></li>
					{else}
						<li><a href="{url data=['c' =>'calendar','a'=>'index','category'=>$category_slug,'year'=>$m->year,'month'=>$m->month,'day'=>1,'calendarView'=>'list','calendarShow'=>'monthly']}" class="{if $m->selected}active{/if}{if $m->border} border_line{/if}">{$m->name}</a></li>
					{/if}
				{/foreach}
			</ul>
		{/if}

		{block name="calendar-content"}{/block}

	</div>

{/block}