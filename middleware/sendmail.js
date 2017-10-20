module.exports = function(to,subject,message,templateName,data) {

var mailer = require('nodemailer');

var transporter = mailer.createTransport({
   service: "Yandex",  // sets automatically host, port and connection security settings
   auth: {
       //user: "info@selen-it.ru",
       //pass: "Monday2017"

user:"finance@cfcp.ru",
pass: "brAcj6Fs6zENXo"
   }
,tls: {rejectUnauthorized: false }
});

//-- Get your html body from database
if (templateName){ 
var ejs = require('ejs')
  , fs = require('fs')
  , str = fs.readFileSync('template/email/'+templateName+'.ejs', 'utf8'); 

var message = ejs.render(str, data);
console.log(message);
}

var mailOptions = {
    from: "<finance@cfcp.ru>",//"<info@selen-it.ru>", // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: message// html body
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log('mail error' + error);
        return error;
    } else {
        console.log('mail info' + info);
        return 'OK';
    }
});
}