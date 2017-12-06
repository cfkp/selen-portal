var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID;
var sess=require('../middleware/session');
 
var   dbconnection=null ;  // глобальная переменная не обнуляется при запросах  

exports.connect = function(url, done) {

 console.log('connect  dbconnection_ '+ dbconnection);

  if (dbconnection) return done()
   MongoClient.connect(url,
 	{
         autoReconnect: true,
 	 reconnectTries:100,
         poolSize: 10
	}, 
	function(err, dbres) {
    		if (err) return done(err);
    		 dbconnection = dbres;
   done();
	  })
}

exports.get = function() {
 
   return dbconnection
 }

exports.close = function(done) {
  if (dbconnection) {
    dbconnection.close(function(err, result) {
      dbconnection = null
      done(err)
    })
  }
}

exports.audit=function(userid,meta_class,meta_method,obj_id,data){
 		var id = new ObjectID().toString();
         	var sysdate=   new Date().toISOString();

  		var row = {"_id":id,
			"created": sysdate ,
			"this_meta_class":"audit",
			"user_createid": sess.CurrentUserId(),
			"meta_class":meta_class,
			"meta_method":meta_method,
			"object_id":obj_id,
			"data": data
		};

		dbconnection.collection("audit").save(row, function (err, docs) {

		});


};


exports.findone=function(meta_class,search_filter,nextfunc){
  		 dbconnection.collection(meta_class).findOne(
				search_filter,nextfunc
                	);
 };


exports.save_obj_hist=function(userid,meta_class,obj){
	var id = new ObjectID().toString();
 	var sysdate=   new Date().toISOString();

 	if (obj){	
		var row = {"_id":id,
			"created": sysdate ,
			this_meta_class:"object_history",
			"user_createid": sess.CurrentUserId(),
			"meta_class":meta_class,
			"object_id":obj._id,
			"object": obj
		};

		dbconnection.collection("object_history").save(row, function (err, docs) {

		});
	};	

};


exports.save_obj=function(meta_class,data,callback){
console.log('save_obj curuser '+sess.CurrentUserId());

	var id = new ObjectID().toString();
 	var sysdate=   new Date().toISOString();

 	if (data){	
		var row = {"_id":id,
			"created": sysdate ,
			this_meta_class:meta_class,
			"user_createid": sess.CurrentUserId(),
			"meta_class":meta_class, 
			"state":"Новый",
			"data":data
		};

		dbconnection.collection(meta_class).save(row, function (err, docs) { 

			callback(err,row)

		});
	
	}else callback({'err':'NO_DATA_SAVE','msg':'Нет данных для сохранения'});	

};

  