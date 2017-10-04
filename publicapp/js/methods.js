var bf_modal;

function call_method  (meta_class,meta_method,container) {
var id_list=get_selected_rows($('#main_workspace'));
var obj_list ={"objectlist":id_list};

	api_load('callmethod/'+meta_class+'/'+meta_method+'/init',JSON.stringify(obj_list),rendermethodform,container);



};

var execute_method = function (errors,value,grid_container){
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

	get_view_data(grid_container, undefined,refresh_grid);

	}
};

var rendermethodform = function(formjson,data,container) {

    var schema =formjson.data;
    var value = data.data;


	bf_modal = BrutusinForms.create(schema);
	
	var cont =$('.method_form');
	cont.empty();
	bf_modal.render(cont[0],value);

 	$('#method_execute').attr("meta_class",schema.meta_class);	
 	$('#method_execute').attr("meta_method",schema.meta_method);	
 	$('#method_execute').attr("method_type",schema.method_type);	
 	$('#method_execute').attr("meta_object_id",data._id);	

 	$('#method_execute #method_title').html(schema.title);	
	$('#method_execute .btn-primary').unbind('click');

	$('#method_execute .btn-primary').bind('click', function () {
		execute_method(null, bf_modal.getData(),container);
	});

	$('#method_execute').modal();


};


