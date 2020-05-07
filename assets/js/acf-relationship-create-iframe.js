(function ($, acf_relationship_create, wp, undefined) {
    $(document).ready(function () {
        // Get the ACF field identifier from the parent window
        var parent_acf_field_identifier = acf_relationship_create.get_parent_acf_field_identifier();
        if (!parent_acf_field_identifier) return;

        var $parent_jquery = acf_relationship_create.get_parent_jQuery();
        if (!$parent_jquery) return;

        function callback(post_id, post_title) {
            $parent_jquery("body").trigger("acf-relationship-create/created", [
                parent_acf_field_identifier, // the original ACF field identifier
                {
                    post_id: parseInt(post_id),
                    post_type: $('form#post input[name="post_type"]').val(),
                    post_title: post_title,
                },
            ]);
        }

        // WP >= 5: Gutenberg save post using a call to API in AJAX
        if (typeof wp === "object" && typeof wp.apiFetch === "function") {
            wp.apiFetch.use(function (options, next) {
                const result = next(options);

                result.then(function () {
                    if (
                        typeof options.path !== "string" ||
                        typeof options.method !== "string" ||
                        options.method !== "PUT"
                    )
                        return;

                    callback(options.data.id, options.data.title);
                });
                return result;
            });
        }

        // Compatibility with WP < 5
        // Get current post ID and trigger an event to the parent window
        var $post_id_input = $('form#post input[name="post_ID"]');
        if ($post_id_input.length === 1 && $post_id_input.val() != "") {
            callback(
                $post_id_input.val(),
                $('form#post input[name="post_title"]').val()
            );
        }
    });
})(jQuery, window.acf_relationship_create || {}, window.wp || {});
