var log = require('libs/log')(module);

module.exports = function(to,subject,message,templateName,data) {

var config = require('config');

var mailer = require('nodemailer');
/*
var transporter = mailer.createTransport({
   service: "Yandex",  
   auth: {
      user: "info@selen-it.ru",
      pass: "Monday2017"
    }
,tls: {rejectUnauthorized: false }
}); */
var mailer_option=config.get('mail');

var transporter = mailer.createTransport(mailer_option);

//-- Get your html body from database
if (templateName){ 
var ejs = require('ejs')
  , fs = require('fs')
  , str = fs.readFileSync('template/email/'+templateName+'.ejs', 'utf8'); 

data['server']=config.get('server');
console.log('sendmail data '+JSON.stringify(data));
var message = ejs.render(str, data);
 }

var mailOptions = {
    from:  mailer_option.auth.user,//"<info@selen-it.ru>", // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: message// html body
};
 log.info({mailOptions:mailOptions},'sendMail');

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
	log.error({error:error},'sendMail');
  	return error;
    } else {
	log.info({info:info},'sendMail');
        return 'OK';
    }
});
}