define(['jquery',
    'mustache',
    'text!../../html/templates.html',
    'bootstrap'], function ($, Mustache, templates) {

    var returnedModule = function (lang) {

        require.config({"locale" : lang});

        var _name = 'Module: Browse';

        this.getName = function () {
            return _name;
        };

        this.build_navbar = function() {
            require(
                ['i18n!nls/translate'], function (translate) {
                    var template = $(templates).filter('#navbar').html();
                    var view = {
                        company: translate.company,
                        browse: translate.browse,
                        download: translate.download
                    };
                    var render = Mustache.render(template, view);
                    $('#main_content_placeholder').html(_name);
                });

        };

    };

    return returnedModule;

});