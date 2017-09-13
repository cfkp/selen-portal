var crypto = require('crypto');
var async = require('async');
var util = require('util');
var mailer = require('../middleware/sendmail'); //-- Your js file path

var mongoose = require('libs/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema( {
    email: {
        type: String,
        unique: true,
        required: true,
        meta_name: "Логин"
    },
    tel: {
        type: String,
        unique: true,
        required: true
     },
    fio: {
        type: String
     },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    state: {
        type: String,
	default:"new"
     },

    userData: [{
        paramName: {
            type: String

        },
        paramValue: {
            type: Object
        }
    }]
});
schema.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() { return this._plainPassword; });


schema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function(isNew,email,fio, password,tel, callback) {
        console.log("user auth"+isNew);

    var User = this;
    if (isNew=='1') {
        console.log("user auth isnew=1");

        async.waterfall([
            function (callback) {
                User.findOne({email: email}, callback);
            },
            function (user, callback) {
                if (user) {
                    callback(new AuthError("Пользователь с таким email уже существует"));
                }
                else
                    User.findOne({tel: tel}, callback);
            },
            function (user, callback) {
                if (user) {
                    callback(new AuthError("Пользователь с таким телефоном уже существует"));
                }
                else {
                    var user = new User({email: email,fio:fio, tel: tel, password: password});
                    user.save(function (err) {
                    if (err) {return callback(err);}else{
             
                    callback(null, user); } 
                });
            }}
        ], callback);
    }
    else if (isNew=='0') {

        console.log("user auth isnew=0");
        async.waterfall([
            function (callback) {
                User.findOne({email: email}, callback);
            },
            function (user, callback) {
                if (user) {
			
                    if (user.checkPassword(password)) {
                        callback(null, user);
                    } else {
                        callback(new AuthError("Пароль неверен"));
                    }
                }
                else
                    callback(new AuthError("Пользователь не найден"));
            },
        ], callback);
    }

     else if (isNew=='2') {
        console.log("user auth isnew=2");

        async.waterfall([
            function (callback) {
                User.findOne({email: email}, callback);
            },
            function (user, callback) {
                if (user) {
		    var randomString = require('random-string');
                    var password = randomString({length: 6});
		    user.password=password;
                user.save(function (err) {
                    if (err) {return callback(err);}else{
                 	mailer(user.email,'Сброс пароля',null,'temp_pass_mail',{user:user,password:password});
                        callback(null,user);
			}

                } );      }
                else                     {
                    callback(new AuthError("Пользователь не найден")); }
		}
        ], callback);
    };
};

exports.User = mongoose.model('User', schema);

function AuthError(message) {
   // Error.apply(this, arguments);
   // Error.captureStackTrace(this, AuthError);

    this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

exports.AuthError = AuthError;