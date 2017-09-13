
function arrayToTable(meta_class, meta_view, data) {
    var table = $('<table class="table table-striped"></table>');
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

var closegrid=function (){
	jQuery("#method_menu").empty();
	jQuery("#detail_tabs").empty();
	hide_formBRUT();
	$.jgrid.gridUnload('#jqGrid');
	$('#jqGrid').empty();

};

var showgrid = function (meta_class, meta_view, data) {

        closegrid();

	var header = data.header;
	var rows = data.rows;
  if ((header.view_mode)&&(header.view_mode=="page" )){
     //   drawpage(meta_class, meta_view, data);
     $('#jqGrid').append(arrayToTable(meta_class, meta_view, data));
return;
  };      
	if (header.methods_menu) {
		load_menu(header.methods_menu);
		
		
	};

	if (header.detail) {
		load_menu(header.detail.menu);
		
		
	};


	$.jgrid.defaults.width = 780;
	$.jgrid.defaults.responsive = true;
	$.jgrid.defaults.styleUI = 'Bootstrap';

	$("#jqGrid").jqGrid({
		datatype: "local",
		data: rows,
		height: 250,
		colModel: header.colmodel,
		viewrecords: true, // show the current page, data rang and total records on the toolbar
		caption: header.title,
		multiselect: true,
		pager: "#jqGridPager",
		loadonce: true,
		onSelectRow: function (rowid, selected) {
			if ((header.detail) && (rowid != null)) {

				if (selected) {
					$("#detail_tabs").attr("meta_parent_field", "pers_request_id");
					$("#detail_tabs").attr("meta_parent_value", rowid);
					$("#detail_tabs").attr("meta_readonly",header.detail.readonly);
					
					var reports = $("#detail_tabs #rep_menu")
					if (reports) {
					reports.find( "li a" ).each(function( index ) {
   $( this ).attr("href",$( this ).attr("hreftempl").replace('<%=meta_parent_value%>',rowid))
					console.log( index + ": " + $( this ).attr("href") );	
					});	
					}
					$("#detail_tabs").show();
					$("#detail_tabs").find("[root_menu='#detail_tabs']").show();	
					$("#detail_tabs").find('.active a').click();
					$("#jqGrid").jqGrid('setGridState', 'hidden');
				} else {
					jQuery("#detail_tabs").hide();
					hide_formBRUT()
				};
			}
		}
	});

	$('#jqGrid').navGrid("#jqGridPager", {
		search: true, // show search button on the toolbar
		add: false,
		edit: false,
		del: false,
		refresh: true,
		beforeRefresh: function () {
			//	alert("beforeRefresh" + meta_class);
			get_view_data(meta_class, meta_view, refresh_grid);
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

};

function refresh_grid(meta_class, meta_view, dataresponse) {
	var rows = dataresponse.rows;
	jQuery('#jqGrid').jqGrid('clearGridData');
	jQuery('#jqGrid').jqGrid('setGridParam', {
		data: rows
	});
	jQuery('#jqGrid').trigger('reloadGrid');
};

function show_view(meta_class, meta_view) {

	get_view_data(meta_class, meta_view, showgrid);

};

var get_view_data = function (meta_class, meta_view, datarender) {
	//  function api_load(url,requestdata,responsefunc) {
	var requestdata = {}; //filter потом будет
	var url = meta_class + '/' + meta_view;
	$.ajax({
		url: "/view/" + url,
		type: "POST",
		data: requestdata,
		contentType: "application/json",
		dataType: "json",

		statusCode: {
			200: function (dataresponse) {
				if (datarender) {
					datarender(meta_class, meta_view, dataresponse);
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

function get_autodata(params,request,response) {
        params.value= request.term;
		    
        $.post('view/ref_value_list',params, 
	function(data){
              response(data);
        });
    } 

function get_selected_rows() {
	var s=[];
	var  page = $("#jqGrid .table");
	if (page.length) {
		s.push($("#jqGrid .page_view").attr("meta_id")); 
	}
	else{
		s = jQuery("#jqGrid").jqGrid('getGridParam', 'selarrrow');
	};	 
	return s;
};
