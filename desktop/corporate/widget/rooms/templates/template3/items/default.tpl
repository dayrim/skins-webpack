<article class="rooms-entry{if $room->image_link} img{/if}"{if $room->categories} data-category="{foreach $room->categories as $category_id}{$category_id}{if !$category_id@last},{/if}{/foreach}"{else} data-category="0"{/if}>
    <div class="background" style="background-image:url({if $room->image_link}{$room->image_link}{elseif $hebs->attributes->corporate->get('attributes.rooms_default_image.value')}{image id=$hebs->attributes->corporate->get('attributes.rooms_default_image.value') size="960x220"}{/if});">

        {if $room->gallery}
            <a href="#" class="rooms-item-gallery" data-gallery-id="{$room->id}">{translate label="View Gallery"}</a>
        {/if}

        {if $room->price}
            {widget name="rooms" action="include" template="price" data=$room}
        {/if}
    </div>

    <div class="description">
        <h3>{$room->name|escape}</h3>
        <p>{$room->descr_short|truncate:190}</p>

        <nav>
            {if $room->link}<a href="{$room->link}">{$room->link_title}</a>{/if}
            {if $room->file->path}<a href="{$room->file->path}">Floorplan</a>{/if}
            {if $room->extlink}<a href="{$room->extlink}" data-dtm-event="check-availability" data-dtm-room-name="{$room->name|escape}">Book Now</a>{/if}
        </nav>
    </div>
</article>
