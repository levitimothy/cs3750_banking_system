var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("transactions.js: GET");
    res.render('transactions', {});
});

module.exports = router;