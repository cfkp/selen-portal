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
if (f=='or'||f=='regex'||f=='options'  )
{ newf='$'+newf;};
	
	if (filter[f]!=undefined&&filter[f] instanceof Object)
{

result[newf]=get_filter (filter[f],value)}
else if (typeof filter[f]=='string' ) { 

var s; s=filter[f]; 
result[newf]=s.replace('[value]', value);

} ;    try{
		if (result[newf] === "session_user") {
			result[newf] = userID;
		};
							
	if (newf=="_id")
	{  
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
 					//var colmodel = cols;
				/*if (rows) {
					selcols=get_col_list(row.data.colmodel)
					var selcols = {};
					for (var i = 0; i < rows.length; i++) {
                                        selcols = {};
                                        if (colmodel&&colmodel.value) {
                               // console.log(rows[i]);
        
                               // console.log(colmodel.value);
					selcols["value"]= jspath ({json:rows[i],path:colmodel.value} )[0];
                               // console.log(selcols["value"]);
					
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

				};      */ 				callback(null, result);
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

 userID = req.session.user;
	var meta_class = req.params.meta_class;
	var meta_view = req.params.meta_view;

	var userID = req.session.user;
	/////////////////////////
	var dbloc = db.get();

	async.waterfall([
			function (callback) {
				db.get().collection("meta_view").findOne({
					"meta_name": meta_view
				}, callback);
			},
			function (row, callback) {
				if (row) {

					selcols=get_col_list(row.data.colmodel) ;
				/*	console.log(' find doc');              
					var colmodel = row.data.colmodel;
					var selcols = {};
					for (var i = 0; i < colmodel.length; i++) {
						//console.log(colmodel[i].name);

						selcols[colmodel[i].name] = '1';

					}; */
					console.log(selcols);
					var filter = {};
					if (row.data.filter) {
						filter = row.data.filter
						
				        filter=get_filter(filter,null);
					console.log('filter '+JSON.stringify(filter));

					};
					
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
