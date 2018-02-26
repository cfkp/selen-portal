!(function () {

    function cb(object, fnc) {
        return function () {
            var args = [this];
            for (var i in arguments) args.push(arguments[i]);
            return fnc.apply(object, args);
        }
    }

    function getfile_sync(file, callback) {
        var result = $.ajax(file, {
            type: 'GET',
            async: false
        });
        if (result.status != 200) {
            HaltError("Ошибка загрузки шаблона "+file); 
        }

        return result;
    };




    function api_load_sync(url, requestdata) {
        var result = $.ajax({
            url: "../api/" + url,
            type: "POST",
            data: requestdata,
            contentType: "application/json",
            dataType: "json",
            async: false
        });
        if (result.status != 200) {
            throw new SelenError(result) ; 
        }

        return result;

    };

    function view_load_sync(url, requestdata) {
        var result = $.ajax({
            url: "../view/" + url,
            type: "POST",
            data: requestdata,
            contentType: "application/json",
            dataType: "json",
            async: false
        });
        if (result.status != 200) {
            throw new SelenError(result) ;
        }

        return result;

    };

    function defSelenErrorhandler(err) {
        $('#loading').hide();
        throw new SelenError(err);
    }

    function api_load_async(url, requestdata, responsefunc, errorhandler) {
        if (!errorhandler) {
            errorhandler = defSelenErrorhandler
        };
        if (requestdata && typeof requestdata == 'object') {
            requestdata = JSON.stringify(requestdata)
        };
        $('#loading').show();

        $.ajax({
            url: "../api/" + url,
            type: "POST",
            data: requestdata,
            contentType: "application/json",
            dataType: "json",
            statusCode: {
                200: responsefunc,
                403: errorhandler,
                500: errorhandler
            },
            complete: function () {
                $('#loading').hide();
            }
        });

    };



    function selen_call(url, requestdata, responsefunc, errorhandler) {
        if (!errorhandler) {
            errorhandler = messagedlg
        };
        if (requestdata && typeof requestdata == 'object') {
            requestdata = JSON.stringify(requestdata)
        };
        $.ajax({
            url: "../" + url,
            type: "POST",
            data: requestdata,
            contentType: "application/json",
            dataType: "json",
            statusCode: {
                200: function (dataresponse) {
                    if (responsefunc) {
                        responsefunc(dataresponse);
                    } else {
                        messagedlg(dataresponse.responseText, "Данные сохранены", "message");
                    };
                },
                403: function (jqXHR) {
                    errorhandler(jqXHR.responseText);
                },
                500: function (jqXHR) {
                    errorhandler(jqXHR.responseText);
                }
            }
        });

    };

    var messagedlg = function (jsonmessage, usermessage, dlgtype, onclose) {
        if (!jsonmessage) {
            jsonmessage = {
                msg: usermessage,
                type: dlgtype
            }
        } else if (jsonmessage instanceof Object) {} else {
            jsonmessage = JSON.parse(jsonmessage)
        };

        var msg = jsonmessage.msg;
        var dlgtype = jsonmessage.type;
        var dlgtitle = "Сообщение";
        if (!dlgtype || dlgtype == "error") {
            dlgtitle = "Ошибка"
        }
        if (!msg) {
            msg = "Неизвестная ошибка"
        };

        $('#messagedlg #msgtitle').html(dlgtitle);
        $('#messagedlg #msg').html(msg);
        $("#messagedlg").on("hidden.bs.modal", onclose);
        $('#messagedlg').modal();

    };


    class SelenError {
        constructor(res) {
            this.name = 'SelenError';
            if (res && res.responseJSON) {
                this.errobj = res.responseJSON;
            } else if (res && !res.responseJSON&& res.statusText) {

                this.errobj = {
                    'err': 'unknow',
                    'msg': 'Ошибка ' + res.statusText
                }
            } else if (res&&typeof res=='string') {

                this.errobj = {
                    'err': 'user',
                    'msg': res
                }
            } else {
                this.errobj = {
                    'err': 'unknow',
                    'msg': 'Ошибка ' + res
                }

            };

            //	this.stack = cause.stack;
        }
    }

    class SelenTemplate {
        constructor(name) {
            this.name = name;
            this.load();

        }
        load() {
            var tpl = getfile_sync('../template/' + this.name);
            this.template = tpl.responseText;

        }
        render(data) {
            if (data) {
                var html = ejs.render(this.template, data);
                return html;
            } else return undefined;
        }

    }

    var HaltError = function (res, msg) {
        throw new SelenError(res, msg);
    }

    function SelenApi() {};

    function SelenUtil() {};

    SelenApi.api_load_sync = api_load_sync;
    SelenApi.getfile_sync = getfile_sync;
    SelenApi.view_load_sync = view_load_sync;
    SelenApi.api_load_async = api_load_async;
    SelenApi.selen_call = selen_call;
    SelenUtil.messagedlg = messagedlg;
    SelenUtil.cb = cb;

    window.SelenApi = SelenApi;
    window.SelenError = SelenError;
    window.HaltError = HaltError;
    window.SelenUtil = SelenUtil;
    window.SelenTemplate = SelenTemplate;
}());
