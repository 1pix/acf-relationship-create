<?php
/*
Plugin Name: Quick and easy Post creation for ACF Relationship Fields PRO
Description: Quick & Easy post creation on your Advanced Custom Fields (ACF) Relationship Fields (PRO version)
Author: Bazalt
Version: 3.2.2
Author URI: http://bazalt.fr/
Text Domain: acf-relationship-create
Domain Path: /languages/
*/

if ( ! class_exists( 'ACF_Relationship_Create_Pro' ) ) :

    class ACF_Relationship_Create_Pro
    {

        private static $_instance;

        /**
         * Singleton pattern
         * @return ACF_Relationship_Create_Pro
         */
        public static function getInstance() {
            if( self::$_instance instanceof self ) return self::$_instance;
            self::$_instance = new self();
            return self::$_instance;
        }

        /**
         * Avoid creation of an instance from outside
         */
        private function __clone() {}


        /**
         * Private constructor (part of singleton pattern)
         * Declare WordPress Hooks
         */
        private function __construct() {

            // Load the plugin's translated strings
            add_action( 'plugins_loaded', array( $this, 'load_text_domain' ) );

            // Init
            add_action(
                'init',
                array($this, 'init'),
                6 // Right after ACF
            );
        }

        /**
         * Load the plugin's translated strings
         *
         * @hook action plugins_loaded
         */
        public function load_text_domain() {
            load_plugin_textdomain( 'acf-relationship-create', false, plugin_basename( dirname( __FILE__ ) ) . '/languages' );
        }

        /**
         * Check if ACF is installed
         *
         * @return bool
         */
        public static function is_acf_installed() {
            return ( class_exists( 'acf' ) || class_exists( 'ACF' ) );
        }

        /**
         * Check if ACF version is PRO
         *
         * @return bool
         */
        public static function is_acf_pro_version() {
            return class_exists( 'acf_pro' );
        }

        /**
         * Admin notice if ACF version isn't PRO
         *
         * @hook action admin_notices
         * @see ACF_Relationship_Create_Free::register_assets
         */
        public function admin_notice_bad_ACF_version() {
            ?>
            <div class="notice notice-error is-dismissible">
                <p>
                    <?php
                    printf(
                        __( 'You are using the free version of Advanced Custom Fields plugin. You have to downgrade `Advanced Custom Fields Relationship Create` plugin <a href="%s" target="_blank">to the FREE version</a> too!', 'acf-relationship-create' ),
                        'https://wordpress.org/plugins/quick-and-easy-post-creation-for-acf-relationship-fields/'
                    );
                    ?>
                </p>
            </div>
            <?php
        }

        /**
         * Init method, called right after ACF
         *
         * @hook action init
         */
        public function init() {

            // Stop here if ACF isn't installed
            if( !self::is_acf_installed() )
                return;

            // Bail early with an error notice if ACF version isn't PRO
            if( !self::is_acf_pro_version() ) {
                add_action( 'admin_notices', array( $this, 'admin_notice_bad_ACF_version' ) );
                return;
            }



            /**
             * Register scripts
             */

            // Tools
            wp_register_script(
                'acf-relationship-create-pro',
                plugins_url('assets/js/acf-relationship-create' . ( ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min' ) . '.js', __FILE__),
                array( 'jquery' ),
                '3.2.2'
            );

            // Relationship field script
            wp_register_script(
                'acf-relationship-create-pro-field',
                plugins_url('assets/js/acf-relationship-create-field' . ( ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min' ) . '.js', __FILE__),
                array( 'acf-relationship-create-pro', 'thickbox', 'acf-input' ),
                '3.2.2'
            );
            wp_register_script(
                'acf-relationship-create-pro-field-5.7',
                plugins_url('assets/js/acf-relationship-create-field-5.7' . ( ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min' ) . '.js', __FILE__),
                array( 'acf-relationship-create-pro', 'thickbox', 'acf-input' ),
                '3.2.2'
            );

            // iframe script
            wp_register_script(
                'acf-relationship-create-pro-iframe',
                plugins_url('assets/js/acf-relationship-create-iframe' . ( ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min' ) . '.js', __FILE__),
                array( 'acf-relationship-create-pro' ),
                '3.2.2'
            );

            wp_register_style(
                'acf-relationship-create-pro',
                plugins_url( 'assets/css/acf-relationship-create.css', __FILE__ ),
                array( 'acf-input', 'thickbox' ),
                '3.2.2'
            );


            /**
             * Admin enqueue scripts
             */
            add_action(
                'admin_enqueue_scripts',
                array( $this, 'admin_scripts'),
                11 // Right after ACF
            );


            /**
             * ACF Hooks
             */

            // Enqueue assets for ACF fields
            add_action( 'acf/input/admin_enqueue_scripts', array( $this, 'enqueue_acf_assets' ), 11 ); // Just after ACF scripts

            // Alter query params for AJAX calls on ACF Relationship fields
            add_filter( 'acf/fields/relationship/query', array( $this, 'acf_field_alter_ajax' ), 10, 3 );

            // Add new setting for ACF relationship fields
            add_action( 'acf/render_field_settings/type=relationship', array( $this, 'acf_relationship_settings' ), 50);
            add_action( 'acf/render_field_settings/type=post_object', array( $this, 'acf_relationship_settings' ), 50);

            // Alter markup of ACF relationship fields
            add_action( 'acf/render_field/type=relationship', array( $this, 'acf_render_relationship_field' ), 10, 1 );
            add_action( 'acf/render_field/type=post_object', array( $this, 'acf_render_relationship_field' ), 10, 1 );
        }

        public function isGutenbergEnabledOnCPT( $post_type ) {
            $post_type_object = get_post_type_object( $post_type );

            if( empty( $post_type_object ) )
                return false;

            if( !isset( $post_type_object->show_in_rest ) || $post_type_object->show_in_rest !== true )
                return false;

            if( !post_type_supports( $post_type, 'editor' ) )
                return false;

            return true;
        }

        /**
         * Include scripts
         *
         * @hook action admin_enqueue_scripts
         *
         * @param $hook
         */
        public function admin_scripts( $hook ) {
            $include_in = array( 'post.php' );

            // Check if Gutenberg is enabled on this post type.
            // In this only case, post-new.php hook must be included.
            $current_screen = get_current_screen();
            if( !empty( $current_screen->post_type ) && $this->isGutenbergEnabledOnCPT( $current_screen->post_type ) ) {
                $include_in[] = 'post-new.php';
            }

            if( in_array( $hook, $include_in ) ) {
                wp_enqueue_script( 'acf-relationship-create-pro-iframe' );
            }
        }

        /**
         * Enqueue assets for ACF fields
         *
         * @hook action acf/input/admin_enqueue_scripts
         */
        public function enqueue_acf_assets() {

            $script_name = 'acf-relationship-create-pro-field';
            if( defined('ACF_VERSION') && (float) ACF_VERSION >= 5.7 )
                $script_name.= '-5.7';

            include_once( ABSPATH . WPINC . '/version.php' );
            global $wp_version;

            wp_enqueue_script( $script_name );
            wp_localize_script(
                $script_name,
                'acf_relationship_create_pro_field',
                array(
                    'i18n' => array(
                        'no_title' => __( '(No title)', 'acf-relationship-create' )
                    ),
                    'ACF' => array(
                        'version' => ( defined('ACF_VERSION') ? ACF_VERSION : 0 )
                    ),
                    'wp' => array(
                        'version' => $wp_version
                    )
                )
            );

            wp_enqueue_style( 'acf-relationship-create-pro' );
        }

        /**
         * Alter query params for AJAX calls on ACF Relationship fields
         *
         * @hook filter acf/fields/relationship/query
         *
         * @param $args
         * @param $field
         * @param $post_id
         * @return mixed
         */
        public function acf_field_alter_ajax( $args, $field, $post_id ) {
            if( empty( $_POST['acf_relationship_created_post_id'] ) ) return $args;

            $post_params = explode( '-', $_POST['acf_relationship_created_post_id'] );

            $created_post_id = absint( $post_params[0] );
            if( empty( $created_post_id ) ) return $args;

            if( !empty( $args['post_type'] ) ) {
                // We're only looking for this particular post ID
                $args['p'] = $created_post_id;
                unset($args['s']);
                unset($args['tax_query']);
            }

            return $args;
        }

        /**
         * Alter markup of ACF relationship fields
         *
         * @hook action acf/render_field/type=relationship
         *
         * @param $field
         */
        public function acf_render_relationship_field( $field ) {
            if( empty( $field['acf_relationship_create'] ) ) return;

            $post_types = empty( $field['post_type'] ) ? acf_get_post_types() : $field['post_type'];
            if( empty( $post_types ) ) return;

            $tooltip_links = array();
            foreach( $post_types as $post_type ) {
                if( $post_type == 'attachment' ) continue;

                $post_type_obj = get_post_type_object( $post_type );

                if( !user_can( get_current_user_id(), $post_type_obj->cap->create_posts ) )
                    continue;

                $tooltip_links[ $post_type ] = array(
                    'label' => $post_type_obj->labels->singular_name,
                    'url' => admin_url(
                        add_query_arg(
                            array(
                                'acf_rc_original_field_uniqid' => '__acf_rc_original_field_uniqid__', // token that will be replaced dynamically in JS
                                'acf_rc_from_content_type' => '__acf_rc_from_content_type__',
                                'acf_rc_from_content_ID' => '__acf_rc_from_content_ID__',
                                'TB_iframe' => 1 // Force loading as iframe
                            ),
                            'post-new.php?post_type=' . $post_type
                        )
                    )
                );
            }

            $tooltip_links = apply_filters( 'acf-relationship-create/tooltip_links', $tooltip_links, $field );

            if( empty( $tooltip_links ) ) return;
            ?>

            <a href="#" class="acf-relationship-create-link">
                <span class="dashicons dashicons-plus"></span>
                <span class="screen-reader-text"><?php esc_html_e( 'Create', 'acf-relationship-create' ); ?></span>
            </a>

            <div>
                <input type="hidden"
                       name="acf-relationship-created_post_id"
                       data-field-type="<?php echo esc_attr( $field['type'] ); ?>"
                       data-filter="acf_relationship_created_post_id" />
            </div>

            <script type="text-html" class="acf-rc-popup-wrapper">
                <div id="acf-rc-popup"
                     data-field-type="<?php echo esc_attr( $field['type'] ); ?>">
                    <ul>
                        <?php foreach( $tooltip_links as $post_type => $post_type_data ) : ?>
                        <li>
                            <a href="#"
                                data-create-url="<?php echo esc_attr( $post_type_data['url'] ); ?>"
                                title="<?php printf( esc_attr__( 'Create new %s', 'acf-relationship-create' ), $post_type_data['label'] ); ?>">
                                <?php echo $post_type_data['label']; ?>
                                <span class="status"></span>
                            </a>
                        </li>
                        <?php endforeach; ?>
                    </ul>
                    <a href="#" class="focus"></a>
                </div>
            </script>
            <?php
        }

        /**
         * Add new setting for ACF relationship fields
         *
         * @hook action acf/render_field_settings/type=relationship
         * @hook action acf/render_field_settings/type=post_object
         *
         * @param $field
         */
        public function acf_relationship_settings( $field ) {
            acf_render_field_wrap( array(
                'label'			=> __( 'Display a link to create content on the fly?', 'acf-relationship-create' ),
                'instructions'	=> '',
                'type'			=> 'radio',
                'name'			=> 'acf_relationship_create',
                'prefix'		=> $field['prefix'],
                'value'			=> $field['acf_relationship_create'],
                'choices'		=> array(
                    0				=> __("No",'acf'),
                    1				=> __("Yes",'acf'),
                ),
                'layout'		=> 'horizontal',
                'class'			=> 'field-acf_relationship_create'
            ), 'tr');
        }
    }

    ACF_Relationship_Create_Pro::getInstance();
endif;
