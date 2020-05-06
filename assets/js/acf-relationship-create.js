;( function( window, $, undefined ) {

    window.acf_relationship_create = {

        /**
         * Extract query string params
         *
         * @param url
         * @returns {{}}
         */
        parse_query_string: function( url ) {
            var queryString = url.replace(/^[^\?]+\??/, '');

            var Params = {};
            if ( ! queryString ) {return Params;}// return empty object
            var Pairs = queryString.split(/[;&]/);
            for ( var i = 0; i < Pairs.length; i++ ) {
                var KeyVal = Pairs[i].split('=');
                if ( ! KeyVal || KeyVal.length != 2 ) {continue;}
                var key = decodeURI( KeyVal[0] );
                var val = decodeURI( KeyVal[1] );
                val = val.replace(/\+/g, ' ');
                Params[key] = val;
            }
            return Params;
        },

        /**
         * Generate a random id
         *
         * @returns {string}
         */
        generate_random_id: function() {
            return Math.random().toString(36).substr(2, 18);
        },

        /**
         * Get jQuery instance of parent window
         *
         * @returns {*}
         */
        get_parent_jQuery: function() {
            // Ensure jQuery is defined in the parent window
            if( typeof window.parent.window.jQuery == 'undefined' ) return false;
            return window.parent.window.jQuery;
        },

        /**
         * Get parent iframe
         *
         * @returns {*}
         */
        get_parent_iframe: function() {
            if( typeof window.parent == 'undefined' ) return false;
            if( window.parent.window === window ) return false;

            // Ensure jQuery is defined in the parent window
            var $parent_jquery = this.get_parent_jQuery();
            if( ! $parent_jquery ) return false;

            // Search for the Thickbox in the parent window
            var $iframe = $parent_jquery('body #TB_window iframe');
            if( $iframe.length != 1 ) return false;

            return $iframe;
        },

        /**
         * Get ACF field identifier in parent window
         *
         * @returns {*}
         */
        get_parent_acf_field_identifier: function(){
            var $parent_iframe = this.get_parent_iframe();
            if( !$parent_iframe ) return false;

            // Parse iframe URL
            var url_params = this.parse_query_string( $parent_iframe.attr('src') );

            // Ensure the iframe URL contains the original ACF field identifier
            if( typeof url_params.acf_rc_original_field_uniqid == 'undefined' ) return false;

            return url_params.acf_rc_original_field_uniqid;
        },

        /**
         * Hide admin bar in iframe
         */
        hide_admin_bar: function() {
            $('#wpadminbar').hide();
            $('html').css('padding-top', 0);
        },

        /**
         * Hide admin menu in iframe
         */
        hide_admin_menu: function() {
            $('#adminmenumain').hide();
            $('#wpcontent, #wpfooter').css('margin-left', 0);
        }


    };
} )( window, jQuery );