/**
 * Created by Valery on 04.06.2017.
 */
// Отчет #4 - Анкета проекта
var fs = require('fs');
var zip = new require('node-zip')();
var async = require('async');
var db = require('../db/db');
var path = require('path');
 //function doReport1(aIdNumber) {
function doReport4(req, res, next) {
	var parent_name = 'pers_request_id';
	var parent_id = req.params.pers_req;

//	parent_id="5941ae031e9a551829eb8c3c" ;
     console.log('parent_id=' + parent_id);
res.redirect('http://selen-it.ru:8080/zrep01/rep/download/rep4?pers_request_id='+parent_id); 
     //res.send('ID=' + userID);
}


module.exports.doReport4 = doReport4;
