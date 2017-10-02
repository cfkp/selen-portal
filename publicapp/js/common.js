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
	} else {
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
