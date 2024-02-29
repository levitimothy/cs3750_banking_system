var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("transfer.js: GET");
    res.render('transfer', {});
});

router.post('/', function(req, res, next){
    console.log("transfer.js: POST");
    var withdraw = req.body.withdraw;
    var amount = req.body.amount;
    var deposit = req.body.deposit;
    var memo = req.body.memo;
    const sql = "call new_transaction_neg('" + withdraw + "', " + amount + ", '" + memo + "');";
    dbCon.query(sql, function(err, result){
        if (err){
            throw err;
        }
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
                        console.log("transer.js: regular user tansfered funds");
                        res.redirect("/accountpage");
                    } else if (results[0].user_type_id == 2) {
                        console.log("transer.js: employee user tansfered funds");
                        res.redirect("/accountsearch");
                    } else if (results[0].user_type_id == 3) {
                        console.log("transer.js: admin user tansfered funds");
                        res.redirect("/adminaccountsearch");
                    }
                });
            }
        })
    });
});

module.exports = router;