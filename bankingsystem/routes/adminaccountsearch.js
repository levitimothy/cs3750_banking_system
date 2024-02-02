var express = require('express');
var router = express.Router();

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("adminaccountsearch.js: GET");
    res.render('adminaccountsearch', { });
});

/* POST page. */
router.post('/', function(req, res, next) {
    
    console.log("adminaccountsearch.js: GET adminaccountresult");
    res.render('adminaccountresult',{});
});

module.exports = router;