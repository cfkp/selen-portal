//var User = require('models/user').User;
var db = require('../db/db');

/*{
    "_id": "5a0a7b11243df50d14a9d2a3",
    "email": "shemardin@gmail.com",
    "fio": "wqeqwe",
    "tel": "+7-111-111-11-11",
    "hashedPassword": "6b4d2c9af6366d121667a78f82da505fdfe0a2bb",
    "salt": "0.2050832940667715",
    "state": "work",
    "created": "2017-11-14T05:11:45.980Z",
    "__v": 0,
    "updated": "2017-11-15T11:25:25.617Z",
    "data": {
        "role": "5a0c23cdfb34d60870d64a72"
    },
    "this_meta_class": "users",
    "role": {
        "_id": "5a0c23cdfb34d60870d64a72",
        "created": "2017-11-15T11:23:57.670Z",
        "user_createid": "5a0a83138e4bc811f8d9ae83",
        "state": "Новый",
        "data": {
            "name": "Администратор",
            "code": "admin",
            "user_menu": "admin_menu"
        },
        "updated": "2017-11-15T11:27:26.528Z",
        "this_meta_class": "roles"
    }
}
*/


module.exports = function(req, res, next) {
 
    req.user = res.locals.user = null;
     if (!req.session.user) return next();
	var dbloc = db.get();

	dbloc.collection('users').aggregate( [

				{$match:{"_id":req.session.user}},
				{$lookup: {
				 from: "roles",
		          	localField: "data.role",
		          	foreignField: "_id",   
		          	as: "role"
			        }},
				{$addFields:  
				{"role" : 
					{$arrayElemAt: [ "$role", 0 ]}
				} }
	] ).toArray(function (err, rows) {
 		        if (err) return next(err);

		        req.user = res.locals.user = rows[0];
  		        next();

			});    

 };