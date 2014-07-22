require.config({

    baseUrl: 'js/libs',

    paths: {
        'jquery': '//code.jquery.com/jquery-1.10.1.min',
        'jquery.i18n': '//fenixapps.fao.org/repository/js/jquery/1.0.9/jquery.i18n.properties-min',
        'bootstrap': '//netdna.bootstrapcdn.com/bootstrap/3.0.1/js/bootstrap.min',
        'chosen': '//fenixapps.fao.org/repository/js/chosen/1.0.0/chosen.jquery.min',
        'underscore': '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
        'highcharts': '//code.highcharts.com/highcharts'
    },

    shim: {
        'jquery.i18n': {
            deps: ['jquery'],
            exports: 'i18n',
            init: function() {
                $.i18n.properties({
                    name: 'I18N',
                    path: 'I18N/',
                    mode: 'both',
                    language: 'en'
                });
            }
        },
        'bootstrap': {
            deps: ['jquery']
        },
        chosen: {
            deps: ['jquery']
        },
        underscore: {
            deps: ['jquery']
        },
        highcharts: {
            deps: ['jquery']
        }
    }

});

require(['jquery', 'bootstrap', 'jquery.i18n', 'chosen', 'underscore', 'highcharts'], function($) {
    console.log('jQuery version:', $.fn.jquery);
});