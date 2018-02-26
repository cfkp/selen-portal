'use strict';



class SelenObject {

    constructor(parentobj, _meta_class, _meta_name, _meta_value, meta_readonly) {
        this.parent = parentobj;
        this.parent_container = this.parent.container;

        var obj_container = $('<div></div>');
        obj_container.attr('class', 'sln_obj_container');
        obj_container.attr('id', 'sln_cnt' + _meta_name);
        this.parent_container.append(obj_container);

        this.container = obj_container;

        this.meta_class = _meta_class;
        this.meta_name = _meta_name;
        this.meta_value = _meta_value;
        if ((meta_readonly) && (meta_readonly == "true")) {
            this.meta_readonly = true;
        } else {
            this.meta_readonly = false;
        };
        if (parentobj && parentobj.collection) {
            this.collection = Object.assign({}, parentobj.collection);
        }

        this.schema = {};
        this.data = {};
        this.bf = null;
        this.Load();
        this.Show();
    }
    Destroy() {
        this.SaveClick();
        this.container.remove();
        /*var meth_cont =this.container.find("#methods_container"); 
        meth_cont.remove();
        var bfcont=this.container.find("#data_container");
        bfcont.remove();
        */

        for (var prop in this) {
            this[prop] = null;
        };
    }

    Load() {
        this.lastresponse = SelenApi.api_load_sync('/loadclass/' + this.meta_class + '/' + this.meta_name + '/' + this.meta_value, null);
        this.schema = this.lastresponse.responseJSON.schema;
        this.value = this.lastresponse.responseJSON.value;
    }

    Show() {
        /*	<div id="methods_container" style="position: relative;display: block;margin-bottom: 2%;">
        	</div>
        	<div id="data_container"></div>
        */
        var div_meth = $('<div id="methods_container" class="sln_method_menu" > </div>');
        var div_data = $('<div id="data_container"></div>');
        this.container.append(div_meth, div_data);

        if (!this.meta_readonly) {

            var savebtn = document.createElement("button");
            savebtn.className = "btn btn-primary";
            savebtn.appendChild(document.createTextNode('Сохранить'));
            savebtn.onclick = SelenUtil.cb(this, this.SaveClick);

            var check_btn = document.createElement("button");
            check_btn.className = "btn btn-primary";
            check_btn.appendChild(document.createTextNode('Проверить'));
            check_btn.onclick = SelenUtil.cb(this, this.CheckClick);

            var meth_cont = this.container.find("#methods_container");
            meth_cont.append(savebtn, check_btn);
            $(div_meth).affix({
                               
                offset: {
                    top: 500 /*,
                    bottom: function () {
                      return (this.bottom = $('.footer').outerHeight(true))
                    }*/
                }
            })
        }
        var bfcont = this.container.find("#data_container");
        this.bf = BrutusinForms.create(this.schema.data);
        if (this.value && this.value.data) {
            this.bf.render(bfcont[0], this.value.data);
        } else {
            this.bf.render(bfcont[0], null);
        };
        this.data = this.bf.getData();
        if (this.meta_readonly) {
            bfcont.find(':input').attr('disabled', 'disabled');
        }
    }

    SaveClick(sayOk) {
        var save;
        if (this.meta_readonly) {
            return;
        };
        var newdata = this.bf.getData();
        if (newdata == null) {
            messagedlg(null, "Ошибка сохранения данных - пустые данные", "message");
        } else if (newdata && this.data && JSON.stringify(newdata) === JSON.stringify(this.data)) {
            console.log('no change data');
            if (sayOk) {
                alert("Данные не изменялись.");
            }
        } else {
            save = true; // confirm("Данные не сохранены.Сохранить?");
            if (save) {
                this.data = newdata;
                var resp = api_load_sync("saveobj/" + this.meta_class + '/' + this.meta_name + '/' + this.meta_value, JSON.stringify(this.data));
                /*if (sayOk){
			messagedlg(null, "Данные сохранены", "message");
		}*/
            }
        }
    }

    CheckClick() {
        //     HaltError('jkhkjhkhkh');

        if (this.bf.validate()) {
            messagedlg(null, "Ошибок нет", "message");
        }
        /*else {
	messagedlg(null, "Найдены ошибки", "error");
		}*/
        ;

    }

};
