var view;

 
 
var get_view_data = function (grid_container, user_filter, datarender, selectrows) {
    //  function api_load(url,requestdata,responsefunc) {
    var requestdata; //filter потом будет

    var meta_class = grid_container.attr('meta_class');
    var meta_view = grid_container.attr('meta_view');

    var url = meta_class + '/' + meta_view;

    if (user_filter) {
        requestdata = {
            'filter': user_filter
        };
    };

    $.ajax({
        url: "/view/" + url,
        type: "POST",
        data: requestdata,
        contentType: "application/json",
        dataType: "json",

        statusCode: {
            200: function (dataresponse) {
                if (datarender) {
                    datarender(grid_container, dataresponse, selectrows);
                }
                //	alert('view result ok');
            },
            403: function (jqXHR) {
                loadError(jqXHR);
            },
            500: function (jqXHR) {
                loadError(jqXHR);
            }
        }
    });

};

function jsonPathToValue(jsonData, path) {
    if (!(jsonData instanceof Object) || typeof (path) === "undefined") {
        throw "Not valid argument:jsonData:" + jsonData + ", path:" + path;
    }
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    path = path.replace(/^\./, ''); // strip a leading dot
    var pathArray = path.split('.');
    for (var i = 0, n = pathArray.length; i < n; ++i) {
        var key = pathArray[i];
        if (key in jsonData) {
            if (jsonData[key] !== null) {
                jsonData = jsonData[key];
            } else {
                return null;
            }
        } else {
            return key;
        }
    }
    return jsonData;
};

function convert_colmodel2auto(rows, colmodel) {
    if (!colmodel) {
        return undefined
    };
    var autodata = [];
    var auto_row = {};

    for (d in rows) {
        auto_row = {
            'value': null,
            'label': '',
            'desc': '',
            '_id': null
        };
        var row = rows[d];
        for (cols in colmodel) {
            if (colmodel[cols] && colmodel[cols].key) {
                auto_row['value'] = jsonPathToValue(row, colmodel[cols].name);

            }
            if (colmodel[cols].name == '_id') {
                auto_row['_id'] = jsonPathToValue(row, colmodel[cols].name)
            }
            if (!colmodel[cols].hidden) {
                auto_row['label'] = auto_row['label'] + jsonPathToValue(row, colmodel[cols].name) + ' ';
            };


        };
        autodata[d] = auto_row;
    };

    return autodata;
};

function get_autodata(params, request, response) {
    params.value = request.term;
    var colmodel = params.colmodel;
    $.post('view/ref_value_list', params,
        function (data) {
            if (data) {
                 var autodata = convert_colmodel2auto(data.rows, colmodel);
            };
            response(autodata);
        });
};

function fill_ref(src_meta_ref, input_element, value_ref_element) {
    var request = {};
    request.term = value_ref_element.value;
    var meta_ref = Object.assign({}, src_meta_ref);
    meta_ref.filter = {};

    if (meta_ref.colmodel) {
        for (x in meta_ref.colmodel) {
            if (meta_ref.colmodel[x].key) {
                meta_ref.filter[meta_ref.colmodel[x].name] = "[value]";
            }
        };
    } else {
        meta_ref.filter["_id"] = "[value]";
    };
    get_autodata(meta_ref, request, function (data) {
        if (data && data[0]) {
            $(input_element).val(data[0].label);
            $(value_ref_element).val(data[0].value);
            $(value_ref_element).attr("meta_ref", data[0].id);
        }
    });

};

function get_selected_rows(viewcontainer) {
    var s = [];
    var page = viewcontainer.find(".pageview");
    if (page.length) {
        s.push(page.attr("meta_id"));
    } else {
        var gridid = get_grid_id(viewcontainer);
        var selrows;
        selrows = $(gridid.grid_id_).jqGrid('getGridParam', 'selrow');
        if (selrows && typeof selrows == 'array') {
            s = selrows;
        } else {
            s.push(selrows)
        };
    };
    return s;
};

var refviewmodal = function (meta_class, meta_view, selectFunc) {

    var rez = {};
    var from_method = false;
    var modal_view = $('#refview');
    var b = $('#method_execute');
    var isfrom_modal = $('#method_execute').is(':visible');
    //show_view (grid_container,meta_class, meta_view);
    view = new SelenView(undefined, meta_class, meta_view);
    if (isfrom_modal === true) {
        from_method = true;
        $('#method_execute').modal('hide');
    };
    modal_view.unbind('hidden.bs.modal');
    modal_view.on('hidden.bs.modal', function (event) {
        view.Destroy();
        if (from_method) {
            setTimeout(function () {
                $('#method_execute').modal('show');
            }, 500);
        };


    });

    modal_view.find('.btn-primary').unbind('click');

    modal_view.find('.btn-primary').bind('click', function () {
        //	execute_method(null, bf_modal.getData());
        var s = view.get_selected_rows();
        if (!s || s == null) {
            alert('Выберите значение');

        } else {
            modal_view.modal('hide');
             var ui = {
                "item": {
                    "value": null,
                    "id": null,
                    "label": null
                }
            };
            ui.item.value = s;
            ui.item.id = s;
            ui.item.label = s;
            selectFunc(null, ui);
        }
    });

     setTimeout(function () {
        modal_view.modal();
    }, 500);

  

};
