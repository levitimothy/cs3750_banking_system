var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("deposit.js: GET");
    res.render('deposit', {});
});

router.post('/', function(req, res, next){
    console.log("deposit.js: POST");
    var amount = req.body.amount;
    var deposit = req.body.deposit;
    var memo = req.body.memo;
    const mysql = "call new_transaction_pos('" + deposit + "', " + amount + ", '" + memo + "');";
    dbCon.query(mysql, function(err, result){
        if (err){
            throw err;
        } else {
            const local_username = req.session.username;
            const mysql1 = ("select user_type_id\n" +
                    "from users\n" +
                    "where username = '" + local_username + "';");
            dbCon.query(mysql1, function(err,results){
                if (err){
                    throw err;
                } 
                if(results[0] === undefined || results[0].user_type_id == 1) {
                    console.log("deposit.js: regular user deposited funds");
                    res.redirect("/accountpage");
                } else if (results[0].user_type_id == 2) {
                    console.log("deposit.js: employee user deposited funds");
                    res.redirect("/accountsearch");
                } else if (results[0].user_type_id == 3) {
                    console.log("deposit.js: admin user deposited funds");
                    res.redirect("/adminaccountsearch");
                }
            });
        }
    });
});

module.exports = router;