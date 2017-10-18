var db = require('../db/db');
var async = require('async');
var https = require('http');




var create_request=function(userID,fio,phone,fin_amount,fin_period,program_id,enterprise_inn,goal,product) {
console.log("create_request "+userID);
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
    var row = {user_createid :userID,created:sysdate,need_ext_load:true,state:'Новый', data: pers_req };
		console.log(' set row');
		console.log(row);
	        dbloc.collection("person_request").save(row, function (err, docs){
	
		console.log('save row');
                console.log(docs);

            if(err || docs.result === undefined){
                console.error('Error inserting document', err);
                //res.status(400).json({'msg': 'Error inserting document'});
            }else{  }
                });
}; 

/*var load_request_info=function(request_id,next) {
	console.log("load_request_info "+request_id);
 
	var sysdate=   new Date().toISOString();
    var options = {host:'selen-it.ru', 
		port:'800',
		path:'/ztassquery/query/tass/input?login=tishenkov@icgfirst.ru&password=Aa4224005&id='+request_id,
		method : 'GET'};
 
    //making the https get call
    var getReq = https.request(options, function(res) {
        console.log("status code: ", res.statusCode);
        res.on('data', function(data) {
            console.log( data );
        });
	
    });
     //end the request
    getReq.end();
     getReq.on('error', function(err){
        console.log("Error send load_request_info: "+request_id+ err);
    }); 
  

};*/ 

var load_request_info=function(request_id,next) {
	console.log("load_request_info "+request_id);
 
	var sysdate=   new Date().toISOString();
    var options = {host:'selen-it.ru', 
		port:'8080',
//http://selen-it.ru:8080/ztassquery/query/tass/small?login=tishenkov@icgfirst.ru&password=Aa4224005&id=
//		path:'/ztassquery/query/tass/input?login=tishenkov@icgfirst.ru&password=Aa4224005&id='+request_id,
		path:'/ztassquery/query/tass/small?login=tishenkov@icgfirst.ru&password=Aa4224005&id='+request_id,
		method : 'GET'};
 
 var request = require('request');
//  Basic Authentication credentials   
/*var username = "vinod"; 
var password = "12345";
var authenticationHeader = "Basic " + new Buffer(username + ":" + password).toString("base64");
*/
request(   
{
url : "http://"+options.host+':'+options.port+options.path,
headers : { /*"Authorization" : authenticationHeader */}  
},
 function (error, response, body) {
	console.log(response.statusCode)
		if (error||response.statusCode!=200) {console.log("send load_request_info Error : "+request_id+ ' '+error);}
		else
	{console.log("send load_request_info: "+request_id+ 'success ');}
	next(error,body);
   }  );     
  

};
var update_newuser_request=function(userID) {
console.log("update_newuser_request "+userID);
/////////////////////////
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
			//	row ={};row._id='58f720c0931574157ced48ab';
				console.log('сделали поиск заявки');

 				if (row) {
console.log('заявка найдена'); 
				load_request_info (row._id,callback);
				} else {console.log('заявка не найдена'); 
};
 			}

		],
		function (err, results) {
		console.log('Завершили вызов http');
 		console.log(results);
		console.log(err);
 	});




 }; 


exports.create_request=create_request;

exports.update_newuser_request=update_newuser_request;
exports.load_request_info=load_request_info;
