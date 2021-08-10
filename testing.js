function CollectionTable(Mysql_Connectionnection, location_area, mongoCollection, callback) {
    var sql = 'SELECT * FROM ' + location_area + ';';
     // let db = mongoose.connection.db;
     // db.collection('location_area').rename('companies');
      
    Mysql_Connectionnection.query(sql, function (error, results, fields) {
        if (error) {
            callback(error);
        } else {
            if (results.length > 0) {
                 // Mysql_Connectionnection.connection.collection("location_area").rename("companies");
                  var area_id = [] ; 
                  // foreach loop for location
                  results.forEach( area => area_id = area.id  );
                  var sql = 'SELECT * FROM  location;';
                  console.log(area_id);

                mongoCollection.insertMany(results, {}, function (error,area,area_fields) {
                  console.log(results[0].id);
                  console.log("kk");
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
    mongoose.connection.collection("location_area").rename("companies");
}