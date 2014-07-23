require.config({

    baseUrl: 'js/libs',

    paths: {
        'bootstrap'     :   '//netdna.bootstrapcdn.com/bootstrap/3.0.1/js/bootstrap.min',
        'chosen'        :   '//fenixapps.fao.org/repository/js/chosen/1.0.0/chosen.jquery.min',
        'highcharts'    :   '//code.highcharts.com/highcharts',
        'jquery'        :   '//code.jquery.com/jquery-1.10.1.min',
        'mustache'      :   '//cdnjs.cloudflare.com/ajax/libs/mustache.js/0.8.1/mustache'
    },

    shim: {
        bootstrap: ['jquery'],
        chosen: ['jquery'],
        highcharts: ['jquery']
    }

});

require({locale: 'it-IT'},
        ['jquery',
         'mustache',
         'text!../../html/templates.html',
         'i18n!nls/translate',
         'bootstrap',
         'chosen',
         'highcharts'], function($, Mustache, templates, translate) {

    var template = $(templates).filter('#structure').html();
    var view = {
        company: translate.company,
        browse: translate.browse,
        download: translate.download
    };
    var render = Mustache.render(template, view);
    $('#js_geo_placeholder').append(render);

});