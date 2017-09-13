/**
 * Created by Valery on 07.06.2017.
 */
// Отчет #2 - Заявка на получение независимой гарантии
var fs = require('fs');
var zip = new require('node-zip')();
var async = require('async');
var petrovich = require('petrovich');
var db = require('../db/db');
var path = require('path');

var jspath = require('JSONPath');
 //function doReport2(aIdNumber) {
function doReport2(req, res, next) {
	var parent_name = 'pers_request_id';
	var parent_id = req.params.pers_req;

//	parent_id="5941ae031e9a551829eb8c3c" ;
        console.log('parent_id=' + parent_id);
res.redirect('http://selen-it.ru:8080/zrep01/rep/download/rep2?pers_request_id='+parent_id); 
 
    // Вывод результата
    //res.send('ID=' + userID);
}
 module.exports.doReport2 = doReport2;
