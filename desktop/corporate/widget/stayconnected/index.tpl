{*
Min Requirements:
    <input type="hidden" name="send" value="stayconnected">
    <input type="text" name="email4" class="mandatory hide" value="" autocomplete="off">
    <input type="text" name="ping" id="ping" class="mandatory hide" value="{$ping}" autocomplete="off">
*}


{if isset($error)}
    {$error}
{/if}

{if isset($thankyou)}
    {$thankyou}
{else}
    <form method="post" action="" class="form" id="newsletter-form" data-dtm-rfp-name="stay-connected">
        <fieldset>
            <legend></legend>
			<h3>{translate label="Your Information"}</h3>
			<p class="odd2">
				<label for="email"><em>*</em>{translate label="Email Address:"}</label>
				<input type="text" class="validate[required,custom[email]] text" name="email" id="email" value="{if isset($smarty.post.email)}{$smarty.post.email}{/if}">
			</p>
			<p>
				<label for="FirstName"><em>*</em>{translate label="First Name:"}</label>
				<input type="text" class="validate[required] text" name="Information.First Name" id="FirstName">
			</p>
			<p class="odd2">
				<label for="LastName"><em>*</em>{translate label="Last Name:"}</label>
				<input type="text" class="validate[required] text" name="Information.Last Name" id="LastName">
			</p>
			<p>
				<label for="city">{translate label="City:"}</label>
				<input type="text" class="text" name="Information.City" id="city" value="">
			</p>
			<p class="odd2">
				<label for="zip">{translate label="Zip:"}</label>
				<input type="text" name="Information.Zip" id="zip" class="text" value="">
			</p>
			<p>
				<label for="Mobile"><em>*</em>{translate label="Mobile:"}</label>
				<input type="text" class="validate[required,custom[telephone]] text" name="Information.Mobile" id="Mobile" value="">
			</p>
			<h3>{translate label="Your Interests"}</h3>
			<p>
				<label>{translate label="Interests:"}</label>
				<span class="group">
					<label for="General_Interest"><input type="checkbox" name="CheckBox.Interests.General Interest" id="General_Interest" class="checkbox">{translate label="General Interest"}</label>
					<label for="Business_Travel"><input type="checkbox" name="CheckBox.Interests.Business Travel" id="Business_Travel" class="checkbox">{translate label="Business Travel"}</label>
					<label for="Weekend_Travel"><input type="checkbox" name="CheckBox.Interests.Weekend Travel" id="Weekend_Travel" class="checkbox">{translate label="Weekend Travel"}</label>
					<label for="Meeting_and_Event_Planners"><input type="checkbox" name="CheckBox.Interests.Meeting &amp; Event Planners" id="Meeting_and_Event_Planners" class="checkbox">{translate label="Meeting & Event Planners"}</label>
				</span>
			</p>
            <input type="text" name="email4" class="mandatory hide" value="" autocomplete="off" aria-label="Security Check (do not modify)">
            <input type="text" name="ping" id="ping" class="mandatory hide" value="{$ping}" autocomplete="off" aria-label="Security Check (do not modify)">
		</fieldset>
		<fieldset class="controls">
            <p>
                <input type="submit" id="submit" class="button" data-dtm-rfp-name="stay-connected" value="{translate label="Sign Up"}">
                <input type="hidden" name="send" value="stayconnected">
				<input type="hidden" name="crvs" value="_92roaw_7m0HZFrJQxW5egzU35G-zwFX-JjTUwnhXMKT_zAhMiwPuwau9viNdvVxOREeqVq_XeY680sB0R-PfLixyppKEvvLv0RNlKPstLpflKfbbjEPhjhfDqcyMqCe">
            </p>
        </fieldset>
    </form>
{/if}