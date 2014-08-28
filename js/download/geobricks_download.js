define(['jquery', 'mustache', 'text!../../html/templates.html', 'bootstrap', 'chosen'], function ($, Mustache, templates) {

    var global = this;

    global.DWLD = function() {

        var CONFIG = {
            lang:                                   'en',
            url_data_providers:                     'http://127.0.0.1:5005/schema/sources/',
            url_download:                           'http://127.0.0.1:5005/download/',
            url_processing:                         'http://127.0.0.1:5005/download/process/',
            url_gaul_2_modis:                       'http://127.0.0.1:5005/browse/modis/countries/',
            url_progress:                           'http://127.0.0.1:5005/download/progress/',
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
            id_gaul_2_modis:                        'gaul_2_modis_list',
            layers_list:                            [],
            timers_map:                             {},
            months:                                 [],
            source_paths:                           {},
            data_provider_config:                   null
        };

        var init = function(config) {

            /* Extend default configuration. */
            CONFIG = $.extend(true, {}, CONFIG, config);

            /* Fetch data providers. */
            init_data_providers();

        };

        var load_month_names = function() {
            require(['i18n!nls/translate'], function (translate) {
                CONFIG.months.push(translate.jan);
                CONFIG.months.push(translate.feb);
                CONFIG.months.push(translate.mar);
                CONFIG.months.push(translate.apr);
                CONFIG.months.push(translate.may);
                CONFIG.months.push(translate.jun);
                CONFIG.months.push(translate.jul);
                CONFIG.months.push(translate.aug);
                CONFIG.months.push(translate.sep);
                CONFIG.months.push(translate.oct);
                CONFIG.months.push(translate.nov);
                CONFIG.months.push(translate.dec);
            })
        };

        var init_data_providers = function() {

            $.ajax({

                url: CONFIG.url_data_providers,
                type: 'GET',
                dataType: 'json',

                success: function(response) {

                    /* Load multi-language plug-in. */
                    require(['i18n!nls/translate'], function (translate) {

                        /* Load month names. */
                        load_month_names();

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

            /* Clean the area. */
            $('#selectors_placeholder').empty();
            $('#gaul2modis_placeholder').empty();

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

            $('#gaul2modis_placeholder').empty();

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
                        $('#gaul2modis_placeholder').append(render);

                        /* Create drop-down. */
                        var s = '';
                        s += '<option value="null">' + translate.please_select + '</option>';
                        for (var i = 0; i < json.length; i++) {
                            s += '<option value="' + json[i].gaul_code + '" ';
                            s += 'data-from_h="' + json[i].from_h + '" ';
                            s += 'data-to_h="' + json[i].to_h + '" ';
                            s += 'data-from_v="' + json[i].from_v + '" ';
                            s += 'data-to_v="' + json[i].to_v + '" ';
                            s += 'data-gaul_code="' + json[i].gaul_code + '" ';
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

            var random_id = create_random_id();
            $('#' + CONFIG.id_selectors_placeholder).append('<div id="' + random_id + '"><i class="fa fa-refresh fa-spin"></i></div>');

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
                                single_generic_dropdown_label_id: json.id + '_label',
                                single_generic_dropdown_container_id: json.id + '_container'
                            };
                        } else if (json.selection_type == 'multiple') {
                            template = $(templates).filter('#' + CONFIG.id_multiple_generic_dropdown_template).html();
                            view = {
                                multiple_generic_dropdown_label: json.description[CONFIG.lang],
                                multiple_generic_dropdown_id: json.id,
                                multiple_generic_dropdown_label_id: json.id + '_label',
                                multiple_generic_dropdown_container_id: json.id + '_container'
                            };
                        }
                        var render = Mustache.render(template, view);
                        $('#' + random_id).html(render);

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
                                    for (var z = 0; z < json.services.length; z++) {
                                        $('#' + json.services[z].id).remove();
                                        $('#' + json.services[z].id + '_chosen').remove();
                                        $('#' + json.services[z].id + '_label').remove();
                                        create_dropdown(base_url, json.services[z], z);
                                    }
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

            /* Build countries list, comma separated. */
            var data_provider = $('#' + CONFIG.id_data_providers).val().substring(0, $('#' + CONFIG.id_data_providers).val().indexOf('.'));
            switch (data_provider) {
                case 'modis':
                    var countries = $('#gaul_2_modis_list').find(':selected');
                    var s = '';
                    for (var i = 0 ; i < countries.length ; i++) {
                        s += $(countries[i]).data('gaul_code');
                        if (i < countries.length - 1)
                            s += ',';
                    }
                    url += s + '/';
            }

            /* Fetch time interval. */
            var from_day = parseInt($('#list_days_from').val());
            var to_day = null;
            try {
                to_day = parseInt($('#list_days_to').val());
            } catch (e) {
                to_day = from_day;
            }
            var total_tabs = 1 + (to_day - from_day) / 16;

            /* Clear existing tabs and timers. */
            for (var key in CONFIG.timers_map) {
                for (var key2 in CONFIG.timers_map[key])
                    clearInterval(CONFIG.timers_map[key][key2]);
                delete CONFIG.timers_map[key];
            }
            var lis = $('#download_tab').children('li');
            if (lis.length > 0)
                for (var i = 1 ; i < lis.length ; i++)
                    $(lis[i]).remove();
            $('#download_tab a:first').tab('show');

            /* Create a tab for each date. */
            for (var i = 0 ; i < total_tabs ; i++) {
                var s = '';
                var day = from_day + i * 16;
                var d = new Date(parseInt($('#list_years_from').val()), 0, day);
                s += d.getDate() + ' ' + CONFIG.months[d.getMonth()] + ' ' + $('#list_years_from').val();
                $('#download_tab').append('<li id="' + i + '_li"><a role="tab" data-toggle="tab" href="#tab_' + i + '">' + s + '</a></li>');
                $('#tab_contents').append('<div class="tab-pane" id="tab_' + i + '"><br></div>');
                init_tab(url, i, d, data_provider);
            }

        };

        var init_tab = function(url, tab_index, date, data_provider) {

            /* Replace the correct day in the URL. */
            url = url.replace($('#list_days_from').val(), create_day_of_the_year(date));

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
                    data.tab_id = 'tab_' + tab_index;
                    data.filesystem_structure = {
                        'product': $('#list_products').val(),
                        'year': $('#list_years_from').val(),
                        'day': create_day_of_the_year(date)
                    };

                    $.ajax({
                        url: CONFIG.url_download + data_provider + '/',
                        type: 'POST',
                        dataType: 'json',
                        data: JSON.stringify(data),
                        contentType: 'application/json',
                        success: function (response) {
                            $('#download_tab a[href="#tab_0"]').tab('show');
                            CONFIG.source_paths['tab_' + tab_index] = response.source_path;
                            progress(json, data_provider, 'tab_' + tab_index);
                        }
                    });

                }

            });

        };

        var create_day_of_the_year = function(date) {
            var start = new Date(date.getFullYear(), 0, 1);
            var day = 1 + Math.ceil((date - start) / 86400000);
            if (day < 10)
                day = '00' + day;
            else if (day < 100)
                day = '0' + day;
            return day;
        };

        var progress = function(json, data_provider, tab_id) {
            clean_progress_tab(tab_id);
            for (var i = 0 ; i < json.length ; i++) {
                var view = {
                    label: (1 + i) + ') ' + json[i]['label'],
                    id: json[i]['file_name'],
                    id_percentage: json[i]['file_name'] + '_percentage'
                };
                var template = $(templates).filter('#loading_bar_template').html();
                var render = Mustache.render(template, view);
                $('#' + tab_id).append(render);
                setTimeout(init_progress(json[i]['file_name'], data_provider, tab_id), 5000);
            }
            $('#' + tab_id).append('<div id="' + tab_id + '_processing_result">Processing Result</div>');
        };

        var init_progress = function(filename, data_provider, tab_id) {
            if (CONFIG.timers_map[tab_id] == null)
                CONFIG.timers_map[tab_id] = {};
            CONFIG.timers_map[tab_id][filename] = setInterval(function (id) {
                $.ajax({
                    url: CONFIG.url_progress + tab_id + '/' + id + '/',
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
                            clearInterval(CONFIG.timers_map[tab_id][id]);
                            delete CONFIG.timers_map[tab_id][id];
                            $(document.getElementById(id)).removeClass('progress-bar-warning');
                            $(document.getElementById(id)).addClass('progress-bar-success');
                            if (Object.keys(CONFIG.timers_map[tab_id]).length == 0)
                                processing(data_provider, tab_id);
                        }
                    }
                });
            }, 1000, filename);
        };

        var clean_progress_tab = function(tab_id) {
            $('#' + tab_id).empty();
            $('#' + tab_id).append('<br>');
            for (var key in CONFIG.timers_map[tab_id])
                delete CONFIG.timers_map[tab_id][key]
        };

        var processing = function (data_provider, tab_id) {
            var data = {};
            data.source_path = CONFIG.source_paths[tab_id];
            data.pixel_size = 0.004166665;
            $.ajax({
                url: CONFIG.url_processing + data_provider + '/',
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: function (response) {
                    console.log(response);
                    $('#' + tab_id + '_processing_result').html(response);
                }
            });
        };

        var create_random_id = function() {
            return 'placeholder_' + parseInt(1000000 * Math.random());
        };

        return {
            init: init,
            create_random_id: create_random_id
        };

    };

});