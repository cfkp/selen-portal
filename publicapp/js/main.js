/**
 * Created by lexusrules on 18.03.17.
 */
var bf;
var BrutusinForms;
$(document).ready(function () {
  	load_main_menu();

	$('#method_execute .btn-primary').bind('click', function () {
		execute_method(null, bf_modal.getData());
	});

	$('#brut_save').bind('click', function () {
		alert(JSON.stringify(bf.getData(), null, 4));
		var meta_class = $('#BRUTform').attr("meta_class");
		var meta_name = $('#BRUTform').attr("meta_name");
		var meta_value = $('#BRUTform').attr("meta_value");
		api_load("saveobj/" + meta_class + '/' + meta_name + '/' + meta_value, JSON.stringify(bf.getData()), null);
	});

	$('#brut_validate').bind('click', function () {
		if (bf.validate()) {
			alert('Ошибок нет');
		} else {
			alert('Ошибка проверки');
		};
	});

	hide_formBRUT();
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

	/*$('.menu_left').bind('click', function(){
	//  alert('lef click '+$(this).attr( "id")+' '+$(this).attr( "meta_class"));
	getData (this);
	});

	/*$('.menu_top').bind('click', function(){
	//  alert('top click '+$(this).attr( "meta_id")+' '+$(this).attr( "meta_class"));
	loadmenu(this);
	});
	 */
	//$(".navmenu.navmenu-default.navmenu-fixed-left .active a").click();

});

var loaduserobj = function (meta_class, meta_name, meta_value) {
	$.ajax({
		type: "POST",
		url: "/api/loaduserobj/" + meta_class,
		contentType: "application/json",
		dataType: "json",
		//data: ,
		statusCode: {
			200: function (data) {
				//$("form").attr("meta_class",meta_class);
				//                loadForm(data);
				loadFormBRUT(meta_class, meta_name, meta_value, data);
			},
			403: function () {
				messagedlg(jqXHR.responseText);
			},
			500: function (jqXHR) {
				messagedlg(jqXHR.responseText);
			}

		}
	});
};

/*var getData = function(obj){
$(".object_form").empty();
var meta_class=$(obj).attr( "meta_class");
var meta_name=$(obj).attr( "meta_name");
var meta_value=$(obj).attr( "meta_value");
//   alert(id);
if (meta_class) {
loaduserobj(meta_class,meta_name,meta_value);
}
}
 */
function load_class(obj) {
	var meta_class = $(obj).attr("meta_class");
	var parent = $(obj).parents().find('#detail_tabs');

	var meta_name = parent.attr("meta_parent_field");
	var meta_value = parent.attr("meta_parent_value");
	var meta_readonly=parent.attr("meta_readonly");
	if (!meta_readonly){meta_readonly=false}
	var datajson;

	var func = function (schema, data) {
		loadFormBRUT(schema, data, meta_class, meta_name, meta_value);
		if ((meta_readonly)&&(meta_readonly=="true")){
		$('#BRUTbutton').hide();
		$('#BRUTcontainer').find(':input').attr('disabled', 'disabled');	
		}else{$('#BRUTbutton').show();};
	};

	api_load('/loadclass/' + meta_class + '/' + meta_name + '/' + meta_value, null, func);

};

function api_load(url, requestdata, responsefunc) {
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
					responsefunc(schema, value);
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

var prep_cont_BRUT = function (el_sel, meta_class, meta_name, meta_value) {
	var form = $('#BRUTform')
		var cont = $(el_sel);
	cont.empty();
	form.attr('meta_class', meta_class);
	form.attr('meta_name', meta_name);
	form.attr('meta_value', meta_value);
	form.show();

	return cont[0];
};

function hide_formBRUT() {
	$('#BRUTform').hide();
	var cont = $('#BRUTcontainer');
	cont.empty();
};

var loadFormBRUT = function (schema, value, meta_class, meta_name, meta_value) {

	if (meta_name === '_id') {
		meta_value = value._id;
	}

	bf = BrutusinForms.create(schema.data);
	var container = prep_cont_BRUT('#BRUTcontainer', meta_class, meta_name, meta_value);
	bf.render(container, value.data);
//        $('#BRUTcontainer').find(':input').attr('disabled', 'disabled');
};
