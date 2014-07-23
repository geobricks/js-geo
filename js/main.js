require.config({

    baseUrl: 'js/libs',

    paths: {
        bootstrap       :   '//netdna.bootstrapcdn.com/bootstrap/3.0.1/js/bootstrap.min',
        backbone        :   '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
        chosen          :   '//fenixapps.fao.org/repository/js/chosen/1.0.0/chosen.jquery.min',
        highcharts      :   '//code.highcharts.com/highcharts',
        jquery          :   '//code.jquery.com/jquery-1.10.1.min',
        loglevel        :   'logger/loglevel.min',
        mustache        :   '//cdnjs.cloudflare.com/ajax/libs/mustache.js/0.8.1/mustache',
        navbar          :   '../navbar/geobricks_navbar',
        browse          :   '../browse/geobricks_browse',
        download        :   '../download/geobricks_download',
        underscore      :   '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',

        // fenix-map-js
        'import-dependencies'   :   'http://fenixapps.fao.org/repository/js/FENIX/utils/import-dependencies-1.0',
        'jquery-ui'             :   '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min',
        'leaflet'               :   'http://fenixapps.fao.org/repository/js/leaflet/0.7.2/leaflet',
        'jquery.power.tip'      :   'http://fenixapps.fao.org/repository/js/jquery.power.tip/1.1.0/jquery.powertip.min',
        'jquery-ui'             :   'http://fenixapps.fao.org/repository/js/jquery-ui/1.10.3/jquery-ui-1.10.3.custom.min',
        'jquery.i18n.properties':   'http://fenixapps.fao.org/repository/js/jquery/1.0.9/jquery.i18n.properties-min',
        'jquery.hoverIntent'    :   'http://fenixapps.fao.org/repository/js/jquery.hoverIntent/1.0/jquery.hoverIntent',

        'fenix-map'             :   'http://localhost:7070/fenix-map-js/fenix-map-min',
        'fenix-map-config'      :   'http://localhost:7070/fenix-map-js/fenix-map-config'
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
        },
        

        'jquery-ui' :  {
            deps: ['jquery']
        },
        'fenix-map':  {
            deps: ['jquery', 'jquery-ui', 'fenix-map-config', 'import-dependencies', 'jquery.power.tip', 'jquery.i18n.properties', 'jquery.hoverIntent']
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
         'fenix-map',
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