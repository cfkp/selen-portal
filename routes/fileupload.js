var express = require("express");
var router = express.Router();
var async = require('async');
var _ = require('lodash');
var formidable = require('formidable');
var path = require('path');

var fs = require("fs");
var db = require('../db/db');
var checkAuth = require('../middleware/checkAuth');
 
/*router.all('/',checkAuth,function(request, response,next){
console.log('upload all');
	next();   
         });
*/
router.get('/down/:file(*)', function(req, res, next){
 console.log('download');
 var userid= req.session.user;
 var file = req.params.file;

var  filename =path.resolve(".")+'/uploads/' + file;


 console.log(file);
 console.log(filename);
 var newfilename=filename.substr(filename.indexOf("$")+1);
 console.log(newfilename);

 res.download(filename,newfilename);
});

 


router.post('/up', function(req, res){
 console.log('up');
 var userid= req.session.user;
 var result={};
  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;
 console.log('upload1');

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '../uploads');
 console.log('upload2');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    console.log('download ok' );
    console.log(file.path);
	console.log(file.hash);

 console.log(file.name);

 fs.rename(file.path, path.join(form.uploadDir, userid+'$'+file.name));
result.serverfilename= userid+'$'+file.name;
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end(JSON.stringify(result));
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

module.exports=router;