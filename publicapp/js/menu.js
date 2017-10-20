var set_def_active =function (menu){
	var sel;
	sel= '#'+menu+' [active_def=true] #menu_item_a';
	var el=$(sel);
	var par=el.parents("ul");
	if ((par[0])&&(par[0].style)&&(par[0].style.display)&&(par[0].style.display=='none')){return};
	el.click();
};

function load_main_menu(obj) {
	var meta_class = "meta_menu";
	var meta_name = "main_menu";
	var meta_value = "0";

	var datajson;

	var func = function (schema, menu) {
		makeList2(menu.data, 'nav navmenu-nav');
		set_def_active(menu.data.name);

 
	}

	api_load('load_main_menu', null, func);

};

function load_menu(menu_name) {
	var meta_class = "meta_menu";
	var meta_name = "name";
	var meta_value = menu_name;

	var datajson;

	var func = function (schema, menu) {
		makeList2(menu.data, "nav nav-tabs");
		set_def_active(menu.data.name);

	}
	api_load('/load_menu/' + meta_value, null, func);
 
};


var menu_item_click = function () {
	var obj = $(this);
	var root_ul = obj.parents("ul");
	root_ul.find("li").removeClass("active");
	obj.parent().addClass("active");
	if (root_ul.attr("root_menu") === '#top_menu') {
		$('#left_menu ul').hide();
		closegrid($('#main_workspace'));
		var sub_id = '#' + obj.attr("sub_id");
		$(sub_id).show();

 		set_def_active(obj.attr("sub_id"));
		                                       

/*		hide_formBRUT();
		jQuery("#detail_tabs").empty();

		$.jgrid.gridUnload('#jqGrid');
		$('#jqGrid').empty();
*/
	};
	if (obj.attr("meta_action_type")) {
		if (obj.attr("meta_action_type") == "object") {
			hide_formBRUT($("#main_workspace"));
			load_class(this);
		} else if (obj.attr("meta_action_type") == "method") {
			call_method(obj.attr("meta_class"), obj.attr("meta_method"),$('#main_workspace'));
		} else if (obj.attr("meta_action_type") == "view") {
 			show_view($('#main_workspace'),obj.attr("meta_class"), obj.attr("meta_view"));
		};

	};

	return true;
};

function makeList2(json, ulclass, root) {
	if (!json) {
		return;
	};
	if (typeof root === 'undefined') {
		root = $(json.root_menu);
	}
	if (json.root_menu === '#top_menu') {
		ulclass = 'nav navbar-nav';
	}
	if (typeof json.class==='undefined' ) {}
else{
		ulclass = json.class;

	}

	if (typeof ulclass === 'undefined') {
		ulclass = 'nav navmenu-nav';
	}
	var ul = $('<ul></ul>');
	ul.attr('id', json.name);
	ul.attr('class', ulclass.toString());
	ul.attr('root_menu', json.root_menu);
	root.append(ul);
	if ((json.root_menu !== '#top_menu')&&(json.root_menu !== '#method_menu')) {
		ul.hide();
	};
	var array = json.items;
	for (var i = 0; i < array.length; i++) {
		var li,
		a;
		if (array[i].class==='dropdown') {

/*T1 - "Приложение 1.1. Чек-лист";
Т2 - "Приложение 2. Заявка на получение независимой гарантии";
Т3 - "Резюме проекта";
Т4 - "Приложение 1.2. Анкета проекта субъекта МСП".
*/
                li = $(' <li class="menu_left dropdown">'+
				' <a class="dropdown-toggle" data-toggle="dropdown" href="#">'+
			'	 Отчеты<span ></span>                                                        '+
			'	 </a>                                                                         '+
 			'	<ul id="rep_menu" class="dropdown-menu" role="menu">                                        '+
			'		 <li><a hreftempl="/report/rep1/<%=meta_parent_value%>">Приложение 1.1. Чек-лист</a></li>             '+
 			'	<li><a hreftempl="/report/rep2/<%=meta_parent_value%>">Приложение 2. Заявка на получение независимой гарантии</a></li>                     '+
			'		 <li><a hreftempl="/report/rep3/<%=meta_parent_value%>">Резюме проекта</a></li>             '+
			'	 <li><a hreftempl="/report/rep4/<%=meta_parent_value%>">Приложение 1.2. Анкета проекта субъекта МСП</a></li>                       '+
			'	 </ul>    '+
			 '</li>      ');

		ul.append(li);
		
		}else{
		li = $('<li></li>');
		li.attr('id', 'menu_item');
		if (array[i].active === true) {
			li.attr('class', 'active');
			li.attr('active_def', true);
		};
		ul.append(li);
		a = $('<a></a>');
		a.attr('id', 'menu_item_a');
		a.attr('class', 'menu_left');
		a.attr('meta_class', array[i].meta_class);
		a.attr('meta_action_type', array[i].meta_action_type);
		a.attr('meta_method', array[i].meta_method);
		a.attr('meta_view', array[i].meta_view);
		a.attr('href', array[i].href);
		a.attr('sub_id', array[i].name);
		a.text(array[i].title);
		li.append(a);
		//	if (array[i].meta_action_type ) {
		a.bind('click', menu_item_click);
		//	};
		}
		if (typeof array[i].items !== 'undefined') {
			makeList2(array[i]);
		}
	}
	return root;
};
