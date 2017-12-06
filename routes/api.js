const util = require('util');
var express = require("express");
var router = express.Router();

var log = require('libs/log')(module);

var async = require('async');
var _ = require('lodash');
var fs = require("fs");
var db = require('../db/db');
var objlib=require('../db/obj');
var crypto = require('crypto');
var mailer = require('../middleware/sendmail'); //-- Your js file path

var checkAuth = require('../middleware/checkAuth');
var ObjectID = require('mongodb').ObjectID;

var pers_req = require('../db/person_request');


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

 	var child_coll ={'meta_parent_field':parent_name,'meta_parent_value':parent_id}; 
 	
	async.waterfall(
		[objlib.getchildobj.bind(null,meta_class,child_coll) 
		],
	        function (err, result) {
 			if (err){res.status(500).send(err)}else {
			res.json(result);		
			};
		}
	);
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
	if (req.user.role){
		search_filter = { "_id": req.user.role.data.user_menu};
 		}
	else {					
		search_filter = { "name": "person_menu"};
	};

	async.parallel({
 			'value':objlib.getobjbyfilter.bind(null,meta_class,search_filter)
		},
		function (err, results) {
		if (err){res.status(500).send(err)}else {
		//var result={};
		//result['value']= results;
		res.json(results);		
		};
	});
});

router.post('/load_menu/:menu_name',checkAuth, function (req, res, next) {
log.debug({req:req},'start');
 	var userID = req.session.user;
	var meta_class = "meta_menu";
	var meta_name = "name";
	var meta_value = req.params.menu_name;

	/////////////////////////
	var search_filter = {
			"name": meta_value
			};

	async.parallel({
 			'value':objlib.getobjbyfilter.bind(null,meta_class,search_filter)
		},
		function (err, results) {
		if (err){res.status(500).send(err)}else {
		//var result={};
		//result['value']= results;
		res.json(results);		
		};
	});
});


router.post('/callmethod/:meta_class/:meta_method/init', function (req, res, next) {
log.info({req:req},'start');
	var userID = req.session.user;
	var meta_class = req.params.meta_class;
	var meta_method = req.params.meta_method;
	var meta_action = req.params.meta_action;
	
	async.waterfall(
		[objlib.init_method.bind(null,meta_class,meta_method,req.body.objectlist),
		function (meth,callback) {  
			console.log('after init '+JSON.stringify (meth));
 			if (meth.value
				&&meth.value.state
				&&meth.value.state !== "Новый"
				&&meth.schema.meta_name=='edit'
				&&meth.schema.meta_class=='person_request') {
				callback({'error': 'no_edit_right',
					'msg': 'Документ не в состоянии "Новый"'
					});
										}
 			else {
			callback(null,meth);
			}}
		],
	        function (err, result) {

		if (err){res.status(500).send(err)}else {
		res.json(result);		
		};
	}
	);

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
	if (!data.confirm)   {
 		res.status(500).send({
			'error': 'no_new_state',
			'msg': 'Действие не подтверждено'
		});
		return;
	};
	
	set$.state='В работе';
	
		set$.user_expert=userID;
	var obj_id;
	if (req.body.objectlist) {
 		 obj_id = req.body.objectlist[0];
	};
       db.audit(userID,meta_class,meta_method,obj_id,{set: set$});

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
	var new_state='В работе';
	var set$={};
 	
	set$.state=new_state;
	
 	set$.user_expert=userID;
 	var obj_id;
	if (req.body.objectlist) {
 		 obj_id = req.body.objectlist[0];
	};

       db.audit(userID,meta_class,meta_method,obj_id,{set: set$});

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
	var meta_method = "change_state";
	var meta_action = req.params.meta_action;
 	/////////////////////////
	var dbloc = db.get();
	var data = req.body.data;
	var new_state_act,new_state;
	if ((data.new_state) && (data.new_state !== undefined)) {
		new_state_act = data.new_state;
	} else {
		res.status(500).send({
			'error': 'no_new_state',
			'msg': 'Не указано Действие'
		});
		return;
	};

	var obj_id;
	if (req.body.objectlist) {
 		 obj_id =  req.body.objectlist[0];
	};

	async.waterfall([
			function (callback) {
                        objlib.getobj(meta_class,obj_id,callback);
			},
			function (obj,callback) {
			console.log("callback "+obj);
			if  (!obj||obj==null ){callback({
			'error': 'no_object',
			'msg': 'Не найден документ'
				});}	
			if (new_state_act==='Выполнено'){
				if (obj.state==='В работе'){new_state="На проверку"}
				else if (obj.state==='На проверку'){new_state="На рассмотрение"}
				else if (obj.state==='На рассмотрение'){new_state="Одобрено КМСП"}
				;

			}
			else if(new_state_act==='Вернуть'){
				if (obj.state==='В работе'){}
				else if (obj.state==='На проверку'){new_state="В работе"}
				else if (obj.state==='На рассмотрение'){new_state="Отказано КМСП"}
				;

			}
			
			if (!new_state) {var err={
			'error': 'no_new_state',
			'msg': 'Не найдено следующее состояние'
				};
			return callback(err);
			}	
	                	db.audit(userID,meta_class,meta_method,obj_id,{
						set: {
						"state": new_state
						}});

				dbloc.collection(meta_class).updateOne({
					"_id": obj_id	
					}, {
						$set: {
						"state": new_state
						}},callback);
			                                 
			}

		],
		function (err, results) {
		if (!err){
 		res.json(results);}
		else {res.status(500).send(err);};
	});



});

router.post('/callmethod/person_request/load_data_from_ext/execute',checkAuth, function (req, res, next) {
log.info({req:req},'start');
 
	var userID =  req.session.user;
	var meta_class = "person_request";
	var meta_method = 'load_data_from_ext';
	var meta_action = req.params.meta_action;
 	/////////////////////////
	var dbloc = db.get();
	var data = req.body.data;
var pers_req = require('../db/person_request');

 	if (!data.confirm)   {
 		res.status(500).send({
			'error': 'no_new_state',
			'msg': 'Действие не подтверждено'
		});
		return;
	};

 	var obj_id;
	if (req.body.objectlist) {
 		 obj_id = req.body.objectlist[0];//new ObjectID(req.body.objectlist[0]);
	};


        db.audit(userID,meta_class,meta_method,obj_id,{});
        pers_req.load_request_info (obj_id, function (err, docs) {
 
		if (err) {
		res.status(500).json(err);
 		} else {		res.json(obj_id);

 		};

 	});

});


router.post('/callmethod/person_request/change_state2expert/execute',checkAuth, function (req, res, next) {
log.info({req:req},'start');
 
	var userID =  req.session.user;
	var meta_class = "person_request";
	var meta_method = 'change_state2expert';
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
       db.audit(userID,meta_class,meta_method,obj_id,{set: {"state": new_state	}});

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


router.post('/callmethod/person_request/create_request/execute', function (req, res, next) {
log.info({req:req},'start');
 
	var userID =  req.session.user ;
	var meta_class = req.params.meta_class;
	var meta_method = req.params.meta_method;
	var meta_action = req.params.meta_action;
 	var data = req.body.data;
 	if (meta_class=='undefined'||meta_method=='undefined') {
	return	res.status(500).send({
				'error': 'no_class',
				'msg': 'Не определен класс или операция'
			})
	
	};

 	var sysdate= new Date().toISOString();
	var obj_id;
	var institute;
	obj_id = new ObjectID().toString();
	/// ищем продукт в каталоге продуктов   	
        if  (!(data&&data.program_id)) {
		return	res.status(500).send({
				'error': 'no_program_id',
				'msg': 'Не указана програма'
			})
	
	};


	async.waterfall(
		[objlib.getobj.bind(null,'cfkp_product',data.program_id),
		function  (programm,callback) {
			if (!programm)
			{callback({
				'error': 'no_program_id',
				'msg': 'Не указана програма c id='+data.program_id})
				};
			institute=programm.data.program.institute;
 			pers_req.create_NewUser_pers_request(data,callback);
 
 		},
		function  (res, callback) {
//			console.log('res ' +JSON.stringify(res,4,4));   

		 	if (res.user.state='new'&&institute&&institute==='Корпорация МСП'){
	 			mailer('a.shemardin@selen-it.ru','Заявка на финансирование',null,'registerwithpersreq',res);
 			        callback(null,{'msg':{'type':'msg','msg': 'Ваша заявка зарегистрирована, для подтверждения Вам выслано письмо.'}})

			}else if (res.user.state='work'&&institute&&institute==='Корпорация МСП'){
//	 			mailer('a.shemardin@selen-it.ru','Заявка на финансирование',null,'registerwithpersreq',res);
 			        callback(null,{'msg':{'type':'msg','msg': 'Ваша заявка зарегистрирована в вашем Личном кабинете, для работы с ней зайдите в личный кабинет'}})
			}
			else if (institute&&(institute==='ФРП'||institute==='МСП Банк'))
			{ mailer('a.shemardin@selen-it.ru','Заявка на финансирование',null,'no_registerwithpersreq',res);

 			        callback(null,{'msg':{'type':'msg','msg': 'Ваша заявка зарегистрирована, для подтверждения Вам выслано письмо.'}})
   			} 
			else  {
 			        callback({'msg':{'type':'error','msg': 'Указана програма c неизвестным институтом'+institute}})

 			}  
 		}

		],
	        function (err, result) {
 			if (err){res.status(500).send(err)}else {
			res.json(result);		
			};
		}
	);
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