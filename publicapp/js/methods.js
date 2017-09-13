var bf_modal;

function call_method  (meta_class,meta_method) {
var id_list=get_selected_rows();
var obj_list ={"objectlist":id_list};

	api_load('callmethod/'+meta_class+'/'+meta_method+'/init',JSON.stringify(obj_list),rendermethodform);

//rendermethodform (form);                       

};

var execute_method = function (errors,value){
	   if (errors){
                alert("Ошибка");
            }
            else {
                var data ={};
              //  data =JSON.stringify({userName: "userName", userAge: "userAge"});
                data = value; 
      // 	alert(data, null, 4);

 	var meta_class =$('#method_execute').attr("meta_class");	
 	var meta_method =$('#method_execute').attr("meta_method");	
 	var meta_object_id =$('#method_execute').attr("meta_object_id");	
	var obj={};
	obj._id=meta_object_id;
	obj.data=data;

	api_load('callmethod/'+meta_class+'/'+meta_method+'/execute',JSON.stringify(obj));
	$('#method_execute').modal('hide');
        jQuery('#refresh_jqGrid').click();
          
}

};

var rendermethodform = function(formjson,data) {
//    var schema =JSON.parse(datajson.responseText)[1].schema.json;

    var schema =formjson.data;
    var value = data.data;
   // $(".method_form").empty();

/*    $('.method_form').jsonForm({
        "schema":schema,
        "value":value,
        onSubmit: execute_method,
        "validate": false
    });  */
//    $('.form-actions').hide();
  //  var schema =datajson[0].schema;
   // var value = datajson[1].value;



	bf_modal = BrutusinForms.create(schema);
	
	var cont =$('.method_form');
	cont.empty();
	bf_modal.render(cont[0],value);

 	$('#method_execute').attr("meta_class",schema.meta_class);	
 	$('#method_execute').attr("meta_method",schema.meta_method);	
 	$('#method_execute').attr("method_type",schema.method_type);	
 	$('#method_execute').attr("meta_object_id",data._id);	

 	$('#method_execute #method_title').html(schema.title);	
	$('#method_execute').modal();


};


