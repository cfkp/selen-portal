'use strict';

 
class SelenMenu {

  constructor(parentobj,_meta_name) 
{ if (parentobj){      
	this.parent=parentobj;
	this.parent_container=this.parent.container;
	var obj_container = $('<div></div>'); 
//	obj_container.attr('class','sln_container')	 
	obj_container.attr('id','sln_cnt'+_meta_name);
	this.parent_container.append(obj_container);
	this.container=obj_container;

	}else
	{this.parent_container=$('#top_menu');
	this.container=$('#main_workspace')
	 }
	
        this.meta_class="meta_menu";
        this.meta_name=_meta_name;
        this.meta_value=_meta_name;
	this.collection={};
	if (parentobj&&parentobj.collection){
	this.collection=Object.assign({},parentobj.collection);}
	this.child_obj={};
	this.schema={};
	this.data={};
	this.bf=null;
  	this.Load();
if (this.parent){
	this.makemenu(this.value.data,undefined,this.container);
	}
else
{	this.makemenu(this.value.data,undefined,this.parent_container);
	this.Show(true);
 }

}
   Destroy()
	{
//	this.SaveClick();
	this.container.remove();
	for (var prop in this){
		this[prop]=null;
	};
 	}

   Load()
	{
if (this.meta_value=='main_menu'){
	this.lastresponse= api_load_sync('/load_main_menu', null);
}
else
{
	this.lastresponse= api_load_sync('/load_menu/' + this.meta_value, null);

}	this.schema=this.lastresponse.responseJSON.schema;
	this.value=this.lastresponse.responseJSON.value;
	}

Show(set_def)
{
        this.container.find('ul').first().show();
// 	if (set_def){
if (this.meta_value=='main_menu'){
	this.set_def_active(this.parent_container.attr('id'));
}
	else {
this.set_def_active(this.container.attr('id'));}
//}

}
set_def_active  (menu){
	var sel;
	sel= '#'+menu+' [active_def=true] #menu_item_a';
	var el=$(sel);
	var par=el.parents("ul");
	if ((par[0])&&(par[0].style)&&(par[0].style.display)&&(par[0].style.display=='none')){return};
	el.click();
};

MenuClick(clickedElem)
{	var obj=$(clickedElem);
	var root_ul = obj.parents("ul");
	//root_ul.find("li").removeClass("active");
	//obj.parent().addClass("active");
 	if (obj.attr("sub_id")&&!obj.attr("meta_action_type")) {
		$(obj.attr("sub_container_id")+' ul').hide();
		//closegrid($('#main_workspace'));
		var sub_id = obj.attr("sub_container_id")+' #' + obj.attr("sub_id");
		$(sub_id).show();

 		set_def_active(obj.attr("sub_id"));
		                                       

 	};
	if (obj.attr("meta_action_type")) {
		if (obj.attr("meta_action_type") == "object") {
			 if (this.child_obj&&this.child_obj[this.container.attr('id')]){
				this.child_obj[this.container.attr('id')].Destroy();
				this.child_obj[this.container.attr('id')]=null;}

			this.child_obj[this.container.attr('id')] = new SelenObject(this,obj.attr("meta_class") ,this.container.attr("meta_parent_field") ,this.container.attr("meta_parent_value") ,this.container.attr("meta_readonly"));
 		} else if (obj.attr("meta_action_type") == "method") {
			 if (this.child_meth ){
				this.child_meth.Destroy();
				this.child_meth=null;}

				this.child_meth=new SelenMethod(this,obj.attr("meta_class"), obj.attr("meta_method"),this.parent.get_selected_rows())
			//call_method(obj.attr("meta_class"), obj.attr("meta_method"),this.container);
		} else if (obj.attr("meta_action_type") == "view") {
			if (this.child_obj&&this.child_obj[this.container.attr('id')]){
				this.child_obj[this.container.attr('id')].Destroy();
				this.child_obj[this.container.attr('id')]=null;}
 			this.child_obj[this.container.attr('id')] = new SelenView(this,obj.attr("meta_class") ,obj.attr("meta_view"));
		};

	};
 
	return true;


}

makemenu(json, ulclass, root) {
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
			ulclass = root.attr('class');
	
	} 

	if (typeof ulclass === 'undefined') {
		ulclass = 'nav nav-tabs';
	}
	var ul;
	if (json.root_menu == '#method_menu') {ul = $('<div class="btn-group btn-group-justified "></div>');}
	else {
	ul = $('<ul></ul>');
 	ul.attr('class', ulclass.toString());
 	}                             
	ul.attr('id', json.name);
	ul.attr('root_menu', json.root_menu);

	root.append(ul);
	if ((json.root_menu !== '#top_menu') &&(json.root_menu !== '#method_menu')) {
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
                li = $(' <div class="btn-group">'+
				'<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">'+
			'Шаблоны<span class="caret"></span>'+
			'</button>'+
 			'<ul id="rep_menu" class="dropdown-menu" role="menu">'+
			'<li><a hreftempl="/report/rep1/<%=meta_parent_value%>">Приложение 1.1. Чек-лист</a></li>'+
 			'<li><a hreftempl="/report/rep2/<%=meta_parent_value%>">Приложение 2. Заявка на получение независимой гарантии</a></li>'+
			'<li><a hreftempl="/report/rep3/<%=meta_parent_value%>">Резюме проекта</a></li>'+
			'<li><a hreftempl="/report/rep4/<%=meta_parent_value%>">Приложение 1.2. Анкета проекта субъекта МСП</a></li>'+
			'<li><a id="rep5" hreftempl="/report/rep5/<%=meta_parent_value%>">Отчет по выбранным заявкам</a></li>'+
			'</ul>'+
			 '</div>');

 
/*                li = $(' <div class="btn-group">'+
				'<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">'+
			'Отчеты<span class="caret"></span>'+
			'</button>'+
 			'<ul id="rep_menu" class="dropdown-menu" role="menu">'+
			'<li><a hreftempl="/report/rep1/<%=meta_parent_value%>">Приложение 1.1. Чек-лист</a></li>'+
 			'<li><a hreftempl="/report/rep2/<%=meta_parent_value%>">Приложение 2. Заявка на получение независимой гарантии</a></li>'+
			'<li><a hreftempl="/report/rep3/<%=meta_parent_value%>">Резюме проекта</a></li>'+
			'<li><a hreftempl="/report/rep4/<%=meta_parent_value%>">Приложение 1.2. Анкета проекта субъекта МСП</a></li>'+
			'<li><a id="rep5" hreftempl="/report/rep5/<%=meta_parent_value%>">Отчет по выбранным заявкам</a></li>'+
			'</ul>'+
			 '</div>');
*/
		ul.append(li);
		
		}
		else if(array[i].meta_action_type==='method'){
		var gr= $('<div class="btn-group"></div>');
		a = $('<button></button>');
		a.attr('id', 'menu_item_a');
		a.attr('type', 'button');
		a.attr('class', 'btn btn-default');
		a.attr('meta_class', array[i].meta_class);
		a.attr('meta_action_type', array[i].meta_action_type);
		a.attr('meta_method', array[i].meta_method);
		a.attr('meta_view', array[i].meta_view);
		a.attr('href', array[i].href);
		a.attr('sub_id', array[i].name);
		a.attr('sub_container_id', array[i].root_menu);
		a.text(array[i].title);
		gr.append(a);
		ul.append(gr);
		a.bind('click',cb(this,this.MenuClick) );
  
		}
		else
		{
		li = $('<li></li>');
		li.attr('id', 'menu_item');
li.attr('data-toggle',"tab");
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
		a.attr('sub_container_id', array[i].root_menu);
		a.text(array[i].title);
		li.append(a);
		a.bind('click',cb(this,this.MenuClick) );
		}
		if (typeof array[i].items !== 'undefined') {
			this.makemenu(array[i]);
		}
	}
	return root;
};


};

