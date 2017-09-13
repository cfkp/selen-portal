// Данные для заполнения таблицы
var express = require('express');
var router = express.Router();
var doReport1 = require('../report/doReport1');
var doReport2 = require('../report/doReport2');
var doReport3 = require('../report/doReport3');
var doReport4 = require('../report/doReport4');

 /* Get Report1 - http://localhost:3000/report1 */
router.get('/report1/:pers_req', doReport1.doReport1);

/* Get Report2 - http://localhost:3000/report2 */
router.get('/report2/:pers_req', doReport2.doReport2);

/* Get Report2 - http://localhost:3000/report3 */
router.get('/report3/:pers_req', doReport3.doReport3);

/* Get Report4 - http://localhost:3000/report4 */
router.get('/report4/:pers_req', doReport4.doReport4);

 
module.exports = router;
