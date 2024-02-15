let mysql = require('mysql2');

var dbConnectionInfo = require('./connectionInfo');

var con = mysql.createConnection({
  host: dbConnectionInfo.host,
  user: dbConnectionInfo.user,
  password: dbConnectionInfo.password,
  port: dbConnectionInfo.port,
  multipleStatements: true              // Needed for stored proecures with OUT results
});

con.connect(function(err) {
  if (err) {
    throw err;
  }
  else {
    console.log("database.js: Connected to server!");
    
    con.query("CREATE DATABASE IF NOT EXISTS banking_system", function (err, result) {
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: banking_system database created if it didn't exist");
      selectDatabase();
    });
  }
});

function selectDatabase() {
    let sql = "USE banking_system";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: Selected banking_system database");
        createTables();
        createStoredProcedures();
        addTableData();
      }
    });
}


function createTables() {
    // A CREATE TABLE call will work if it does not exist or if it does exist.
    // Either way, that's what we want.
    let sql = "CREATE TABLE IF NOT EXISTS user_types (\n" +
          "user_type_id INT NOT NULL AUTO_INCREMENT, \n" +
          "user_type VARCHAR(25) NOT NULL,\n" +
          "PRIMARY KEY (user_type_id)\n" +
          ");";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table user_types created if it didn't exist");
      }
    });

    sql = "CREATE TABLE IF NOT EXISTS users (\n" +
                "user_id INT NOT NULL AUTO_INCREMENT,\n" +
                "username VARCHAR(255) NOT NULL,\n" +
                "hashed_password VARCHAR(255) NOT NULL,\n" +
                "salt VARCHAR(255) NOT NULL,\n" +
                "phone VARCHAR(10) NOT NULL,\n" +
                "name VARCHAR(255) NOT NULL,\n" +
                "address VARCHAR(255) NOT NULL,\n" +
                "user_type_id INT NOT NULL,\n" +
                "PRIMARY KEY (user_id),\n" +
                "FOREIGN KEY (user_type_id) REFERENCES user_types(user_type_id)\n" +
                ")";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table users created if it didn't exist");
      }
    });

    sql = "CREATE TABLE IF NOT EXISTS account_types (\n" +
                "account_type_id INT NOT NULL AUTO_INCREMENT, \n" +
                "account_type VARCHAR(25) NOT NULL,\n" +
                "PRIMARY KEY (account_type_id)\n" +
              ");";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table account_types created if it didn't exist");
      }
    });

    
  
    sql = "CREATE TABLE IF NOT EXISTS account_nums (\n" +
                "account_num INT NOT NULL AUTO_INCREMENT,\n" +
                "user_id INT NOT NULL,\n" +
                "balance INT NOT NULL,\n" +
                "account_type_id INT NOT NULL,\n" +
                "PRIMARY KEY (account_num),\n" +
                "FOREIGN KEY (user_id) REFERENCES users(user_id),\n" +
                "FOREIGN KEY (account_type_id) REFERENCES account_types(account_type_id)\n" +
              ")";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table account_nums created if it didn't exist");
      }
    }); 

    sql = "Alter table account_nums AUTO_INCREMENT = 10000;";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table users created if it didn't exist");
      }
    });


    sql = "CREATE TABLE IF NOT EXISTS transactions (\n" +
                "transaction_id INT NOT NULL AUTO_INCREMENT,\n" +
                "account_num INT NOT NULL,\n" +
                "amount INT NOT NULL,\n" +
                "date_time DATETIME NOT NULL,\n" +
                "memo VARCHAR(255),\n" +
                "PRIMARY KEY (transaction_id),\n" +
                "FOREIGN KEY (account_num) REFERENCES account_nums(account_num)\n" +
              ")";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table transactions created if it didn't exist");
      }
    }); 
}
  
function createStoredProcedures() {

    let sql = "CREATE PROCEDURE IF NOT EXISTS `insert_account_type`(\n" +
                      "IN account_type VARCHAR(45)\n" +
                  ")\n" +
                  "BEGIN\n" +
                  "INSERT INTO account_types (account_type)\n" +
                  "SELECT account_type FROM DUAL\n" +
                  "WHERE NOT EXISTS (\n" +
                    "SELECT * FROM account_types\n" +
                    "WHERE account_types.account_type=account_type LIMIT 1\n" +
                  ");\n" +
              "END;";
    
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure insert_account_type created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `insert_user_type`(\n" +
                      "IN user_type VARCHAR(45)\n" +
                  ")\n" +
                  "BEGIN\n" +
                  "INSERT INTO user_types (user_type)\n" +
                  "SELECT user_type FROM DUAL\n" +
                  "WHERE NOT EXISTS (\n" +
                    "SELECT * FROM user_types\n" +
                    "WHERE user_types.user_type=user_type LIMIT 1\n" +
                  ");\n" +
              "END;";
    
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure insert_user_type created if it didn't exist");
      }
    });
  
    sql = "CREATE PROCEDURE IF NOT EXISTS `new_user`(\n" +
                  "IN  username VARCHAR(255), \n" +
                  "IN  hashed_password VARCHAR(255), \n" +
                  "IN  salt VARCHAR(255), \n" +
                  "IN  phone VARCHAR(10), \n" +
                  "IN  name VARCHAR(255), \n" +
                  "IN  address VARCHAR(255), \n" +
                  "OUT result INT\n" +
              ")\n" +
              "BEGIN\n" +
                  "DECLARE nCount INT DEFAULT 0;\n" +
                  "SET result = 0;\n" +
                  "SELECT Count(*) INTO nCount FROM users WHERE users.username = username;\n" +
                  "IF nCount = 0 THEN\n" +
                      "INSERT INTO users (username, hashed_password, salt, phone, name, address, user_type_id)\n" +
                      "VALUES (username, hashed_password, salt, phone, name, address, \n" +
                      "(SELECT user_type_id FROM user_types WHERE user_types.user_type = 'regular')\n" +
                      ");\n" +
                  "ELSE\n" +
                      "SET result = 1;\n" +
                  "END IF;\n" +
              "END;"
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure new_user created if it didn't exist");
      }
    });
    
    sql = "CREATE PROCEDURE IF NOT EXISTS `change_user_type`(\n" +
              "IN  username VARCHAR(255),\n" +
              "IN  user_type VARCHAR(255)\n" +
          ")\n" +
          "BEGIN\n" +
              "UPDATE users\n" +
              "SET user_type_id = (SELECT user_type_id FROM user_types WHERE user_types.user_type = user_type)\n" +
              "WHERE users.username = username;\n" +
          "END;"
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure change_user_type created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `add_account`(\n" +
                "IN  username VARCHAR(255), \n" +
                "IN  balance INT,\n" +
                "IN  account_type VARCHAR(45)\n" +
            ")\n" +
            "BEGIN\n" +
                // "set @temp = (SELECT count(account_type_id)\n" +
                //              "FROM account_nums\n" +
                //              "WHERE account_type_id = (SELECT account_type_id\n" +
                //              "FROM account_types\n" +
                //              "WHERE account_type = 'savings')\n" +
                //              "AND user_id = (SELECT user_id\n" +
                //              "FROM users\n" +
                //              "WHERE users.username = 'member')\n" +
                //              "group by account_type_id);\n" +
                // "IF @temp = NULL THEN\n" +
                      "INSERT INTO account_nums (user_id, balance, account_type_id)\n" +
                      "VALUES ((SELECT user_id FROM users WHERE users.username = username),\n" + 
                      "balance,\n" + 
                      "(SELECT account_type_id FROM account_types WHERE account_types.account_type = account_type)\n" +
                      ");\n" +
                // "END IF;\n" +
            "END;"
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure add_account created if it didn't exist");
      }
    });
  
    sql = "CREATE PROCEDURE IF NOT EXISTS `new_transaction_pos`(\n" +
           "IN  accountNumber INT, \n" +
           "IN  amount INT, \n" +
           "IN  memo VARCHAR(255)\n" +
        ")\n" +
        "BEGIN\n" +
            "IF memo = NULL THEN\n" +
                "INSERT INTO transactions (account_num, amount, date_time)\n" +
                "VALUES (accountNumber, amount, (select current_timestamp()));\n" +
                "Update account_nums\n" +
                "set balance = account_nums.balance + amount where account_num = accountNumber0;\n" +
            "ELSE\n" +
                "INSERT INTO transactions (account_num, amount, date_time, memo)\n" +
                "VALUES (accountNumber, amount, (select current_timestamp()), memo);\n" +
                "update account_nums\n" +
                "set balance = account_nums.balance + amount where account_num = accountNumber;\n" +
            "END IF;\n" +
        "END;"
        con.query(sql, function(err, results, fields) {
        if (err) {
        console.log(err.message);
        throw err;
        } else {
        console.log("database.js: procedure new_transaction_pos created if it didn't exist");
        }
        });
    
    sql = "CREATE PROCEDURE IF NOT EXISTS `new_transaction_neg`(\n" +
               "IN  accountNumber INT, \n" +
               "IN  amount INT, \n" +
               "IN  memo VARCHAR(255)\n" +
            ")\n" +
            "BEGIN\n" +
                "IF memo = NULL THEN\n" +
                    "INSERT INTO transactions (account_num, amount, date_time)\n" +
                    "VALUES (accountNumber, concat('-',amount), (select current_timestamp()));\n" +
                    "update account_nums\n" +
                    "set balance = account_nums.balance - amount where account_num = accountNumber;\n" +
                "ELSE\n" +
                    "INSERT INTO transactions (account_num, amount, date_time, memo)\n" +
                    "VALUES (accountNumber, concat('-',amount), (select current_timestamp()), memo);\n" +
                    "update account_nums\n" +
                    "set balance = account_nums.balance - amount where account_num = accountNumber;\n" +
                "END IF;\n" +
            "END;"
            con.query(sql, function(err, results, fields) {
            if (err) {
            console.log(err.message);
            throw err;
            } else {
            console.log("database.js: procedure new_transaction_neg created if it didn't exist");
            }
        });
  
    sql = "CREATE PROCEDURE IF NOT EXISTS `get_salt`(\n" +
              "IN username VARCHAR(255)\n" +
          ")\n" +
          "BEGIN\n" +
              "SELECT salt FROM users\n" +
              "WHERE users.username = username\n" +
              "LIMIT 1;\n" +
          "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_salt created if it didn't exist");
      }
    });
  
    sql = "CREATE PROCEDURE IF NOT EXISTS `check_credentials`(\n" +
              "IN username VARCHAR(255),\n" +
              "IN hashed_password VARCHAR(255)\n" +
          ")\n" +
          "BEGIN\n" +
              "SELECT EXISTS(\n" +
                "SELECT * FROM users\n" +
                "WHERE users.username = username AND users.hashed_password = hashed_password\n" +
              ") AS result;\n" +
          "END;";
  
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure check_credentials created if it didn't exist");
      }
    });
  
    
}
  
function addTableData() {
    let sql = "CALL insert_account_type('checking')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'checking' to account_types");
    });

    sql = "CALL insert_account_type('savings')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'savings' to account_types");
    });

    sql = "CALL insert_user_type('regular')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'regular' to user_types");
    });

    sql = "CALL insert_user_type('employee')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'employee' to user_types");
    });
  
    sql = "CALL insert_user_type('admin')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'admin' to user_types");
    });

    sql = "SET @temp = 0;\n" +
          "CALL new_user('admin', '518210a7b7adc34a3aac2d440bb3a2796a07e3bcc918783559528b44ca5ab26a',\n" +
          "'dc1998bcdb6320d', '8011234567', 'John Doe', 'idk Lane Herriman UT 84096', @temp);\n" +
          "Select @temp;";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'admin' to users");
    });

    sql = "CALL change_user_type('admin', 'admin')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Changed 'admin' user to admin user role");
    });

    sql = "SET @temp = 0;\n" +
          "CALL new_user('employee', '518210a7b7adc34a3aac2d440bb3a2796a07e3bcc918783559528b44ca5ab26a',\n" +
          "'dc1998bcdb6320d', '8011234567', 'Jane Doe', 'idk Lane Herriman UT 84096', @temp);\n" +
          "Select @temp;";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'employee' to users");
    });

    sql = "CALL change_user_type('employee', 'employee')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Changed 'employee' user to employee user role");
    });

    sql = "SET @temp = 0;\n" +
          "CALL new_user('member', '518210a7b7adc34a3aac2d440bb3a2796a07e3bcc918783559528b44ca5ab26a',\n" +
          "'dc1998bcdb6320d', '8011234567', 'Jack Doe', 'idk Lane Herriman UT 84096', @temp);\n" +
          "Select @temp;";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'member' to users");
    });

    sql = "CALL add_account('member', 0, 'savings');";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added savings to account_nums for 'member'");
    });

    sql = "CALL add_account('member', 10, 'checking');";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added checking to account_nums for 'member'");
    });

    sql = "CALL new_transaction_neg(10001, 10, 'test with memo');";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: move 10 from checking 'member' with a memo");
    });

    sql = "CALL new_transaction_pos(10000, 10, 'test with memo');";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: move 10 to savings 'member' with a memo");
    });

    sql = "CALL new_transaction_neg(10000, 10, NULL);";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: move 10 from savings 'member' without a memo");
    });

    sql = "CALL new_transaction_pos(10001, 10, NULL);";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: move 10 to checking 'member' without a memo");
    });  


}

module.exports = con;
