var express = require('express');
var router = express.Router();

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("accountsearch.js: GET");
    res.render('accountsearch', { });
});

/* POST page. */
router.post('/', function(req, res, next) {
    
    console.log("accountsearch.js: GET accountresult");
    res.render('accountresult',{});
});

module.exports = router;