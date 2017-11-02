'use strict';

function cb(object, fnc)
{
    return function() {
        var args = [this];
        for (var i in arguments) args.push(arguments[i]);
        return fnc.apply(object, args);
    }
}

function view_load_sync(url, requestdata) {
var result=$.ajax({
		url: "../view/" + url,
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

function getfile_sync(file, callback) {
var result=$.ajax(file, {
		type: 'GET',
		async: false
             }
        );
 	if(result.status!=200){
		throw result.responseText//new IstoeServiceException(this.lastResult.status,xml+" "+this.lastResult.statusText,this.lastResult.responseText);
	}

	return  result;
};


var get_grid_id =function (grid_container){
var id_cont={};
id_cont['grid_id']=grid_container.attr('id')+'_'+'vwGrid';
id_cont['gridpager_id']=grid_container.attr('id')+'_'+'vwPager';
id_cont['grid_id_']='#'+id_cont['grid_id'];
id_cont['gridpager_id_']='#'+id_cont['gridpager_id'];
return id_cont;
	
};


class SelenView {

  constructor(cont,_meta_class,_meta_view) 
{       this.parent_container=cont;

	var obj_container = $('<div></div>'); 
	obj_container.attr('class','sln_container');	 
	obj_container.attr('id','sln_cnt'+_meta_view);
	this.parent_container.append(obj_container);
		
	this.container=obj_container;

	this.container.attr('meta_class',_meta_class);
	this.container.attr('meta_view',_meta_view);

	this.meta_class=_meta_class;
	this.meta_view=_meta_view;
	this.gridid=get_grid_id(this.container);
	this.selected_rows=[];
	this.header={};
	this.rows={};
	this.methods=null;
	this.detail=null;
  	this.Load();
	this.Show();
}
   Destroy()
	{
	//this.SaveClick();

//	var meth_cont =this.container.find("#methods_container"); 
//	meth_cont.empty();
//	var bfcont=this.container.find("#data_container");
//	bfcont.empty();
	if (this.view_mode=='grid'){
 	$.jgrid.gridUnload(this.gridid.grid_id);
  	}
	this.container.remove();
	for (var prop in this){
		this[prop]=null;
	};
 	}

   Load()
	{

	var requestdata ; 
	
 

	if (this.user_filter){requestdata = {'filter':this.user_filter};};



	this.lastresponse= view_load_sync( this.meta_class + '/' + this.meta_view , requestdata);
	this.header=this.lastresponse.responseJSON.header;
	this.rows=this.lastresponse.responseJSON.rows;
	}

Show()
{
	if ((this.header.view_mode)&&(this.header.view_mode=="page" ))
	{ this.showpage()}
	else 
	{this.showgrid()}
 

}

showpage() {
	this.view_mode='page'; 
        var tpl=getfile_sync('../template/'+'default.ejs'); 
 	if (this.rows){ 
         var html = ejs.render(tpl.responseText,{header:this.header,rows:this.rows});
         $(this.container).html(html);
        };
     

}

showgrid() {
this.view_mode='grid'; 
var header=this.header; 
 	if (this.header.methods_menu) {
/*	   	var div_detail = $('<div></div>'); 
		div_detail.attr('id','method_menu');	 
	        this.container.append(div_detail);*/
		this.methods=new SelenMenu(this.container,this.header.methods_menu);
		
		
	}; 

     	var table = $('<table></table>');
    
     	table.attr('id',this.gridid.grid_id);
   	var pager = $('<div></div>'); 
	pager.attr('id',this.gridid.gridpager_id)	 
        var gr_cont= this.container.append(table);
        gr_cont.append(pager);
	var container=this.container.find(this.gridid.grid_id_);
 	var detail_container;//=grid_container.find('#detail_tabs');


 	
 	/*if (this.header.detail) {
	   	var div_detail = $('<div></div>'); 
		div_detail.attr('id','detail_tabs')	 
	        this.container.append(div_detail);
		detail_container=div_detail;
		this.detail=new SelenMenu(div_detail,header.detail.menu);
 		
		
	};*/
  	$.jgrid.defaults.width = 900;
	$.jgrid.defaults.responsive = true; 
	$.jgrid.defaults.styleUI = 'Bootstrap';

	container.jqGrid({
		datatype: "local",
		data: this.rows,
		height: 400,
		colModel: this.header.colmodel,
		viewrecords: true, // show the current page, data rang and total records on the toolbar
		caption: this.header.title,
		multiselect: true,
		pager: this.gridid.gridpager_id_,
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
		onSelectRow: cb(this,this.onSelectRow)/*function (rowid, selected) {
			if ((header.detail) && (rowid != null)&&detail_container.length!=0) {

				if (selected) {
					detail_container.attr("meta_parent_field", "pers_request_id");
					detail_container.attr("meta_parent_value", rowid);
					detail_container.attr("meta_readonly",header.detail.readonly);
					
					var reports = detail_container.find("#rep_menu")
					if (reports) {
						reports.find( "li a" ).each(function( index ) {
   							$( this ).attr("href",$( this ).attr("hreftempl").replace('<%=meta_parent_value%>',rowid))
 						});	
					}
					detail_container.show();
					detail_container.find("[root_menu='#detail_tabs']").show();	
					detail_container.find('.active a').click();
 				} else {
					detail_container.hide();
					hide_formBRUT(grid_container);
				};
			}
		}    */
	});

	container.navGrid(this.gridid.gridpager_id_, {
		search: true, // show search button on the toolbar
		add: false,
		edit: false,
		del: false,
		refresh: true,
		
		beforeRefresh: cb(this,this.refresh) ,
		afterRefresh: cb(this,this.setSelection)
 
	}, {}, // edit options
	{}, // add options
	{}, // delete options
	{
		multipleSearch: true
	} // search options - define multiple search
	);

 
}
refresh(){
  	var s=this.get_selected_rows();
 	this.Load();
	var grid_element=this.container.find(this.gridid.grid_id_);
	 
	grid_element.jqGrid('clearGridData');
	grid_element.jqGrid('setGridParam', {
		data: this.rows
	});
	grid_element.trigger('reloadGrid');
/*	if (s&&s.length>0){
	grid_element.jqGrid('setSelection',s);
	 };
*/  
}
setSelection(){
 	if (this.selected_rows&&this.selected_rows.length>0){
	var grid_element=this.container.find(this.gridid.grid_id_)
	grid_element.jqGrid('setSelection',this.selected_rows);
	 };
  
}

get_selected_rows() {
	var s=[];
	//var  page = viewcontainer.find(".pageview");
	if (this.view_mode=='page') {
	//	s.push(page.attr("meta_id")); 
	}
	else{     
 		let selrows;
		selrows = $(this.gridid.grid_id_).jqGrid('getGridParam', 'selrow');
		if (selrows){	
		if (selrows&&typeof selrows=='array') {
		s=selrows;		
		} else {s.push(selrows)};
		} 
	};	 
	this.selected_rows=s;
	return this.selected_rows;
}


onSelectRow (elem,rowid, selected) {
	if ((this.header.detail) && (rowid != null)) {
		if (this.detail) {
		this.detail.Destroy();
		this.detail=null;
		};					
 		if (selected) {
			this.detail=new SelenMenu(this.container,this.header.detail.menu);
			this.detail.container.attr("meta_parent_field", "pers_request_id");
			this.detail.container.attr("meta_parent_value", rowid);
			this.detail.container.attr("meta_readonly",this.header.detail.readonly);
			this.detail.meta_parent_field="pers_request_id";
			this.detail.meta_parent_value="rowid";
			this.detail.meta_readonly="this.header.detail.readonly";
			var reports = this.detail.container.find("#rep_menu")
			if (reports) {
				reports.find( "li a" ).each(function( index ) {
					$( this ).attr("href",$( this ).attr("hreftempl").replace('<%=meta_parent_value%>',rowid))
				});	
			} 
this.detail.Show();
		//	detail_container.show();
		//	detail_container.find("[root_menu='#detail_tabs']").show();	
		//	detail_container.find('.active a').click();

 		}  
	 
	}
}


};

