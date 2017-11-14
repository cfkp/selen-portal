var express = require("express");
var router = express.Router();
var async = require('async');
var _ = require('lodash');
var fs = require("fs");
var db = require('../db/db');
var checkAuth = require('../middleware/checkAuth');
var ObjectID = require('mongodb').ObjectID;
var jspath = require('JSONPath');
var log = require('libs/log')(module);
var config = require('config');

var userID;

router.all('/', checkAuth, function (request, response, next) {
log.debug({req:req},'router all');
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
	//console.log('set object_id '+result[newf]);
	//result[newf]= new ObjectID(result[newf]); 
	}; }   catch(err){
	//console.log('set object_id err'+err);

		log.error({filter:filter,value:value,error:err },'get_filter');
	};


};                      

return result;	

};

var get_col_list =function(colmodel){
 	var selcols = {};
	for (var i = 0; i < colmodel.length; i++) {
              if (colmodel[i].value){selcols[colmodel[i].name] = colmodel[i].value;}else{
		selcols[colmodel[i].name] = 1;}

	};
return selcols;	

}; 

var get_aggregate_params =function(filter ,colmodel){
	var res=[];
	res.push({ $match : filter });

 	var selcols = {};
	var joins=[];
	for (var i = 0; i < colmodel.length; i++) {
              if (colmodel[i].value)
		{selcols[colmodel[i].name] = colmodel[i].value;}
		else{selcols[colmodel[i].name] = 1;}
	if (colmodel[i].meta_ref) {
		var f=res.find(item => {
  		 return item.$lookup&&item.$lookup.localField == colmodel[i].meta_ref.localfield});
//console.log('f '+f);
		if (!f){	
		var look= {$lookup:
		        {
		          from: colmodel[i].meta_ref.meta_class,
		          localField: colmodel[i].meta_ref.localfield,
		          foreignField: "_id",   
		          as: colmodel[i].meta_ref.localfield
		        }}
		res.push(look);
		var addf= {},loc ={};

		loc[colmodel[i].meta_ref.localfield]={$arrayElemAt: [ "$"+colmodel[i].meta_ref.localfield, 0 ]};
		console.log(addf);
		addf['$addFields']=loc;
//console.log(addf);		
		res.push(addf);}	  
		/*	{$addFields:  
				{"user_createid" : 
					{$arrayElemAt: [ "$"+colmodel[i].meta_ref.localfield, 0 ]}
				} }*/
		
 		};		

	};
 res.push({'$project':selcols});
res.push({ $sort : { created : -1} });
return res;//{selcols:selcols,joins:joins};	

}; 

function jsonPathToValue(jsonData, path) {
    if (!(jsonData instanceof Object) || typeof (path) === "undefined") {
        throw "Not valid argument:jsonData:" + jsonData + ", path:" + path;
    }
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    path = path.replace(/\//g, '.');
     path = path.replace(/^\#/, ''); // strip a leading dot

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


var get_defcolmodel= function (root_src,src,parent_path, dst/*,i*/){
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
 
	    if (src[prop]&&src[prop].type&&(src[prop].type=='string'||src[prop].type=='text'||src[prop].type=='number'||src[prop].type=='boolean'||src[prop].type=='integer')){
                 dst_row['name']=path;
                dst_row['label']=src[prop].title;
		if (src[prop].type=='number'||src[prop].type=='boolean'||src[prop].type=='integer') 
	{	dst_row['formatter']=src[prop].type;
         }   	dst.push(dst_row);
 
 	      }


 		};
	};
return;
};

var  get_gridcols_from_class =function (meta_class){
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
log.info({req:req},'start');
 
	userID = req.session.user;
	var meta_class = req.body.meta_class;
	var meta_view = req.body.meta_view;
	var colmodel = req.body.colmodel;
 	var req_filter = req.body.filter;
 
 	if (!colmodel) {colmodel=[{
			                "label": "id",
			                "name": "_id",
			                "key": true,
			                "hidden": true
            			},
				{
			                "label": "id",
			                "name": "_id" 
            			}];
	    };

        var selcols=get_col_list(colmodel);
					 
         req_filter=get_filter(req_filter,req.body.value);
//	console.log('req_filter '+JSON.stringify(req_filter));
                                       
	async.waterfall([
			 function ( callback) {
 					var rows = db.get().collection(meta_class).find
						(req_filter,selcols).limit(5).toArray( function (err, rows) {
							var result = {};
						 	result = rows;
							callback(null, result);
						}); 

				},
			function ( rows,callback) {
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

//  /request_messages/vw_collection_messages

router.post('/request_messages/vw_collection_messages', function (req, res, next) {
log.debug({req:req},'start');
         userID = req.session.user;
 console.log('/request_messages/vw_collection_messages');
	var meta_class = 'request_messages';
	var meta_view ='vw_collection_messages';
	var user_filter;
	var collection;
	if (req.body) {user_filter=req.body.filter;collection=req.body.collection};
	 
	
 	/////////////////////////
	var dbloc = db.get();
   	var collectname= "meta_view";
	var fil= {"meta_name": meta_view};

	if (typeof meta_class === 'undefined' ||!meta_class||meta_class===null||meta_class==='undefined') { 
res.json({'error': 'class_undefined','msg': 'Неопределен класс'});
return;
	}	
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
				filter['and']=[];
var user_role;
 if (req.user.role){
 user_role=req.user.role._id;
}
		else
	{
user_role=config.get('def_role_id');
};

				filter['and'].push({"deleted":{ $exists: false}});
 				filter['and'].push({$or :[{"user_createid":userID } ,
				{"data.recepient_group_id": user_role } ]});
 				var vfilter ;
				var selcols={};
 				if (collectname=="meta_view"&& model!==null) {
				
					selcols=get_col_list(model.data.colmodel) ;
 					
					if (model.data.filter) {
						vfilter = model.data.filter
					};
				};
 
				if (collectname=='meta_class') 
					{model['data']= get_gridcols_from_class(model)};	
				if (vfilter&&user_filter)
					{  
					 filter['and'].push(vfilter)    ;
					 filter['and'].push(user_filter);
					}
				else if (vfilter) {
 					filter=vfilter;
				}
 

				else if (user_filter) {
 					filter=user_filter; 
				};
				if (collection&&collection.meta_parent_field){
				var colfilt={};
				colfilt[collection.meta_parent_field]=collection.meta_parent_value; 
					 filter['and'].push(colfilt);
					  
				}
//console.log('filt1')
//				console.log(JSON.stringify(filter))
//console.log('filt2')

 				filter=get_filter(filter,null);
//				console.log(JSON.stringify(filter))

  
var aggreg=get_aggregate_params(filter,model.data.colmodel);
aggreg.push({'$addFields':{mymessage:{ $eq: [ "$user_createid._id", userID ] }}})

console.log('view aggreg');
console.log(JSON.stringify(aggreg,4,4));
/*selcols={ _id: 1,
  created: 1,
  'data.message': 1,
  'data.recepient_group_id.title': 1,
  'data.recepient_group_idk': 'kljlkjlk' ,
  'user_createid.email': 1
   
};*/

  			dbloc.collection(meta_class).aggregate(
   				aggreg).toArray(function (err, rows) {
						var result = {};
						result.header = model.data;
						result.rows = rows;
						callback(null, result);
					});    


				
			}
		], function (err, results) {
 		if (err)
			return next(err);
		res.json(results);
	});

});




router.post('/:meta_class/:meta_view', function (req, res, next) {
log.debug({req:req},'start');
         userID = req.session.user;
	var meta_class = req.params.meta_class;
	var meta_view = req.params.meta_view;
	var user_filter;
	var collection;
	if (req.body) {user_filter=req.body.filter;collection=req.body.collection};
	 
	
 	/////////////////////////
	var dbloc = db.get();
   	var collectname= "meta_view";
	var fil= {"meta_name": meta_view};

	if (typeof meta_class === 'undefined' ||!meta_class||meta_class===null||meta_class==='undefined') { 
res.status(500).json({'error': 'class_undefined','msg': 'Неопределен класс'});
return;
	}	
		if (typeof meta_view === 'undefined' ||!meta_view||meta_view===null||meta_view==='undefined') {
			collectname="meta_class";
 			fil={"meta_name": meta_class};
		};

	async.waterfall([
			function (callback) {
 				dbloc.collection(collectname).findOne(fil, callback);
			},
			function (model, callback) {
				if (!model)
				{res.status(500).json({'error': 'view_undefined','msg': 'Не найдено представление'+meta_view});
				return;

				};
 				var filter = {};
				filter['and']=[];
 
				filter['and'].push({"deleted":{ $exists: false}});
  				var vfilter ;
				var selcols={};
 				if (collectname=="meta_view"&& model!==null) {
				
					selcols=get_col_list(model.data.colmodel) ;
 					
					if (model.data.filter) {
						vfilter = model.data.filter
					};
				};
 
				if (collectname=='meta_class') 
					{model['data']= get_gridcols_from_class(model)};	
				if (vfilter&&user_filter)
					{  
					 filter['and'].push(vfilter)    ;
					 filter['and'].push(user_filter);
					}
				else if (vfilter) {
					 filter['and'].push(vfilter)    ;
				}
 

				else if (user_filter) {
 					filter=user_filter; 
				};
				if (collection&&collection.meta_parent_field){
				var colfilt={};
				colfilt[collection.meta_parent_field]=collection.meta_parent_value; 
					 filter['and'].push(colfilt);
					  
				}
 
 				filter=get_filter(filter,null);
 
  
var aggreg=get_aggregate_params(filter,model.data.colmodel);
 
console.log('view aggreg');
 console.log(JSON.stringify(aggreg,4,4));

  			dbloc.collection(meta_class).aggregate(
   				aggreg).toArray(function (err, rows) {
						var result = {};
						result.header = model.data;
						result.rows = rows;
						callback(null, result);
					});    


				
			}
		], function (err, results) {
 		if (err)
			return next(err);
		res.json(results);
	});

});



////////////////////////////////////////
module.exports = router;
