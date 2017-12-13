const util = require('util');
var express = require("express");
var router = express.Router();

var log = require('libs/log')(module);

var async = require('async');
var _ = require('lodash');
var fs = require("fs");
var db = require('../db/db');

var mailer = require('../middleware/sendmail'); //-- Your js file path
var sess = require('../middleware/session');

function jsonPathToValue(jsonData, path) {
    if (!(jsonData instanceof Object) || typeof (path) === "undefined") {
        throw "Not valid argument:jsonData:" + jsonData + ", path:" + path;
    }
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    path = path.replace(/\//g, '.');
     path = path.replace(/^\#/, ''); // strip a leading #
    path = path.replace(/^\$/, ''); // strip a leading $
    path = path.replace(/^\./, ''); // strip a leading dot
//console.log('jsonPathToValue ' + JSON.stringify(jsonData,4,4));
//console.log('jsonPathToValue ' +   path);
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
            return null;//key;
        }
    }
    return jsonData;
};  


function set_defaults(schema,sysdefs) {
 
	 for (var f in schema)   
		{ 
		if (schema[f]!=undefined&&schema[f] instanceof Object)
		{
		set_defaults (schema[f],sysdefs) ;
		}
		else if (typeof schema[f]=='string') { 
/*console.log(f);
console.log(schema[f]);*/
			var val =  schema[f];
			if (f=='default'&&val.match(/^\$.*$/) /*'$user.email'&&sysdefs&&sysdefs.email*/){
//console.log('set def '+val);
				try{	  
                        	  schema[f]=jsonPathToValue(sysdefs,val  );}
				catch (e){schema[f]=null;}
	
//console.log('new  '+schema[f]);
			};
 		};
 	};                      
};


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
		{   if (schema_method)
			{callback(null,schema_method)
			}
			else if(!schema_method&&(meta_method=='new'||meta_method=='edit')) {	
				getObjectSchema(meta_class,callback);
			}
			else if(!schema_method&&meta_method=='delete'){
///можно поставить рекурсию но пока не будем		getMethodSchema('default','delete',nextfunc)	
				search_filter={
					'meta_class': 'default',
					'meta_name': 'delete'
				};
				db.findone("meta_method",search_filter,callback);
 			}
			else{

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
 //console.log('getobj metaclass '+metaclass);
 //console.log('getobj search '+JSON.stringify(search_filter));
 db.findone(metaclass,search_filter, nextfunc);
};
exports.getobj=getobj;

function getobjbyfilter(metaclass,search_filter,nextfunc){
// console.log('getobjbyfilter metaclass '+metaclass);
// console.log('getobjbyfilter search '+JSON.stringify(search_filter));
 db.findone(metaclass,search_filter, nextfunc);
};
exports.getobjbyfilter=getobjbyfilter;

function getobjfull(metaclass,this_id,nextfunc){
	async.parallel({
		"schema":getObjectSchema.bind(null,metaclass),
		"value": getobj.bind(null,metaclass,this_id)
		 
	},
  		nextfunc
 	);
};
exports.getobjfull=getobjfull;

/// получить объект коллекции  
// metaclass - имя дочернего мета класса 
// collection - {meta_parent_field:'имя поля',meta_parent_value:'значение поля'} 
 
function getchildobj (metaclass,collection,nextfunc){
        var search_filter={};
        if (collection&&collection.meta_parent_field){
		search_filter[collection.meta_parent_field]=collection.meta_parent_value; 
	};

 	async.parallel({
		"schema":getObjectSchema.bind(null,metaclass),
		"value": getobjbyfilter.bind(null,metaclass,search_filter)
	},
  		nextfunc
 	);
};
exports.getchildobj =getchildobj;


function init_method(meta_class,meta_method,obj_list,nextfunc) {
/* console.log('init_method meta_class '+meta_class);
 console.log('init_method meta_method '+meta_method);
 console.log('init_method obj_list '+obj_list);
*/
 	if (meta_class=='undefined'||meta_method=='undefined') {
	return	{ 		'error': 'no_class',
				'msg': 'Не определен класс или операция'
			};
	
	};
	/////////////////////////
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
console.log('default session  '+JSON.stringify(sess.CurrentUser(),4,4));
			try{
			set_defaults(results.schema,{user:sess.CurrentUser()});
			}
			catch(e){};
 			console.log('after set def '+JSON.stringify(results,4,4));
			nextfunc(null,results);
		}
	});

};
exports.init_method=init_method;

function sendmail2user(userid,subject,message,templateName,data){

 	async.waterfall([
			function (callback) {
                         getobj('users',userid,callback);
			}
 
		],
		function (err, res) {
 			console.log('sendmail2user' +' mail data '+JSON.stringify(res,4,4));
			mailer(res.email,subject,message,templateName,data);
 	});

};

exports.sendmail2user=sendmail2user;

////////////////////////////////////////

