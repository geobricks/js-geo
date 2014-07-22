require.config({

    baseUrl: 'js',

    paths: {
        'jquery': '//code.jquery.com/jquery-1.10.1.min.js'
    },

    shim: {
        'i18n': {
            deps: ['jquery']
        }
    }

});

require(['jquery', 'js-geo'], function($, JSGEO) {
    console.log('jQuery version:', $.fn.jquery);
});