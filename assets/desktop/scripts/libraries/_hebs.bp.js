(function( $ ) {
    var log = function() {
        try {
            console.log.apply(console, arguments);
        } catch(err) {}
    };

    $.fn.hebsBP = function(options) {
        if (typeof bookingEngineVars === 'undefined') {
            log('HeBS Booking: "bookingEngineVars" variable must be defined.');
            return false;
        }

        var self = $(this);

        if (self.length == 0) {
            log('HeBS Booking: must be attached to form. Please specify proper form selector.');
            return false;
        }

        var settings = {
            'propertyId'       : null,
            'propertySelector' : null,
            'checkIn'               : null,
            'checkOut'              : null,
            'stay'             : null,
            'adults'           : null,
            'extraFields'      : {},
            'singleCookie'     : true,
            'onComplete'       : function() {}
        };

        try {
            var booking_window, booking_length, number_of_adults, extraFields = [];
            if (options) {
                $.extend( settings, options );
            }

            if (!settings.checkIn || !$(settings.checkIn, self).length) {
                log('HeBS Booking: "Check-in" selector is incorrect.');
                return false;
            }

            var settingsPropertyId = settings.propertyId;
            var currentDefaultBooking = $.grep(bookingEngineVars, function(e){
                if (settingsPropertyId) {
                    return e.property_id == settingsPropertyId;
                } else {
                    return !e.property_id;
                }
            });

            var today = new Date(),
                checkin_date,
                checkout_date;

            var property_id = null,
                default_booking_window   = currentDefaultBooking[0].default_booking_window,
                default_booking_length   = currentDefaultBooking[0].default_booking_length,
                default_number_of_adults = currentDefaultBooking[0].default_number_of_adults;

            var cookie_base_name = '__hebs_booking',
                cookie_options = { expires : 36500, path : '/' },
                cookie;

            if(settings.singleCookie){
                cookie = $.cookie(cookie_base_name);
            }
            else{
                if (settingsPropertyId) {
                    cookie = $.cookie(cookie_base_name + '-' + settingsPropertyId);
                } else {
                    cookie = $.cookie(cookie_base_name);
                }
            }

            if (cookie) {
                var cookie_obj = $.secureEvalJSON(cookie);

                booking_window = typeof cookie_obj.bw !== 'undefined' ? cookie_obj.bw : default_booking_window;
                if (today.getTime() <= cookie_obj.checkInDate) {
                    booking_length   = typeof cookie_obj.bl !== 'undefined' ? cookie_obj.bl : default_booking_length;
                    number_of_adults = typeof cookie_obj.noa  !== 'undefined' ? cookie_obj.noa : default_number_of_adults;

                    /* init ckeckin date */
                    checkin_date  = new Date(cookie_obj.checkInDate);

                    /* init ckeckout date */
                    checkout_date = new Date(checkin_date);
                    checkout_date.setDate(checkout_date.getDate() + booking_length);
                } else {
                    booking_length   = typeof cookie_obj.bl !== 'undefined' ? cookie_obj.bl : default_booking_length;
                    number_of_adults = cookie_obj.noa ? cookie_obj.noa : default_number_of_adults;

                    /* init ckeckin date */
                    checkin_date = new Date(today);
                    checkin_date.setDate(checkin_date.getDate()+booking_window);

                    /* init ckeckout date */
                    checkout_date = new Date(checkin_date);
                    checkout_date.setDate(checkout_date.getDate() + booking_length);
                }

                if (cookie_obj.ef) {
                    $.each (cookie_obj.ef, function( key, value ) {
                        $(key, self).val(value);
                        extraFields.push({'selector':key,'value':value});
                    });
                }

                if (cookie_obj.pid && typeof cookie_obj.pid !== 'undefined') {
                    property_id = cookie_obj.pid;
                }
            } else {

                booking_window   = default_booking_window;
                booking_length   = default_booking_length;
                number_of_adults = default_number_of_adults;

                /* init ckeckin date */
                checkin_date = new Date(today);

                checkin_date.setDate(checkin_date.getDate()+booking_window);

                /* init ckeckout date */
                checkout_date = new Date(checkin_date);
                checkout_date.setDate(checkout_date.getDate() + booking_length);
            }

            // returns default values if cookie dosnt exist
            var return_data  = {
                'checkin_date'     : checkin_date,
                'checkout_date'    : checkout_date,
                'booking_window'   : booking_window,
                'booking_length'   : booking_length,
                'number_of_adults' : number_of_adults,
                'property_id'      : (settingsPropertyId) ? settingsPropertyId : property_id,
                'extra_fields'     : extraFields ? extraFields : [],
                'default'          : {
                    'booking_window'   : default_booking_window,
                    'booking_length'   : default_booking_length,
                    'number_of_adults' : default_number_of_adults
                }
            };
        }
        catch(err){}

        if (currentPropertyId) {
            var ccookie_obj = {
                pid: currentPropertyId
            };
            var ccookie = $.cookie(cookie_base_name);
            if (ccookie) {
                ccookie_obj = $.secureEvalJSON(ccookie);
                /* set corporate widget's property to last visited property */
                ccookie_obj.pid = currentPropertyId;
            }
            var cjson = $.toJSON(ccookie_obj);
            $.cookie(cookie_base_name, cjson, cookie_options);
        }

        $(self).on( "submit", function() {
            saveCookie();
        });

        if (settings.propertySelector && $(settings.propertySelector, self).length) {
            $(settings.propertySelector, self).on('change',function(){
                saveCookie();
            });
        }

        if (settings.checkIn && $(settings.checkIn, self).length) {
            $(settings.checkIn, self).on('change',function(){
                saveCookie();
            });
        }

        if (settings.checkOut && $(settings.checkOut, self).length) {
            $(settings.checkOut, self).on('change',function(){
                saveCookie();
            });
        }

        if (settings.adults && $(settings.adults, self).length) {
            $(settings.adults, self).on('change',function(){
                saveCookie();
            });
        }

        if (settings.extraFields){
            $.each( settings.extraFields, function( key, value ) {
                $(key, self).on( value, function() {
                    saveCookie();
                });
            });
        }

        if (typeof settings.onComplete == 'function') {
            settings.onComplete.call(self, return_data);
        }

        function getValue(selector, scope) {
            if (selector && $(selector, scope).length) {
                var type = $(selector, scope).prop('type');
                switch (type) {
                    case 'radio':
                    case 'checkbox':
                        return $(selector+":checked", scope).map(function(){ return $(this).val(); }).get();
                    default:
                        return $(selector, scope).val();
                }
            }
            return undefined;
        }

        function saveCookie(){
            var propertyId;
            var selected_property_id = null;
            if (!currentPropertyId) {
                selected_property_id = getValue(settings.propertySelector, self);
                propertyId = typeof selected_property_id !== 'undefined' ? selected_property_id : null;
            }
            else
                propertyId = currentPropertyId;

            try{
                var today = new Date();
                today.setHours(0,0,0,0);

                var ci = new Date($(settings.checkIn, self).val());
                ci.setHours(0,0,0,0);

                var booking_window = Math.floor((ci - today)/86400000);

                var booking_length = default_booking_window;
                if (settings.checkOut && $(settings.checkOut, self).length) {
                    var co = new Date ($(settings.checkOut, self).val());
                    co.setHours(0,0,0,0);
                    booking_length = Math.floor((co - ci)/86400000);
                } else if (settings.stay && $(settings.stay, self).length) {
                    booking_length = $(settings.stay, self).val();
                }

                var number_of_adults = null;
                if (settings.adults && $(settings.adults, self).length) {
                    number_of_adults = $(settings.adults, self).val();
                }

                var extraFields = {};
                if (settings.extraFields) {
                    $.each( settings.extraFields, function( key, value ) {
                        extraFields[key] =  getValue(key, self);
                    });
                }

                var obj = {
                    checkInDate: ci.getTime(),
                    bw:          booking_window,
                    bl:          booking_length,
                    noa:         number_of_adults,
                    ef:          extraFields,
                    pid:         propertyId
                };

                var json = $.toJSON(obj);
                if(!settings.singleCookie && currentPropertyId){
                    $.cookie(cookie_base_name + '-' + currentPropertyId, json, cookie_options);

                    var cobj = {
                        pid: obj.pid
                    };

                    var ccookie = $.cookie(cookie_base_name);
                    if (ccookie) {
                        ccookie_obj = $.secureEvalJSON(ccookie);
                        cobj = $.extend({}, ccookie_obj, cobj);
                    }

                    var cjson = $.toJSON(cobj);
                    $.cookie(cookie_base_name, cjson, cookie_options);
                }
                else{
                    $.cookie(cookie_base_name, json, cookie_options);
                }
            } catch(err){}
        }

        return self;

    };
})(jQuery);
