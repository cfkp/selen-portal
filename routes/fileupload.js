var express = require("express");
var router = express.Router();
var async = require('async');
var _ = require('lodash');
var formidable = require('formidable');
var path = require('path');

var config = require('config');

var fs = require("fs");
var db = require('../db/db');
var checkAuth = require('../middleware/checkAuth');
var log = require('libs/log')(module);
 
router.get('/down/:file(*)', function(req, res, next){

 log.info({req:req},'start');
 var userid= req.session.user;
 var file = req.params.file;

  var  filename =path.join(__dirname,config.get('upload_path'))+'/' + file;


  var newfilename=filename.substr(filename.indexOf("$")+1);
 
 res.download(filename,newfilename);
});

 


router.post('/up', function(req, res){
 log.info({req:req},'start');
 var userid= req.session.user;
 var result={};
  // create an incoming form object
 var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;
 
  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname,config.get('upload_path'));// path.join(__dirname, '../uploads');
console.log('uploadDir'+form.uploadDir); 
  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
  	result.serverfilename= userid+'$'+file.name;
  	fs.rename(file.path, path.join(form.uploadDir, result.serverfilename));
  
	log.info({req:req},{uploadDir:form.uploadDir,serverfilename:result.serverfilename,file_name:file.name});
 
  });

  // log any errors that occur
  form.on('error', function(err) {
	log.error({req:req},{uploadDir:form.uploadDir,serverfilename:result.serverfilename,file_name:file.name},'An error has occured: \n' + err);
   });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end(JSON.stringify(result));
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

module.exports=router;