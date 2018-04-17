!(function () {

    function cb(object, fnc) {
        return function () {
            var args = [this];
            for (var i in arguments) args.push(arguments[i]);
            return fnc.apply(object, args);
        };
    }

    function getfile_sync(file, callback) {
        var result = $.ajax(file, {
            type: 'GET',
            async: false
        });
        if (result.status != 200) {
            HaltError("Ошибка загрузки шаблона " + file);
        }

        return result;
    };

    function getURLparam(varName) {
        // Grab and unescape the query string - appending an '&' keeps the RegExp simple
        // for the sake of this example.
        var queryStr = /*unescape(*/ window.location.search /*)*/ + '&';

        // Dynamic replacement RegExp
        var regex = new RegExp('.*?[&\\?]' + varName + '=(.*?)&.*');

        // Apply RegExp to the query string
        val = unescape(queryStr.replace(regex, "$1"));

        // If the string is the same, we didn't find a match - return false
        return val == queryStr ? '' : val;
    }




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
            throw new SelenError(result);
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
            throw new SelenError(result);
        }

        return result;

    };

    function defSelenErrorhandler(err) {
        $('#loading').hide();
        throw new SelenError(err);
    }

    function api_load_async(url, requestdata, responsefunc, errorhandler) {
        if (!errorhandler) {
            errorhandler = defSelenErrorhandler;
        };
        if (requestdata && typeof requestdata == 'object') {
            requestdata = JSON.stringify(requestdata);
        };
        $('#loading').show();

        $.ajax({
            url: ".." + url,
            type: "POST",
            data: requestdata,
            //   timeout: 600000,
            contentType: "application/json",
            dataType: "json",
             tryCount : 0,
    retryLimit : 3,
            statusCode: {
                200: responsefunc,
                403: errorhandler,
                500: errorhandler
            },
            error: function (xhr, textStatus, errorThrown) {
                var retryAfter = xhr.getResponseHeader('Retry-After');

                if (textStatus == 'timeout'||xhr.status == 503) {
                    this.tryCount++;
                    if (this.tryCount <= this.retryLimit) {
                        //try again
                        var thisAjax=this;
                        setTimeout(function(){$.ajax(thisAjax);
                        return;},retryAfter);
//                        $.ajax(this);
//                        return;
                    }/*else{errorhandler(errorThrown);}
                    return;
                }
                if (xhr.status == 500) {
                    errorhandler(errorThrown);
                } */else {
                   errorhandler(errorThrown);
                }}
            },
            
            complete: function (xhr, textStatus) {
                if ((textStatus == 'timeout'||xhr.status == 503)&&(this.tryCount <= this.retryLimit) ){}
        else {                $('#loading').hide();
}
//                $('#loading').hide();
            }
        });

    };



    function selen_call(url, requestdata, responsefunc, errorhandler) {
        if (!errorhandler) {
            errorhandler = messagedlg;
        };
        if (requestdata && typeof requestdata == 'object') {
            requestdata = JSON.stringify(requestdata);
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
            };
        } else if (jsonmessage instanceof Object) {} else {
            jsonmessage = JSON.parse(jsonmessage);
        };

        var msg = jsonmessage.msg;
        dlgtype = jsonmessage.type;
        var dlgtitle = "Сообщение";
        if (!dlgtype || dlgtype == "error") {
            dlgtitle = "Ошибка";
        }
        if (!msg) {
            msg = "Неизвестная ошибка";
        };

        $('#messagedlg #msgtitle').html(dlgtitle);
        $('#messagedlg #msg').html(msg);
        $("#messagedlg").on("hidden.bs.modal", onclose);
        $('#messagedlg').modal();

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

    class SelenError {
        constructor(res) {
            this.name = 'SelenError';
            if (res && res.responseJSON) {
                this.errobj = res.responseJSON;
            } else if (res && !res.responseJSON && res.statusText) {

                this.errobj = {
                    'err': 'unknow',
                    'msg': 'Ошибка ' + res.statusText
                };
            } else if (res && typeof res == 'string') {

                this.errobj = {
                    'err': 'user',
                    'msg': res
                };
            } else {
                this.errobj = {
                    'err': 'unknow',
                    'msg': 'Ошибка ' + res
                };

            };

            //	this.stack = cause.stack;
        }
    };

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

    };

    var HaltError = function (res, msg) {
        throw new SelenError(res, msg);
    };

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
    window.getURLparam = getURLparam;
    window.jsonPathToValue = jsonPathToValue;
}());
