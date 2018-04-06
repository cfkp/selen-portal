'use strict';


function callmeth_in_window(meta_class, meta_meth, def_data) {

    window.method_call = {};
    window.method_call.meta_class = meta_class;
    window.method_call.meta_meth = meta_meth;
    window.method_call.def_data = def_data;

    // var win = window.open('/dummy.html','', '');
    var win = window.open('/callmethod.html', '', '');

    /*win.onload =function(){
    	new SelenMethod(undefined,meta_class, meta_meth,null, def_data );
    };
    */


};

class SelenMethod {

    constructor(parentobj, _meta_class, _meta_name, _objectlist, def_data) {
        if (parentobj) {
            this.parent = parentobj;

            this.parent_container = this.parent.container;

            var obj_container = $('<div></div>');
            obj_container.attr('class', 'sln_container');
            obj_container.attr('id', 'sln_cnt' + _meta_name);
            this.parent_container.append(obj_container);

            this.container = obj_container;
        }

        this.modal_container = $('#method_execute');
        this.meta_class = _meta_class;
        this.meta_name = _meta_name;
        this.def_data = def_data;
        this.objectlist = {};
        if (_objectlist) {
            this.objectlist = _objectlist
        };
        this.schema = {};
        if (parentobj && parentobj.collection) {
            this.collection = Object.assign({}, parentobj.collection);
        }
        this.data = {};
        this.bf = null;
        this.Init();
        //	this.Show();
    }
    Destroy() {
        //this.SaveClick();
        this.container.remove();
        this.modal_container.find('#execute').unbind('click');
        this.modal_container.find("#data_container").empty();

        for (var prop in this) {
            this[prop] = null;
        };
    }

    Init() {

        SelenApi.api_load_async('/api/callmethod/' + this.meta_class + '/' + this.meta_name + '/init', {
            objectlist: this.objectlist
        }, SelenUtil.cb(this, this.AfterInit))
        /*	this.lastresponse= api_load_sync('callmethod/'+this.meta_class+'/'+this.meta_name+'/init', JSON.stringify({objectlist:this.objectlist}));
        	this.schema=this.lastresponse.responseJSON.schema;
        	 
        	this.value=this.lastresponse.responseJSON.value;
        */
    }
    AfterInit(ajaxobj, response) {
        this.lastresponse = response;
        this.schema = this.lastresponse.schema;

        this.value = this.lastresponse.value;
        /*if (!this.parent) {
        this.createwindow();
        } else {
        */
        this.Show();
        //}

    } 

    Errorhandler(element, err) {
        $('#loading').hide();
        var alertcont = this.modal_container.find('#executealert');
        if (alertcont && err.responseJSON && err.responseJSON.msg) {
            alertcont.text(err.responseJSON.msg);
            this.modal_container.find('#execute').prop('disabled', false);
            alertcont.show();
            //throw undefined;
        } else {
            throw new SelenError(err);
        }
    }


    Execute() {
        //alert (JSON.stringify(this.bf.getData(),4,4));
        if (this.bf.validate()) {
            this.data = this.bf.getData();
            this.modal_container.find('#execute').prop('disabled', true);
            SelenApi.api_load_async('/api/callmethod/' + this.meta_class + '/' + this.meta_name + '/execute', {
                objectlist: this.objectlist,
                collection: this.collection,
                data: this.data
            }, SelenUtil.cb(this, this.AfterExecute), SelenUtil.cb(this, this.Errorhandler));

            /* 	this.lastresponse=api_load_sync('callmethod/'+this.meta_class+'/'+this.meta_name+'/execute', JSON.stringify({objectlist:this.objectlist,collection:this.collection,data:this.data}));
             	if (this.lastresponse.responseJSON.msg) {messagedlg(this.lastresponse.responseJSON.msg);};
            	if (this.parent&&this.parent.parent instanceof SelenView ) {
                                                       this.parent.parent.refresh();
            	};*/
        };
    }

    AfterExecute(ajaxobj, response) {
        this.lastresponse = response;
        if (this.lastresponse.msg) {
            SelenUtil.messagedlg(this.lastresponse.msg);
        };
        $('#method_execute').modal('hide');

        if (this.parent && this.parent.parent instanceof SelenView) {
            this.parent.parent.refresh();
        };
 
        if (window.opener) {

            window.close();
        };


    };


    Show() {

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
        var bfcont = this.modal_container.find("#data_container");
        bfcont.empty();
        this.bf = BrutusinForms.create(this.schema.data);

        if (this.value && this.value.data) {
            this.bf.render(bfcont[0], this.value.data);
        } else {
            this.bf.render(bfcont[0], this.def_data);
        };

        this.modal_container.find('#method_title').html(this.schema.data.title);
        this.modal_container.find('#execute').unbind('click');
        this.modal_container.find('#execute').prop('disabled', false);
        this.modal_container.find('#executealert').hide();

        this.modal_container.find('#execute').bind('click', SelenUtil.cb(this, this.Execute));
        if (window.opener) {
            this.modal_container.find('#cancel').unbind('click');
            this.modal_container.find('#cancel').bind('click', function () {
                window.close()
            });
        };
        this.modal_container.modal();


    }


    CheckClick() {
        if (this.bf.validate()) {
            SelenUtil.messagedlg(null, "Ошибок нет", "message");
        } else {
            SelenUtil.messagedlg(null, "Найдены ошибки", "error");
        };

    }



};
