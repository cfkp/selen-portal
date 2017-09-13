/**
 * Created by Valery on 07.06.2017.
 */
// Отчет #3 - Резюме проекта
var fs = require('fs');
var zip = new require('node-zip')();
var async = require('async');
var db = require('../db/db');
var path = require('path');

 
//function doReport2(aIdNumber) {
function doReport3(req, res, next) {
	var parent_name = 'pers_request_id';
	var parent_id = req.params.pers_req;

//	parent_id="5941ae031e9a551829eb8c3c" ;
     console.log('parent_id=' + parent_id);
res.redirect('http://selen-it.ru:8080/zrep01/rep/download/rep3?pers_request_id='+parent_id); 
 
    // Вывод результата
    //res.send('ID=' + userID);
}


module.exports.doReport3 = doReport3;
