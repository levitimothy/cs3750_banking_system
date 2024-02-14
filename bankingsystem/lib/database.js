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
    
    con.query("CREATE DATABASE IF NOT EXISTS color_survey", function (err, result) {
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: color_survey database created if it didn't exist");
      selectDatabase();
    });
  }
});

function selectDatabase() {
    let sql = "USE color_survey";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: Selected color_survey database");
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
                "email VARCHAR(255) NOT NULL,\n" +
                "gender VARCHAR(255) NOT NULL,\n" +
                "education VARCHAR(255) NOT NULL,\n" +
                "user_role_id INT NOT NULL,\n" +
                "PRIMARY KEY (user_id),\n" +
                "FOREIGN KEY (user_role_id) REFERENCES user_types(user_type_id)\n" +
                ")";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table users created if it didn't exist");
      }
    });

    
    
    sql = "CREATE TABLE IF NOT EXISTS timing_types (\n" +
                "timing_type_id INT NOT NULL AUTO_INCREMENT, \n" +
                "timing_type VARCHAR(25) NOT NULL,\n" +
                "PRIMARY KEY (timing_type_id)\n" +
              ");";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table timing_types created if it didn't exist");
      }
    });

    
  
    sql = "CREATE TABLE IF NOT EXISTS timings (\n" +
                "timing_id INT NOT NULL AUTO_INCREMENT,\n" +
                "user_id INT NOT NULL,\n" +
                "timing INT NOT NULL,\n" +
                "timing_type_id INT NOT NULL,\n" +
                "PRIMARY KEY (timing_id),\n" +
                "FOREIGN KEY (user_id) REFERENCES users(user_id),\n" +
                "FOREIGN KEY (timing_type_id) REFERENCES timing_types(timing_type_id)\n" +
              ")";
    con.execute(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table timings created if it didn't exist");
      }
    }); 
}
  
function createStoredProcedures() {

    let sql = "CREATE PROCEDURE IF NOT EXISTS `insert_timing_type`(\n" +
                      "IN timing_type VARCHAR(45)\n" +
                  ")\n" +
                  "BEGIN\n" +
                  "INSERT INTO timing_types (timing_type)\n" +
                  "SELECT timing_type FROM DUAL\n" +
                  "WHERE NOT EXISTS (\n" +
                    "SELECT * FROM timing_types\n" +
                    "WHERE timing_types.timing_type=timing_type LIMIT 1\n" +
                  ");\n" +
              "END;";
    
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure insert_timing_type created if it didn't exist");
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
        console.log("database.js: procedure user_timing_type created if it didn't exist");
      }
    });
  
    sql = "CREATE PROCEDURE IF NOT EXISTS `register_user`(\n" +
                  "IN  username VARCHAR(255), \n" +
                  "IN  hashed_password VARCHAR(255), \n" +
                  "IN  salt VARCHAR(255), \n" +
                  "IN  email VARCHAR(255), \n" +
                  "IN  gender VARCHAR(255), \n" +
                  "IN  education VARCHAR(255), \n" +
                  "OUT result INT\n" +
              ")\n" +
              "BEGIN\n" +
                  "DECLARE nCount INT DEFAULT 0;\n" +
                  "SET result = 0;\n" +
                  "SELECT Count(*) INTO nCount FROM users WHERE users.username = username;\n" +
                  "IF nCount = 0 THEN\n" +
                      "INSERT INTO users (username, hashed_password, salt, email, gender, education, user_role_id)\n" +
                      "VALUES (username, hashed_password, salt, email, gender, education, \n" +
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
        console.log("database.js: procedure register_user created if it didn't exist");
      }
    });
    
    sql = "CREATE PROCEDURE IF NOT EXISTS `change_user_type`(\n" +
              "IN  username VARCHAR(255)\n" +
          ")\n" +
          "BEGIN\n" +
              "UPDATE users\n" +
              "SET user_role_id = (SELECT user_type_id FROM user_types WHERE user_types.user_type = 'admin')\n" +
              "WHERE users.username = username;\n" +
          "END;"
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure change_user created if it didn't exist");
      }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `add_timing`(\n" +
              "IN  username VARCHAR(255), \n" +
              "IN  timing INT,\n" +
              "IN  timing_type VARCHAR(45)\n" +
          ")\n" +
          "BEGIN\n" +
              "INSERT INTO timings (user_id, timing, timing_type_id)\n" +
              "VALUES ((SELECT user_id FROM users WHERE users.username = username),\n" + 
              "timing,\n" + 
              "(SELECT timing_type_id FROM timing_types WHERE timing_types.timing_type = timing_type)\n" +
              ");\n" +
          "END;"
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure add_timing created if it didn't exist");
      }
    });
  
    sql = "CREATE PROCEDURE IF NOT EXISTS `get_top_ten_times`(\n" +
              "IN timing_type VARCHAR(45),\n" +
              "IN education VARCHAR(255)\n" +
          ")\n" +
          "BEGIN\n" +
            "IF education = NULL THEN\n" +
              "SELECT users.username, timings.timing, timing_types.timing_type\n" +
              "FROM users\n" +
              "INNER JOIN timings ON users.user_id=timings.user_id\n" +
              "INNER JOIN timing_types ON timings.timing_type_id=timing_types.timing_type_id\n" +
              "WHERE timing_types.timing_type = timing_type\n" +
              "ORDER BY timings.timing ASC\n" +
              "LIMIT 10;\n" +
            "ELSE\n" +
              "SELECT users.username, timings.timing, timing_types.timing_type\n" +
              "FROM users\n" +
              "INNER JOIN timings ON users.user_id=timings.user_id\n" +
              "INNER JOIN timing_types ON timings.timing_type_id=timing_types.timing_type_id\n" +
              "WHERE timing_types.timing_type = timing_type\n" +
              "AND users.education = education\n" +
              "ORDER BY timings.timing ASC\n" +
              "LIMIT 10;\n" +
            "END IF;\n" +
          "END;";
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure get_top_ten_times created if it didn't exist");
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
  
    // Found this here: https://sebhastian.com/mysql-median/
    sql = "CREATE PROCEDURE IF NOT EXISTS `get_median_timing`(\n" +
              "IN timing_type VARCHAR(45),\n" +
              "IN education VARCHAR(255)\n" +
          ")\n" +
          "BEGIN\n" +
            "IF education = NULL THEN\n" +
              "SET @row_index := -1;\n" +
              "SELECT AVG(subq.timing) as median_value\n" +
              "FROM (\n" +
                  "SELECT @row_index:=@row_index + 1 AS row_index, timings.timing, timing_types.timing_type\n" +
                  "FROM timings\n" +
                  "INNER JOIN timing_types ON timings.timing_type_id=timing_types.timing_type_id\n" +
                  "WHERE timing_types.timing_type = timing_type\n" +
                  "ORDER BY timings.timing\n" +
              ") AS subq\n" +
              "WHERE subq.row_index\n" +
              "IN (FLOOR(@row_index / 2) , CEIL(@row_index / 2));\n" +
            "ELSE\n" +
              "SET @row_index := -1;\n" +
              "SELECT AVG(subq.timing) as median_value\n" +
              "FROM (\n" +
                  "SELECT @row_index:=@row_index + 1 AS row_index, timings.timing, timing_types.timing_type\n" +
                  "FROM timings\n" +
                  "INNER JOIN users ON users.user_id=timings.user_id\n" +
                  "INNER JOIN timing_types ON timings.timing_type_id=timing_types.timing_type_id\n" +
                  "WHERE timing_types.timing_type = timing_type\n" +
                  "AND users.education = education\n" +
                  "ORDER BY timings.timing\n" +
              ") AS subq\n" +
              "WHERE subq.row_index\n" +
              "IN (FLOOR(@row_index / 2) , CEIL(@row_index / 2));\n" +
            "END IF;\n" +
          "END;"
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: get_median_timing created if it didn't exist");
      }
    });
}
  
function addTableData() {
    let sql = "CALL insert_timing_type('saywordtext')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'saywordtext' to timing_types");
    });
  
    sql = "CALL insert_timing_type('sayfontcolor')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'sayfontcolor' to timing_types");
    });

    sql = "CALL insert_user_type('regular')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'regular' to user_types");
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
          "CALL register_user('admin', '518210a7b7adc34a3aac2d440bb3a2796a07e3bcc918783559528b44ca5ab26a',\n" +
          "'dc1998bcdb6320d', 'admin@admin.com', 'Male', 'Finished College', @temp);\n" +
          "Select @temp;";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Added 'admin' to users");
    });

    sql = "CALL change_user_type('admin')";
    con.query(sql, function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: Changed 'admin' user to admin user role");
    });
  
}

module.exports = con;
