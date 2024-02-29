var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("transactions_emp.js: GET");
    res.render('transactions_emp', {username: "", transactions: ""});
});

router.post('/', function(req, res, next){
    
    console.log("transactions_emp.js: POST");
    var username = req.body.username_;
    let sql = "CALL get_user_transactions('" + username + "');";
    objForTransactionsEJS = {}    
    dbCon.query(sql, function(err,rows){
        if (err){
            throw err;
        }
        objForTransactionsEJS.transactions = rows[0];
        objForTransactionsEJS.username = username;
        res.render('transactions_emp', objForTransactionsEJS);
    });
    
});

module.exports = router;