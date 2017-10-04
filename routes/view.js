var express = require("express");
var router = express.Router();
var async = require('async');
var _ = require('lodash');
var fs = require("fs");
var db = require('../db/db');
var checkAuth = require('../middleware/checkAuth');
var ObjectID = require('mongodb').ObjectID;
var jspath = require('JSONPath');

var userID;

router.all('/', checkAuth, function (request, response, next) {
	next();
});

function get_filter (filter,value) {
var result;
var newf;

if (filter instanceof Array) {result=[];} else {result={};};
	for (var f in filter)   
	{ 
		newf=f;
if (f=='or'||f=='regex'||f=='options'|| f=='and' || f=='or'|| f=='lt'|| f=='gt'|| f=='lte'||f=='gte'|| f=='eq')
{ newf='$'+newf;};
	
	if (filter[f]!=undefined&&filter[f] instanceof Object)
{

result[newf]=get_filter (filter[f],value)}
else if (typeof filter[f]=='string') { 

var s; s=filter[f]; 
result[newf]=s.replace('[value]', value);


}else if (typeof filter[f]=='number'|| typeof filter[f]=='boolean') 
{result[newf]=filter[f];
}
;    try{
		if (result[newf] === "session_user") {
//			console.log('set session_user '+result[newf]);
			result[newf] = userID;
//			console.log(' session_user '+result[newf]);
		};
							
	if (newf=="_id")
	{  
//	console.log('set object_id '+result[newf]);
	result[newf]= new ObjectID(result[newf]); 
	}; }   catch(err){console.log('f= _id err '+err);};


};                      

return result;	

};

var get_col_list =function(colmodel){
//	var colmodel = row.data.colmodel;
	var selcols = {};
	for (var i = 0; i < colmodel.length; i++) {
		console.log(colmodel[i].name);

		selcols[colmodel[i].name] = '1';

	};
return selcols;	

}; 

function jsonPathToValue(jsonData, path) {
    if (!(jsonData instanceof Object) || typeof (path) === "undefined") {
        throw "Not valid argument:jsonData:" + jsonData + ", path:" + path;
    }
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    path = path.replace(/\//g, '.');
     path = path.replace(/^\#/, ''); // strip a leading dot

    path = path.replace(/^\./, ''); // strip a leading dot
 console.log('jsonPathToValue path '+ path); 
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


var get_defcolmodel= function (root_src,src,parent_path, dst/*,i*/){
/*  i=i-1;
   if (i<0){
	console.log('EXIT');
 return};*/
	if (src&&src.$ref) {
		src=jsonPathToValue(root_src, src.$ref);
 	};
 	for (prop in src){
	if (prop !== 'definitions'&& typeof src[prop]!='function') {
	    var dst_row={};
	    var path=parent_path;
		if (prop!=='properties')
		{path=path+'.'+prop;}
		
		if (src[prop]!=undefined &&src[prop] instanceof Object)
 		{  if (src[prop].type=='object'||prop=='properties'||src[prop].$ref){
 		    get_defcolmodel   (root_src,src[prop],path, dst/*,i*/)
		   };
                 }; 
//	console.log(JSON.stringify(src[prop]));

	    if (src[prop]&&src[prop].type&&(src[prop].type=='string'||src[prop].type=='text'||src[prop].type=='number'||src[prop].type=='boolean'||src[prop].type=='integer')){
	//	path=path+'.'+prop;
                dst_row['name']=path;
                dst_row['label']=src[prop].title;
		if (src[prop].type=='number'||src[prop].type=='boolean'||src[prop].type=='integer') 
	{	dst_row['formatter']=src[prop].type;
         }   	dst.push(dst_row);
//	console.log(dst_row['path']);

 	      }


 		};
	};
return;
};

var  get_gridcols_from_class =function (meta_class){
	console.log('Формируем view  из модели класса');
var plain=[];
var view={};
var colmodel=[{
                "label": "id",
                "name": "_id",
                "key": true,
                "hidden": true
            }];
            
	get_defcolmodel(meta_class.data,meta_class.data,'data',colmodel/*,10*/);
 view['colmodel']=colmodel;	
 return view;	

};                                           

router.post('/ref_value_list', function (req, res, next) {
	console.log("post '/ref_value_list'");
	console.log("post "+JSON.stringify(req.body) );
   

	userID = req.session.user;
	var meta_class = req.body.meta_class;
	var meta_view = req.body.meta_view;
	var colmodel = req.body.colmodel;
	

	var req_filter = req.body.filter;
 
	 /////////////////////////
	
	console.log('meta_class '+meta_class);
        var selcols=get_col_list(colmodel);
					 
	console.log('selcols '+JSON.stringify(selcols));
        req_filter=get_filter(req_filter,req.body.value);
	console.log('req_filter '+JSON.stringify(req_filter));

	async.waterfall([
			 function ( callback) {
		 			console.log(' find doc');
					var rows = db.get().collection(meta_class).find
						(req_filter,selcols).limit(5).toArray( function (err, rows) {
							var result = {};
						 	result = rows;
							callback(null, result);
						}); 

				},
			function ( rows,callback) {
				
		 		console.log(' prepare data  '+rows);
                                var result={rows}; 
				callback(null, result);
				},
			
		]
		, function (err, results) {

		if (err)
			return next(err);
		res.json(results);
	}); 

 

});

router.post('/:meta_class/:meta_view', function (req, res, next) {

	console.log("post '/:meta_class/:meta_view'");
	console.log("post " + req.params.meta_class);
	console.log("post " + req.params.meta_view);
	console.log("post "+JSON.stringify(req.body) );

        userID = req.session.user;

	var meta_class = req.params.meta_class;
	var meta_view = req.params.meta_view;
	var user_filter;
	if (req.body) {user_filter=req.body.filter};
	
 	/////////////////////////
	var dbloc = db.get();
   	var collectname= "meta_view";
	var fil= {"meta_name": meta_view};
	console.log("meta_view type "+typeof meta_view);
		
		if (typeof meta_view === 'undefined' ||!meta_view||meta_view===null||meta_view==='undefined') {
			collectname="meta_class";
 			fil={"meta_name": meta_class};
		};

	async.waterfall([
			function (callback) {
 				dbloc.collection(collectname).findOne(fil, callback);
			},
			function (model, callback) {
 				var filter = {};
				var vfilter ;
				var selcols={};
				console.log("model");
                                console.log(model);
				if (collectname=="meta_view"&& model!==null) {
				
					selcols=get_col_list(model.data.colmodel) ;
					console.log(selcols);
					
					if (model.data.filter) {
						vfilter = model.data.filter
						
				         

					};
				};
				
				if (collectname=='meta_class') 
					{model['data']= get_gridcols_from_class(model)};	
				if (vfilter&&user_filter)
					{ console.log('filter 1' );
					 filter['and']=[];
					 filter['and'].push(vfilter)    ;
					 filter['and'].push(user_filter);
					}
				else if (vfilter) {
					console.log('filter 2' );
					filter=vfilter;
				}
 

				else if (user_filter) {
					console.log('filter 3' );
					filter=user_filter; 
				};
                                console.log('filter4 '+JSON.stringify(filter));
				filter=get_filter(filter,null);
				console.log('filter5 '+JSON.stringify(filter));
				var rows= dbloc.collection(meta_class).find
					(filter, selcols).toArray(function (err, rows) {
						var result = {};
						result.header = model.data;
						result.rows = rows;
						callback(null, result);
					});

				
			}
		], function (err, results) {
		//console.log(results);

		if (err)
			return next(err);
		res.json(results);
	});

});

////////////////////////////////////////
module.exports = router;
