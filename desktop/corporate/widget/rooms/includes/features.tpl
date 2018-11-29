{function renderfeature}
    {if $feat->element == 'text'}
        <span class="{$feat->slug|escape}">{$feat->name|escape}: {$feat->value|escape}</span>
    {else}
        <span class="rooms-icon rooms-icon-{$feat->slug|escape}" title="{$feat->name|escape}"></span>
    {/if}
{/function}

{if count($data->features->features)}
    <div class="features">
        {foreach $data->features->features as $feature}
            {renderfeature feat=$feature}
        {/foreach}
    </div>
{/if}

{if count($data->features->amenities)}
    <div class="amenities">

        <div class="additional-list">
            {foreach $data->features->amenities as $amenity}
                {renderfeature feat=$amenity}
            {/foreach}
        </div>

        <div class="main-list">
            {foreach $data->features->amenities as $amenity}
                {renderfeature feat=$amenity}
            {/foreach}
        </div>

        <div class="toggle"></div>

    </div>
{/if}