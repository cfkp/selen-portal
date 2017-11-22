var db = require('../db/db');
var async = require('async');
var https = require('http');
var ObjectID = require('mongodb').ObjectID;

var config = require('config');
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
		statusCode:response.statusCode,error:error },'load_request_info');
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


exports.create_request=create_request;
exports.update_newuser_request=update_newuser_request;
exports.load_request_info=load_request_info;
