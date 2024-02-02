var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("accountresult.js: GET");
    res.render('accountresult', {});
});

module.exports = router;
