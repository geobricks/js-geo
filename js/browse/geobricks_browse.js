define(['jquery',
    'mustache',
    'text!../../html/templates.html',
    'bootstrap'], function ($, Mustache, templates) {

        var CONFIG = {
            lang: 'en',
            placeholder: 'main_content_placeholder',
            template_id: 'navbar'
        }

        var build = function(config) {
            CONFIG = $.extend(true, {}, CONFIG, config);

            require(['i18n!nls/translate'], function (translate) {
                var template = $(templates).filter('#' + CONFIG.template_id).html();
                var view = {
                    company: translate.company,
                    browse: translate.browse,
                    download: translate.download
                };
                var render = Mustache.render(template, view);
                $('#' + CONFIG.placeholder).html("browse");
            });
        }

        return {
            build: build
        };
});