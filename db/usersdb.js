var express = require("express");
var async = require('async');
var fs = require("fs");
var db = require('../db/db');

router.all('/',checkAuth,function(request, response,next){
	next();   
         });

router.post('/loaduserobj/:idform', function(req, res, next) {
console.log("post"+req.params.idform);
    var userID= req.session.user;
    var idform = req.params.idform;
/////////////////////////
	var dbloc=db.get();
	console.log('coll_get');

 
    async.parallel([
	function (callback){
            var result = {};
		console.log('Find meta data 0');
		console.log('idform '+idform);

            db.get().collection("meta_class").findOne({'meta_name': idform}, function (err, doc) {
		console.log('Find meta data1');
   		if( doc){
			result["schema"] = doc.data;
            
	    	}//else {result["schema"]={'error':'no_schema_found','mesage':'Не найдено описание данных'} }
                
                callback(err, result);
            });
        },
        function (callback){
            var result = {};
		console.log('Finddata');
		db.get().collection(idform).findOne({'user_createid':userID}, function(err, doc){
	 	if(err){  console.log('ERRRRRRRRRRRRRRROr'); console.log(err);
	            return next(err);
	        }

		console.log('Finddata');
   		if( doc) {
			console.log(doc);
			result["value"] = doc.data;
			}            
	        callback(err, result);
		});
		}

],
        function (err, results){
		console.log(results);
                if (!results[0].schema) 
		{res.status(500).send({'error':'no_schema_found','msg':'Не найдено описание данных'})}
		else 
		{res.json(results);}
        });
});



router.post('/loadclass/:meta_class/:meta_name/:meta_value', function(req, res, next) {
console.log("post '/loadclass/:meta_class/:meta_name/:meta_value',");
console.log("post "+req.params.meta_class);
console.log("post "+req.params.meta_name);
console.log("post "+req.params.meta_value);
    var userID= req.session.user;
    var meta_class = req.params.meta_class;
    var meta_name = req.params.meta_name;
    var meta_value = req.params.meta_value;

/////////////////////////
	var dbloc=db.get();
	console.log('coll_get');

 
    async.parallel([
	function (callback){
            var result = {};
		console.log('Find meta data 0');
		console.log('meta_class'+meta_class);

            db.get().collection("meta_class").findOne({'meta_name': meta_class}, function (err, doc) {
		console.log('Find meta data1');
   		if(doc) {
			result["schema"] = doc.data;
	    	};
		console.log(result["schema"]);

                if (err) return next(err);
                callback(err, result);
            });
        },
        function (callback){
            var result = {};
		console.log('Finddata');
	    var search_filter = {};
		search_filter[meta_name] = meta_value
/*		if (meta_name!="user_createid" )
		{ search_filter={"name":meta_value}}	
		 else
		{ search_filter={"user_created":userID };}	*/
	console.log('search_filter');
	console.log(search_filter);

		db.get().collection(meta_class).findOne(search_filter, function(err, doc){
	 	if(err){   console.log(err);
	            return next(err);
	        }

		console.log('Finddata');
   		if( doc) {
			console.log(doc);
			result["value"] = doc.data;
			}            
	        callback(err, result);
		});
		}
	],
        function (err, results){
                console.log("results");
		console.log(results);
                res.json(results);
/*                if (!results.schema) {res.status(500).send({'error':'no_data_found'})}
		else 
		{res.json(results);}*/
        });
});

router.post('/saveobj/:meta_class', function(req, res, next) {
console.log("post '/saveobj/:meta_class'");
console.log("post "+req.params.meta_class);
console.log(req.body);
    
var userID= req.session.user;
  // var nameForm = req.params.idform;
    var meta_class = req.params.meta_class;

    if(req.params.meta_class.indexOf(' ') > -1){
        res.status(400).json({'msg': 'Invalid class name'});
    }

    /*try{
        var data = ejson.parse(req.body);
    }catch(e){
        console.error('Syntax error: ' + e);
        res.status(400).json({'msg': 'Syntax error. Please check the syntax','detail':e});
        return;
    }*/         
        var data = req.body;

    console.log(data);
	var dbloc=db.get();
	console.log('coll_get');


    async.waterfall([
        function(callback) {
	    db.get().collection(meta_class).findOne({'user_createid':userID}, callback);
       	},
        function(row, callback) {
            if (row) {
		console.log(' find doc');
		console.log(row);
                row.data = data;
		row.created = Date.now;

            } else {  console.log('not find doc');
                var row = {user_createid :userID, data: data };
		};
		console.log(' set row');
		console.log(row);
	        dbloc.collection(meta_class).save(row, function (err, docs){
	
		console.log('save row');
                console.log(docs);

            if(err || docs.result === undefined){
                console.error('Error inserting document', err);
                //res.status(400).json({'msg': 'Error inserting document'});
            }else{
                var dataReturn = '';
                if(docs.ops){
                console.log(' inserting document');
                console.log(docs.ops);

                    dataReturn = docs.ops[0]._id;
                }
                console.log('Document successfully added');
            }
                    callback(null, row);
                });
            }
        
    ], function (err, results){
        if (err) return next(err);
        res.json(results);
    });
});/**/



router.post('/load_main_menu', function(req, res, next) {
console.log("post '/load_main_menu',");
    var userID= req.session.user;
    var meta_class = "meta_menu";
    var meta_name = "name";
    var meta_value = "client_menu";

/////////////////////////
	var dbloc=db.get();
	console.log('coll_get');

 
    async.parallel([
	function (callback){
            var result = {};
		console.log('Find meta data 0');
		console.log('meta_class'+meta_class);
 		result["schema"] = {};
                callback(undefined, result);

/*            db.get().collection("meta_class").findOne({'meta_name': meta_class}, function (err, doc) {
		console.log('Find meta data1');
   		if(doc) {
			result["schema"] = doc.data;
	    	};
		console.log(result["schema"]);

                if (err) return next(err);
                callback(err, result);
            });*/
        },
        function (callback){
            var result = {};
		console.log('Finddata');
	    var search_filter = {};
		search_filter[meta_name] = meta_value
/*		if (meta_name!="user_createid" )
		{ search_filter={"name":meta_value}}	
		 else
		{ search_filter={"user_created":userID };}	*/
	console.log('search_filter');
	console.log(search_filter);

		db.get().collection(meta_class).findOne(search_filter, function(err, doc){
	 	if(err){   console.log(err);
	            return next(err);
	        }

		console.log('Finddata');
   		if( doc) {
			console.log(doc);
			result["value"] = doc.data;
			}            
	        callback(err, result);
		});
		}
],
        function (err, results){
                console.log("results");
		console.log(results);
                res.json(results);
/*                if (!results.schema) {res.status(500).send({'error':'no_data_found'})}
		else 
		{res.json(results);}*/
        });
});

router.post('/callmethod/:meta_class/:meta_method/init', function(req, res, next) {
console.log("post '/call_method/:meta_class/:meta_method/:meta_action',");
console.log("post "+req.params.meta_class);
console.log("post "+req.params.meta_method);
console.log("post "+req.params.meta_action);

    var userID= req.session.user;
    var meta_class = req.params.meta_class;
    var meta_method = req.params.meta_method;
    var meta_action = req.params.meta_action;

/////////////////////////
	var dbloc=db.get();
	console.log('coll_get');

 
    async.parallel([

	function (callback){

            var result = {};
		console.log('Find meta data 0');
		console.log('meta_class'+meta_class);

            db.get().collection("meta_method").findOne({'meta_class': meta_class,'meta_method': meta_method}, function (err, doc) {
		console.log('Find meta data1');
   		if(doc) {
			result["schema"] = doc.data;
	    	};
		console.log(result["schema"]);

                if (err) return next(err);
                callback(err, result);
            });
        },
	function (callback){
            var result = {};
		console.log('Find meta data 0');
		console.log('meta_class'+meta_class);
 		result["value"] = {};
                callback(undefined, result);

/*            db.get().collection("meta_class").findOne({'meta_name': meta_class}, function (err, doc) {
		console.log('Find meta data1');
   		if(doc) {
			result["schema"] = doc.data;
	    	};
		console.log(result["schema"]);

                if (err) return next(err);
                callback(err, result);
            });*/
        }
],
        function (err, results){
                console.log("results");
		console.log(results);
                res.json(results);
        });

});


router.post('/callmethod/garant_request/create_request/execute', function(req, res, next) {
console.log("post '/callmethod/garant_request/create_request/execute',");
console.log("post "+req.body);
console.log("post comment"+req.body.comment);
console.log("post bank"+req.body.bank);
    var userID= req.session.user;
    var meta_class = 'garant_request';//req.params.meta_class;
    var meta_method = 'create_request';//req.params.meta_method;
    var meta_action  = 'execute';// req.params.meta_action;

/////////////////////////
	var dbloc=db.get();


    async.parallel({ 
	"enterprise":
        function (callback){
            var result = {};
	    var meta_class='enterprise';	
		console.log('Finddata');
		db.get().collection(meta_class).findOne({'user_createid':userID}, function(err, doc){
	 	if(err){  console.log('ERRRRRRRRRRRRRRROr'); console.log(err);
	            return next(err);
	        }

		console.log('Finddata');
   		if( doc) {
			console.log(doc);
			result = doc.data;
			}            
	        callback(err, result);
		});
	},
	"project":
        function (callback){
            var result = {};
	    var meta_class='project';	
		console.log('Finddata');
		db.get().collection(meta_class).findOne({'user_createid':userID}, function(err, doc){
	 	if(err){  console.log('ERRRRRRRRRRRRRRROr'); console.log(err);
	            return next(err);
	        }

		console.log('Finddata');
   		if( doc) {
			console.log(doc);
			result = doc.data;
			}            
	        callback(err, result);
		});
	}

}
,
        function (err, results){
                console.log("results");
		console.log(results);
		var data = results;
		data.comment=req.body.comment;
		data.bank=req.body.bank;
		data.state="Новый";

                var row = {"created":Date.now, "user_createid" :userID, "data": data};

		console.log(' set row');
		console.log(row);
	        dbloc.collection(meta_class).save(row, function (err, docs){
	
		console.log('save row');
                console.log(docs);

            if(err || docs.result === undefined){
                console.error('Error inserting document', err);
                //res.status(400).json({'msg': 'Error inserting document'});
            }else{
                var dataReturn = '';
                if(docs.ops){
                console.log(' inserting document');
                console.log(docs.ops);

                    dataReturn = docs.ops[0]._id;
                }
                console.log('Document successfully added');
            }
		
                res.json(dataReturn);
        	}); 

	});
});

router.post('/callmethod/:meta_class/:meta_method/execute', function(req, res, next) {
console.log("post '/call_method/:meta_class/:meta_method/execute',");
console.log("post "+req.params.meta_class);
console.log("post "+req.params.meta_method);
console.log("post "+req.body);

    var userID= req.session.user;
    var meta_class = req.params.meta_class;
    var meta_method = req.params.meta_method;
    var meta_action = req.params.meta_action;

/////////////////////////
	var dbloc=db.get();
	console.log('coll_get');
var results=req.body;
        res.json(results);

/* 
    async.parallel([

	function (callback){

            var result = {};
		console.log('Find meta data 0');
		console.log('meta_class'+meta_class);

            db.get().collection("meta_method").findOne({'meta_class': meta_class,'meta_method': meta_method}, function (err, doc) {
		console.log('Find meta data1');
   		if(doc) {
			result["schema"] = doc.data;
	    	};
		console.log(result["schema"]);

                if (err) return next(err);
                callback(err, result);
            });
        },
	function (callback){
            var result = {};
		console.log('Find meta data 0');
		console.log('meta_class'+meta_class);
 		result["value"] = {};
                callback(undefined, result);

        }
],
        function (err, results){
                console.log("results");
		console.log(results);
                res.json(results);
        });*/

});




////////////////////////////////////////
module.exports=router;