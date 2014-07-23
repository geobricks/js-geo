define(['jquery',
        'mustache',
        'text!../../html/templates.html',
        'bootstrap'], function ($, Mustache, templates) {

    var returnedModule = function (lang) {

        console.log('lang? ' + lang);
        require.config({"locale" : lang});

        var CONFIG = {

        }



        var _name = 'Module: Navbar';

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
                    console.log('Locale? ' + translate.company);
                    $('#navbar_placeholder').html(render);
                });

        };

    };

    return returnedModule;

});