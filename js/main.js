require.config({

    baseUrl: 'js/libs',

    paths: {
        bootstrap   :   '//netdna.bootstrapcdn.com/bootstrap/3.0.1/js/bootstrap.min',
        backbone    :   '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
        chosen      :   '//fenixapps.fao.org/repository/js/chosen/1.0.0/chosen.jquery.min',
        highcharts  :   '//code.highcharts.com/highcharts',
        jquery      :   '//code.jquery.com/jquery-1.10.1.min',
        mustache    :   '//cdnjs.cloudflare.com/ajax/libs/mustache.js/0.8.1/mustache',
        navbar      :   '../navbar/geobricks_navbar',
        browse      :   '../browse/geobricks_browse',
        underscore  :   '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min'
    },

    shim: {
        bootstrap: ['jquery'],
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        chosen: ['jquery'],
        highcharts: ['jquery'],
        underscore: {
            exports: '_'
        }
    }

});

require(['jquery',
         'mustache',
         'text!../../html/templates.html',
         'backbone',
         'navbar',
         'browse',
         'bootstrap',
         'chosen',
         'highcharts'], function($, Mustache, templates, Backbone, navbar_def, browse_def) {

        var ApplicationRouter = Backbone.Router.extend({

            initialize: function (options) {
                Backbone.history.start();
            },

            routes: {
                '(/)home(/):lang': 'home',
                '(/)home(/)': 'home',
                '(/)browse(/):lang': 'browse',
                '(/)browse(/)': 'browse',
                '': 'home'
            },

            home: function(lang) {
                console.log('home:');
                this._init(lang);
            },

            browse: function(lang) {
                console.log('browse:');
                this._init(lang);
                var browse = new browse_def(lang);
                browse.build_navbar();
            },

            _init: function(lang) {
                if ( lang )
                    this._initLanguage(lang)

                var template = $(templates).filter('#structure').html();
                var view = {};
                var render = Mustache.render(template, view);
                $('#js_geo_placeholder').html(render);

                var navbar = new navbar_def(lang);
                navbar.build_navbar();

            },

            _initLanguage: function (lang) {
                require.config({"locale" : lang});
            }

        });

        new ApplicationRouter();





});