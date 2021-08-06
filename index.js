import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import companyRoutes from './routes/company.js';
import locationRoutes from './routes/location.js';
import usersRoutes from './routes/users.js';
import categoryRoutes from './routes/category.js';
import skillRoutes from './routes/skill.js';
import mysql from 'mysql2';


const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true}));
app.use(cors());

app.use('/company',companyRoutes);
app.use('/location',locationRoutes);
app.use('/users',usersRoutes);
app.use('/category',categoryRoutes);
app.use('/skill',skillRoutes);
//const CONNECTION_URL = 'mongodb+srv://muskan:1ASVCr7yBZQUKzh4@ratings-dev.knldc.mongodb.net/ratings?authSource=admin&replicaSet=atlas-11l9kt-shard-0&readPreference=primary&appname=MongoDB%20Compass%20Isolated%20Edition%20Beta&ssl=true';
const CONNECTION_URL = 'mongodb+srv://free_user:Servefirst2021@cluster0.gdowm.mongodb.net/ratings?retryWrites=true&w=majority';
const PORT = process.env.PORT || 5000;

app.get("/", async (req, res,next) => {
      res.send({ success: true, message: 'Welcomw to SFratings Backend.'})
});

mongoose.connect(CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true})
      .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
      .catch((error) => console.log(error.message));

mongoose.set('useFindAndModify', false);   


// mongoose.connect("mongodb+srv://free_user:Servefirst2021@cluster0.gdowm.mongodb.net/ratings?retryWrites=true&w=majority", function (error, db) {
//     if (error) throw error;
//     var Mysql_Connection = mysql.createConnection({
//       host: '192.168.64.2',
//       user: 'hitarth',
//       password: 'password',
//       database: 'ratings_live'
//   });
//     Mysql_Connection.connect();
//     var jobs = 0;
//     getTABLESfromSQL(Mysql_Connection, function(error, tables) {
//         tables.forEach(function(table) {
//             var collection = db.collection(table);

//             ++jobs;
//             CollectionTable(Mysql_Connection, table, collection, function(error) {
//                 if (error) throw error;
//                 --jobs;
//             });
//         })
//         console.log("jobs " +jobs);

            
//     });
//     var interval = setInterval(function() {
//         if(jobs<=0) {
//             clearInterval(interval);
//             db.close();
//             Mysql_Connection.end();
//         }
//     }, 300);
// });


// function getTABLESfromSQL(Mysql_Connectionnection, callback) {

//     Mysql_Connectionnection.query("show full tables where Table_Type = 'BASE TABLE';", function(error, results, fields) {

//         if (error) {
//             console.log("test "+error);
//             callback(error);
//         } else {
            

//             var tables = [];

//             results.forEach(function (row) {
                  
//                 for (var key in row) {
//                     if (row.hasOwnProperty(key)) {
//                         if(key.startsWith('Tables_in')) {
//                             tables.push(row[key]);
//                         }
//                     }
//                 }
//             });
//             callback(null, tables);
//         }
//     });
// }

// function CollectionTable(Mysql_Connectionnection, location_area, mongoCollection, callback) {
//     var sql = 'SELECT * FROM ' + location_area + ';';
//     Mysql_Connectionnection.query(sql, function (error, results, fields) {
//         if (error) {
//             callback(error);
//         } else {
//             if (results.length > 0) {
//                 mongoCollection.insertMany(results, {}, function (error) {
//                     if (error) {
//                         callback(error);
//                     } else {
//                         callback(null);
//                     }
//                 });
//             } else {
//                 callback(null);
//             }
//         }
//     });
// }