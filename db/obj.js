const util = require('util');
var express = require("express");
var router = express.Router();

var log = require('libs/log')(module);

var async = require('async');
var _ = require('lodash');
var fs = require("fs");
var db = require('../db/db');



function getschema(metaclass,nextfunc){
 var search_filter = {};
  if (metaclass) {search_filter["meta_name"]=metaclass;}

	db.get().collection("meta_class").findOne(
				search_filter
			, function (err,schema) {
				nextfunc(err, schema);
			});
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
		"schema":getschema.bind(null,metaclass),
		"value": getobj.bind(null,metaclass,this_id)
		 
	},
		function (err, result) {
		// result = {schema:xxx, value:xxx}
		
 		nextfunc(err,result);
 	});
};
 

////////////////////////////////////////
exports.getobj=getobj;
