{block name="content"}

	<section id="content" class="fade-on-scroll" role="main">

		<div id="main-content" class="center-column">

			{block name="content-submenu"}
				{$submenu = {widget name="navigation" action="submenu"}}
				{if $submenu|trim}
					<nav id="content-submenu">
						{$submenu}
					</nav>
				{/if}
			{/block}

			{block name="page-content"}
				<div class="page-content">
					<h1>{$data->h1}</h1>
					{if $data->h2}<h2>{$data->h2}</h2>{/if}
					{$data->body}
				</div>
			{/block}

		</div>

		{block name="additional-content"}
			{if isset($acm)}
				{$acm->render()}
			{/if}
		{/block}

	</section>

{/block}