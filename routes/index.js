var express = require('express');
var router = express.Router();

var checkAuth = require('middleware/checkAuth');



router.get('/', checkAuth, function (req, res, next) {
    res.render('main');

});
router.post('/logout', require('./logout').post);

module.exports = router;
