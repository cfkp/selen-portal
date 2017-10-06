const util = require('util');
var express = require("express");
var router = express.Router();
var async = require('async');
var _ = require('lodash');
var fs = require("fs");
var db = require('../db/db');
var crypto = require('crypto');

var checkAuth = require('../middleware/checkAuth');
var ObjectID = require('mongodb').ObjectID;

router.all('/', checkAuth, function (request, response, next) {
	next();
});

router.post('/loadclass/:meta_class/:parent_name/:parent_id',checkAuth, function (req, res, next) {
	console.log("post '/loadclass/:meta_class/:meta_name/:meta_value',");
	console.log("post " + req.params.meta_class);
	console.log("post " + req.params.parent_name);
	console.log("post " + req.params.parent_id);
	var userID = req.session.user;
	var meta_class = req.params.meta_class;
	var parent_name = req.params.parent_name;
	var parent_id = req.params.parent_id;

	/////////////////////////
	var dbloc = db.get();
	console.log('coll_get');

	async.parallel({
		"schema": function (callback) {
			var result = {};
			console.log('Find meta data 0');
			console.log('meta_class' + meta_class);

			db.get().collection("meta_class").findOne({
				'meta_name': meta_class
			}, function (err, doc) {
				console.log('Find meta data1');
				if (doc) {
					result = doc;
				};
				console.log(result);

				if (err)
					return next(err);
				callback(err, result);
			});
		},
		"value": function (callback) {
			var result = {};
			console.log('Finddata');
			var search_filter = {};
			search_filter[parent_name] = parent_id;
			/*		if (meta_name!="user_createid" ){ search_filter={"name":meta_value}}
			else{ search_filter={"user_created":userID };}	*/
			console.log('search_filter');
			console.log(search_filter);

			db.get().collection(meta_class).findOne(search_filter, function (err, doc) {
				if (err) {
					console.log(err);
					return next(err);
				}

				console.log('Finddata');
				if (doc) {
					console.log(doc);
					result = doc;
				}
				callback(err, result);
			});
		}
	},
		function (err, results) {
		console.log("results");
		console.log(results);
		res.json(results);
		/*                if (!results.schema) {res.status(500).send({'error':'no_data_found'})}
		else {res.json(results);}*/
	});
});

router.post('/saveobj/:meta_class/:parent_name/:parent_id',checkAuth, function (req, res, next) {
	console.log("post '/saveobj/:meta_class'");
	console.log("post " + req.params.meta_class);
	console.log(req.body);

	var userID = req.session.user;
	// var nameForm = req.params.idform;
	var meta_class = req.params.meta_class;
	var parent_name = req.params.parent_name;
	var parent_id = req.params.parent_id;
	console.log("parent_name " + parent_name);
	console.log("parent_id " + parent_id);
	if (parent_id === 'undefined') {
		parent_name = "user_createid";
		parent_id = userID;
	};
	console.log("parent_name " + parent_name);
	console.log("parent_id " + parent_id);

	if (req.params.meta_class.indexOf(' ') > -1) {
		res.status(400).json({
			'msg': 'Invalid class name'
		});
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
	var dbloc = db.get();
	console.log('coll_get');

	async.waterfall([
			function (callback) {
				var search_filter = {};
				search_filter[parent_name] = parent_id;

				db.get().collection(meta_class).findOne(search_filter, callback);
			},
			function (row, callback) {
				if (row) {
					console.log(' find doc');
					console.log(row);
					if (parent_name) {
						row[parent_name] = parent_id;
					};
					row.data = data;
					row.created = Date.now;
				} else {
					console.log('not find doc');
					var row = {
						user_createid: userID
					};
					if (parent_name) {
						row[parent_name] = parent_id;
					};
					row.data = data;

				};
				console.log(' set row');
				console.log(row);
				dbloc.collection(meta_class).save(row, function (err, docs) {

					console.log('save row');
					console.log(docs);

					if (err || docs.result === undefined) {
						console.error('Error inserting document', err);
						//res.status(400).json({'msg': 'Error inserting document'});
					} else {
						var dataReturn = '';
						if (docs.ops) {
							console.log(' inserting document');
							console.log(docs.ops);

							dataReturn = docs.ops[0]._id;
						}
						console.log('Document successfully added');
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
	console.log("post '/load_main_menu',");
	var userID = req.session.user;
	var meta_class = "meta_menu";
	var meta_name = "name";
	var meta_value = "client_menu";

	/////////////////////////
	var dbloc = db.get();
	console.log('coll_get');

	async.waterfall([
			function (callback) {
				db.get().collection("role").findOne({
					'users.user_id': userID
				}, callback);
			},
			function (row, callback) {
				console.log('role');
				console.log(row);

				var result = {};
				console.log('Finddata');
				var search_filter = {};

				if (!row) {
					search_filter = {
						"name": "person_menu"
					}
				} else {
					search_filter = {
						"name": row.menu
					};
				}
				console.log('search_filter');
				console.log(search_filter);

				db.get().collection(meta_class).findOne(search_filter, function (err, doc) {
					if (err) {
						console.log(err);
						return next(err);
					}

					console.log('Finddata');
					if (doc) {
						console.log(doc);
						result["value"] = doc;
					}
					callback(err, result);
				});
			}
		],
		function (err, results) {
		console.log("results");
		console.log(results);
		res.json(results);
		/*                if (!results.schema) {res.status(500).send({'error':'no_data_found'})}
		else {res.json(results);}*/
	});
});

router.post('/load_tab_menu',checkAuth, function (req, res, next) {
	console.log("post '/load_tab_menu',");
	var userID = req.session.user;
	var meta_class = "meta_menu";
	var meta_name = "name";
	var meta_value = "request_detail_menu";

	/////////////////////////
	var dbloc = db.get();
	console.log('coll_get');

	async.waterfall([
			function (callback) {

				var result = {};
				console.log('Finddata');
				var search_filter = {
					"name": meta_value
				};

				console.log('search_filter');
				console.log(search_filter);

				db.get().collection(meta_class).findOne(search_filter, function (err, doc) {
					if (err) {
						console.log(err);
						return next(err);
					}

					console.log('Finddata');
					if (doc) {
						console.log(doc);
						result["value"] = doc;
					}
					callback(err, result);
				});
			}
		],
		function (err, results) {
		console.log("results");
		console.log(results);
		res.json(results);
		/*                if (!results.schema) {res.status(500).send({'error':'no_data_found'})}
		else {res.json(results);}*/
	});
});

router.post('/load_menu/:menu_name',checkAuth, function (req, res, next) {
	console.log("post '/load_menu',");
	var userID = req.session.user;
	var meta_class = "meta_menu";
	var meta_name = "name";
	var meta_value = req.params.menu_name;

	/////////////////////////
	var dbloc = db.get();
	console.log('coll_get');

	async.waterfall([
			function (callback) {

				var result = {};
				console.log('Finddata');
				var search_filter = {
					"name": meta_value
				};

				console.log('search_filter');
				console.log(search_filter);

				db.get().collection(meta_class).findOne(search_filter, function (err, doc) {
					if (err) {
						console.log(err);
						return next(err);
					}

					console.log('Finddata');
					if (doc) {
						console.log(doc);
						result["value"] = doc;
					}
					callback(err, result);
				});
			}
		],
		function (err, results) {
		console.log("results");
		console.log(results);
		res.json(results);
		/*                if (!results.schema) {res.status(500).send({'error':'no_data_found'})}
		else {res.json(results);}*/
	});
});

router.post('/callmethod/person_request/edit_request/init',checkAuth, function (req, res, next) {
	console.log("post '/call_method/person_request/edit_request/init',");
	console.log("post " + req.body);
	console.log("post " + "init");

	var userID = req.session.user;
	var meta_class = "person_request";
	var meta_method = "edit_request";
	var meta_action = "init";

	/////////////////////////
	var dbloc = db.get();
	console.log('coll_get');

	async.parallel({

		"schema": function (callback) {

			var result = {};
			console.log('Find meta data 0');
			console.log('meta_class' + meta_class);

			db.get().collection("meta_method").findOne({
				'meta_class': meta_class,
				'meta_name': meta_method
			}, function (err, doc) {
				console.log('Find meta data0');
				if (doc) {
					result = doc;
				};
				console.log(result);

				if (err)
					return next(err);
				callback(null, result);
			});
		},
		"value": function (callback) {
			var result = {};
			console.log('Find data ');
			console.log('meta_class ' + meta_class);
			result = {};
			if (req.body.objectlist) {
				console.log('req.body.objectlist ' + req.body.objectlist[0]);
				var o_id = new ObjectID(req.body.objectlist[0]);
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
					//console.log(result);

					callback(null, result);
				});
			} else {
				callback(null, result);
			};
		}
	},
		function (err, results) {
		console.log("results");
		console.log(err);
		if (err) {
			res.status(500).send(err);
			return;
		};
		if ((results.schema.data.objectlist !== undefined) && (results.schema.data.objectlist === "1") &&
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
	console.log("post '/call_method/:meta_class/:meta_method/init',");
	console.log("post " + req.params.meta_class);
	console.log("post " + req.params.meta_method);
	console.log("post " + req.body);
	console.log("post " + "init");
	
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
	console.log('coll_get');

	async.parallel({

		"schema": function (callback) {

			var result = {};
			console.log('Find meta data 0');
			console.log('meta_class ' + meta_class);

			db.get().collection("meta_method").findOne({
				'meta_class': meta_class,
				'meta_name': meta_method
			}, function (err, doc) {
				console.log('Find meta data 1');
				if (doc) {
					result = doc;
					callback(null, result); 
				}else if(!doc&&(meta_method=='new'||meta_method=='edit'))
				{
 				console.log('Find meta data 0 1 '+meta_class);
				   db.get().collection("meta_class").findOne({
					'meta_name': meta_class}, function (err, doc) {
				console.log('Find meta data 1 '+doc);

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
 				console.log('Find meta data 1 1 '+meta_class);
				   db.get().collection("meta_method").findOne({
					'meta_class': 'default','meta_name':'delete'}, function (err, doc) {
				console.log('Find meta data 1 '+doc);

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
				console.log(result);

				if (err)
					return next(err);
				//callback(null, result); 
			});
		},
		"value": function (callback) {
			var result = {};
			console.log('Find data ');
			console.log('meta_class ' + meta_class);
			result = {};
			if (req.body.objectlist) {
				console.log('req.body.objectlist ' + req.body.objectlist[0]);
				var o_id = new ObjectID(req.body.objectlist[0]);
				db.get().collection(meta_class).findOne({
					"_id": o_id
				}, function (err, doc) {  
					console.log('Find data1');
					if (doc) {
						result = doc;
					};
					console.log(result);

					callback(null, result);
				});
			} else {
				callback(null, result);
			};
		}
	},
		function (err, results) {
		console.log("results");
		console.log(results);
		if (_.isEmpty(results.schema)) {
		console.log("results.schema=='{}'");
	
	return	res.status(500).send({
				'error': 'no_schema',
				'msg': 'Не определена схема для операции'
			})
		
		};
		if ((results.schema.data.objectlist !== undefined) && (results.schema.data.objectlist === "1") &&
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
	console.log("post '/callmethod/garant_request/create_request/execute',");
	console.log("post " + req.body);
	console.log("post comment" + req.body.comment);
	console.log("post bank" + req.body.bank);
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
			console.log('Finddata');
			db.get().collection(meta_class).findOne({
				'user_createid': userID
			}, function (err, doc) {
				if (err) {
					console.log('ERRRRRRRRRRRRRRROr');
					console.log(err);
					return next(err);
				}

				console.log('Finddata');
				if (doc) {
					console.log(doc);
					result = doc;
				}
				callback(err, result);
			});
		},
		"project":
		function (callback) {
			var result = {};
			var meta_class = 'project';
			console.log('Finddata');
			db.get().collection(meta_class).findOne({
				'user_createid': userID
			}, function (err, doc) {
				if (err) {
					console.log('ERRRRRRRRRRRRRRROr');
					console.log(err);
					return next(err);
				}

				console.log('Finddata');
				if (doc) {
					console.log(doc);
					result = doc;
				}
				callback(err, result);
			});
		}

	},
		function (err, results) {
		console.log("results");
		console.log(results);
		var data = results;
		data.comment = req.body.comment;
		data.bank = req.body.bank;
		data.state = "Новый";

		var row = {
			"created": Date.now,
			"user_createid": userID,
			"data": data
		};

		console.log(' set row');
		console.log(row);
		dbloc.collection(meta_class).save(row, function (err, docs) {

			console.log('save row');
			console.log(docs);

			if (err || docs.result === undefined) {
				console.error('Error inserting document', err);
				//res.status(400).json({'msg': 'Error inserting document'});
			} else {
				var dataReturn = '';
				if (docs.ops) {
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

router.post('/callmethod/person_request/process_request/execute',checkAuth, function (req, res, next) {
	console.log("post '/callmethod/person_request/process_request/execute'");

	console.log("post " + req.params.meta_class);
	console.log("post " + req.params.meta_method);
	console.log("post " + req.body);

	var userID = req.session.user;
	var meta_class = "person_request";
	var meta_method = req.params.meta_method;
	var meta_action = req.params.meta_action;
	console.log('id=' + req.body._id);

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
	console.log(set$);
	var obj_id = new ObjectID(req.body._id);
	dbloc.collection(meta_class).updateOne({
		"_id": obj_id
	}, {
		
		$set: set$
		
	}, function (err, docs) {
		console.log('save row');
		console.log(docs);
		if (err || docs.result === undefined) {
			console.error('Error updating document', err);
			//res.status(400).json({'msg': 'Error inserting document'}); } else
			{
				var dataReturn = '';
				if (docs.ops) {
					console.log(' updating document');
					console.log(docs.ops);
					dataReturn = docs.ops[0]._id;
				}
				console.log('Document successfully update');
			}
			res.json(dataReturn);
		};
	});
});

router.post('/callmethod/person_request/change_state/execute',checkAuth, function (req, res, next) {
	console.log("post '/callmethod/person_request/change_state/execute'");
	console.log("post " + req.params.meta_class);
	console.log("post " + req.params.meta_method);
	console.log("post " + req.body);

	var userID = req.session.user;
	var meta_class = "person_request";
	var meta_method = req.params.meta_method;
	var meta_action = req.params.meta_action;
	console.log('id=' + req.body._id);

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

	//        var row = {"created":Date.now, "user_createid" :userID,state:"Новый","data": data};
	var obj_id = new ObjectID(req.body._id);
	dbloc.collection(meta_class).updateOne({
		"_id": obj_id
	}, {
		$set: {
			"state": new_state
		}
	},
		function (err, docs) {

		console.log('save row');
		console.log(docs);

		if (err || docs.result === undefined) {
			console.error('Error updating document', err);
			//res.status(400).json({'msg': 'Error inserting document'});
		} else {
			var dataReturn = '';
			if (docs.ops) {
				console.log(' updating document');
				console.log(docs.ops);

				dataReturn = docs.ops[0]._id;
			}
			console.log('Document successfully update');
		}

		res.json(dataReturn);
	});

});


router.post('/callmethod/users/user_change_pass/execute',checkAuth, function (req, res, next) {
	console.log("post '/callmethod/users/user_change_pass/execute'");
	console.log("post " + req.params.meta_class);
	console.log("post " + req.params.meta_method);
	console.log("post " + req.body);
	var userID = req.session.user;
	var meta_class = "users";
//	var meta_method = req.params.meta_method;
//	var meta_action = req.params.meta_action;
	console.log('id=' + req.body._id);


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

	//        var row = {"created":Date.now, "user_createid" :userID,state:"Новый","data": data};
	var obj_id = new ObjectID(userID);
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

		console.log('save row');
		console.log(docs);

		if (err || docs.result === undefined) {
			console.error('Error updating document', err);
			//res.status(400).json({'msg': 'Error inserting document'});
		} else {
			var dataReturn = '';
			if (docs.ops) {
				console.log(' updating document');
				console.log(docs.ops);

				dataReturn = docs.ops[0]._id;
			}
			console.log('Document successfully update');
		}

		res.json(dataReturn);
	});

});


router.post('/callmethod/:meta_class/:meta_method/execute',checkAuth, function (req, res, next) {
	console.log("post '/call_method/:meta_class/:meta_method/execute',");
	console.log("post " + req.params.meta_class);
	console.log("post " + req.params.meta_method);
	console.log("post " + req.body);

	var userID = req.session.user;
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

	console.log(req.body._id);
	var sysdate=   new Date().toISOString();
	var obj_id;
	if (meta_method=='edit'&&req.body._id) {
		obj_id = new ObjectID(req.body._id);
		console.log('updating document');
		if (data !== null) {
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
	else if (meta_method=='delete'&&req.body._id){
		obj_id = new ObjectID(req.body._id);
		console.log('deleting document');
		if ( data.confirm!== null&&data.confirm==true) {
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
		var row = {
			"created": sysdate ,
			"user_createid": userID,
			state: "Новый",
			"data": data
		};
		dbloc.collection(meta_class).save(row, function (err, docs) {

			if (err || docs.result === undefined) {
				console.error('Error inserting document', err);
				//res.status(400).json({'msg': 'Error inserting document'});
			} else {
				var dataReturn = '';
				if (docs.ops) {
					console.log(' inserting document');
					console.log(docs.ops);

					dataReturn = docs.ops[0]._id;
				}
				console.log('Document successfully added');
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
