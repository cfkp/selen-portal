const util = require('util');
var express = require("express");
var router = express.Router();

var log = require('libs/log')(module);

var async = require('async');
var _ = require('lodash');
var fs = require("fs");
var db = require('../db/db');
var crypto = require('crypto');
var mailer = require('../middleware/sendmail'); //-- Your js file path

var checkAuth = require('../middleware/checkAuth');
var ObjectID = require('mongodb').ObjectID;

router.all('/', checkAuth, function (request, response, next) {
log.info({req:req},"router.all");

	next();
});

router.post('/loadclass/:meta_class/:parent_name/:parent_id',checkAuth, function (req, res, next) {
log.info({req:req},'start');

 	var userID = req.session.user;
	var meta_class = req.params.meta_class;
	var parent_name = req.params.parent_name;
	var parent_id = req.params.parent_id;

	/////////////////////////
	var dbloc = db.get();
 
	async.parallel({
		"schema": function (callback) {
			var result = {};
 
			db.get().collection("meta_class").findOne({
				'meta_name': meta_class
			}, function (err, doc) {
 				if (doc) {
					result = doc;
				};
				//console.log(result);

				if (err)
					return next(err);
				callback(err, result);
			});
		},
		"value": function (callback) {
			var result = {};
 			var search_filter = {};
			search_filter[parent_name] = parent_id;
			/*		if (meta_name!="user_createid" ){ search_filter={"name":meta_value}}
			else{ search_filter={"user_created":userID };}	*/
 
			db.get().collection(meta_class).findOne(search_filter, function (err, doc) {
				if (err) {
 					return next(err);
				}

 				if (doc) {
 					result = doc;
				}
				callback(err, result);
			});
		}
	},
		function (err, results) {
 		res.json(results);
 	});
});

router.post('/saveobj/:meta_class/:parent_name/:parent_id',checkAuth, function (req, res, next) {
log.info({req:req},'start');
 
	var userID =req.session.user;
	// var nameForm = req.params.idform;
	var meta_class = req.params.meta_class;
	var parent_name = req.params.parent_name;
	var parent_id = req.params.parent_id;
 	if (parent_id === 'undefined') {
		parent_name = "user_createid";
		parent_id = userID;
	};
 
	if (req.params.meta_class.indexOf(' ') > -1) {
		res.status(400).json({
			'msg': 'Invalid class name'
		});
	}

 	var data = req.body;

 	var dbloc = db.get();
 
	async.waterfall([
			function (callback) {
				var search_filter = {};
				search_filter[parent_name] = parent_id;

				db.get().collection(meta_class).findOne(search_filter, callback);
			},
			function (row, callback) {
				if (row) {

					db.save_obj_hist(userID,meta_class,row);
 					if (parent_name) {
						row[parent_name] = parent_id;
					};
					row.data = data;
					row.created = Date.now;
				} else {
 					var row = { _id:new ObjectID().toString(),
						user_createid: userID,
						this_meta_class:meta_class
					};
					if (parent_name) {
						row[parent_name] = parent_id;
					};
					row.data = data;

				};
 				dbloc.collection(meta_class).save(row, function (err, docs) {
                         
					if (err || docs.result === undefined) {
						log.error({req:req},'Error inserting document');
						//res.status(400).json({'msg': 'Error inserting document'});
					} else {
						var dataReturn = '';
						if (docs.ops) {
 
							dataReturn = docs.ops[0]._id;
						}
 					}
					callback(null, row);
				});
			}

		], function (err, results) {
		if (err)
			return next(err);
		res.json(results);
	});
}); /**/

router.post('/load_main_menu',checkAuth, function (req, res, next) {
log.debug({req:req},'start');
	var userID = req.session.user;
	var meta_class = "meta_menu";
	var meta_name = "name";
	var meta_value = "client_menu";
	var search_filter = {};


	if (req.user.role)
		{  search_filter = { "_id": req.user.role.data.user_menu};
 		}
	else {					
		search_filter = { "name": "person_menu"};
	};
 	var dbloc = db.get();

	async.waterfall([
 			function ( callback) {
 
				var result = {};
 				db.get().collection(meta_class).findOne(search_filter, function (err, doc) {
					if (err) {
 						return next(err);
					}

 					if (doc) {
 						result["value"] = doc;
					}
					callback(err, result);
				});
			}
		],
		function (err, results) {
 		res.json(results);
		/*                if (!results.schema) {res.status(500).send({'error':'no_data_found'})}
		else {res.json(results);}*/
	});
});

router.post('/load_tab_menu',checkAuth, function (req, res, next) {
log.debug({req:req},'start');
	var userID = req.session.user;
	var meta_class = "meta_menu";
	var meta_name = "name";
	var meta_value = "request_detail_menu";

	/////////////////////////
	var dbloc = db.get();
 
	async.waterfall([
			function (callback) {

				var result = {};
 				var search_filter = {
					"name": meta_value
				};
 
				db.get().collection(meta_class).findOne(search_filter, function (err, doc) {
					if (err) {
 						return next(err);
					}

 					if (doc) {
 						result["value"] = doc;
					}
					callback(err, result);
				});
			}
		],
		function (err, results) {
 		res.json(results);
		/*                if (!results.schema) {res.status(500).send({'error':'no_data_found'})}
		else {res.json(results);}*/
	});
});

router.post('/load_menu/:menu_name',checkAuth, function (req, res, next) {
log.debug({req:req},'start');
 	var userID = req.session.user;
	var meta_class = "meta_menu";
	var meta_name = "name";
	var meta_value = req.params.menu_name;

	/////////////////////////
	var dbloc = db.get();
 
	async.waterfall([
			function (callback) {

				var result = {};
 				var search_filter = {
					"name": meta_value
				};

 
				db.get().collection(meta_class).findOne(search_filter, function (err, doc) {
					if (err) {
 						return next(err);
					}

 					if (doc) {
 						result["value"] = doc;
					}
					callback(err, result);
				});
			}
		],
		function (err, results) {
 		res.json(results);
		/*                if (!results.schema) {res.status(500).send({'error':'no_data_found'})}
		else {res.json(results);}*/
	});
});

router.post('/callmethod/person_request/edit_request/init',checkAuth, function (req, res, next) {
log.info({req:req},'start');
 
	var userID = req.session.user;
	var meta_class = "person_request";
	var meta_method = "edit_request";
	var meta_action = "init";

	/////////////////////////
	var dbloc = db.get();
 
	async.parallel({
 		"schema": function (callback) {

			var result = {};
 
			db.get().collection("meta_method").findOne({
				'meta_class': meta_class,
				'meta_name': meta_method
			}, function (err, doc) {
 				if (doc) {
					result = doc;
				};
 
				if (err)
					return next(err);
				callback(null, result);
			});
		},
		"value": function (callback) {
			var result = {};
 			result = {};
			if (req.body.objectlist) {
 				var o_id = req.body.objectlist[0];
				db.get().collection(meta_class).findOne({
					"_id": o_id
				}, function (err, doc) {

					if (doc) {
						if (doc.state !== "Новый") {
							callback({
								'error': 'no_edit_right',
								'msg': 'Документ не в состоянии "Новый"'
							});
							return;
						};
						result = doc;
					};
 
					callback(null, result);
				});
			} else {
				callback(null, result);
			};
		}
	},
		function (err, results) {
 		if (err) {
			res.status(500).send(err);
			return;
		};
		if ((results.schema.data.objectlist !== undefined) && (results.schema.data.objectlist === 1||
results.schema.data.objectlist === "1") &&
			((!req.body.objectlist) || (req.body.objectlist.length === 0))) {
			res.status(500).send({
				'error': 'no_objectlist',
				'msg': 'Не выбраны документы'
			})
		} else {
			res.json(results);
		}
	});

});

router.post('/callmethod/:meta_class/:meta_method/init',checkAuth, function (req, res, next) {
log.info({req:req},'start');
 	
	var userID = req.session.user;
	var meta_class = req.params.meta_class;
	var meta_method = req.params.meta_method;
	var meta_action = req.params.meta_action;

	if (meta_class=='undefined'||meta_method=='undefined') {
	return	res.status(500).send({
				'error': 'no_class',
				'msg': 'Не определен класс или операция'
			})
	
	};
	/////////////////////////
	var dbloc = db.get();
 
	async.parallel({

		"schema": function (callback) {

			var result = {};
 
			db.get().collection("meta_method").findOne({
				'meta_class': meta_class,
				'meta_name': meta_method
			}, function (err, doc) {
 				if (doc) {
					result = doc;
					callback(null, result); 
				}else if(!doc&&(meta_method=='new'||meta_method=='edit'))
				{
 				   db.get().collection("meta_class").findOne({
					'meta_name': meta_class}, function (err, doc) {
 
					if (doc&&doc.data) {
						doc.data["meta_class"]=meta_class;
						doc.data["meta_method"]=meta_method;
					if (meta_method=='edit')
						{doc.data["objectlist"]=1};
					result = doc;
                                 	};
				if (err)
					return next(err);
				callback(null, doc);

				 });
				}else if(!doc&&meta_method=='delete')
				{
 				   db.get().collection("meta_method").findOne({
					'meta_class': 'default','meta_name':'delete'}, function (err, doc) {
 
					if (doc&&doc.data) {
						doc.data["meta_class"]=meta_class;
						doc.data["meta_method"]=meta_method;
 					result = doc;
                                 	};
				if (err)
					return next(err);
				callback(null, doc);

				 });
				} 
 
				if (err)
					return next(err);
 			});
		},
		"value": function (callback) {
			var result = {};
 			result = {};
			if (req.body.objectlist) {
 				var o_id = req.body.objectlist[0];
				db.get().collection(meta_class).findOne({
					"_id": o_id
				}, function (err, doc) {  
 					if (doc) {
						if (doc.state&&doc.state !== "Новый"&&meta_method=='edit'&&meta_class=='person_request') {
							callback({
								'error': 'no_edit_right',
								'msg': 'Документ не в состоянии "Новый"'
							});
							return;
						};
						result = doc;
					};
 					callback(null, result);
				});
			} else {
				callback(null, result);
			};
		}
	},
		function (err, results) {
 		if (err) {
			res.status(500).send(err);
			return;
		};

		if (_.isEmpty(results.schema)) {
 	
	return	res.status(500).send({
				'error': 'no_schema',
				'msg': 'Не определена схема для операции'
			})
		
		};
		if ((results.schema.data.objectlist !== undefined) && (results.schema.data.objectlist === 1||
results.schema.data.objectlist === "1") &&
			((!req.body.objectlist) || (req.body.objectlist.length === 0))) {
			res.status(500).send({
				'error': 'no_objectlist',
				'msg': 'Не выбраны документы'
			})
		} else {
			res.json(results);
		}
	});

});

router.post('/callmethod/garant_request/create_request/execute',checkAuth, function (req, res, next) {
log.info({req:req},'start');
 	var userID = req.session.user;
	var meta_class = 'garant_request'; //req.params.meta_class;
	var meta_method = 'create_request'; //req.params.meta_method;
	var meta_action = 'execute'; // req.params.meta_action;

	/////////////////////////
	var dbloc = db.get();

	async.parallel({
		"enterprise":
		function (callback) {
			var result = {};
			var meta_class = 'enterprise';
 			db.get().collection(meta_class).findOne({
				'user_createid': userID
			}, function (err, doc) {
				if (err) {
 					return next(err);
				}

 				if (doc) {
 					result = doc;
				}
				callback(err, result);
			});
		},
		"project":
		function (callback) {
			var result = {};
			var meta_class = 'project';
 			db.get().collection(meta_class).findOne({
				'user_createid': userID
			}, function (err, doc) {
				if (err) {
 					return next(err);
				}

 				if (doc) {
 					result = doc;
				}
				callback(err, result);
			});
		}

	},
		function (err, results) {
 		var data = results;
		data.comment = req.body.comment;
		data.bank = req.body.bank;
		data.state = "Новый";

		var row = {
			"created": Date.now,
			"user_createid": userID,
			"data": data
		};

 		dbloc.collection(meta_class).save(row, function (err, docs) {
 
			if (err || docs.result === undefined) {
				log.error({req:req},'Error inserting document', err);
				//res.status(400).json({'msg': 'Error inserting document'});
			} else {
				var dataReturn = '';
				if (docs.ops) {
 
					dataReturn = docs.ops[0]._id;
				}
 			}

			res.json(dataReturn);
		});

	});
});
 
router.post('/callmethod/person_request/process_request/execute',checkAuth, function (req, res, next) {
log.info({req:req},'start');
 
	var userID = req.session.user;
	var meta_class = "person_request";
	var meta_method = req.params.meta_method;
	var meta_action = req.params.meta_action;
 
	/////////////////////////
	var dbloc = db.get();
	var data = req.body.data;
	var new_state;
	var set$={};
	if ((data.new_state) && (data.new_state !== undefined)) {
		new_state = data.new_state;
	} else {
		res.status(500).send({
			'error': 'no_new_state',
			'msg': 'Не указано состояние'
		});
		return;
	};
	
	set$.state=new_state;
	
	if (new_state==='Экспертиза') 
	{
		set$.user_expert=userID;
	}; 
	var obj_id;
	if (req.body.objectlist) {
 		 obj_id = req.body.objectlist[0];
	};
	dbloc.collection(meta_class).updateOne({
		"_id": obj_id
	}, {
		
		$set: set$
		
	}, function (err, docs) {
	var dataReturn =obj_id;

 		if (err || docs.result === undefined) {
 			log.error({req:req},'Error inserting document', err);
                      console.log('err '+err);
                }

	res.json(dataReturn);
	
	});
});
router.post('/callmethod/person_request/set_expert/execute',checkAuth, function (req, res, next) {
log.info({req:req},'start');
 
	var userID = req.session.user;
	var meta_class = "person_request";
	var meta_method = "set_expert";
	var meta_action = "execute";
 
	/////////////////////////
	var dbloc = db.get();
	var data = req.body.data;
	var new_state='В работу';
	var set$={};
	if ((data.new_state) && (data.new_state !== undefined)) {
		new_state = data.new_state;
	} else {
		res.status(500).send({
			'error': 'no_new_state',
			'msg': 'Не указано состояние'
		});
		return;
	};
	
	set$.state=new_state;
	
 	set$.user_expert=userID;
 	var obj_id;
	if (req.body.objectlist) {
 		 obj_id = req.body.objectlist[0];
	};

       db.audit(userID,meta_class,meta_method,obj_id,{$set: set$});

	dbloc.collection(meta_class).updateOne({
		"_id": obj_id
	}, {
		
		$set: set$
		
	}, function (err, docs) {
	var dataReturn =obj_id;

 		if (err || docs.result === undefined) {
 			log.error({req:req},'Error inserting document', err);
                      console.log('err '+err);
                }
 	res.json(dataReturn);
 	});
});

router.post('/callmethod/person_request/change_state/execute',checkAuth, function (req, res, next) {
log.info({req:req},'start');
 
	var userID = req.session.user;
	var meta_class = "person_request";
	var meta_method = req.params.meta_method;
	var meta_action = req.params.meta_action;
 	/////////////////////////
	var dbloc = db.get();
	var data = req.body.data;
	var new_state;
	if ((data.new_state) && (data.new_state !== undefined)) {
		new_state = data.new_state;
	} else {
		res.status(500).send({
			'error': 'no_new_state',
			'msg': 'Не указано состояние'
		});
		return;
	};

	var obj_id;
	if (req.body.objectlist) {
 		 obj_id =  req.body.objectlist[0];
	};
	dbloc.collection(meta_class).updateOne({
		"_id": obj_id
	}, {
		$set: {
			"state": new_state
		}
	},
		function (err, docs) {

 
		if (err || docs.result === undefined) {
				log.error({req:req},'Error update document', err);
 		} else {
			var dataReturn = '';
			if (docs.ops) {
 
				dataReturn = docs.ops[0]._id;
			}
 		}

		res.json(dataReturn);
	});

});

router.post('/callmethod/person_request/change_state2expert/execute',checkAuth, function (req, res, next) {
log.info({req:req},'start');
 
	var userID =  req.session.user;
	var meta_class = "person_request";
	var meta_method = req.params.meta_method;
	var meta_action = req.params.meta_action;
 	/////////////////////////
	var dbloc = db.get();
	var data = req.body.data;
	var new_state="Отправлена клиентом";
	if (!data.confirm)   {
 		res.status(500).send({
			'error': 'no_new_state',
			'msg': 'Действие не подтверждено'
		});
		return;
	};

	//        var row = {"created":Date.now, "user_createid" :userID,state:"Новый","data": data};
	var obj_id;
	if (req.body.objectlist) {
 		 obj_id = req.body.objectlist[0];//new ObjectID(req.body.objectlist[0]);
	};
	dbloc.collection(meta_class).updateOne({
		"_id": obj_id
	}, {
		$set: {
			"state": new_state
		}
	},
		function (err, docs) {
 
		if (err || docs.result === undefined) {
				log.error({req:req},'Error update document', err);
 			//res.status(400).json({'msg': 'Error inserting document'});
		} else {
			var dataReturn = '';
			if (docs.ops) {
 
				dataReturn = docs.ops[0]._id;
			}
 			mailer('finance@cfcp.ru','Уведомление',null,'request_notify',{});
		};

		res.json(dataReturn);
	});

});


router.post('/callmethod/users/user_change_pass/execute',checkAuth, function (req, res, next) {
log.info({req:req},'start');
 	var userID =  req.session.user;
	var meta_class = "users";
 

	/////////////////////////
	var dbloc = db.get();
	var data = req.body.data;
	var new_state;
	if (data.newpassword!=data.confirmation)  {
		res.status(500).send({
			'error': 'check_pass',
			'msg': 'Подтверждение пароля не совпадает с новым'
		});
		return;
	};

 	var obj_id = userID;//new ObjectID(userID);
	var salt= Math.random() + '';
	var hashpass=crypto.createHmac('sha1', salt).update(data.newpassword).digest('hex');
	
	dbloc.collection(meta_class).updateOne({
		"_id": obj_id
	}, {
		$set: {
			"salt": salt,
			"hashedPassword":hashpass
		}
	},
		function (err, docs) {

 
		if (err || docs.result === undefined) {
				log.error({req:req},'Error update document', err);
		} else {
			var dataReturn = '';
			 				dataReturn = obj_id;
			 
 		}

		res.json(dataReturn);
	});

});


router.post('/callmethod/:meta_class/:meta_method/execute',checkAuth, function (req, res, next) {
log.info({req:req},'start');
 
	var userID =  req.session.user ;
	var meta_class = req.params.meta_class;
	var meta_method = req.params.meta_method;
	var meta_action = req.params.meta_action;
	var dbloc = db.get();
	var data = req.body.data;
 	if (meta_class=='undefined'||meta_method=='undefined') {
	return	res.status(500).send({
				'error': 'no_class',
				'msg': 'Не определен класс или операция'
			})
	
	};

 	var sysdate=   new Date().toISOString();
	var obj_id;
	if (req.body.objectlist) {
 		 obj_id = req.body.objectlist[0];//new ObjectID(req.body.objectlist[0]);
	};
	if (meta_method=='edit'&&obj_id) {
 		if (data !== null) {
		db.audit(userID,meta_class,meta_method,obj_id,data);

			dbloc.collection(meta_class).updateOne({
				"_id": obj_id
			}, {
				$set: { "updated":sysdate,
					"data": data
				}
			}, function (err, docs) {
				var dataReturn = '';
				if (docs.ops) {

					dataReturn = docs.ops[0]._id;
		 		}
				res.json(dataReturn);

			});
		}
	} 
	else if (meta_method=='delete'&&obj_id){
 		if ( data.confirm!== null&&data.confirm==true) {

		db.audit(userID,meta_class,meta_method,obj_id,data);
		
		dbloc.collection(meta_class).remove//updateOne
				({
				"_id": obj_id
			}/*, {
				$set: {
					"deleted": true
				}
			}*/, function (err, docs) {
				var dataReturn = '';
				if (docs.ops) {

					dataReturn = docs.ops[0]._id;
		 		}
				res.json(dataReturn);

			});
		}else {res.status(500).send({
				'error': 'no_confirm',
				'msg': 'Операция не подтверждена'
			}); return;
	
		};
	}
	else if (meta_method=='new'){
 		 obj_id = new ObjectID().toString();
		
		var row = {"_id":obj_id,
			"created": sysdate ,
			"user_createid": userID,
			this_meta_class:meta_class,
			state: "Новый",
			"data": data
		};
		if (req.body.collection&&req.body.collection.meta_parent_field){
//	console.log('insert collection');
//	console.log(req.body.collection);

		  row[req.body.collection.meta_parent_field]=req.body.collection.meta_parent_value;
		}
		db.audit(userID,meta_class,meta_method,obj_id,row);
		dbloc.collection(meta_class).save(row, function (err, docs) {

			if (err || docs.result === undefined) {
				log.error({req:req},'Error inserting document', err);
 			} else {
//	console.log('insert doc');
//	console.log(docs);
	
				if (meta_class=='person_request'){
					var pers_req = require('../db/person_request');
 					pers_req.load_request_info (obj_id,function(error,body){});	
					 };
				var dataReturn = obj_id;
  			}

			res.json(dataReturn);
		});

	}
	else {
	return	res.status(500).send({
				'error': 'no_class',
				'msg': 'Не определен обработчик операции '+meta_method
			})
	

};
;
});

////////////////////////////////////////
module.exports = router;