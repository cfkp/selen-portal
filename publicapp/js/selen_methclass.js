'use strict';
 
class SelenMethod {

  constructor(parentobj,_meta_class,_meta_name,_objectlist) 
{       this.parent=parentobj;

	this.parent_container=this.parent.container;
	var obj_container = $('<div></div>'); 
	obj_container.attr('class','sln_container');	 
	obj_container.attr('id','sln_cnt'+_meta_name);
	this.parent_container.append(obj_container);
		
	this.container=obj_container;
	this.modal_container=$('#method_execute');
        this.meta_class=_meta_class;
        this.meta_name=_meta_name;
 	this.objectlist={};
	if (_objectlist) {this.objectlist=_objectlist};
 	this.schema={};
	if (parentobj&&parentobj.collection){
	this.collection=Object.assign({},parentobj.collection);}
	if (parentobj.collection){
	this.collection.meta_class='dfgdfg';
}
	this.data={};
	this.bf=null;
  	this.Init();
	this.Show();
}
   Destroy()
	{
	//this.SaveClick();
	this.container.remove();
	this.modal_container.find('#execute').unbind('click');
	 this.modal_container.find("#data_container").empty();
 
	for (var prop in this){
		this[prop]=null;
	};
 	 }

   Init()
	{
	this.lastresponse= api_load_sync('callmethod/'+this.meta_class+'/'+this.meta_name+'/init', JSON.stringify({objectlist:this.objectlist}));
	this.schema=this.lastresponse.responseJSON.schema;
	this.value=this.lastresponse.responseJSON.value;
	}
Execute(){
	this.data=this.bf.getData();
 	this.lastresponse=api_load_sync('callmethod/'+this.meta_class+'/'+this.meta_name+'/execute', JSON.stringify({objectlist:this.objectlist,data:this.data}));
 	$('#method_execute').modal('hide');



}

Show()
{
 
/*	var div_meth = $('<div id="methods_container"></div>');
	var div_data = $('<div id="data_container"></div>');
	this.container.append(div_meth,div_data);

 	if (!this.meta_readonly){

		var savebtn = document.createElement("button");
                savebtn.className = "btn btn-primary";
                savebtn.appendChild(document.createTextNode('Сохранить'));
                savebtn.onclick = cb(this, this.SaveClick);
 
	var check_btn = document.createElement("button");
                check_btn.className = "btn btn-primary";
                check_btn.appendChild(document.createTextNode('Проверить'));
                check_btn.onclick = cb(this, this.CheckClick);

	var  meth_cont =this.container.find("#methods_container"); 
		meth_cont.append(savebtn,check_btn);
	}
	var bfcont=this.container.find("#data_container");
		this.bf = BrutusinForms.create(this.schema.data);
 		this.bf.render(bfcont[0], this.value.data);
 	if (this.meta_readonly){
	bfcont.find(':input').attr('disabled', 'disabled');}	
*/
/*	var div_data = $('<div id="data_container"></div>');
	this.container.append(div_data);

	var bfcont=div_data;
*/

	var bfcont=this.modal_container.find("#data_container");
	bfcont.empty();
	this.bf = BrutusinForms.create(this.schema.data);
	
 	this.bf.render(bfcont[0], this.value.data);

/* 	$('#method_execute').attr("meta_class",schema.meta_class);	
 	$('#method_execute').attr("meta_method",schema.meta_method);	
 	$('#method_execute').attr("method_type",schema.method_type);	
 	$('#method_execute').attr("meta_object_id",data._id);	
 */
 	this.modal_container.find('#method_title').html(this.schema.data.title);	
	this.modal_container.find('#execute').unbind('click');

	this.modal_container.find('#execute').bind('click', cb(this, this.Execute));

	this.modal_container.modal();

  }

SaveClick(sayOk)
{ 	this.data=this.bf.getData();
	if (this.data == null){
		messagedlg(null, "Ошибка сохранения данных", "message");

	}else{
		var resp=api_load_sync("saveobj/" + this.meta_class + '/' + this.meta_name + '/' + this.meta_value, JSON.stringify(this.data));
		if (sayOk){
		messagedlg(null, "Данные сохранены", "message");
	}
	}
}

CheckClick()
{
	if (this.bf.validate()) {
	messagedlg(null, "Ошибок нет", "message");
		} else {
	messagedlg(null, "Найдены ошибки", "error");
		};
	 
}

};

