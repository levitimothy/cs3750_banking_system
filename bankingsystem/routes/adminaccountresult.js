var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("adminaccountresult.js: GET");
    res.render('adminaccountresult', {});
});

module.exports = router;
