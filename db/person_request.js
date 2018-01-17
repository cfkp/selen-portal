var db = require('../db/db');
var async = require('async');
var https = require('http');
var ObjectID = require('mongodb').ObjectID;
var User = require('models/user').User;
var objlib=require('../db/obj');


var config = require('config');
var sess=require('middleware/session');
var log = require('libs/log')(module);



var create_request=function(userID,fio,phone,fin_amount,fin_period,program_id,enterprise_inn,goal,product) {
 /////////////////////////
	var sysdate=   new Date().toISOString();

	var dbloc=db.get();
   pers_req={
        "fio": fio,
        "phone": phone,
        "project_name": "",
	"product":product,
        "INN": enterprise_inn,
        "fin_amount": fin_amount,
        "fin_period": fin_period,
	"program_id":program_id,
	"goal":goal
     };
    var row = {_id:new ObjectID().toString(),user_createid :userID,created:sysdate,
			this_meta_class:"person_request",
			need_ext_load:true,state:'Новый', data: pers_req };
		log.info( {row:row},'create_request');
 	        dbloc.collection("person_request").save(row, function (err, docs){
             if(err || docs.result === undefined){
 		log.error( {row:row},'create_request');
             }else{  }
                });
}; 

 
var load_request_info=function(request_id,next) {
 
	var sysdate=   new Date().toISOString();
	
	var options=config.get('tass_server');
   
	var request = require('request');
//  Basic Authentication credentials   
/*var username = "vinod"; 
var password = "12345";
var authenticationHeader = "Basic " + new Buffer(username + ":" + password).toString("base64");
*/
log.info( {request_id:request_id,
url : "http://"+options.host+':'+options.port+options.path+request_id},'load_request_info');

request(   
{
url : "http://"+options.host+':'+options.port+options.path+request_id,
headers : { /*"Authorization" : authenticationHeader */}  
},
 function (error, response, body) {
	var err;
	if (error||!response) {	log.error( {request_id:request_id,
		statusCode:404,error:error },'load_request_info');
		err={
			'error': 'no_load_request_info',
			'msg': 'Ошибка загрузки 404'
		}; 
}
	else if (error||response.statusCode!=200) {	log.error( {request_id:request_id,
		statusCode:response.statusCode,res:response,error:error },'load_request_info');
			err={
			'error': 'no_load_request_info',
			'msg': 'Ошибка загрузки  '+response.statusCode
		};
}	else {log.info( {request_id:request_id,
		statusCode:response.statusCode,error:error },'load_request_info');
 	}
			next(err,body);
   }  );     
  

};

var update_newuser_request=function(userID) {
log.info( {userID:userID},'update_newuser_request');
 	var sysdate=   new Date().toISOString();

	var dbloc=db.get();
 
	async.waterfall([
			function (callback) {
				dbloc.collection('person_request').findOne({
						 'user_createid': String(userID)
						}, 
				  callback);
			},
			function (row, callback) {
  				if (row) {
				 log.info( {userID:userID,rowid:row._id},'update_newuser_request');
					load_request_info (row._id,callback);
				} else {
				 log.error( {userID:userID },'update_newuser_request not found');
 
				};
 			}

		],
		function (err, results) {
		return;
 	});




 }; 


var create_NewUser_pers_request=function(pers_data,next) {

   var pers_req={
	"email": pers_data.email,
        "fio": pers_data.fio,
        "phone": pers_data.phone,
        "project_name": pers_data.project_name,
	"product":pers_data.product,
        "INN": pers_data.INN,
        "fin_amount": pers_data.fin_amount,
        "fin_period": pers_data.fin_period,
	"program_id":pers_data.program_id,
	"goal":pers_data.goal
     };
var user$;
	async.waterfall([
			function (callback) {
	console.log('create_NewUser_pers_request check_user');
				if (!sess.CurrentUserId())
				{
					console.log('create_NewUser_pers_request check_user no find or create user');

				User.authorize(3,pers_data.email,pers_data.fio ,null,pers_data.phone ,callback);
				}
				else {callback(null,sess.CurrentUser())};
				
			},
			function (user,callback){
			user$=user;
	console.log('set_current_user'+user$);
		
			if (!sess.CurrentUserId())
			        {console.log('set_current_user1' );
				sess.setCurrentUserbyID(user._id,callback);}
			else {console.log('set_current_user2' );callback(null)}
			},
			function (callback) {   
	console.log('create_request'+user$);console.log('create_request'+callback);
			    db.save_obj("person_request",undefined,pers_req,function(err,row){
				callback(err,{"user":user$,"pers_req":row})}); 
 			}

		],
		function (err, results) {
		next(err,results);
 	});





}; 
exports.create_NewUser_pers_request=create_NewUser_pers_request;


function sendnotifymessage(pers_req_id,mess_row){

 	async.waterfall([
			function (callback) {
                         objlib.getobj('person_request',pers_req_id,callback);
			}
 
		],
		function (err, res) {

 		//	console.log('sednotifymessage' +' mail res '+JSON.stringify(res,4,4));
 		//	console.log('sednotifymessage' +' mail row '+JSON.stringify(mess_row,4,4));
			if (res&&res.user_createid!==sess.CurrentUserId()&&res.user_expert){
				objlib.sendmail2user(/*res.user_createid*/res.user_expert,'Уведомление о сообщении',null,'message_notify',
					{person_request:res,person_message:mess_row});
			}
			else if (res&&res.user_expert&&res.user_createid==sess.CurrentUserId())
			{	objlib.sendmail2user(res.user_expert,'Уведомление о сообщении',null,'message_notify',
					{person_request:res,person_message:mess_row});
			}
			/*else {
				 mailer('finance@cfcp.ru','Уведомление о сообщении',null,'message_notify',
					{person_request:res,person_message:mess_row});
			 

			}*/
//			mailer(res.email,subject,message,templateName,data);
 	});

};

exports.sendnotifymessage=sendnotifymessage;



exports.create_request=create_request;
exports.update_newuser_request=update_newuser_request;
exports.load_request_info=load_request_info;
