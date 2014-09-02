define(['jquery', 'mustache', 'text!../../html/templates.html', 'bootstrap', 'chosen'], function ($, Mustache, templates) {

    var global = this;

    global.SCHEDULER = function() {

        var CONFIG = {
            lang:                                   'en',
            url_data_providers:                     'http://127.0.0.1:5005/schema/sources/',
            url_download:                           'http://127.0.0.1:5005/download/',
            url_bulk_progress:                      'http://127.0.0.1:5005/download/bulk/progress/',
            url_bulk_download:                      'http://127.0.0.1:5005/download/bulk/trmm2/',
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
            data_provider:                          null,
            data_provider_filename:                 null,
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
                            s += '<option value="' + json[i].code + '">' + json[i].label.toUpperCase() + '</option>';
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
            CONFIG.data_provider_filename = $('#' + CONFIG.id_data_providers).val();
            CONFIG.data_provider = CONFIG.data_provider_filename.substring(0, CONFIG.data_provider_filename.indexOf('.json'));

            /* Add countries for MODIS. */
            switch (CONFIG.data_provider) {
                case 'modis':
                    create_modis2gaul_dropdown();
                    break;
            }

            $.ajax({

                url: CONFIG.url_data_providers + CONFIG.data_provider_filename + '/',
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
            $('#' + CONFIG.id_selectors_placeholder).append('<div id="' + random_id + '"><i style="margin-top: 16px;" class="fa fa-refresh fa-spin"></i></div>');

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
                        if (inner_json[0].modis_data_product != null) {
                            for (var i = 0; i < inner_json.length; i++) {
                                var lbl = inner_json[i].code + ': ' + inner_json[i].modis_data_product + ' (' + inner_json[i].spatial_resolution + ', ' + inner_json[i].temporal_resolution + ')';
                                s += '<option value="' + inner_json[i].code + '">' + lbl + '</option>';
                            }
                        } else {
                            for (var i = 0; i < inner_json.length; i++)
                                s += '<option value="' + inner_json[i][json.payload.id] + '">' + inner_json[i][json.payload.label] + '</option>';
                        }

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
                    var v = $('#' + CONFIG.data_provider_config.services.layers.parameters[i].parameter_value).val();
                    CONFIG.data_provider_config.services.layers.path = CONFIG.data_provider_config.services.layers.path.replace(p, v);
                }
            }

            /* Build URL. */
            var url = CONFIG.data_provider_config.base_url + CONFIG.data_provider_config.services.layers.path + '/';

            /* Build countries list, comma separated. */
            switch (CONFIG.data_provider) {
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
            var total_tabs = null;
            var from_day = null;
            var to_day = null;
            switch (CONFIG.data_provider) {
                case 'modis':
                    try {
                        to_day = parseInt($('#list_days_to').val());
                    } catch (e) {
                        to_day = from_day;
                    }
                    total_tabs = 1 + (to_day - from_day) / 16;
                    break;
                case 'trmm2':
                    from_day = parseInt($('#list_days_from').val());
                    to_day = parseInt($('#list_days_to').val());
                    total_tabs = 1 + (to_day - from_day);
                    break;
            }

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
                switch (CONFIG.data_provider) {
                    case 'modis':
                        var s = '';
                        var day = from_day + i * 16;
                        var d = new Date(parseInt($('#list_years_from').val()), 0, 1+day);
                        s += d.getDate() + ' ' + CONFIG.months[d.getMonth()] + ' ' + $('#list_years_from').val();
                        $('#download_tab').append('<li id="' + i + '_li"><a role="tab" data-toggle="tab" href="#tab_' + i + '">' + s + '</a></li>');
                        $('#tab_contents').append('<div class="tab-pane" id="tab_' + i + '"><br></div>');
                        init_tab(url, i, d);
                        break;
                    case 'trmm2':
                        var year = parseInt($('#list_years').val());
                        var month = parseInt($('#list_months').val()) - 1;
                        var day = from_day + i;
                        var d = new Date(year, month, day);
                        s = day + ' ' + CONFIG.months[d.getMonth()] + ' ' + year;
                        $('#download_tab').append('<li id="' + i + '_li"><a role="tab" data-toggle="tab" href="#tab_' + i + '">' + s + '</a></li>');
                        $('#tab_contents').append('<div class="tab-pane" id="tab_' + i + '"><br></div>');
                        init_tab(url, i, d);
                        break;
                }
            }

        };

        var init_tab = function(url, tab_index, date) {

            /* Replace the correct day in the URL. */
            switch (CONFIG.data_provider) {
                case 'modis':
                    url = url.replace($('#list_days_from').val(), create_day_of_the_year(date));
                    break;
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
                    data.tab_id = 'tab_' + tab_index;
                    switch (CONFIG.data_provider) {
                        case 'modis':
                            data.filesystem_structure = {
                                'product': $('#list_products').val(),
                                'year': $('#list_years_from').val(),
                                'day': create_day_of_the_year(date)
                            };
                            break;
                        case 'trmm2':
                            var day = date.getDate() < 10 ? ('0' + date.getDate()) : date.getDate();
                            data.filesystem_structure = {
                                'year': $('#list_years').val(),
                                'month': $('#list_months').val(),
                                'day': day
                            };
                            data.bulk_download_objects = [];
                            var file_list = [];
                            for (var z = 0 ; z < response.length ; z++)
                                file_list.push(response[z].file_name)
                            var ftp_data_dir = CONFIG.data_provider_config.ftp.data_dir;
                            ftp_data_dir += $('#list_years').val() + '/';
                            ftp_data_dir += $('#list_months').val() + '/';
                            ftp_data_dir += day + '/';
                            data.bulk_download_objects.push({
                                'ftp_base_url': CONFIG.data_provider_config.ftp.base_url,
                                'ftp_data_dir': ftp_data_dir,
                                'file_list': file_list
                            });
                            break;
                    }

                    switch (CONFIG.data_provider) {
                        case 'modis':
                            $.ajax({
                                url: CONFIG.url_download + CONFIG.data_provider + '/',
                                type: 'POST',
                                dataType: 'json',
                                data: JSON.stringify(data),
                                contentType: 'application/json',
                                success: function (response) {
                                    $('#download_tab a[href="#tab_0"]').tab('show');
                                    CONFIG.source_paths['tab_' + tab_index] = response.source_path;
                                    progress(json, 'tab_' + tab_index);
                                }
                            });
                            break;
                        case 'trmm2':
                            $.ajax({
                                url: CONFIG.url_bulk_download,
                                type: 'POST',
                                dataType: 'json',
                                data: JSON.stringify(data),
                                contentType: 'application/json',
                                success: function (response) {
                                    $('#download_tab a[href="#tab_0"]').tab('show');
                                    CONFIG.source_paths['tab_' + tab_index] = response.source_path;
                                    progress(json, 'tab_' + tab_index);
                                }
                            });
                            break;
                    }

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

        var progress = function(json, tab_id) {
            switch (CONFIG.data_provider) {
                case 'modis':
                    clean_progress_tab(tab_id);
                    for (var i = 0; i < json.length; i++) {
                        var view = {
                            label: (1 + i) + ') ' + json[i]['label'],
                            id: json[i]['file_name'],
                            id_percentage: json[i]['file_name'] + '_percentage'
                        };
                        var template = $(templates).filter('#loading_bar_template').html();
                        var render = Mustache.render(template, view);
                        $('#' + tab_id).append(render);
                        setTimeout(init_progress(json[i]['file_name'], tab_id), 5000);
                    }
                    $('#' + tab_id).append('<div id="' + tab_id + '_processing_result">Processing Result</div>');
                    break;
                case 'trmm2':
                    clean_progress_tab(tab_id);
                    var view = {
                        label: 'Label',
                        id: tab_id + '_progress',
                        id_percentage: tab_id + '_progress_percentage'
                    };
                    var template = $(templates).filter('#loading_bar_template').html();
                    var render = Mustache.render(template, view);
                    $('#' + tab_id).append(render);
                    init_progress(null, tab_id);
                    break;
            }
        };

        var init_progress = function(filename, tab_id) {
            switch (CONFIG.data_provider) {
                case 'modis':
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
                                        processing(tab_id);
                                }
                            },
                            error: function(a, b, c) {
                                clearInterval(CONFIG.timers_map[tab_id][id]);
                                delete CONFIG.timers_map[tab_id][id];
                            }
                        });
                    }, 1000, filename);
                    break;
                case 'trmm2':
                    CONFIG.timers_map[tab_id] = setInterval(function (id) {
                        $.ajax({
                            url: CONFIG.url_bulk_progress + tab_id + '/',
                            type: 'GET',
                            success: function (progress) {
                                $(document.getElementById(id)).attr('aria-valuenow', progress.progress);
                                $(document.getElementById(id)).css('width', progress.progress + '%');
                                if (!isNaN(parseFloat(progress.progress))) {
                                    var msg = '';
                                    msg += '[' + progress.downloaded_files + '/' + progress.total_files + '] ';
                                    msg += '<b>' + progress.progress + '%</b>';
                                    $(document.getElementById(id + '_percentage')).html(msg);
                                }
                                if (parseFloat(progress.progress) >= 100) {
                                    clearInterval(CONFIG.timers_map[tab_id]);
                                    delete CONFIG.timers_map[tab_id];
                                    $(document.getElementById(id)).removeClass('progress-bar-warning');
                                    $(document.getElementById(id)).addClass('progress-bar-success');
                                    if (Object.keys(CONFIG.timers_map).length == 0)
                                        processing(tab_id);
                                }
                            },
                            error: function(a, b, c) {
                                $(document.getElementById(id)).attr('aria-valuenow', 100);
                                $(document.getElementById(id)).css('width', '100%');
                                $(document.getElementById(id)).removeClass('progress-bar-warning');
                                switch (a.responseJSON.message) {
                                    case 'COMPLETE':
                                        $(document.getElementById(id)).addClass('progress-bar-success');
                                        break;
                                    case 'ERROR':
                                        $(document.getElementById(id)).addClass('progress-bar-danger');
                                        break;
                                }
                                clearInterval(CONFIG.timers_map[tab_id]);
                                delete CONFIG.timers_map[tab_id];
                            }
                        });
                    }, 250, tab_id + '_progress');
                    break;
            }
        };

        var clean_progress_tab = function(tab_id) {
            $('#' + tab_id).empty();
            $('#' + tab_id).append('<br>');
            for (var key in CONFIG.timers_map[tab_id])
                delete CONFIG.timers_map[tab_id][key]
        };

        var processing = function (tab_id) {
            var data = {};
            data.source_path = CONFIG.source_paths[tab_id];
//            data.pixel_size = 0.004166665;
            data.pixel_size = 0.002083332;
            $.ajax({
                url: CONFIG.url_processing + CONFIG.data_provider + '/',
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: function (response) {
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