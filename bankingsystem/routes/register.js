var express = require('express');
var router = express.Router();

let mysql = require('mysql2');

var dbConnectionInfo = require('../lib/connectionInfo');

var con = mysql.createConnection({
  host: dbConnectionInfo.host,
  user: dbConnectionInfo.user,
  password: dbConnectionInfo.password,
  port: dbConnectionInfo.port,
  multipleStatements: true
});

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("register.js: GET");
    res.render('register', { });
});

/* POST page. */
router.post('/', function(req, res, next) {
    con.connect(function(err) {
        if (err) {
          throw err;
        }
        else {
            console.log("register.js: Connected to server!");
            var username = req.body.username
            var password = req.body.hash
            var salt = req.body.salt
            var phone = req.body.phone
            var name = req.body.name
            var address = req.body.address
            var values = [username, password, salt, phone, name, address]
            let sql = "USE banking_system;";
            con.query(sql, function(err, results, fields) {
                if (err) {
                    console.log(err.message);
                    throw err;
                } else {
                    console.log("register.js: Selected color_survey database");
                }
            });
            con.query("CALL new_user(?,?,?,?,?,?,@result); SELECT @result", values,function (err, rows) {
            if (err) {
                console.log(err.message);
                throw err;
            }
            if (rows[1][0]['@result'] != 0){
                console.log("redister.js: failed to register user");
                // res.redirect('/');
                res.render('register', {message: "The username '" + username + "' already exists"});
            } else {
                sql = "CALL add_account('" + username + "', 0, 'savings');";
                con.query(sql, function(err, rows){
                    if(err){
                        throw err;
                    } else {
                        console.log("register.js: savings created for " + username)
                    }
                    sql = "CALL add_account('" + username + "', 0, 'checking');";
                    con.query(sql, function(err, rows){
                        if(err){
                            throw err;
                        } else {
                            console.log("register.js: checking created for " + username)
                            console.log("register.js: user registered and added to database if not already exitis");
                            console.log("register.js: POST");
                            res.redirect('/');
                        }
                    });
                });
            }
          });
        }
      });
});

module.exports = router;