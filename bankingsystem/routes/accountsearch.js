var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("accountsearch.js: GET");
    res.render('accountsearch', { });
});

/* POST page. */
router.post('/', function(req, res, next) {
    console.log("accountpage.js: GET");
    var username = req.body.username;
    let sql = "SELECT *\n" +
              "FROM users\n" +
              "WHERE username = '" + username + "';";
    dbCon.query(sql, function(err, rows){
        if (err){
            throw err;
        } else {
            var name = rows[0].name;
            var address = rows[0].address;
            var phone = rows[0].phone;
            var user_id = rows[0].user_id;
            sql = "call find_user_accounts('" + username + "','savings');";
            dbCon.query(sql, function(err,rows){
                if (err){
                    throw err;
                } else {
                    console.log(rows);
                    var savingsAccount = rows[0][0].account_num;
                    var savingsBalance = rows[0][0].balance;
                    sql = "call find_user_accounts('" + username + "','checking');";
                    dbCon.query(sql, function(err,rows){
                        if (err){
                            throw err;
                        } else {
                            console.log(rows);
                            var checkingAccount = rows[0][0].account_num;
                            var checkingBalance = rows[0][0].balance;
                            res.render('accountresult', {
                                username: username,
                                name: name,
                                address: address,
                                phone: phone,
                                savingsAccount: savingsAccount,
                                savingsBalance: savingsBalance,
                                checkingAccount: checkingAccount,
                                checkingBalance: checkingBalance
                            });
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;