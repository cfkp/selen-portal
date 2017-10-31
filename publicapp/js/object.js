'use strict';

function cb(object, fnc)
{
    return function() {
        var args = [this];
        for (var i in arguments) args.push(arguments[i]);
        return fnc.apply(object, args);
    }
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
		throw result.responseText//new IstoeServiceException(this.lastResult.status,xml+" "+this.lastResult.statusText,this.lastResult.responseText);
	}

	return  result;

};



class SelenObject {

  constructor(cont,_meta_class,_meta_name,_meta_value,meta_readonly) 
{     this.container=cont;
      this.meta_class=_meta_class;
      this.meta_name=_meta_name;
      this.meta_value=_meta_value;
if ((meta_readonly)&&(meta_readonly=="true")){
this.meta_readonly= true; }else {this.meta_readonly= false;};
	this.schema={};
	this.data={};
	this.bf=null;
  	this.Load();
	this.Show();
}
   Destroy()
	{
	this.SaveClick();

	var meth_cont =this.container.find("#methods_container"); 
	meth_cont.empty();
	var bfcont=this.container.find("#data_container");
	bfcont.empty();
	for (var prop in this){
		this[prop]=null;
	};
 	}

   Load()
	{
	this.lastresponse= api_load_sync('/loadclass/' + this.meta_class + '/' + this.meta_name + '/' + this.meta_value, null);
	this.schema=this.lastresponse.responseJSON.schema;
	this.value=this.lastresponse.responseJSON.value;
	}

Show()
{
/*	<div id="methods_container" style="position: relative;display: block;margin-bottom: 2%;">
	</div>
	<div id="data_container"></div>
*/
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
  }

SaveClick(sayOk)
{
	var resp=	api_load_sync("saveobj/" + this.meta_class + '/' + this.meta_name + '/' + this.meta_value, JSON.stringify(this.bf.getData()));
	if (sayOk){
	messagedlg(null, "Данные сохранены", "message");
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

