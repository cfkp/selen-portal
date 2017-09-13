var express = require('express');
var router = express.Router();

var User = require('models/user').User;
var HttpError = require('error').HttpError;
var AuthError = require('models/user').AuthError;
var mailer = require('../middleware/sendmail'); //-- Your js file path

var async = require('async');

var db = require('../db/db');
var ObjectID = require('mongodb').ObjectID;

router.get('/', function (req, res) {
    res.render('login');
} );


router.post('/', function (req, res, next) {
	console.log("авторизация");

// isNew - 0 - Уже зарегистрированный
// isNew - 1 - Новый
// isNew - 2 - забыл пароль

    var isNew = parseInt(req.body.isNew);
    var tel = null;
    if (req.body.tel)
        tel = req.body.tel;
   // console.log(req.body.tel);
    var email = req.body.email;
    var password = req.body.password;
    var fio = req.body.fio;
    
    User.authorize(isNew,email,fio,password,tel, function(err, user) {
        console.log("auth");

	 if (err) {
	console.log("err");

            if (err instanceof AuthError) {

	console.log("err http");
              //  return next(new HttpError(403, err.message));
		return res.status(403).send({
				'type': 'error',
				'msg': err.message
			});
	
            } else {
	console.log("err other");

                return next(err);
            }
        }
	if ((isNew=='1')||(!user.state)||(user.state=="new")) {
	console.log("new user");
		mailer(user.email,'Регистрация',null,'regmail',{user:user});

		res.status(200).send({
				'type': 'Сообщение',
				'msg': 'По указанному Вами адресу направлено письмо с подтверждением регистрации. Просьба перейти по ссылке, указанной в письме'
			});

		}
	else if (isNew=='2') {
	console.log("reset pass user");

		res.status(200).send({
				'type': 'Сообщение',
				'msg': 'По указанному Вами адресу направлено письмо с временным паролем. <br> В целях безопасности. После входа смените на новый пароль в личном кабинете.'
			});

		}

	else{
	console.log("login user");

	 req.session.user = user._id;
			res.status(200).send({
				'type': 'Сообщение',
				'msg': 'Добро пожаловать'
			});
             }
    });

}  
);

router.get('/registration', function (req, res, next) {
	console.log("get '/registration'");
	console.log("get " + req.query.confirm);

	var userID = req.session.user;
	var meta_class = "users";

	/////////////////////////
	var dbloc = db.get();
	var new_state="work";
	var obj_id = new ObjectID(req.query.confirm);

	dbloc.collection(meta_class).updateOne({
		"_id": obj_id
	}, {
		$set: {
			"state": new_state
		}
	},
		function (err, docs) {
				console.log(' updating document1 ');

	console.log(docs);

		if (err || (!docs)|| (docs.result.n==0)) {

		//	res.status(400).json({'msg': 'Ошибка регистрации пользователь не найден'});
		  res.render('regfinish',{'msg':{'type':'error','msg': 'Ошибка регистрации пользователь не найден'}});

		} else {
//	console.log(' updating document2 ');
//	console.log(docs);
//	console.log(docs.ops);

		  res.render('regfinish',{'msg':{'type':'message','msg':  "Спасибо за регистрацию"}});

		}
//		res.json(dataReturn);


		//return  res.render('regfinish');
	}); 
	
 //   return res.redirect("./login");
	
});


module.exports = router;
