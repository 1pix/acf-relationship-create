;(function($, acf_relationship_create, acf_relationship_create_pro_field, undefined) {

    // Bail here if acf is not defined
    if( typeof acf === 'undefined' ) return;

    /**
     * Common function to open tooltip on Relationship & Post Object fields
     *
     * @param e: Event
     * @param acf_field_object: acf.fields.relationship OR acf.fields.post_object
     * @param $el: the field
     */
    var open_tooltip = function(e, acf_field_object, $el) {
        // Eventually close other tooltips
        $('#acf-rc-popup').remove();

        // Prevent the user to create a new content
        // if the maximum number of items is already reached.
        if( typeof acf_field_object.o.max != 'undefined' && acf_field_object.o.max > 0 ) {
            if( acf_field_object.$values.find('.acf-rel-item').length >= acf_field_object.o.max ) {
                alert( acf._e('relationship', 'max').replace('{max}', acf_field_object.o.max) );
                return;
            }
        }

        var $tooltip = $( $el.parents('.acf-field:first').find('.acf-rc-popup-wrapper').html() );

        // Handle click on a tooltip link
        $tooltip.on('click', 'a', function(e) {
            e.preventDefault();

            // Fetch the ACF field
            var $field = $el.parents('.acf-field:first');

            // Store link data into ACF field
            $field.data(
                'acfRcOpenUrl',
                {
                    'url':$(this).attr('data-create-url'),
                    'title':$(this).attr('title')
                }
            );

            // Trigger lightbox opening
            $field.trigger('acf-rc-lightbox-open');
        });


        if( $tooltip.find('ul li').length > 1 ) {
            // Show tooltip
            var $media_modal = e.$el.parents('.media-modal:first');
            var context_media_modal = $media_modal.length == 1;
            if (context_media_modal) {
                $media_modal.find('div.media-frame-content div.settings').prepend($tooltip);

                // We need to know if we are in a repeater field
                var $repeater_parent_cell = e.$el.parents('td.acf-field:first');

                var tooltip_pos_top = ( $repeater_parent_cell.length == 1 ) ? e.$el.parents('td.acf-field:first').position().top : 0;
                tooltip_pos_top += e.$el.position().top - $tooltip.height() - 6 + ( e.$el.outerHeight(true) - e.$el.innerHeight() );

                var tooltip_pos_left = ( $repeater_parent_cell.length == 1 ) ? e.$el.parents('td.acf-field:first').position().left : 0;
                tooltip_pos_left += e.$el.position().left - ( $tooltip.width() / 2 );
                tooltip_pos_left += ( $repeater_parent_cell.length == 1 ) ? e.$el.outerWidth(true) : e.$el.outerWidth(true) / 2;

                $tooltip.css({
                    'top': tooltip_pos_top,
                    'left': tooltip_pos_left
                });
            } else {
                $('body').prepend($tooltip);
                $tooltip.css({
                    'top': e.$el.offset().top - $tooltip.height() - 6,
                    'left': e.$el.offset().left - ( $tooltip.width() / 2 ) + ( e.$el.outerWidth(true) / 2 )
                });
            }

            // Take focus
            var $tooltip_focus = $tooltip.children('.focus');
            $tooltip_focus.trigger('focus');

            // Event to close tooltip
            $tooltip_focus.on('blur', function(e) {
                close_tooltip();
            });
        } else {
            // Directly open lightbox if there's only once choice.
            $tooltip.find('ul li:first a:first').trigger('click');
        }
    };

    /**
     * Common function to close tooltip on Relationship & Post Object fields
     **/
    var close_tooltip = function() {
        setTimeout(function(){
            $('#acf-rc-popup').remove();
        }, 200);
    };

    /**
     * Common function to open lightbox on Relationship & Post Object fields
     *
     * @param e: Event
     */
    var open_lightbox = function(e) {

        var url = e.$el.data('acfRcOpenUrl').url;
        url = url.replace(
            '__acf_rc_original_field_uniqid__',
            e.$el.attr('data-acf-rc-uniqid')
        );

        // Check whether we are in a media modal
        var $media_modal = e.$el.parents('.media-modal:first');
        if( $media_modal.length == 1 ) { // Yes we are!
            url = url.replace(
                '__acf_rc_from_content_type__',
                'attachment'
            );
            url = url.replace(
                '__acf_rc_from_content_ID__',
                $media_modal.find('div.media-frame-content div.attachment-details').attr('data-id')
            );
        } else {
            url = url.replace(
                '__acf_rc_from_content_type__',
                $('form#post input[name="post_type"]').val()
            );
            url = url.replace(
                '__acf_rc_from_content_ID__',
                $('form#post input[name="post_ID"]').val()
            );
        }

        tb_show( e.$el.data('acfRcOpenUrl').title, url );
    };



    /**
     * Open a tooltip to choose which kind of CPT to create
     * Inspired from flexible_content field
     *
     * @see acf.fields.flexible_content._open
     * @event click .acf-relationship-create-link
     *
     * @param e Event
     */
    acf.fields.relationship.acf_rc_tooltip_open = function(e) {
        var that = this;
        setTimeout(function(){
            open_tooltip(e, that, that.$el );
        }, 300);
    };
    acf.fields.post_object.acf_rc_tooltip_open = function(e) {
        var that = this;
        setTimeout(function(){
            open_tooltip(e, that, that.$select );
        }, 300);
    };

    // Custom event to open tooltip
    acf.fields.relationship._add_event( 'click .acf-relationship-create-link', 'acf_rc_tooltip_open');
    acf.fields.post_object._add_event( 'click .acf-relationship-create-link', 'acf_rc_tooltip_open');



    /**
     * Open post creation in UI, in an iframe, in a lightbox
     *
     * @event click .acf-fc-popup a
     *
     * @param e Event
     */
    acf.fields.relationship.acf_rc_lightbox_open = function(e) {
        open_lightbox(e);
    };

    acf.fields.post_object.acf_rc_lightbox_open = function(e) {
        open_lightbox(e);
    };

    // Custom event to open iframe in Thickbox
    acf.fields.relationship._add_event( 'acf-rc-lightbox-open  ', 'acf_rc_lightbox_open');
    acf.fields.post_object._add_event( 'acf-rc-lightbox-open  ', 'acf_rc_lightbox_open');



    // Default AJAX callback for completed AJAX requests on Relationship fields
    $(document).ajaxComplete(function(event, xhr, ajaxOptions, data) {

        var ajax_request_data = acf_relationship_create.parse_query_string( 'foobar?' + decodeURIComponent(ajaxOptions.data) );
        if( typeof ajax_request_data.acf_relationship_created_post_id == 'undefined' ) {
            return;
        }
        var splitted_value = ajax_request_data.acf_relationship_created_post_id.split('-');
        if( typeof splitted_value[1] == 'undefined' ) return;

        var $field = $('[data-acf-rc-uniqid=' + splitted_value[1] + ']');
        if( $field.length != 1 ) return;

        // Auto-select newly created post
        var $choices = $field.find('.choices .acf-rel-item:not(.disabled)');
        if( $choices.length == 1 ) {
            $choices.trigger('click');
        }

        // Reset our custom filter
        $field.find('input[data-filter="acf_relationship_created_post_id"]').val('').trigger('change');
    });



    /**
     * Listen to the event triggered from the `create-on-the-fly` iframe
     */
    $(document).on('acf-relationship-create/created', function(e, field_uniq_id, post_data ) {
        if( typeof field_uniq_id == 'undefined' ) return;

        var $field = $('[data-acf-rc-uniqid="' + field_uniq_id + '"]');
        if( $field.length != 1 ) {
            return;
        }

        var $input_filter = $field.find('input[name="acf-relationship-created_post_id"]');
        if( $input_filter.length != 1 ) {
            return;
        }

        switch( $field.attr('data-type') ) {
            case 'relationship':
                $input_filter
                    .val( post_data.post_id + '-' + field_uniq_id )
                    .trigger('change'); // This triggers acf.fields.relationship.change_filter()
                break;

            case 'post_object':
                var $select = $field.find('select');
                if( $select.length !== 1 ) break;

                var select2_data,
                    new_select2_value = {
                        id: post_data.post_id,
                        text: post_data.post_title
                    };

                if( acf_relationship_create_pro_field.ACF.version < '5.6.0' ) {
                    var $select2_input = $select.siblings('input');
                    if( $select2_input.length !== 1 ) break;

                    $select = $select2_input;
                }

                select2_data = $select.select2('data');

                if( new_select2_value.text === '' )
                    new_select2_value.text = acf_relationship_create_pro_field.i18n.no_title;

                // Create <option> if not exists
                var $option = $select.find('option[value="' + new_select2_value.id + '"]');
                if( $option.length < 1 )
                    $select.append(
                        $('<option></option>').attr('value', new_select2_value.id).text(new_select2_value.text)
                    );

                if( $select.prop('multiple') ) {
                    if( acf_relationship_create_pro_field.ACF.version < '5.6.0' ) {
                        // ACF < 5.6.0
                        var post_already_selected = false;
                        $.each( select2_data, function( index, value ) {
                            if( value.id === post_data.post_id ) {
                                post_already_selected = true;
                                return false;
                            }
                        });

                        if( !post_already_selected ) {
                            select2_data.push( new_select2_value );
                            $select2_input.select2(
                                'data',
                                select2_data
                            );
                        }
                    } else {
                        // ACF >= 5.6.0
                        var selected_options = [];
                        $.each( select2_data, function( index, select2_single_data ) {
                            // Create <option> if not exists
                            var $option = $select.find('option[value="' + select2_single_data.id + '"]');
                            if( $option.length < 1 )
                                $select.append(
                                    $('<option></option>').attr('value', select2_single_data.id).text(select2_single_data.text)
                                );

                            selected_options.push(select2_single_data.id);
                        });
                        selected_options.push( new_select2_value.id.toString() );
                        $select.val( selected_options ).trigger('change');
                    }
                } else {
                    if( acf_relationship_create_pro_field.ACF.version < '5.6.0' ) {
                        $select.select2(
                            'data',
                            new_select2_value
                        );
                    }
                    else
                        $select.val( new_select2_value.id.toString() ).trigger('change');
                }
                break;
        }

        tb_remove();
    });



    $(document).ready(function() {

        /**
         * Hide admin bar and admin menu if we're in an iframe
         */
        if( acf_relationship_create.get_parent_iframe() !== false ) {
            acf_relationship_create.hide_admin_bar();
            acf_relationship_create.hide_admin_menu();
        }

        $('body').append('<div id="acf-rc-tooltip"></div>');

        /**
         * Perform some stuff on relationship field
         * as soon as they are created
         */
        function on_acf_relationship_field_ready($el, field_type) {
            var $link = $el.find('a.acf-relationship-create-link');
            if( $link.length != 1 ) return;

            // Add a unique ID for the field
            $el.attr('data-acf-rc-uniqid', acf_relationship_create.generate_random_id() );

            // Add a class (just for CSS purpose)
            $el.attr('data-acf-relationship-create-enabled', true);

            // Position button depending on context
            var $context = '';
            if( $el.is('td') ) $context = 'repeater';
            if( $el.is('tr') ) $context = 'mediamodal';
            switch( $context ) {
                case 'repeater':
                    // Relationship field within Repeater field
                    if( $el.is('.acf-field-relationship') ) {
                        $link.detach().appendTo( $el.find('div.filters') );
                        break;
                    }

                    // Post Object field within repeater field
                    if( $el.is('.acf-field-post-object') ) {
                        $link.detach().appendTo( $el.find('.acf-input') );
                    }
                    break;
                case 'mediamodal':
                    $link.detach().appendTo( $el.find('.acf-label') );
                    $link.css({
                        'margin-top': $el.find('.acf-label label').css('margin-top'),
                        'padding-top': $el.find('.acf-label label').css('padding-top')
                    });
                    break;
                default:
                    $link.detach().appendTo( $el.find('.acf-label') );
            }
        }

        // Relationship fields
        acf.add_action('load_field/type=relationship', function( $el ){
            on_acf_relationship_field_ready( $el, 'relationship' );
        });

        acf.add_action('append_field/type=relationship', function( $el ){
            on_acf_relationship_field_ready( $el, 'relationship' );
        });

        // Post Object fields
        acf.add_action('load_field/type=post_object', function( $el ){
            on_acf_relationship_field_ready( $el, 'post_object' );
        });
        acf.add_action('append_field/type=post_object', function( $el ){
            on_acf_relationship_field_ready( $el, 'post_object' );
        });
    });
})(jQuery, window.acf_relationship_create || {}, window.acf_relationship_create_pro_field || {});