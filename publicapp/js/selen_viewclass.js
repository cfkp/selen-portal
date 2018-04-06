'use strict';
 

class SelenView {

    constructor(parentobj, _meta_class, _meta_view, _filter) {
        var obj_container;
        if (parentobj) {
            this.parent = parentobj;
            this.parent_container = this.parent.container;
        } else {
            parentobj = $('#refview .modal-body')
        }
        if (parentobj instanceof jQuery) {
            this.parent = parentobj;
            this.parent_container = parentobj;

        }
        obj_container = $('<div></div>');
        obj_container.attr('class', 'sln_view_container');
        obj_container.attr('id', 'sln_cnt' + _meta_view);
        this.parent_container.append(obj_container);

        this.container = obj_container;
        this.container.attr('meta_class', _meta_class);

        this.container.attr('meta_view', _meta_view);

        this.meta_class = _meta_class;
        this.meta_view = _meta_view;
        this.gridid = this.get_grid_id();
        var cont_elem = obj_container.get(0);
        cont_elem.SelenObj = this;
        var menu_method_container = $('<div class="sln_menu_method_container"></div>');
        this.container.append(menu_method_container);
        this.menu_method_container = menu_method_container;
        var content_container = $('<div class="sln_view_content_container"></div>');
        this.container.append(content_container);
        this.content_container = content_container;

        var detail_container = $('<div class="sln_detail_container"></div>');
        this.container.append(detail_container);
        this.detail_container = detail_container;

        this.selected_rows = [];
        this.header = {};
        this.rows = {};
        this.methods = null;
        this.detail = null;
        if (typeof _filter == 'string') {
            this.user_filter = JSON.parse(_filter)
        } else {
            this.user_filter = _filter;
        }

        if (parentobj && parentobj.collection) {
            this.collection = Object.assign({}, parentobj.collection);
        }

        this.Load();
        //this.Show();
    }
    Destroy() {
        
        if (this.view_mode == 'grid') {
            $.jgrid.gridUnload(this.gridid.grid_id);
        }
        this.container.remove();
        for (var prop in this) {
            this[prop] = null;
        };
    }

    Load() {

        var requestdata = {};



        if (this.user_filter) {
            requestdata = {
                'filter': this.user_filter
            };
        };
        if (this.collection) {
            requestdata['collection'] = this.collection
        }

        SelenApi.api_load_async('/view/' + this.meta_class + '/' + this.meta_view, JSON.stringify(requestdata), SelenUtil.cb(this, this.AfterLoad))

        }

    AfterLoad(ajaxobj, response) {

        this.lastresponse = response;
        this.header = this.lastresponse.header;
        this.rows = this.lastresponse.rows;
        if (this.mode_refresh) {this.refreshAfterLoad()} else{
        this.Show();}
    };



    Show() {
        if (this.header.methods_menu) {
            this.methods = new SelenMenu(this, this.header.methods_menu, this.menu_method_container);
        };

        if ((this.header.view_mode) && (this.header.view_mode == "page")) {
            this.showpage()
        } else {
            this.showgrid()
        }


    }

    showpage() {
        this.view_mode = 'page';

        var gr_cont = $('<div></div>');

        gr_cont.attr('id', this.gridid.grid_id);
        this.content_container.append(gr_cont);

        if (!this.header.template) {
            this.header.template = 'default.ejs'
        };

        if (!this.EJSTemplate) {
            this.EJSTemplate = new SelenTemplate(this.header.template);
        };

        var html = this.EJSTemplate.render({
            header: this.header,
            rows: this.rows
        });
        gr_cont.html(html);
        this.get_selected_rows();

    }

    showgrid() {
        this.view_mode = 'grid';
        var header = this.header;
        /* 	if (this.header.methods_menu) {
         		this.methods=new SelenMenu(this,this.header.methods_menu,this.menu_method_container);
        	}; 
         */
        var table = $('<table></table>');

        table.attr('id', this.gridid.grid_id);
        var pager = $('<div></div>');
        pager.attr('id', this.gridid.gridpager_id)
        var gr_cont = this.content_container.append(table);
        gr_cont.append(pager);
        var container = table; //this.container.find(this.gridid.grid_id_);



        /*if (this.header.detail) {
	   	var div_detail = $('<div></div>'); 
		div_detail.attr('id','detail_tabs')	 
	        this.container.append(div_detail);
		detail_container=div_detail;
		this.detail=new SelenMenu(div_detail,header.detail.menu);
 		
		
	};*/
        //var w=$(window).width()-$(container).offset().left;//$(window).width();
        //var t= $(window).height()-$(container).offset().top ;

        //var h=$(window).height();
        //w=900;
        //h=400;
        //$.jgrid.defaults.width = w;
        $.jgrid.defaults.responsive = true;
        $.jgrid.defaults.styleUI = 'Bootstrap';
        $.jgrid.styleUI.Bootstrap.base.headerTable = "table table-bordered table-condensed";
        $.jgrid.styleUI.Bootstrap.base.rowTable = "table table-bordered table-condensed";
        $.jgrid.styleUI.Bootstrap.base.footerTable = "table table-bordered table-condensed";
        $.jgrid.styleUI.Bootstrap.base.pagerTable = "table table-condensed";

        container.jqGrid({
            datatype: "local",
            data: this.rows,
            //height: h,
            autowidth: true,
            autoheight: true,
            colModel: this.header.colmodel,
            viewrecords: true, // show the current page, data rang and total records on the toolbar
            caption: this.header.title,
            multiselect: true,
            multiboxonly: true,
            pager: this.gridid.gridpager_id_,
            loadonce: true,
            rowNum: 30,
            viewrecords: true,
            scroll: 1, // set the scroll property to 1 to enable paging with scrollbar - virtual loading of records
            emptyrecords: '0 записей найдено', // the message will be displayed at the bottom 

            shrinkToFit: true,
            beforeSelectRow: function (rowId, e) {
                //container.jqGrid("resetSelection");
                //return true;
            },
            onSelectRow: SelenUtil.cb(this, this.onSelectRow),
            onSelectAll: SelenUtil.cb(this, this.onSelectAll)
        });

        container.navGrid(this.gridid.gridpager_id_, {
                search: true, // show search button on the toolbar
                add: false,
                edit: false,
                del: false,
                refresh: true,

                beforeRefresh: SelenUtil.cb(this, this.refresh),
                afterRefresh: SelenUtil.cb(this, this.setSelection)

            }, {}, // edit options
            {}, // add options
            {}, // delete options
            {
                multipleSearch: true
            } // search options - define multiple search
        );

        var grid_element = this.container.find(this.gridid.grid_id_);
        var ids = grid_element.jqGrid("getDataIDs");
        if (ids && ids.length > 0) {
            grid_element.jqGrid("setSelection", ids[0]);
        }

    }
    clear_detail() {
        if (this.detail) {
            this.detail.Destroy();
            this.detail = null;
        };
    }
    refresh() {
        var s = this.get_selected_rows();
        this.mode_refresh=true;
        this.Load();
    }

    refreshAfterLoad() {
        var grid_element = this.container.find(this.gridid.grid_id_);

        if (this.view_mode == 'grid') {
            grid_element.jqGrid('resetSelection');
            this.clear_detail();
            grid_element.jqGrid('clearGridData');
            grid_element.jqGrid('setGridParam', {
                data: this.rows
            });
            grid_element.trigger('reloadGrid');
            this.setSelection();

        } else {
            var html = this.EJSTemplate.render({
                header: this.header,
                rows: this.rows
            });
            grid_element.html(html);
            this.get_selected_rows();
        };


    }


    setSelection() {
        if (this.selected_rows && this.selected_rows.length > 0) {
            var grid_element = this.container.find(this.gridid.grid_id_)
            grid_element.jqGrid('setSelection', this.selected_rows);
        };

    }

    get_selected_rows() {
        var s = [];
        if (this.view_mode == 'page') {
            var page = this.container.find(".selectelem");

            s.push(page.attr("meta_id"));
        } else {
            let selrows;
            selrows = $(this.gridid.grid_id_).jqGrid('getGridParam', 'selarrrow');
            if (selrows) {
                //if (selrows&&typeof selrows=='array') {
                s = selrows;
                //	} else {s.push(selrows)};
            }
        };
        this.selected_rows = s;
        if (this.methods) {
            this.methods.enableByObjlist(s.length)
        }
        return this.selected_rows;
    }

    onSelectAll(elem, id, status) {
        /* 	if (this.methods&&this.methods.container) {
        	var reports = this.methods.container.find("#rep_menu")
        	if (reports) {
        		reports.find( "#rep5" ).each(function( index ) {
        			if (status ){
        			$( this ).attr("href",$( this ).attr("hreftempl").replace('<%=meta_parent_value%>',id.join()))
        			}	
        			else {
        			$( this ).attr("href", null);

        			}
        		});	                           };

        }*/
    }
    onSelectRow(elem, rowid, selected) {
        if ((this.header.detail) && (rowid != null)) {
            this.clear_detail();
            var s = this.get_selected_rows();
            if (selected && s.length == 1) {
                this.detail = new SelenMenu(this, this.header.detail.menu, this.detail_container);
                this.detail.container.attr("meta_parent_field", "pers_request_id");
                this.detail.container.attr("meta_parent_value", rowid);
                this.detail.container.attr("meta_readonly", this.header.detail.readonly);
                this.detail.collection.meta_parent_class = "person_request";
                this.detail.collection.meta_parent_field = "pers_request_id";
                this.detail.collection.meta_parent_value = rowid;

                this.detail.meta_readonly = this.header.detail.readonly;
 
                this.detail.Show();
              }

        }
    }


    get_grid_id() {
        var id_cont = {};
        id_cont['grid_id'] = this.container.attr('id') + '_' + 'vwGrid';
        id_cont['gridpager_id'] = this.container.attr('id') + '_' + 'vwPager';
        id_cont['grid_id_'] = '#' + id_cont['grid_id'];
        id_cont['gridpager_id_'] = '#' + id_cont['gridpager_id'];
        return id_cont;

    };


};
