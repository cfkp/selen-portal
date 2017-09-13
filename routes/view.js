var express = require("express");
var router = express.Router();
var async = require('async');
var _ = require('lodash');
var fs = require("fs");
var db = require('../db/db');
var checkAuth = require('../middleware/checkAuth');
var ObjectID = require('mongodb').ObjectID;
var jspath = require('JSONPath');

router.all('/', checkAuth, function (request, response, next) {
	next();
});

function get_filter (filter,value,i) {
var result;
var newf;
i=i-1;
if (filter instanceof Array) {result=[];} else {result={};};
//if (i<0) {return;};
	for (var f in filter)   
	{ 
		newf=f;
if (f=='or'||f=='regex'||f=='options'  )
{ console.log('add$ '+f);
newf='$'+newf;};
	
console.log("filt["+f+"] "+JSON.stringify(filter[f]) );
console.log(typeof filter[f]);
console.log(filter[f] instanceof Object);
console.log(filter[f] instanceof Array);
console.log(filter[f] instanceof String);
	if (filter[f]!=undefined&&filter[f] instanceof Object)
{
console.log('Object go next');

result[newf]=get_filter (filter[f],value,i)}
else if (typeof filter[f]=='string' ) { 
console.log('String find value ');

var s; s=filter[f]; result[newf]=s.replace('[value]', value);
console.log('new '+result[f]);

} ;    try{
	if (newf=="_id")
	{  
console.log('f= _id filter[newf]');
	result[newf]= new ObjectID(result[newf]); 
	}; }   catch(err){console.log('f= _id err '+err);};


};                      

return result;	
};

router.post('/ref_value_list', function (req, res, next) {
	console.log("post '/ref_value_list'");
	console.log("post "+JSON.stringify(req.body) );
   

	var userID = req.session.user;
	var meta_class = req.body.meta_class;
	var meta_view = req.body.meta_view;
	var colmodel = req.body.colmodel;
	

	var req_filter = req.body.filter;
/*	var col_val= colmodel.value;
	col_val=col_val.substring(2);*/
	//req_filter [col_val]= { $regex: "^"+req.body.filter, $options:"i" } ;
 
	var userID = req.session.user;
	/////////////////////////
	
	console.log('meta_class '+meta_class); 
	console.log('req_filter '+JSON.stringify(req_filter));
        req_filter=get_filter(req_filter,req.body.value,5);
/*	req_filter={$or : [{"email" : { "$regex": ".*"+req.body.value +".*" , $options:"i"}}, 
                           {"fio"   : { "$regex": ".*"+req.body.value +".*", $options:"i" }}]};

     
	console.log('req_filternew '+JSON.stringify(req_filter));
        req_filter={"$or" : [{"email" : {"$regex":".*s.*","$options":"i"}},
                           {"fio"   : {"$regex":".*s.*","$options":"i"}}]};*/
	console.log('req_filternew2 '+JSON.stringify(req_filter));

	async.waterfall([
			 function ( callback) {
		 			console.log(' find doc');
					var rows = db.get().collection(meta_class).find
						(req_filter).limit(5).toArray( function (err, rows) {
							var result = {};
						 	result = rows;
							callback(null, result);
						}); 

				},
			function ( rows,callback) {
				
		 		console.log(' prepare data  '+rows);
                                var result={}; 
 					//var colmodel = cols;
				if (rows) {
					var selcols = {};
					for (var i = 0; i < rows.length; i++) {
                                        selcols = {};
                                        if (colmodel&&colmodel.value) {
                                console.log(rows[i]);
        
                                console.log(colmodel.value);
//({json: obj, path: path, callback: callback});
					selcols["value"]= jspath ({json:rows[i],path:colmodel.value} )[0];
                                console.log(selcols["value"]);
					
					}
					else {
						selcols["value"]= rows[i]._id;
					}
					;
					//	console.log(rows[i].email);
                                        if (colmodel&&colmodel.label) {
 					selcols["label"]= jspath ({json:rows[i],path:colmodel.label} )[0]
						;
					if (colmodel.value!="_id")   {
                                        selcols["label"]=selcols["label"] +'('+selcols["value"]+')';};
					};
                                         if (colmodel&&colmodel.desc) {
                                        	selcols["desc"]= jspath ({json:rows[i],path:colmodel.desc} )[0];
 					};
 					 selcols["id"]= rows[i]._id;
                        		 result[i] =selcols;
					};

				};
 				callback(null, result);
				},
			
		]
		, function (err, results) {
	//	console.log(results);

		if (err)
			return next(err);
		res.json(results);
	}); 

 

});

router.post('/:meta_class/:meta_view', function (req, res, next) {

	console.log("post '/:meta_class/:meta_view'");
	console.log("post " + req.params.meta_class);
	console.log("post " + req.params.meta_view);

	var userID = req.session.user;
	var meta_class = req.params.meta_class;
	var meta_view = req.params.meta_view;

	var userID = req.session.user;
	/////////////////////////
	var dbloc = db.get();
	console.log('coll_get');

	async.waterfall([
			function (callback) {
				db.get().collection("meta_view").findOne({
					"meta_name": meta_view
				}, callback);
			},
			function (row, callback) {
				if (row) {
					console.log(' find doc');
					console.log(row);
					var colmodel = row.data.colmodel;
					var selcols = {};
					for (var i = 0; i < colmodel.length; i++) {
						//console.log(colmodel[i].name);

						selcols[colmodel[i].name] = '1';

					};
					//console.log(selcols);
					var filter = {};
					if (row.data.filter) {
						filter = row.data.filter
						
						for (var key in filter) {

 							if (filter[key] === "session_user") {
								filter[key] = userID;
								};
							if (key=="_id")
								{
						filter[key]= new ObjectID(filter[key]);

								};

							}
					};

					
					console.log(filter);

					var rows = db.get().collection(meta_class).find
						(filter, selcols).toArray(function (err, rows) {
							var result = {};
							result.header = row.data;
							result.rows = rows;
							callback(null, result);
						});

				}
			}
		], function (err, results) {
		console.log(results);

		if (err)
			return next(err);
		res.json(results);
	});

});

////////////////////////////////////////
module.exports = router;
