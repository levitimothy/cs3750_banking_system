var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("accountpage.js: GET");
    res.render('accountpage', {});
});

module.exports = router;