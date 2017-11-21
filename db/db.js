var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID;

var state = {
  db: null,
}

exports.connect = function(url, done) {
  if (state.db) return done()
   MongoClient.connect(url,
 	{
         autoReconnect: true,
 	 reconnectTries:100,
         poolSize: 10
	},
 
function(err, db) {
    if (err) return done(err)
    state.db = db
    done()
  })
}

exports.get = function() {
   return state.db
 }

exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null
      state.mode = null
      done(err)
    })
  }
}

function audit(userid,meta_class,meta_method,obj_id,data){
 		var id = new ObjectID().toString();
         	var sysdate=   new Date().toISOString();

		var dbloc = this.get();
		
		var row = {"_id":id,
			"created": sysdate ,
			this_meta_class:"audit",
			"user_createid": userid,
			"meta_class":meta_class,
			"meta_method":meta_method,
			"object_id":obj_id,
			"data": data
		};

		dbloc.collection("audit").save(row, function (err, docs) {

		});


};

function save_obj_hist(userid,meta_class,obj){
	var id = new ObjectID().toString();
 	var sysdate=   new Date().toISOString();

	var dbloc = this.get();
	if (obj){	
		var row = {"_id":id,
			"created": sysdate ,
			this_meta_class:"object_history",
			"user_createid": userid,
			"meta_class":meta_class,
			"object_id":obj._id,
			"object": obj
		};

		dbloc.collection("object_history").save(row, function (err, docs) {

		});
	};	

};

exports.audit=audit;
exports.save_obj_hist=save_obj_hist;