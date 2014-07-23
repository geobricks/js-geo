require.config({

    baseUrl: 'js/libs',

    paths: {
        bootstrap   :   '//netdna.bootstrapcdn.com/bootstrap/3.0.1/js/bootstrap.min',
        backbone    :   '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
        chosen      :   '//fenixapps.fao.org/repository/js/chosen/1.0.0/chosen.jquery.min',
        highcharts  :   '//code.highcharts.com/highcharts',
        jquery      :   '//code.jquery.com/jquery-1.10.1.min',
        loglevel    :   'logger/loglevel.min',
        mustache    :   '//cdnjs.cloudflare.com/ajax/libs/mustache.js/0.8.1/mustache',
        navbar      :   '../navbar/geobricks_navbar',
        browse      :   '../browse/geobricks_browse',
        download      :   '../download/geobricks_download',
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
         'browse',
         'loglevel',
         'navbar',
         'download',
         'bootstrap',
         'chosen',
         'highcharts',
         'domReady!'], function($, Mustache, templates, Backbone, browse, log) {

    log.setLevel(0);

    var ApplicationRouter = Backbone.Router.extend({

        isRendered: false,

        initialize: function (options) {
            Backbone.history.start();
        },

        routes: {
            '(/)home(/):lang': 'home',
            '(/)home(/)': 'home',
            '(/)browse(/):lang': 'browse',
            '(/)browse(/)': 'browse',
            '(/)download(/):lang': 'download',
            '(/)download(/)': 'download',
            '': 'home'
        },

        home: function (lang) {
            this._init(lang);
            $('#main_content_placeholder').html('home');
        },

        browse: function (lang) {
            this._init(lang);
            browse.build({lang: lang});
        },

        download: function(lang) {
            var chart = new FMChartScatter()
        },

        _init: function (lang) {

            if (lang)
                this._initLanguage(lang)

            if (!this.isRendered) {
                this.isRendered = true;
                var template = $(templates).filter('#structure').html();
                var view = {};
                var render = Mustache.render(template, view);
                $('#js_geo_placeholder').html(render);
                var navbar = new Navbar({lang: lang});
                navbar.build();
            }

        },

        _initLanguage: function (lang) {
            require.config({"locale": lang});
        }

    });

    new ApplicationRouter();

});