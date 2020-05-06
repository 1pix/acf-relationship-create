=== Quick and Easy Post creation for ACF Relationship Fields PRO ===
Contributors: cyrilbatillat
Donate link: http://bazalt.fr
Tags:  acf, advanced custom fields, add-on, relationship, field, post creation, shortcut, workflow, admin, administration, wordpress
Requires at least: 4.5
Tested up to: 4.9.7
Stable tag: trunk
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Quick & Easy post creation on your Advanced Custom Fields (ACF) Relationship Fields (PRO version)

== Description ==

This plugin is a excellent companion of Advanced Custom Fields PRO.

When dealing with relationship fields (which links a post to one or multiple other posts), you often stumble on having to link to a post that does not exist yet. This is a frustrating and time-consuming experience: you have to save the content you were working on, then create the new post, and finally reload your primary content to be able to link to the newly created post.

This plugin simplifies this process by allowing you to create the related posts on the fly.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/` directory, or install the plugin through the WordPress plugins screen directly.
1. Activate the plugin through the 'Plugins' screen in WordPress

=== Once activated ===
You can enable on-the-fly post creation on a field basis.
1. In your ACF Field Groups, locate the field you want to enable on-the-fly post creation.
1. Check "Yes" on the field setting "Display a link to create content on the fly?"
1. That's all. Now, while editing your content, you'll see a button next to your field to create a new post (see Screenshots section)


== Frequently Asked Questions ==

= Is it compatible with Advanced Custom Fields Free version? =

No. This plugin is only compatible with ACF PRO. If you are using ACF free plugin, please download [the free version of this plugin](https://wordpress.org/plugins/quick-and-easy-post-creation-for-acf-relationship-fields/)


== Screenshots ==

1. Enable post creation on your Relationship Field, in ACF settings
1. Notice the button that allows you to create a new content (in this case, a new album)
2. The new post can be created in a dedicated popup. Fill the fields as you would have done normally, and publish the post.
3. The new post is added in your relationship field


== Changelog ==

= 3.2.2 = 2019-07-19
* Remove error_log debug messages

= 3.2.1 = 2019-07-12
* Fix PHP Warning when trying to detect Gutenberg on Post Type

= 3.2 = 2019-03-27
* Bug fix: Gutenberg was not handled in some contexts

= 3.1 = 2018-07-31
* Compatibility with WordPress 5

= 3.0 = 2018-01-31
* Compatibility with ACF Pro 5.7

= 2.2 = 2017-08-05
* Enhancement: new filter 'acf-relationship-create/tooltip_links' to customize tooltip links

= 2.1 = 2017-02-09
* Enhancement: Greater lightbox while creating new content.
* Enhancement: Clicking on the "+" button directly opens the lightbox when there's only one content type available.

= 2.0 = 2016-09-13
* Now supporting 'Post Object' fields ! :)
* Fix CSS bugs in tooltip positioning

= 1.1 =
* Bug fix: plugin was not working with relationship fields on attachments (in media modal)

= 1.0 = 2016-07-28
First release
