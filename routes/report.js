// Данные для заполнения таблицы
var express = require('express');
var router = express.Router();
var config = require('config');



router.get('/:report/:pers_req', function (req, res, next) {
    var parent_name = 'pers_request_id';
    var parent_id = req.params.pers_req;
    var rep = req.params.report;
    //'http://selen-it.ru:8080/zrep01/rep/download/'

    res.redirect(config.get('report_server') + rep + '?pers_request_id=' + parent_id);





});


module.exports = router;
