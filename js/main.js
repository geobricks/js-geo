require.config({

    baseUrl: 'js/libs',

    paths: {
        'bootstrap'     :   '//netdna.bootstrapcdn.com/bootstrap/3.0.1/js/bootstrap.min',
        'chosen'        :   '//fenixapps.fao.org/repository/js/chosen/1.0.0/chosen.jquery.min',
        'highcharts'    :   '//code.highcharts.com/highcharts',
        'jquery'        :   '//code.jquery.com/jquery-1.10.1.min',
        'jquery.i18n'   :   '//fenixapps.fao.org/repository/js/jquery/1.0.9/jquery.i18n.properties-min',
        'mustache'      :   '//cdnjs.cloudflare.com/ajax/libs/mustache.js/0.8.1/mustache'
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
        bootstrap: ['jquery'],
        chosen: ['jquery'],
        highcharts: ['jquery'],
        underscore: ['jquery']
    }

});

require(['jquery', 'mustache', 'text!../../html/templates.html', 'bootstrap', 'jquery.i18n', 'chosen', 'highcharts'], function($, Mustache, templates) {

    var template = $(templates).filter('#structure').html();
    var view = {
        company: 'GeoBricks',
        browse: 'Browse',
        download: 'Download'
    };
    var render = Mustache.render(template, view);
    $('#js_geo_placeholder').append(render);

});