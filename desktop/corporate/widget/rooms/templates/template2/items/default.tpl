<article class="rooms-entry{if $room->image_link} img{/if}"{if $room->categories} data-category="{foreach $room->categories as $category_id}{$category_id}{if !$category_id@last},{/if}{/foreach}"{else} data-category="0"{/if}>
    <div class="background" style="background-image:url({if $room->image_link}{$room->image_link}{elseif $hebs->attributes->corporate->get('attributes.rooms_default_image.value')}{image id=$hebs->attributes->corporate->get('attributes.rooms_default_image.value') size="1280x500"}{/if});">

        {if $room->gallery}
            <a href="#" class="rooms-item-gallery" data-gallery-id="{$room->id}">{translate label="View Gallery"}</a>
        {/if}

        {if $room->price}
            {widget name="rooms" action="include" template="price" data=$room}
        {/if}

        <div class="full-description">
            {if $room->descr}
                <span class="close">Close</span>
                <div class="inner-wrapper">
                    {$room->descr}
                </div>
            {/if}
        </div>
    </div>

    <div class="description">
        <h3>{$room->name|escape}</h3>
        <p>{$room->descr_short|truncate:270}</p>
        {if $room->descr}<a href="#" class="expand-collapse expand" data-expand="Expand &gt;" data-collapse="Collapse &lt;"></a>{/if}

        <nav>
            {if $room->link}<a href="{$room->link}" class="button">{$room->link_title}</a>{/if}
            {if $room->file->path}<a href="{$room->file->path}" class="button">Floorplan</a>{/if}
            {if $room->extlink}<a href="{$room->extlink}" data-dtm-event="check-availability" data-dtm-room-name="{$room->name|escape}" class="button">Book Now</a>{/if}
        </nav>
    </div>
</article>
