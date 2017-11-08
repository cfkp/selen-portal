'use strict';

 
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

  constructor(parentobj,_meta_class,_meta_view) 
{       this.parent=parentobj;
	this.parent_container=this.parent.container;

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
	if (parentobj&&parentobj.collection){
	this.collection=Object.assign({},parentobj.collection);}

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

 	if (this.header.methods_menu) {
/*	   	var div_detail = $('<div></div>'); 
		div_detail.attr('id','method_menu');	 
	        this.container.append(div_detail);*/
		this.methods=new SelenMenu(this,this.header.methods_menu);
		
		
	}; 
     	var gr_cont = $('<div></div>');
    
     	gr_cont.attr('id',this.gridid.grid_id);
        this.container.append(gr_cont);
	
	if (!this.header.template){this.header.template='default.ejs'};
        var tpl=getfile_sync('../template/'+this.header.template); 
 	if (this.rows){ 
         var html = ejs.render(tpl.responseText,{header:this.header,rows:this.rows});
         gr_cont.html(html);
        };
     

}

showgrid() {
this.view_mode='grid'; 
var header=this.header; 
 	if (this.header.methods_menu) {
/*	   	var div_detail = $('<div></div>'); 
		div_detail.attr('id','method_menu');	 
	        this.container.append(div_detail);*/
		this.methods=new SelenMenu(this,this.header.methods_menu);
		
		
	}; 

     	var table = $('<table></table>');
    
     	table.attr('id',this.gridid.grid_id);
   	var pager = $('<div></div>'); 
	pager.attr('id',this.gridid.gridpager_id)	 
        var gr_cont= this.container.append(table);
        gr_cont.append(pager);
	var container=table;//this.container.find(this.gridid.grid_id_);
 	var detail_container;//=grid_container.find('#detail_tabs');


 	
 	/*if (this.header.detail) {
	   	var div_detail = $('<div></div>'); 
		div_detail.attr('id','detail_tabs')	 
	        this.container.append(div_detail);
		detail_container=div_detail;
		this.detail=new SelenMenu(div_detail,header.detail.menu);
 		
		
	};*/
/*var c=$(window).width()-$(container).offset().left;//$(window).width();
var t= $(window).height()-$(container).offset().top ;

var h=$(window).height();
  	$.jgrid.defaults.width = c;*/
	$.jgrid.defaults.responsive = true; 
	$.jgrid.defaults.styleUI = 'Bootstrap';
	$.jgrid.styleUI.Bootstrap.base.headerTable = "table table-bordered table-condensed";
	$.jgrid.styleUI.Bootstrap.base.rowTable = "table table-bordered table-condensed";
	$.jgrid.styleUI.Bootstrap.base.footerTable = "table table-bordered table-condensed";
	$.jgrid.styleUI.Bootstrap.base.pagerTable = "table table-condensed";

	container.jqGrid({
		datatype: "local",
		data: this.rows,
		//height: t,
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
		onSelectRow: cb(this,this.onSelectRow)	});

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
			this.detail=new SelenMenu(this,this.header.detail.menu);
			this.detail.container.attr("meta_parent_field", "pers_request_id");
			this.detail.container.attr("meta_parent_value", rowid);
			this.detail.container.attr("meta_readonly",this.header.detail.readonly);
			this.detail.collection.meta_parent_class="person_request";
 			this.detail.collection.meta_parent_field="pers_request_id";
			this.detail.collection.meta_parent_value=rowid;

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

