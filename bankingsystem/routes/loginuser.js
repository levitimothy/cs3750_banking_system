var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("loginuser.js: GET");
    res.render('loginuser', { });
});

/* POST page. */
router.post('/', function(req, res, next) {
    console.log("loginuser.js: POST");
    console.log("The logged in variable is'" + req.session.loggedIn + "'");
    console.log("The username in variable is'" + req.body.username + "'");
    console.log("The hashedPassword in variable is'" + req.body.hashedPassword + "'");
    //if (!req.session.loggedIn && req.body.username != "") {
    if (req.body.hashedPassword) {
        // User is submitting user/password credentials
        const username = req.session.username;
        const hashedPassword = req.body.hashedPassword;
        const sql = "CALL check_credentials('" + username + "', '" + hashedPassword + "')";
        dbCon.query(sql, function(err, results) {
            if (err) {
                throw err;
            }
            // console.log("loginuser.js: Obtained result from accounts table below");
            // console.log(results);
            // console.log(results[0]);
            // console.log(results[0][0]);
            // console.log(results[0][0].result);
            if (results[0][0] === undefined || results[0][0].result == 0) {
                console.log("loginuser.js: No login credentials found");
                res.render('loginuser', {message: "Password not valid for user '" + username + "'.  Please log in again."});
            }
            else {
                console.log("loginuser.js: Credentials matched");
                const mysql = ("select user_type_id\n" +
                      "from users\n" +
                      "where username = '" + username + "';");
                dbCon.query(mysql, function(err,results){
                    if (err){
                        throw err;
                    } 
                    // console.log(results);
                    // console.log(results[0]);
                    // console.log(results[0].user_type_id);
                    if(results[0] === undefined || results[0].user_type_id == 1) {
                        req.session.loggedIn = true;
                        console.log("loginuser.js: Regular user login confirmed");
                        // res.render('loginuser', {message: "It worked"});
                        res.redirect("/accountpage");
                    } else if (results[0].user_type_id == 2) {
                        req.session.loggedIn = true;
                        console.log("loginuser.js: Employee user login confirmed");
                        // res.render('loginuser', {message: "It worked"});
                        res.redirect("/accountsearch");
                    } else if (results[0].user_type_id == 3) {
                        req.session.loggedIn = true;
                        console.log("loginuser.js: Admin user login confirmed");
                        // res.render('loginuser', {message: "It worked"});
                        res.redirect("/adminaccountsearch");
                    }
                });
            }
        });
    } 
    else if (req.body.username != "") {
        const username = req.body.username;
        console.log("loginuser.js: username is: " + username);
        const sql = "CALL get_salt('" + username + "')";
        dbCon.query(sql, function(err, results) {
            if (err) {
                throw err;
            }
            if (results[0][0] === undefined) {
                console.log("loginuser: No results found");
                res.render('loginuser', {message: "User '" + username + "' not found"});
            } else {
                const salt = results[0][0].salt;
                req.session.username = username;
                req.session.salt = salt;
                res.render('loginpassword', {
                    username: username,
                    salt: salt});
            }
        });
 
    }
    
});

module.exports = router;
