define(['jquery', 'mustache', 'text!../../html/templates.html', 'bootstrap', 'chosen'], function ($, Mustache, templates) {

    var global = this;

    global.DWLD = function() {

        var CONFIG = {
            lang:                                   'en',
            url_data_providers:                     'http://127.0.0.1:5005/schema/sources/',
            url_download:                           'http://127.0.0.1:5005/download/',
            data_provider_config:                   null,
            id_placeholder:                         'main_content_placeholder',
            id_data_providers_placeholder:          'data_providers_placeholder',
            id_data_providers_template:             'data_providers_template',
            id_selectors_placeholder:               'selectors_placeholder',
            id_data_providers:                      'data_providers',
            id_single_generic_dropdown_template:    'single_generic_dropdown_template',
            id_multiple_generic_dropdown_template:  'multiple_generic_dropdown_template',
            id_download_button_template:            'download_button_template',
            id_buttons_placeholder:                 'buttons_placeholder',
            id_download_tabs_template:              'download_tabs',
            layers_list:                            [],
            timers_map:                             {},
            url_gaul_2_modis:                       'http://127.0.0.1:5005/browse/modis/countries/',
            id_gaul_2_modis:                        'gaul_2_modis_list',
            url_progress:                           'http://127.0.0.1:5005/download/progress/'
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

                        /* Load tabs. */
                        view = {
                            selectors_label: translate.selectors_label,
                            progress_label: translate.progress_label
                        };
                        template = $(templates).filter('#' + CONFIG.id_download_tabs_template).html();
                        render = Mustache.render(template, view);

                        /* Add template to the main page. */
                        $('#' + CONFIG.id_placeholder).html(render);

                        /* Load template. */
                        var view = {
                            data_providers_label: translate.data_providers
                        };
                        var template = $(templates).filter('#' + CONFIG.id_data_providers_template).html();
                        var render = Mustache.render(template, view);

                        /* Add template to the main page. */
                        $('#' + CONFIG.id_data_providers_placeholder).html(render);

                        /* Populate drop-down. */
                        var s = '';
                        s += '<option value="null">' + translate.please_select + '</option>';
                        for (var i = 0; i < json.length; i++)
                            s += '<option value="' + json[i].code + '">' + json[i].label + '</option>';
                        $('#' + CONFIG.id_data_providers).html(s);

                        /* Load Chosen plug-in. */
                        require(['chosen'], function (translate) {

                            /* Enable Chosen plug-in. */
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

            /* Read data provider. */
            var data_provider = $('#' + CONFIG.id_data_providers).val();

            /* Add countries for MODIS. */
            switch (data_provider) {
                case 'modis.json':
                    create_modis2gaul_dropdown();
                    break;
            }

            $.ajax({

                url: CONFIG.url_data_providers + data_provider + '/',
                type: 'GET',
                dataType: 'json',

                success: function(response) {

                    /* Convert response in JSON object. */
                    var json = response;
                    if (typeof json == 'string')
                        json = $.parseJSON(response);
                    CONFIG.data_provider_config = json;

                    for (var i = 0 ; i < json.services.filters.length; i++)
                        create_dropdown(json.base_url, json.services.filters[i], i);

                }

            });

        };

        var create_modis2gaul_dropdown = function() {

            $.ajax({

                url: CONFIG.url_gaul_2_modis,
                type: 'GET',
                dataType: 'json',

                success: function(response) {

                    /* Load multi-language plug-in. */
                    require(['i18n!nls/translate'], function (translate) {

                        var json = response;
                        if (typeof json == 'string')
                            json = $.parseJSON(response);

                        /* Load template. */
                        var template;
                        var view;
                        template = $(templates).filter('#' + CONFIG.id_multiple_generic_dropdown_template).html();
                        view = {
                            multiple_generic_dropdown_label: translate.countries,
                            multiple_generic_dropdown_id: CONFIG.id_gaul_2_modis,
                            multiple_generic_dropdown_container_id: CONFIG.id_gaul_2_modis + '_container'
                        };
                        var render = Mustache.render(template, view);
                        $('#' + CONFIG.id_selectors_placeholder).append(render);

                        /* Create drop-down. */
                        var s = '';
                        s += '<option value="null">' + translate.please_select + '</option>';
                        for (var i = 0; i < json.length; i++) {
                            s += '<option value="' + json[i].gaul_code + '" ';
                            s += 'data-from_h="' + json[i].from_h + '" ';
                            s += 'data-to_h="' + json[i].to_h + '" ';
                            s += 'data-from_v="' + json[i].from_v + '" ';
                            s += 'data-to_v="' + json[i].to_v + '" ';
                            s += '>';
                            s += json[i].gaul_label;
                            s += '</option>';
                        }
                        $('#' + CONFIG.id_gaul_2_modis).html(s);
                        $('#' + CONFIG.id_gaul_2_modis).chosen({disable_search_threshold: 10});

                    });

                }

            });

        };

        var create_dropdown = function(base_url, json, index) {

            if (json.parameters.length > 0) {
                for (var i = 0 ; i < json.parameters.length ; i++) {
                    var p = '{' + json.parameters[i].parameter_name + '}';
                    var v = $('#' + json.parameters[i].parameter_value).val()
                    json.path = json.path.replace(p, v);
                }
            }

            $.ajax({

                url: base_url + json.path + '/',
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
                        var view;
                        if (json.selection_type == 'single') {
                            template = $(templates).filter('#' + CONFIG.id_single_generic_dropdown_template).html();
                            view = {
                                single_generic_dropdown_label: json.description[CONFIG.lang],
                                single_generic_dropdown_id: json.id,
                                single_generic_dropdown_container_id: json.id + '_container'
                            };
                        } else if (json.selection_type == 'multiple') {
                            template = $(templates).filter('#' + CONFIG.id_multiple_generic_dropdown_template).html();
                            view = {
                                multiple_generic_dropdown_label: json.description[CONFIG.lang],
                                multiple_generic_dropdown_id: json.id,
                                multiple_generic_dropdown_container_id: json.id + '_container'
                            };
                        }
                        var render = Mustache.render(template, view);
                        $('#' + CONFIG.id_selectors_placeholder).append(render);

                        /* Create drop-down. */
                        var s = '';
                        s += '<option value="null">' + translate.please_select + '</option>';
                        for (var i = 0; i < inner_json.length; i++)
                            s += '<option value="' + inner_json[i][json.payload.id] + '">' + inner_json[i][json.payload.label] + '</option>';

                        $('#' + json.id).html(s);

                        /* Load Chosen plug-in. */
                        require(['i18n!nls/translate'], function (translate) {

                            /* Enable Shosen plug-in. */
                            $('#' + json.id).chosen({disable_search_threshold: 10});

                            /* Add change listener. */
                            if (json.services != null) {
                                $('#' + json.id).on('change', function () {
                                    for (var z = 0; z < json.services.length; z++)
                                        create_dropdown(base_url, json.services[z], z);
                                });
                            }

                            /* Add download button. */
                            else {

                                /* Load template. */
                                var view = {
                                    download_label: translate.download_label
                                };
                                var template = $(templates).filter('#' + CONFIG.id_download_button_template).html();
                                var render = Mustache.render(template, view);

                                /* Add button to the interface. */
                                $('#' + CONFIG.id_buttons_placeholder).empty();
                                $('#' + CONFIG.id_buttons_placeholder).html(render);
                                $('#' + CONFIG.id_buttons_placeholder).unbind();
                                $('#' + CONFIG.id_buttons_placeholder).click(function() {
                                    download_layers();
                                });

                            }

                        });

                    });

                }

            });
        };

        var download_layers = function() {

            /* Fill parameters with values from the drop-downs. */
            if (CONFIG.data_provider_config.services.layers.parameters.length > 0) {
                for (var i = 0 ; i < CONFIG.data_provider_config.services.layers.parameters.length ; i++) {
                    var p = '{' + CONFIG.data_provider_config.services.layers.parameters[i].parameter_name + '}';
                    var v = $('#' + CONFIG.data_provider_config.services.layers.parameters[i].parameter_value).val()
                    CONFIG.data_provider_config.services.layers.path = CONFIG.data_provider_config.services.layers.path.replace(p, v);
                }
            }

            /* Build URL. */
            var url = CONFIG.data_provider_config.base_url + CONFIG.data_provider_config.services.layers.path + '/';

            var data_provider = $('#' + CONFIG.id_data_providers).val().substring(0, $('#' + CONFIG.id_data_providers).val().indexOf('.'));
            switch (data_provider) {
                case 'modis':
                    var countries = $('#gaul_2_modis_list').find(':selected');
                    var from_h = $(countries[0]).data('from_h');
                    var to_h = $(countries[0]).data('to_h');
                    var from_v = $(countries[0]).data('from_v');
                    var to_v = $(countries[0]).data('to_v');
                    url += from_h + '/';
                    url += to_h + '/';
                    url += from_v + '/';
                    url += to_v + '/';
            }

            $.ajax({

                url: url,
                type: 'GET',
                dataType: 'json',

                success: function (response) {

                    var json = response;
                    if (typeof json == 'string')
                        json = $.parseJSON(response);
                    var data = {};
                    data.file_paths_and_sizes = json;
                    data.filesystem_structure = {
                        'product': $('#list_products').val(),
                        'year': $('#list_years_from').val(),
                        'day': $('#list_days_from').val()
                    };

                    $.ajax({
                        url: CONFIG.url_download + data_provider + '/',
                        type: 'POST',
                        dataType: 'json',
                        data: JSON.stringify(data),
                        contentType: 'application/json',
                        success: function (response) {
                            CONFIG.source_path = response.source_path
                            $('#download_tab a[href="#tab_progress"]').tab('show')
                            progress(json, data_provider);
                        }
                    });

                }

            });

        };

        var progress = function(json, data_provider) {
            clean_progress_tab();
            for (var i = 0 ; i < json.length ; i++) {
                var view = {
                    label: (1 + i) + ') ' + json[i]['label'],
                    id: json[i]['file_name'],
                    id_percentage: json[i]['file_name'] + '_percentage'
                };
                var template = $(templates).filter('#loading_bar_template').html();
                var render = Mustache.render(template, view);
                $('#tab_progress').append(render);
                setTimeout(init_progress(json[i]['file_name']), 5000);
            }
        };

        var init_progress = function(filename) {
            console.log('init progress for ' + filename + ' @ ' + (new Date().getTime()));
            CONFIG.timers_map[filename] = setInterval(function (id) {
                $.ajax({
                    url: CONFIG.url_progress + id + '/',
                    type: 'GET',
                    success: function (progress) {
                        $(document.getElementById(id)).attr('aria-valuenow', progress.progress);
                        $(document.getElementById(id)).css('width', progress.progress + '%');
                        if (!isNaN(parseFloat(progress.progress))) {
                            var msg = '';
                            msg += '[' + (parseFloat(progress.download_size) / 1000000).toFixed(2) + ' / ' + (parseFloat(progress.total_size) / 1000000).toFixed(2) + '] ';
                            msg += '<b>' + progress.progress + '%</b>';
                            $(document.getElementById(id + '_percentage')).html(msg);
                        }
                        if (parseFloat(progress.progress) >= 100) {
                            clearInterval(CONFIG.timers_map[id]);
                            delete CONFIG.timers_map[id];
                            $(document.getElementById(id)).removeClass('progress-bar-warning');
                            $(document.getElementById(id)).addClass('progress-bar-success');
                            if (Object.keys(CONFIG.timers_map).length == 0)
                                processing(data_provider);
                        }
                    }
                });
            }, 1000, filename);
        };

        var clean_progress_tab = function() {
            $('#tab_progress').empty();
            $('#tab_progress').append('<br>');
            for (var key in CONFIG.timers_map)
                delete CONFIG.timers_map[key]
        };

        var processing = function(data_provider) {
            var data = {};
            data.source_path = CONFIG.source_path;
            data.pixel_size = 0.004166665;
            $.ajax({
                url: 'http://127.0.0.1:5005/download/process/' + data_provider + '/',
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: function (response) {
                    console.log(response);
                }
            });
        };

        return {
            init: init
        };

    };

});