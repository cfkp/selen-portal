function cb(object, fnc)
{
    return function() {
        var args = [this];
        for (var i in arguments) args.push(arguments[i]);
        return fnc.apply(object, args);
    }
}


function SelenError(res) { 
if (res.responseJSON){
  this.errobj = res.responseJSON;
  this.name = 'SelenError';} 
else {
this.errobj={'err':'unknow','msg':'Ошибка '+res.statusText};
 } 
	
//  this.stack = cause.stack;
}

function api_load_sync(url, requestdata) {
var result=$.ajax({
		url: "../api/" + url,
		type: "POST",
		data: requestdata,
		contentType: "application/json",
		dataType: "json",
	            async: false });
 	if(result.status!=200){
		throw new SelenError(result)//new IstoeServiceException(this.lastResult.status,xml+" "+this.lastResult.statusText,this.lastResult.responseText);
	}

	return  result;

};

function view_load_sync(url, requestdata) {
var result=$.ajax({
		url: "../view/" + url,
		type: "POST",
		data: requestdata,
		contentType: "application/json",
		dataType: "json",
	            async: false });
 	if(result.status!=200){
		throw new SelenError(result)//new IstoeServiceException(this.lastResult.status,xml+" "+this.lastResult.statusText,this.lastResult.responseText);
	}

	return  result;

};


function selen_call(url, requestdata, responsefunc, errorhandler) {
if (!errorhandler) {errorhandler=messagedlg};
if (requestdata&&typeof requestdata=='object') {requestdata=JSON.stringify(requestdata)}; 
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

var messagedlg = function (jsonmessage, usermessage, dlgtype,onclose) {
	if (!jsonmessage) {
		jsonmessage = {
			msg: usermessage,
			type: dlgtype
		}
	}else if (jsonmessage instanceof Object){
	} 
	else {
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
