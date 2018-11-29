<a class="button {if isset($class)}{$class|escape}{/if}"
{if isset($title)} title="{$title|escape}" {/if}
{if isset($id)} id="{$id|escape}" {/if}
{if isset($target)} target="{$target|escape}" {/if}
{if isset($rel)} rel="{$rel|escape}" {/if}
{if isset($onclick)} data-dtm-event="{$onclick|escape}" {/if}
href="{$href}">{$value|unescape|escape}</a>