;(function($, acf_relationship_create, acf_relationship_create_pro_field, undefined) {

    // Bail here if acf is not defined
    if( typeof acf === 'undefined' ) return;

    // Extend ACF Relationship Model
    acf.addAction('prepare', function() {

        var model_prototype_extension = {

            bazalt_rc_open_tooltip: function(e) {
                var that = this;
                // Eventually close other tooltips
                $('#acf-rc-popup').remove();

                var val = this.val();
                var max = parseInt( this.get('max') );

                // validate
                if( max > 0 && val && val.length >= max ) {

                    // add notice
                    this.showNotice({
                        text: acf.__('Maximum values reached ( {max} values )').replace('{max}', max),
                        type: 'warning'
                    });
                    return false;
                }

                var $tooltip = $( that.$el.find('.acf-rc-popup-wrapper').html() );

                // Handle click on a tooltip link
                $tooltip.on('click', 'a', function(e) {
                    e.preventDefault();
                    // Store link data into ACF field
                    that.$el.data(
                        'acfRcOpenUrl',
                        {
                            'url':$(this).attr('data-create-url'),
                            'title':$(this).attr('title')
                        }
                    );

                    // Trigger lightbox opening
                    that.bazalt_rc_open_lightbox(e);
                });


                if( $tooltip.find('ul li').length > 1 ) {
                    // Show tooltip
                    var $link = $(e.currentTarget);
                    var $media_modal = that.$el.parents('.media-modal:first');
                    var context_media_modal = $media_modal.length == 1;
                    if (context_media_modal) {
                        $media_modal.find('div.media-frame-content div.settings').prepend($tooltip);

                        // We need to know if we are in a repeater field
                        var $repeater_parent_cell = that.$el.parents('td.acf-field:first');

                        var tooltip_pos_top = ( $repeater_parent_cell.length == 1 ) ? that.$el.parents('td.acf-field:first').position().top : 0;
                        tooltip_pos_top += that.$el.position().top - $tooltip.height() - 6 + ( that.$el.outerHeight(true) - that.$el.innerHeight() );

                        var tooltip_pos_left = ( $repeater_parent_cell.length == 1 ) ? that.$el.parents('td.acf-field:first').position().left : 0;
                        tooltip_pos_left += that.$el.position().left - ( $tooltip.width() / 2 );
                        tooltip_pos_left += ( $repeater_parent_cell.length == 1 ) ? that.$el.outerWidth(true) : that.$el.outerWidth(true) / 2;

                        $tooltip.css({
                            'top': tooltip_pos_top,
                            'left': tooltip_pos_left
                        });
                    } else {
                        $('body').prepend($tooltip);
                        $tooltip.css({
                            'top': $link.offset().top - $tooltip.height() - 6,
                            'left': $link.offset().left - ( $tooltip.width() / 2 ) + ( $link.outerWidth(true) / 2 )
                        });
                    }

                    // Take focus
                    var $tooltip_focus = $tooltip.children('.focus');
                    $tooltip_focus.trigger('focus');

                    // Event to close tooltip
                    $tooltip_focus.on('blur', function(e) {
                        that.bazalt_rc_close_tooltip();
                    });
                } else {
                    // Directly open lightbox if there's only once choice.
                    $tooltip.find('ul li:first a:first').trigger('click');
                }
            },

            bazalt_rc_trigger_open_tooltip: function(e, $el) {
                var that = this;

                setTimeout(function(){
                    that.bazalt_rc_open_tooltip(e, that.$el);
                }, 300);
            },

            bazalt_rc_close_tooltip: function() {
                setTimeout(function(){
                    $('#acf-rc-popup').remove();
                }, 200);
            },

            bazalt_rc_open_lightbox: function(e, $el) {
                var url = this.$el.data('acfRcOpenUrl').url;
                url = url.replace(
                    '__acf_rc_original_field_uniqid__',
                    this.$el.attr('data-acf-rc-uniqid')
                );

                // Check whether we are in a media modal
                var $media_modal = this.$el.parents('.media-modal:first');
                if( $media_modal.length === 1 ) { // Yes we are!
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

                tb_show( this.$el.data('acfRcOpenUrl').title, url );
            },

            bazalt_rc_on_post_created: function(e, $el, data) {
                var html = this.newValue({
                    id: data.post_id,
                    text: data.post_title
                });
                this.$list('values').append( html )

                // trigger change
                this.$input().trigger('change');
            }
        };

        $.extend(acf.models.RelationshipField.prototype, model_prototype_extension);
        $.extend(acf.models.PostObjectField.prototype, model_prototype_extension);

        var model_events_extensions = {
            'click .acf-relationship-create-link': 'bazalt_rc_trigger_open_tooltip',
            'bazalt_rc_on_post_created': 'bazalt_rc_on_post_created'
        };
        $.extend(acf.models.RelationshipField.prototype.events, model_events_extensions);
        $.extend(acf.models.PostObjectField.prototype.events, model_events_extensions);
    });


    /**
     * Listen to the event triggered from the `create-on-the-fly` iframe
     */
    $(document).on('acf-relationship-create/created', function(e, field_uniq_id, post_data ) {
        if( typeof field_uniq_id === 'undefined' ) return;

        var $field = $('[data-acf-rc-uniqid="' + field_uniq_id + '"]');
        if( $field.length !== 1 ) {
            return;
        }

        switch( $field.attr('data-type') ) {
            case 'relationship':
                $field.trigger('bazalt_rc_on_post_created', [post_data]);
                break;

            case 'post_object':
                var $select = $field.find('select');
                if( $select.length !== 1 ) break;

                var select2_data,
                    new_select2_value = {
                        id: post_data.post_id,
                        text: post_data.post_title
                    };

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
                } else {
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
         * Perform some stuff on Relationship & Post Object fields
         * as soon as they are created
         */
        function on_acf_relationship_field_ready($el, field_type) {
            var $link = $el.find('a.acf-relationship-create-link');
            if( $link.length !== 1 ) return;

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