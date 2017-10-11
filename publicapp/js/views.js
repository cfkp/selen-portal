
function arrayToTable(meta_class, meta_view, data) {
    var table = $('<table class="table table-striped pageview"></table>');
    table.attr('id',meta_view);
    table.attr('meta_view',meta_view);
    $(data.header.colmodel).each(function (i, rowData) {
        var row = $('<tr></tr>');
        /*$(rowData).each(function (j, cellData) {
            row.append($('<td>'+cellData+'</td>'));
        });*/
	
	row.append ($('<td>'+rowData.label+'</td>'));
	row.append ($('<td>'+data.rows[0][rowData.name]+'</td>'));        
	if (rowData.hidden) {row.hide();};
	if (rowData.key) {table.attr("meta_id",data.rows[0][rowData.name])};
	table.append(row);
	
    });
    return table;
} ;

var closegrid=function (grid_container){
	grid_container.find("#method_menu").empty();
	grid_container.find("#detail_tabs").empty();
	hide_formBRUT(grid_container);
	grid_container.find('#grid_container').empty();

};
var get_grid_id =function (grid_container){
var id_cont={};
id_cont['grid_id']=grid_container.attr('id')+'_'+'vwGrid';
id_cont['gridpager_id']=grid_container.attr('id')+'_'+'vwPager';
id_cont['grid_id_']='#'+id_cont['grid_id'];
id_cont['gridpager_id_']='#'+id_cont['gridpager_id'];
return id_cont;
	
};

var showgrid = function (grid_container, data) {
        closegrid(grid_container);
	var header = data.header;
	var rows = data.rows;
	var meta_class=	grid_container.attr('meta_class');
	var meta_view =	grid_container.attr('meta_view');

  if ((header.view_mode)&&(header.view_mode=="page" )){
     //   drawpage(meta_class, meta_view, data);
     grid_container.find('#grid_container').append(arrayToTable(meta_class, meta_view, data));
	return;
  };      
    
    	var gridid=get_grid_id(grid_container);


     	var table = $('<table></table>');
    
     	table.attr('id',gridid.grid_id);
   	var pager = $('<div></div>'); 
	pager.attr('id',gridid.gridpager_id)	 
        var gr_cont= grid_container.find('#grid_container').append(table);
        gr_cont.append(pager);
	var container=gr_cont.find(gridid.grid_id_);
 	var detail_container=grid_container.find('#detail_tabs');


	if (header.methods_menu) {
		load_menu(header.methods_menu);
		
		
	};

	if (header.detail) {
		load_menu(header.detail.menu);
		
		
	};
	////console.log(JSON.stringify(header.colmodel));

	$.jgrid.defaults.width = 900;
	$.jgrid.defaults.responsive = true; 
	$.jgrid.defaults.styleUI = 'Bootstrap';

	container.jqGrid({
		datatype: "local",
		data: rows,
		height: 400,
		colModel: header.colmodel,
		viewrecords: true, // show the current page, data rang and total records on the toolbar
		caption: header.title,
		multiselect: true,
		pager: gridid.gridpager_id_,
		loadonce: true, 
	        rowNum: 30,
 		viewrecords: true,
                scroll: 1, // set the scroll property to 1 to enable paging with scrollbar - virtual loading of records
                emptyrecords: '0 записей найдено', // the message will be displayed at the bottom 
   
		shrinkToFit:false,
		beforeSelectRow: function (rowId, e) {
	            container.jqGrid("resetSelection");
	            //return true;
	        },
		onSelectRow: function (rowid, selected) {
			if ((header.detail) && (rowid != null)&&detail_container.length!=0) {

				if (selected) {
					detail_container.attr("meta_parent_field", "pers_request_id");
					detail_container.attr("meta_parent_value", rowid);
					detail_container.attr("meta_readonly",header.detail.readonly);
					
					var reports = detail_container.find("#rep_menu")
					if (reports) {
						reports.find( "li a" ).each(function( index ) {
   							$( this ).attr("href",$( this ).attr("hreftempl").replace('<%=meta_parent_value%>',rowid))
							//	console.log( index + ": " + $( this ).attr("href") );	
						});	
					}
					detail_container.show();
					detail_container.find("[root_menu='#detail_tabs']").show();	
					detail_container.find('.active a').click();
					container.jqGrid('setGridState', 'hidden');
				} else {
					detail_container.hide();
					hide_formBRUT(grid_container);
				};
			}
		}
	});

	container.navGrid(gridid.gridpager_id_, {
		search: true, // show search button on the toolbar
		add: false,
		edit: false,
		del: false,
		refresh: true,
		beforeRefresh: function () {
 			get_view_data(grid_container,undefined, refresh_grid);
		},
		afterRefresh: function () {
			//	alert("afterRefresh" + meta_view);
		}

	}, {}, // edit options
	{}, // add options
	{}, // delete options
	{
		multipleSearch: true
	} // search options - define multiple search
	);

/* container.jqGrid('setGridWidth', parseInt($(window).width()) - 20);    

 //handles the grid resize on window resize
 $(window).resize(function () { 
       container.jqGrid('setGridWidth', parseInt($(window).width()) - 20); 
 });
*/

};

function refresh_grid(grid_container , dataresponse) {
	var gridid=get_grid_id(grid_container);
	var grid_element= $(gridid.grid_id_);
	var rows = dataresponse.rows;

	grid_element.jqGrid('clearGridData');
	grid_element.jqGrid('setGridParam', {
		data: rows
	});
	grid_element.trigger('reloadGrid');
};

function show_view (grid_container,meta_class, meta_view) {
	grid_container.attr('meta_class',meta_class);
	grid_container.attr('meta_view',meta_view);

	get_view_data( grid_container,undefined,showgrid);

};

var get_view_data = function ( grid_container,user_filter, datarender) {
	//  function api_load(url,requestdata,responsefunc) {
	var requestdata ; //filter потом будет
	
	var meta_class=	grid_container.attr('meta_class');
	var meta_view =	grid_container.attr('meta_view');
 
	var url = meta_class + '/' + meta_view;

	if (user_filter){requestdata = {'filter':user_filter};};

	$.ajax({
		url: "/view/" + url,
		type: "POST",
		data: requestdata,
		contentType: "application/json",
		dataType: "json",

		statusCode: {
			200: function (dataresponse) {
				if (datarender) {
					datarender(grid_container, dataresponse);
				}
				//	alert('view result ok');
			},
			403: function (jqXHR) {
				loadError(jqXHR);
			},
			500: function (jqXHR) {
				loadError(jqXHR);
			}
		}
	});

};

function jsonPathToValue(jsonData, path) {
    if (!(jsonData instanceof Object) || typeof (path) === "undefined") {
        throw "Not valid argument:jsonData:" + jsonData + ", path:" + path;
    }
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    path = path.replace(/^\./, ''); // strip a leading dot
    var pathArray = path.split('.');
    for (var i = 0, n = pathArray.length; i < n; ++i) {
        var key = pathArray[i];
        if (key in jsonData) {
            if (jsonData[key] !== null) {
                jsonData = jsonData[key];
            } else {
                return null;
            }
        } else {
            return key;
        }
    }
    return jsonData;
};  

function convert_colmodel2auto (rows,colmodel){
	  if (!colmodel){ return undefined}; 
	  var autodata=[];
	   var auto_row={};

	   for (d in rows){ 
	        auto_row={'value':null,'label':'','desc':'','_id':null};
		var row= rows[d];
		for (cols in colmodel){
	        if (colmodel[cols]&&colmodel[cols].key){
		auto_row['value']=jsonPathToValue(row,colmodel[cols].name);
		
		}
		if(colmodel[cols].name=='_id'){auto_row['_id']=jsonPathToValue(row,colmodel[cols].name)}
		if (!colmodel[cols].hidden) {
		auto_row['label']=auto_row['label']+jsonPathToValue(row,colmodel[cols].name)+' ';
		};

		
		};
		autodata[d]=auto_row;
	    };

return autodata;
};
function get_autodata(params,request,response) {
        params.value= request.term;
	var colmodel=params.colmodel;	    
        $.post('view/ref_value_list',params, 
	function(data){
	  if (data){
           /*var rows =data.rows;
	   for (d in rows){ 
	        auto_row={};
		var row= rows[d];
		for (cols in colmodel){
	        if (colmodel[cols]&&colmodel[cols].key){
		auto_row['value']=row[colmodel[cols].name];
		};
		autodata[d]=auto_row;
		};
	    };*/
		var autodata =convert_colmodel2auto (data.rows,colmodel);
		};	
            response(autodata);
        });
    };

function fill_ref( src_meta_ref,input_element,value_ref_element){
	var request={};           
	request.term=value_ref_element.value;
	var meta_ref=Object.assign({}, src_meta_ref);
	meta_ref.filter={};

	if (meta_ref.colmodel){
		for (x in meta_ref.colmodel){
			if (meta_ref.colmodel[x].key){
		meta_ref.filter[meta_ref.colmodel[x].name]="[value]";}};
	} else {meta_ref.filter["_id"]="[value]";};
	get_autodata(meta_ref,request,function(data){
	if (data&&data[0]){
	$( input_element ).val( data[0].label );
	$( value_ref_element ).val( data[0].value );
	$( value_ref_element ).attr("meta_ref",data[0].id );  }
       });

}; 

function get_selected_rows(viewcontainer) {
	var s=[];
	var  page = viewcontainer.find(".pageview");
	if (page.length) {
		s.push(page.attr("meta_id")); 
	}
	else{     
		var gridid=get_grid_id(viewcontainer);
		var selrows;
		selrows = $(gridid.grid_id_).jqGrid('getGridParam', 'selrow');
		if (selrows&&typeof selrows=='array') {
		s=selrows;		
		} else {s.push(selrows)}; 
	};	 
	return s;
};

var refviewmodal = function(meta_class,meta_view,selectFunc) {

        var rez ={};
        var grid_container=$('#refview');
        show_view (grid_container,meta_class, meta_view)

	grid_container.find('.btn-primary').unbind('click');

	grid_container.find('.btn-primary').bind('click', function () {
	//	execute_method(null, bf_modal.getData());
	var s =get_selected_rows(grid_container);
	if (!s||s==null) {  
		alert('Выберите значение');
        
	}else   {
        	grid_container.modal('hide');
                closegrid(grid_container);
		var ui={"item":{"value":null,"id":null,"label":null}};
		ui.item.value=s;
		ui.item.id=s;
		ui.item.label=s;
		selectFunc(null,ui);
		}
	});

 	//$('#refview #method_title').html(schema.title);	
	grid_container.modal();


};
