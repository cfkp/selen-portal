 var bf;
var BrutusinForms;
var selen_obj={};
$(document).ready(function () {
	BrutusinForms = brutusin["json-forms"];
	BrutusinForms.bootstrap.addFormatDecorator("file", "file", "glyphicon-search",
		function (element) {
		//       alert("user callback on element " + element);
		//            $(element).find('._jsonform-preview').remove();
		var main_div = $(element).parent();
		main_div.find('.file_control').click();
		//        	uploadfile(main_div);

		//  return true;

	});
	BrutusinForms.bootstrap.addFormatDecorator("color", "color");
	BrutusinForms.bootstrap.addFormatDecorator("date", "date");


   	load_main_menu();

  

});

function load_class(container,elem) {
	var meta_class = $(elem).attr("meta_class");
	var parent = $(elem).parents().find('#detail_tabs');

	var meta_name = parent.attr("meta_parent_field");
	var meta_value = parent.attr("meta_parent_value");
	var meta_readonly=parent.attr("meta_readonly");

  	selen_obj[$(container).attr('id')]=new SelenObject($("#detail_obj"),meta_class,meta_name,meta_value ,meta_readonly);


 }; 
 
function api_load(url, requestdata, responsefunc,container) {
	$.ajax({
		url: "../api/" + url,
		type: "POST",
		data: requestdata,
		contentType: "application/json",
		dataType: "json",

		statusCode: {
			200: function (dataresponse) {
				if (responsefunc) {
					var schema = {};

					if (dataresponse.schema) {
						schema = dataresponse.schema;
					}
					var value = dataresponse.value;
					responsefunc(schema, value,container);
				} else {
					messagedlg(dataresponse.responseText, "Данные сохранены", "message");
				};
			},
			403: function (jqXHR) {
				messagedlg(jqXHR.responseText);
			},
			500: function (jqXHR) {
				messagedlg(jqXHR.responseText);
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
 
 
var  hide_formBRUT=function(container) {
 if (selen_obj&&selen_obj[container.attr('id')]){
	selen_obj[container.attr('id')].Destroy();selen_obj[container.attr('id')]=null;}
};

 