var mysql = require('mysql2');
var mongoose = require('mongoose');

function getTABLESfromSQL(Mysql_Connectionnection, callback) {
    Mysql_Connectionnection.query("show full tables where Table_Type = 'location_area';", function(error, results, fields) {
        if (error) {
            callback(error);
        } else {
            var tables = [];
            results.forEach(function (row) {
                for (var key in row) {
                    if (row.hasOwnProperty(key)) {
                        if(key.startsWith('Tables_in')) {
                            tables.push(row[key]);
                        }
                    }
                }
            });
            callback(null, tables);
        }
    });
}

function CollectionTable(Mysql_Connectionnection, location_area, mongoCollection, callback) {
    var sql = 'SELECT * FROM ' + location_area + ';';
    Mysql_Connectionnection.query(sql, function (error, results, fields) {
        if (error) {
            callback(error);
        } else {
            if (results.length > 0) {
                mongoCollection.insertMany(results, {}, function (error) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null);
                    }
                });
            } else {
                callback(null);
            }
        }
    });
}

mongoose.connect("mongodb+srv://free_user:Servefirst2021@cluster0.gdowm.mongodb.net/ratings?retryWrites=true&w=majority", function (error, db) {
    if (error) throw error;
    var Mysql_Connection = mysql.createConnection({
      host: '192.168.64.2',
      user: 'hitarth',
      password: 'password',
      database: 'ratings_live'
  });
    Mysql_Connection.connect();
    var jobs = 0;
    getTABLESfromSQL(Mysql_Connection, function(error, tables) {
        tables.forEach(function(table) {
            var collection = db.collection(table);
            ++jobs;
            CollectionTable(Mysql_Connection, table, collection, function(error) {
                if (error) throw error;
                --jobs;
            });
        })
    });
    var interval = setInterval(function() {
        if(jobs<=0) {
            clearInterval(interval);
            db.close();
            Mysql_Connection.end();
        }
    }, 300);
});