var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("changepassword.js: GET");
    res.render('changepassword', { });
});

/* POST page. */
router.post('/', function(req, res, next) {
    console.log("changepassword.js: POST");
    const local_username = req.session.username;
    var password = req.body.hash;
    var salt = req.body.salt;
    var username = req.body.username;
    const mysql = ("select user_type_id\n" +
            "from users\n" +
            "where username = '" + local_username + "';");
    dbCon.query(mysql, function(err,results){
        if (err){
            throw err;
        } 
        if(results[0] === undefined || results[0].user_type_id == 1) {
            req.session.loggedIn = true;
            console.log("changepassword.js: Regular user password changed");
            let sql = "select * from users where username = '" + local_username + "';";
            dbCon.query(sql, function(err,row){
                if(err){
                    throw err;
                }
                if (row[0].username){
                    sql = "update users\n" +
                          "set hashed_password = '" + password + "', salt = '" + salt + "'\n" +
                          "where username = '" + local_username + "';";
                    dbCon.query(sql,function(err,result){
                        if (err){
                            throw err;
                        } else {
                            res.redirect("/accountpage")
                        }
                    });
                }
            });
        } else if (results[0].user_type_id == 2) {
            req.session.loggedIn = true;
            console.log("changepassword.js: Employee unable to change password");
            res.redirect("/accountsearch");
        } else if (results[0].user_type_id == 3) {
            req.session.loggedIn = true;
            console.log("loginuser.js: Admin user login confirmed");
            sql = "update users\n" +
                  "set hashed_password = '" + password + "', salt = '" + salt + "'\n" +
                  "where username = '" + username + "';";
            
            dbCon.query(sql,function(err,result){
                if (err){
                    throw err;
                } else {
                    res.redirect("/adminaccountsearch");
                }
            });
        }
    });
});

module.exports = router;