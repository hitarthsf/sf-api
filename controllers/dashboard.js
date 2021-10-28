import express from 'express';
import RatingData from '../models/RatingData.js';
import RatingEmployeeData from "../models/RatingEmployeeData.js";
import RatingSkillData from "../models/RatingSkillData.js";
import UserData from '../models/UsersData.js';
import CompanyData from '../models/CompanyData.js'
import _ from "lodash";
export const getData = async (req, res) => {
    const company_id    = req.body.company_id;
    const location_id   = req.body.location_id.split(',');
    const start_date    = new Date(req.body.start_date);
    const end_date      = new Date(req.body.end_date);
    const nps = "";
    // add try catch 
     try {
      // get total counts of rating
      const count_total         = await RatingData.aggregate([
                {
                  $match : {"location_id" : { $in : location_id }, "createdAt": { $gte: new Date( start_date) , $lte: new Date( end_date)} }
                },
                {
                  $count: "rating"
              }]);
      
      // get average of rating
      const average       = await RatingData.aggregate( 
              [
                {
                  $match : {"location_id" : { $in : location_id } , "createdAt": { $gte: new Date( start_date) , $lte: new Date( end_date)} }
                },
                {
                 $group:
                   {
                     _id: "_id",
                      average: { $avg: "$rating" }
                   }
               }
              ]);

      // Calculate NPS 
      // Get Promoters
      const promoters       = await RatingData.aggregate( 
              [
                {
                  $match : {"rating" : {$in : [4,5] },"location_id" : { $in : location_id } , "createdAt": { $gte: new Date( start_date) , $lte: new Date( end_date)} }
                },
                {
                  $count: "rating"
               }
              ]);

      // Get Detractor
      const detractor       = await RatingData.aggregate( 
              [
                {
                  $match : {"rating" : {$in : [1,2,3] },"location_id" : { $in : location_id } , "createdAt": { $gte: new Date( start_date) , $lte: new Date( end_date)} }
                },
                {
                $count: "rating"
               }
              ]);

      if (count_total.length === 0) { res.status(200).json({message:"No data found with above filter"}); } 
         //res.send("count"+promoters.length);
         
      if (promoters.length === 0 )   { const nps = "-1";  }
      if (detractor.length === 0 )   { const nps = "1" ; }
       
      if (detractor.length != 0 && promoters.length != 0 )    
      { 
        const nps = ( promoters[0]['rating'] /  count_total[0]['rating'] ) - ( detractor[0]['rating'] /  count_total[0]['rating'] ) ; 
       
      }

      
      
      const ratings = [{"count":count_total[0]['rating'] , "average" : average[0]['average'] , "nps" : nps}];
      
      res.status(200).json({data:ratings , message : "Success"} );
    } catch (error) {
        res.status(404).json({message : error.message});
    }
    
}


  
// get top location 
export const getLocationRank = async (req, res) => {
    const company_id    = req.body.company_id;
    const start_date    = new Date(req.body.start_date);
    const end_date      = new Date(req.body.end_date);
    const order         = parseInt(req.body.order);

    // add try catch 
    try {
    const location_rank = await RatingData.aggregate( 
      [
        // { 
        //   $unwind: "$location_id"
        // },
        // { 
        //   $sortByCount: "$location_id" 
        // },
        {
                  
          $match : {"company_id": company_id , "createdAt": { $gte: new Date( start_date) , $lte: new Date( end_date)} }
        },
        {
         $group:
             {
               _id: "$location_id",
                count: { $sum:1},
                average: { $avg: "$rating" }
             }
        },
         { $sort : { count : order  , average: order } }

        
      ] 
    );


    if (location_rank.length === 0) { res.status(200).json({message:"No data found with above filter"}); } 
    // get location name 
    const companyData = await CompanyData.findOne({"_id":company_id});
    const responseData =  await Promise.all(
        location_rank.map(async (locationData) => {

            locationData.locationName = '';
            const fetchedLocation = _.find(companyData.location, (location) => {
                return location._id == locationData._id
            });
            if (fetchedLocation) {
                locationData.locationName = fetchedLocation.name;
            }
        }),
      )

      res.status(200).json({data:location_rank , message : "Success"} );
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}

// get ratings diStrubtion+s
export const getRatingsDistribution = async (req, res) => {
    const company_id    = req.body.company_id;
    const location_id   = req.body.location_id.split(',');
    const start_date    = new Date(req.body.start_date);
    const end_date      = new Date(req.body.end_date);
 //res.send(end_date);
 // add try catch 
     try {
      const average_count       = await RatingData.aggregate( 
              [
                {
                  
                  $match : {"location_id" : { $in : location_id } , "createdAt": { $gte: new Date( start_date) , $lte: new Date( end_date)} }
                },
                {
                   $group:
                     {
                       _id: "$rating",
                        count: { $sum:1}
                     }
                }
              ]);

      const total_count       = await RatingData.aggregate( 
              [
              {
                $match: {"location_id" : { $in : location_id }}
              },
               {
                 $group:
                   {
                     _id: "total_count",
                      count: { $sum:1}
                   }
               }
              ]);

      if (average_count.length === 0) { res.status(200).json({message:"No data found with above filter"}); } 
      res.status(200).json({data:average_count , message : "Success"} );
    } catch (error) {
        res.status(404).json({message : error.message});
    }
   
}

// get daily rating ( get ratings date wise)
export const getRatingData = async (req, res) => {
    const company_id    = req.body.company_id;
    const location_id   = req.body.location_id.split(',');
    const start_date    = new Date(req.body.start_date);
    const end_date      = new Date(req.body.end_date);
    const chart_format  = true ; 
 //res.send(end_date);
 // add try catch 
     try {
      const average_count       = await RatingData.aggregate( 
              [
                {
                  
                  $match : {"location_id" : { $in : location_id } , "createdAt": { $gte: new Date( start_date) , $lte: new Date( end_date)} }
                },
                {
                   $group: 
                   { 
                      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt"} }, 
                      count: { $sum: 1 } ,
                      average: { $avg: "$rating" }
                    } ,
                    
                }
              ]);


      if (average_count.length === 0) { res.status(200).json({message:"No data found with above filter"}); } 

      // Convert in chart format 
       if ( chart_format == true)
      {
        const date = [] ;   
        const count = [] ;   
        const average = [] ;   
        average_count.forEach( function(myDoc) { date.push( myDoc._id) ; count.push( myDoc.count) ; average.push( myDoc.average)  } );
        const rating = [{"date":date , "average" : average , "count" : count}] ;
      }
      
      

      res.status(200).json({data:rating , message : "Success"} );
    } catch (error) {
        res.status(404).json({message : error.message});
    }
   
}


// Get Latest Reviews 
export const latestReview = async (req, res) => {
    const company_id    = req.body.company_id;
    const location_id   = req.body.location_id.split(',');
    const start_date    = new Date(req.body.start_date);
    const end_date      = new Date(req.body.end_date);
 //res.send(end_date);
 // add try catch 
     try {
      const reviews     = await RatingData.aggregate( 
              [
                {
                  $match : {"location_id" : { $in : location_id } , "createdAt": { $gte: new Date( start_date) , $lte: new Date( end_date)} }
                },
                { 
                  $sort : { createdAt : -1 } 
                },
                {
                  $limit : 3 
                },
                { 
                  $project: { "location_id": 1, "feedback": 1 , "createdAt" : 1 , "rating" : 1  } 
                }
              ]);

      if (reviews.length === 0) { res.status(200).json({message:"No data found with above filter"}); } 
      res.status(200).json({data:reviews , message : "Success"} );
    } catch (error) {
        res.status(404).json({message : error.message});
    }

}


// Get Skill Rank 

export const getSkillRank = async (req, res) => {
    const company_id    = req.body.company_id;
    const location_id   = req.body.location_id.split(',');
    const start_date    = new Date(req.body.start_date);
    const end_date      = new Date(req.body.end_date);
    const order         = parseInt(req.body.order);
    const rating_id     = [] ;
 
   
    // add try catch 
    try {

      // Get Ratings Id From 
      const rating       = await RatingData.aggregate( 
              [
                {
                  $match : {"location_id" : { $in : location_id } , "createdAt": { $gte: new Date( start_date) , $lte: new Date( end_date)} }
                },
                { 
                  $project: { "_id": 1 } 
                }
              ]);

    // Create an array of ratings id needed 
    rating.forEach( function(myDoc) { rating_id.push( myDoc._id)  } );
    
    // Get count of skills from the ratings id 
      //res.send(rating_id);
      // NEED TO USE rating_id INSTEAD OF THE ARRAY IN LINE 246
      const skill_rank =  await RatingSkillData.aggregate( 
        [
          {
            $match : { "rating_id" : { $in :[
                                                "615d0d3d899c998639f1fd8e",
                                                "616d5e737394a438fc3af263",
                                                "616e75b80a66fc23a0fb6cbf",
                                                "61712aaba1e73a0bc465bef1",
                                                "61712f3fbd80793ac46db2d4",
                                                "61713e743fd1093ed842bf48",
                                                "6171429fda827a3168f7f366",
                                                "61715a5c339deb35348e6ff0"
                                            ]
                                      } 
                      }
          },
          {
           $group:
               {
                 _id: "$skill_id",
                  count: { $sum:1}
               }
          },
          { $sort : { count : order  }  }

          
        ] 
      );
      res.status(200).json({data:skill_rank , message : "Success"} ); 
  
      } catch (error) {
        res.status(404).json({message : error.message});
    }

}

// Get Employee Rank 

export const getEmployeeRank = async (req, res) => {
    const company_id    = req.body.company_id;
    const location_id   = req.body.location_id.split(',');
    const start_date    = new Date(req.body.start_date);
    const end_date      = new Date(req.body.end_date);
    const order         = parseInt(req.body.order);
    const rating_id     = [] ;
 
   
    // add try catch 
    try {

      // Get Ratings Id From 
      const rating       = await RatingData.aggregate( 
              [
                {
                  $match : {"location_id" : { $in : location_id } , "createdAt": { $gte: new Date( start_date) , $lte: new Date( end_date)} }
                },
                { 
                  $project: { "_id": 1 } 
                }
              ]);

    // Create an array of ratings id needed 
    rating.forEach( function(myDoc) { rating_id.push( myDoc._id)  } );
    
    // Get count of skills from the ratings id 
     // res.send(rating_id);
      // NEED TO USE rating_id INSTEAD OF THE ARRAY IN LINE 246
      const employee_rank =  await RatingEmployeeData.aggregate( 
        [
          {
            $match : { "rating_id" : { $in :[
    "615d0d3d899c998639f1fd8e",
    "616d5e737394a438fc3af263",
    "616e75b80a66fc23a0fb6cbf",
    "61712aaba1e73a0bc465bef1",
    "61712f3fbd80793ac46db2d4",
    "61713e743fd1093ed842bf48",
    "6171429fda827a3168f7f366",
    "61715a5c339deb35348e6ff0",
    "617284d82a9ab91264516a3b",
    "617647fd050f21044824044d",
    "6176481b050f210448240453",
    "6176485f1781d7045b191338",
    "61764ab1e56b8b04932d6a3a",
    "61764ac3a549c80498772234",
    "61764ae083f2e8049d946435",
    "6176580a0c205d05713e361a",
    "6176583d0c205d05713e3625",
    "617658d0d5d6e9057888d69a",
    "617658f7723299058e6910c3",
    "617659187665f905938bfd6e"
]} }
          },
          {
           $group:
               {
                 _id: "$employee_id",
                  count: { $sum:1},
                  average: { $avg: "$rating" }
               }
          },
         
          { $sort : { count : order , average: order } }

          
        ] 
      );
      const responseData =  await Promise.all(
        employee_rank.map(async (employee) => {
          employee.employeeName = '';
            const fetchedEmployee = await UserData.findOne({"_id":employee._id});
            if (fetchedEmployee) {
                employee.employeeName = fetchedEmployee.name;
            }
            return employee;
        }),
      )
      res.status(200).json({data:responseData , message : "Success"} ); 
  
      } catch (error) {
        res.status(404).json({message : error.message});
    }

}
