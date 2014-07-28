define(['jquery', 'mustache', 'text!../../html/templates.html', 'bootstrap', 'chosen'], function ($, Mustache, templates) {

    var global = this;

    global.DWLD = function() {

        var CONFIG = {
            lang:                                   'en',
            url_data_providers:                     'http://127.0.0.1:5005/schema/sources/',
            id_placeholder:                         'main_content_placeholder',
            id_data_providers_template:             'data_providers_template',
            id_data_providers:                      'data_providers',
            id_single_generic_dropdown_template:    'single_generic_dropdown_template',
            id_multiple_generic_dropdown_template:  'multiple_generic_dropdown_template'
        };

        var init = function(config) {

            /* Extend default configuration. */
            CONFIG = $.extend(true, {}, CONFIG, config);

            /* Fetch data providers. */
            init_data_providers();

        };

        var init_data_providers = function() {

            $.ajax({

                url: CONFIG.url_data_providers,
                type: 'GET',
                dataType: 'json',

                success: function(response) {

                    /* Load multi-language plug-in. */
                    require(['i18n!nls/translate'], function (translate) {

                        /* Convert response in JSON object. */
                        var json = response;
                        if (typeof json == 'string')
                            json = $.parseJSON(response);

                        /* Load template. */
                        var view = {
                            data_providers_label: translate.data_providers
                        };
                        var template = $(templates).filter('#' + CONFIG.id_data_providers_template).html();
                        var render = Mustache.render(template, view);

                        /* Add template to the main page. */
                        $('#' + CONFIG.id_placeholder).html(render);

                        /* Populate drop-down. */
                        var s = '';
                        s += '<option value="null">' + translate.please_select + '</option>';
                        for (var i = 0; i < json.length; i++)
                            s += '<option value="' + json[i].code + '">' + json[i].label + '</option>';
                        $('#' + CONFIG.id_data_providers).html(s);

                        /* Load Chosen plug-in. */
                        require(['chosen'], function (translate) {

                            /* Enable Shosen plug-in. */
                            $('#' + CONFIG.id_data_providers).chosen({disable_search_threshold: 10});

                            /* Add change listener. */
                            $('#' + CONFIG.id_data_providers).on('change', function () {
                                change_data_provider();
                            });

                        });


                    });

                }

            });

        };

        var change_data_provider = function() {

            $.ajax({

                url: CONFIG.url_data_providers + $('#' + CONFIG.id_data_providers).val() + '/',
                type: 'GET',
                dataType: 'json',

                success: function(response) {

                    /* Convert response in JSON object. */
                    var json = response;
                    if (typeof json == 'string')
                        json = $.parseJSON(response);

                    for (var i = 0 ; i < json.services.length; i++)
                        create_dropdown(json, i);

                }

            });

        };

        var create_dropdown = function(json, index) {

            console.log(json);
            console.log(json.services[index].selection_type);

            if (json.services[index].parameters.length > 0) {
                for (var i = 0 ; i < json.services[index].parameters.length ; i++) {
                    var p = '{' + json.services[index].parameters[i].parameter_name + '}';
                    var v = $('#' + json.services[index].parameters[i].parameter_value).val()
                    json.services[index].path = json.services[index].path.replace(p, v);
                }
            }

            $.ajax({

                url: json.base_url + json.services[index].path + '/',
                type: 'GET',
                dataType: 'json',

                success: function(response) {

                    /* Load multi-language plug-in. */
                    require(['i18n!nls/translate'], function (translate) {

                        /* Convert response in JSON object. */
                        var inner_json = response;
                        if (typeof inner_json == 'string')
                            inner_json = $.parseJSON(response);

                        /* Load template. */
                        var template;
                        if (json.services[index].selection_type == 'single') {
                            template = $(templates).filter('#' + CONFIG.id_single_generic_dropdown_template).html();
                        } else if (json.services[index].selection_type == 'multiple') {
                            template = $(templates).filter('#' + CONFIG.id_multiple_generic_dropdown_template).html();
                        }
                        var view = {
                            single_generic_dropdown_label: json.services[index].description[CONFIG.lang],
                            single_generic_dropdown_id: json.services[index].id
                        };
                        var render = Mustache.render(template, view);
                        $('#' + CONFIG.id_placeholder).append(render);

                        /* Create drop-down. */
                        var s = '';
                        s += '<option value="null">' + translate.please_select + '</option>';
                        for (var i = 0; i < inner_json.length; i++)
                            s += '<option value="' + inner_json[i][json.services[index].payload.id] + '">' + inner_json[i][json.services[index].payload.label] + '</option>';

                        $('#' + json.services[index].id).html(s);

                        /* Load Chosen plug-in. */
                        require(['chosen'], function (translate) {

                            /* Enable Shosen plug-in. */
                            $('#' + json.services[index].id).chosen({disable_search_threshold: 10});

                            /* Add change listener. */
                            $('#' + json.services[index].id).on('change', function () {
                                var tmp = {};
                                tmp.base_url = json.base_url;
                                tmp.services = json.services[index].services;
                                create_dropdown(tmp, 0);
                            });

                        });

                    });

                }

            });
        };

        return {
            init: init
        };

    };

});