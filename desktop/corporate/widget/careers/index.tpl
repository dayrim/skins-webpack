
{if $categories}
	{foreach $categories as $category}
		{assign var="careers" value=$category->getCareers()}
		{if count($careers)}
			<h3>{translate label="Listings for"} {$category->title}</h3>
			<table class="careers">
				<thead>
					<tr>
						<th class="narrow">{translate label="Department"}</th>
						<th class="narrow"{translate label=">Position"}</th>
						<th>{translate label="Description"}</th>
					</tr>
				</thead>
				<tbody>
					{foreach $careers as $row}
						<tr class="{cycle values='odd,even'}{if $row@last} last{/if}">
							<td>{$row->department}</td>
							<td>{$row->position}</td>
							<td>{$row->descr}</td>
						</tr>
					{/foreach}
				</tbody>
			</table>
		{/if}
	{/foreach}
{else}
	<p>{$nopositions}</p>
{/if}
