import express from 'express';
import RatingData from '../models/RatingData.js';
import RatingEmployeeData from "../models/RatingEmployeeData.js";
import RatingSkillData from "../models/RatingSkillData.js";


export const getData = async (req, res) => {
    const company_id    = "61482f56b882280b65acce89";//req.query.company_id;
    const location_id   = req.query.location_id;

    const count         = await RatingData.aggregate([{
              $count: "rating"
            }]);
    
    const average       = await RatingData.aggregate( 
            [
             {
               $group:
                 {
                   _id: "_id",
                    average: { $avg: "$rating" }
                 }
             }
            ]);

     const top_location = await RatingData.aggregate( 
      [
        // { 
        //   $unwind: "$location_id"
        // },
        // { 
        //   $sortByCount: "$location_id" 
        // },
        {
            $match: {company_id: company_id}
        },
        {
          $lookup: {
              from: 'companies',
              localField: 'comapny_id',
              foreignField: 'id',
              "as": "company_name"
          }
        },
        
        { $project: { company_name: {name: 1} } }
        
      ] 
    );

    const ratings = [{"count":count[0]['rating'] , "average" : average[0]['average'] }];
   
    res.status(200).json(top_location);
}
