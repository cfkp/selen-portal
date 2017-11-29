const util = require('util');
var express = require("express");
var router = express.Router();

var log = require('libs/log')(module);

var async = require('async');
var _ = require('lodash');
var fs = require("fs");
var db = require('../db/db');



function getObjectSchema(metaclass,nextfunc){
 var search_filter = {};
  if (metaclass) {search_filter["meta_name"]=metaclass;
	db.findone("meta_class",search_filter, nextfunc);};

/// Добавить обработку ошики если metaclass не указан	
 	/*db.get().collection("meta_class").findOne(
				search_filter
			,  nextfunc);*/
};

function getMethodSchema(meta_class,meta_method,nextfunc){
	var search_filter = {};
/*	if (metaclass) {search_filter={
				'meta_class': meta_class,
				'meta_name': meta_method
			};}
*/
     async.waterfall([
	function(callback)
		{        search_filter={
				'meta_class': meta_class,
				'meta_name': meta_method
			};
			db.findone("meta_method",search_filter,callback);
 
		},

	function(schema_method,callback)
		{   if (schema_method){callback(null,schema_method)
			}else if(!schema_method&&(meta_method=='new'||meta_method=='edit')) {	
				getObjectSchema(meta_class,callback);
			}else if(!doc&&meta_method=='delete'){
///можно поставить рекурсию но пока не будем		getMethodSchema('default','delete',nextfunc)	
				search_filter={
					'meta_class': 'default',
					'meta_name': 'delete'
				};
				db.findone("meta_method",search_filter,callback);
 			}else{

 			   callback ({
				'error': 'no_schema',
				'msg': 'Не определена схема для операции'
				});

			};
		}
			                              		
	]	
        , function (err, result) {

		if (err){nextfunc(err)}else {
		nextfunc(err,result);		
		};
	} );
};

function getobj(metaclass,this_id,nextfunc){
 var search_filter = {};
 search_filter["_id"]= this_id;
 console.log('getobj metaclass '+metaclass);
 console.log('getobj search '+JSON.stringify(search_filter));
 db.findone(metaclass,search_filter, nextfunc);
};

function getobjfull(metaclass,this_id,nextfunc){
	async.parallel({
		"schema":getObjectSchema.bind(null,metaclass),
		"value": getobj.bind(null,metaclass,this_id)
		 
	},
  		nextfunc
 	);
};
 

exports.init_method=function(meta_class,meta_method,obj_list,nextfunc) {
 console.log('init_method meta_class '+meta_class);
 console.log('init_method meta_method '+meta_method);
 console.log('init_method obj_list '+obj_list);

 	if (meta_class=='undefined'||meta_method=='undefined') {
	return	{ 		'error': 'no_class',
				'msg': 'Не определен класс или операция'
			};
	
	};
	/////////////////////////
	var dbloc = db.get();
 
	async.parallel({

		"schema": getMethodSchema.bind(null,meta_class,meta_method) ,
		"value": getobj.bind(null,meta_class,obj_list[0])

		},
		function (err, results) {
 		if (err) {
			nextfunc(err);
		return;
		};

		if ((results.schema.data.objectlist !== undefined) && (results.schema.data.objectlist == "1") &&
			((!obj_list) || (obj_list.length === 0))) {
			nextfunc({
				'error': 'no_objectlist',
				'msg': 'Не выбраны документы'
			})
		} else {
			nextfunc(null,results);
		}
	});

};



////////////////////////////////////////
exports.getobj=getobj;
