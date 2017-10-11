var db = require('../db/db');


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
    var row = {user_createid :userID,created:sysdate, data: pers_req };
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

exports.create_request=create_request;