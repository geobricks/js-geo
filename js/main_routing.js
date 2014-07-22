require.config({
    locale: "",

    baseUrl: 'js/libs',

    paths: {
        jquery: '//code.jquery.com/jquery-1.10.1.min',
        loglevel: 'logger/loglevel.min',
        backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
        underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
        'jquery.i18n': '//fenixapps.fao.org/repository/js/jquery/1.0.9/jquery.i18n.properties-min',
        bootstrap: '//netdna.bootstrapcdn.com/bootstrap/3.0.1/js/bootstrap.min',
        chosen: '//fenixapps.fao.org/repository/js/chosen/1.0.0/chosen.jquery.min',
        highcharts: '//code.highcharts.com/highcharts'
    },

    shim: {
        i18n: {
            deps: ['jquery']
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        underscore: {
            exports: '_'
        }
    }

});

require(['jquery','backbone', 'i18n', 'loglevel', 'domReady!'], function ($, Backbone, i18n, log) {
    //This function is called once the DOM is ready,
    //notice the value for 'domReady!' is the current
    //document.
    //log.setLevel('silent')
    log.setLevel(0)

    var ApplicationRouter = Backbone.Router.extend({

        initialize: function (options) {
            Backbone.history.start();
        },
        //map url routes to contained methods
        routes: {
            "": "home",
            "home": "home",
            "about": "about",
            "contact/:id": "contact"
        },

        home: function() {
            log.info("home");

            require(
//                {locale: 'it-IT'},
                ["i18n!../../I18N/str"], function (i18n) {
                 log.info("home2");
                log.info(i18n);
                log.info(i18n.welcome);
            });

        },

        about: function() {
            log.warn("about");
        },

        contact: function(id) {
            // l.info(id)
        }
    });

    new ApplicationRouter();
});