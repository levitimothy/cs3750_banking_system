var express = require('express');
var router = express.Router();

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("changepassword.js: GET");
    res.render('changepassword', { });
});

/* POST page. */
router.post('/', function(req, res, next) {
    console.log("changepassword.js: POST");
    res.render('loginuser', { });
});

module.exports = router;