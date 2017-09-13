var express = require('express');
var router = express.Router();

var checkAuth = require('middleware/checkAuth');



router.get('/',checkAuth, function(req, res, next) {
    //    res.redirect('./generateForm');
       res.render('main');

});
//router.get('/login',require('./login').get);
//router.post('/login',require('./login').post);
router.post('/logout',require('./logout').post);

module.exports = router;
