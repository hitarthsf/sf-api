import express from 'express';
import RatingData from '../models/RatingData.js';
import RatingEmployeeData from "../models/RatingEmployeeData.js";
import RatingSkillData from "../models/RatingSkillData.js";
import UserData from '../models/UsersData.js';
import CompanyData from '../models/CompanyData.js'
import CompanyMigratedData from '../models/CompanyMigratedData.js'
import RatingMigratedData from '../models/RatingMigratedData.js';
import RatingMigratedEmployeeData from "../models/RatingMigratedEmployeeData.js";
import RatingMigratedSkillData from "../models/RatingMigratedSkillData.js";
import UserMigratedData from "../models/UserMigratedData.js";
import UserLoginData from "../models/UserLoginData.js";
import _ from "lodash";
import moment from "moment";

export const getData = async (req, res) => {
    const company_id = req.body.company_id;
    const location_id = req.body.location_id.split(',');
    const start_date = new Date(req.body.start_date);
    const end_date = new Date(req.body.end_date);
    const nps = "";
    // add try catch
    try {
        // get total counts of rating
        if (location_id[0] === "") {
            const fetchedLocations = await CompanyData.findOne({"_id": company_id}, {location: 1});
            const userLocationId = [];
            if (fetchedLocations)
            {
                if (fetchedLocations.location !== undefined && fetchedLocations.location) {
                fetchedLocations.location.map((location) => {
                    userLocationId.push(location._id.toString());
                });
                }    
            }
            


            var count_total = await RatingData.aggregate([
                {
                    $match: {
                        "location_id": {$in: userLocationId},
                        "createdAt": {$gte: new Date(start_date), $lte: new Date(end_date)}
                    }
                },
                {
                    $count: "rating"
                }]);
            var average = await RatingData.aggregate(
                [
                    {
                        $match: {
                            "location_id": {$in: userLocationId},
                            "createdAt": {$gte: new Date(start_date), $lte: new Date(end_date)}
                        }
                    },
                    {
                        $group:
                            {
                                _id: "_id",
                                average: {$avg: "$rating"}
                            }
                    }
                ]);

        } else {
            var count_total = await RatingData.aggregate([
                {
                    $match: {
                        "location_id": {$in: location_id},
                        "createdAt": {$gte: new Date(start_date), $lte: new Date(end_date)}
                    }
                },
                {
                    $count: "rating"
                }]);

            var average = await RatingData.aggregate(
                [
                    {
                        $match: {
                            "location_id": {$in: location_id},
                            "createdAt": {$gte: new Date(start_date), $lte: new Date(end_date)}
                        }
                    },
                    {
                        $group:
                            {
                                _id: "_id",
                                average: {$avg: "$rating"}
                            }
                    }
                ]);
        }


        // Calculate NPS
        // Get Promoters
        const promoters = await RatingData.aggregate(
            [
                {
                    $match: {
                        "rating": {$in: [4, 5]},
                        "location_id": {$in: location_id},
                        "createdAt": {$gte: new Date(start_date), $lte: new Date(end_date)}
                    }
                },
                {
                    $count: "rating"
                }
            ]);

        // Get Detractor
        const detractor = await RatingData.aggregate(
            [
                {
                    $match: {
                        "rating": {$in: [1, 2, 3]},
                        "location_id": {$in: location_id},
                        "createdAt": {$gte: new Date(start_date), $lte: new Date(end_date)}
                    }
                },
                {
                    $count: "rating"
                }
            ]);

        if (count_total.length === 0) {
            const ratings = [{"count": "0", "average": "0", "nps": "0"}];
            res.status(200).json({data: ratings, message: "Success"});
        }
        //res.send("count"+promoters.length);

        if (promoters.length === 0) {
            const nps = "-1";
        }
        if (detractor.length === 0) {
            const nps = "1";
        }

        if (detractor.length != 0 && promoters.length != 0) {
            const nps = (promoters[0]['rating'] / count_total[0]['rating']) - (detractor[0]['rating'] / count_total[0]['rating']);

        }


        const ratings = [{"count": count_total[0]['rating'], "average": average[0]['average'], "nps": nps}];

        res.status(200).json({data: ratings, message: "Success"});
    } catch (error) {
        res.status(404).json({message: error.message});
    }

}


// get top location
export const getLocationRank = async (req, res) => {
    const company_id = req.body.company_id;
    const location_id = req.body.location_id.split(",");
    const start_date = new Date(req.body.start_date);
    const end_date = new Date(req.body.end_date);
    const order = parseInt(req.body.order);
    const limit = parseInt(req.body.limit);
    if (!req.body.limit)
    {
         limit = 10 ;
    }

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

                    $match: {
                        "company_id": company_id,
                        "location_id" : {$in : location_id },   
                        "createdAt": {$gte: new Date(start_date), $lte: new Date(end_date)}
                    }
                },
                {
                    $group:
                        {
                            _id: "$location_id",
                            count: {$sum: 1},
                            average: {$avg: "$rating"}
                        }
                },
                {$sort: {count: order, average: order}},
                {$limit: limit}


            ]
        );


        if (location_rank.length === 0) {
            res.status(200).json({data: location_rank, message: "No data on this filter"});
        }
        // get location name
        const companyData = await CompanyData.findOne({"_id": company_id});
        if (!companyData)
        {
            res.status(200).json({data: location_rank, message: "Invalid Company Id "});
        } 
        const responseData = await Promise.all(
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

        res.status(200).json({data: location_rank, message: "Success"});
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

// get ratings diStrubtion+s
export const getRatingsDistribution = async (req, res) => {
    const company_id = req.body.company_id;
    const location_id = req.body.location_id.split(',');
    const start_date = new Date(req.body.start_date);
    const end_date = new Date(req.body.end_date);
    //res.send(end_date);
    // add try catch
    try {
        if (location_id[0] === "") {
            var average_count = await RatingData.aggregate(
                [
                    {

                        $match: {"createdAt": {$gte: new Date(start_date), $lte: new Date(end_date)}}
                    },
                    {
                        $group:
                            {
                                _id: "$rating",
                                count: {$sum: 1}
                            }
                    },
                    {
                        $sort : {"_id" : 1}
                    }
                ]);
        } else {
            var average_count = await RatingData.aggregate(
                [
                    {

                        $match: {
                            "location_id": {$in: location_id},
                            "createdAt": {$gte: new Date(start_date), $lte: new Date(end_date)}
                        }
                    },
                    {
                        $group:
                            {
                                _id: "$rating",
                                count: {$sum: 1}
                            }
                    },
                    {
                        $sort : {"_id" : 1}
                    }
                ]);
        }


        const total_count = await RatingData.aggregate(
            [
                {
                    $match: {"location_id": {$in: location_id}}
                },
                {
                    $group:
                        {
                            _id: "total_count",
                            count: {$sum: 1}
                        }

                }
                ,
                {
                    $sort : {"_id" : -1}
                }

            ]);
         var distribution    = [] ; 
        var countDistribution           = [] ; 
        var percentage      = [] ;
        if (average_count.length === 0) {
            const ratings = [{"distribution": distribution, "countDistribution":countDistribution}];
            res.status(200).json({data: ratings ,message: "No data found with above filter"});
        }
        //res.send(average_count[0]["_id"]);
       
        
        for (let i = 0; i < 5; i++) {
            
            if (!average_count[i] ) 
            {
                
                distribution.push(i+1);
                countDistribution.push(0);    
            }
            else
            {
              
                distribution.push(average_count[i]["_id"]);
                countDistribution.push(average_count[i]["count"]);      
            }
          

        } 

        
        const ratings = [{"distribution": distribution, "countDistribution": countDistribution}];
        res.status(200).json({data: ratings, message: "Success"});
    } catch (error) {
        res.status(404).json({message: error.message});
    }

}

// get daily rating ( get ratings date wise)
export const getRatingData = async (req, res) => {
    const company_id = req.body.company_id;
    const location_id = req.body.location_id.split(',');
    const startDate = new Date(req.body.start_date);
    const endDate = new Date(req.body.end_date);
    const format = req.body.format;
    const order = parseInt("-1");
    //res.send(end_date);
    // add try catch
    const fetchedLocations = await CompanyData.findOne({"_id": company_id}, {location: 1});
    const userLocationId = [];
    if (fetchedLocations.location !== undefined && fetchedLocations.location) {
        fetchedLocations.location.map((location) => {
            userLocationId.push(location._id.toString());
        });
    }
    try {
        if (location_id[0] === "") {
            var averageCount = await RatingData.aggregate(
                [
                    {
                        $match: {
                            "location_id": {$in: userLocationId},
                            "createdAt": {$gte: new Date(startDate), $lte: new Date(endDate)}
                        }
                    },
                    {
                        $group:
                            {
                                _id: {$dateToString: {format: "%d-%m-%Y", date: "$createdAt"}},
                                count: {$sum: 1},
                                average: {$avg: "$rating"}
                            },

                    },
                    {$sort: {count: order, average: order}}
                ]);
        } else {
            var averageCount = await RatingData.aggregate(
                [
                    {
                        $match: {
                            "location_id": {$in: location_id},
                            "createdAt": {$gte: new Date(startDate), $lte: new Date(endDate)}
                        }
                    },
                    {
                        $group:
                            {
                                _id: {$dateToString: {format: "%d-%m-%Y", date: "$createdAt"}},
                                count: {$sum: 1},
                                average: {$avg: "$rating"}
                            },

                    },
                    {$sort: {count: order, average: order}}
                ]);
        }

        if (averageCount.length === 0) {
            const rating = [{"date": [], "average": [], "count": []}];
            res.status(200).json({data: rating, message: "No Data"});
        }

        // Convert in chart format
        if (format == "chart") {
            const date = [];
            const average = [];
            const count = [];

            const currDate = moment(startDate).startOf('day');
            const lastDate = moment(endDate).startOf('day');

            while (currDate.add(1, 'days').diff(lastDate) < 0) {
                const temporaryDate = currDate.clone().format('DD-MM-YYYY');
                date.push(temporaryDate);
                const matchFound = _.find(averageCount, (myDoc) => {
                    return myDoc._id == temporaryDate;
                });
                if (matchFound) {
                    average.push(matchFound.average);
                    count.push(matchFound.count);
                } else {
                    average.push(0);
                    count.push(0);

                }
            }
            const rating = [{"date": date, "average": average, "count": count}];

            res.status(200).json({data: rating, message: "Success"});
        } else {
            res.status(200).json({data: averageCount, message: "Success"});
        }
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}


// Get Latest Reviews
export const latestReview = async (req, res) => {
    const companyId     = req.body.company_id;
    const start_date    = new Date(req.body.start_date);
    const end_date      = new Date(req.body.end_date);
  

    if (!companyId) {
        res.status(409).json({ message : 'Invalid request, Company Id is missing'});
    }
    // const ratings = await RatingData.find({companyId: companyId}, {
    //     $lookup: {
    //         from: 'rating_skills',
    //         localField: 'rating_id',
    //         foreignField: '_id',
    //         "as": "L"
    //     }
    // })

    const companyData = await CompanyData.findOne({"_id":companyId  });
    
    const ratings = await RatingData.aggregate([
        {
            $match: {company_id: companyId   ,  "createdAt": {$gte: new Date(start_date), $lte: new Date(end_date)}}
        },
        { "$sort": { createdAt : -1} },
        { "$limit": 3 },
        { "$addFields": { "ratingId": { "$toString": "$_id" }}},
        {
            $lookup: {
                from: 'rating_skills',
                localField: 'ratingId',
                foreignField: 'rating_id',
                "as": "rating_skills",

            }
        },
        {
            $lookup: {
                from: 'rating_employees',
                localField: 'ratingId',
                foreignField: 'rating_id',
                "as": "rating_employees"
            }
        },
        
    ]);
    if (!companyData)
        {
            res.status(200).json({data: location_rank, message: "Invalid Company Id "});
        } 
    const responseData =  await Promise.all(
        ratings.map(async (rating) => {
            rating.companyName = companyData.name;
            if (!rating.is_assign)
            {
             rating.is_assign = 0;   
            }
            rating.locationName = '';
            const fetchedLocation = _.find(companyData.location, (location) => {
                return location._id == rating.location_id
            });
            if (fetchedLocation) {
                rating.locationName = fetchedLocation.name;
            }
            rating.skillName = [];
            rating.rating_skills.map(async (ratingSkill) => {
                
                companyData.attributes.map((attribute) => {
                    const matchingObj = _.find(attribute.positive_skills, (skill) => {
                        return skill._id == ratingSkill.skill_id
                    });
                    if (matchingObj) {
                        rating.skillName.push(matchingObj.name) ;
                    }
                    if (ratingSkill.skillName === '') {
                        const matchingObj = _.find(attribute.negative_skills, {_id: ratingSkill.skill_id});
                        if (matchingObj) {
                            rating.skillName.push(matchingObj.name) ;
                        }
                    }
                });
                rating.skillName = rating.skillName.join(",");
                return ratingSkill;
            });
            await Promise.all(
                rating.rating_employees.map(async (ratingEmployee) => {
                    ratingEmployee.employeeDetails = await UserData.findOne({"_id":ratingEmployee.employee_id});
                    rating.EmployeeName = ratingEmployee.employeeDetails.name;
                    return ratingEmployee;
                }),
            );
            return rating;
        }),
    )
    res.status(200).json({"ratings":ratings });

}

// Get Attribute Rank
export const getAttributeRank = async (req, res) => {
    const companyId = req.body.company_id;
    const locationId = req.body.location_id.split(',');
    const startDate = new Date(req.body.start_date);
    const endDate = new Date(req.body.end_date);
    const order = parseInt(req.body.order);
    const format = req.body.format;
    
    const ratingId = [];


    // add try catch
    try {
        const fetchedLocations = await CompanyData.findOne({"_id": companyId}, {location: 1});
        const userLocationId = [];
        if (fetchedLocations)
        {
            if (fetchedLocations.location !== undefined && fetchedLocations.location) {
            fetchedLocations.location.map((location) => {
                userLocationId.push(location._id.toString());
            });
            }    
        }
        

        // Get Ratings Id From
        if (locationId[0] === "") {
            var rating = await RatingData.aggregate(
                [
                    {
                        $match: {
                            "location_id": {$in: userLocationId},
                            "createdAt": {$gte: new Date(startDate), $lte: new Date(endDate)}
                        }
                    },
                    {
                        $project: {"_id": 1}
                    }
                ]);
        } else {

            var rating = await RatingData.aggregate(
                [
                    {
                        $match: {
                            "location_id": {$in: locationId},
                            "createdAt": {$gte: new Date(startDate), $lte: new Date(endDate)}
                        }
                    },
                    {
                        $project: {"_id": 1}
                    }
                ]);

        }


        const ratingIdArray = rating.map(ratingObj => ratingObj._id.toString());
        // Create an array of ratings id needed
        // rating.forEach( function(ratings) { ratings.push( myDoc._id)  } );

        // Get count of skills from the ratings id
        //res.send(ratingIdArray);
        // NEED TO USE rating_id INSTEAD OF THE ARRAY
        var skillRanks = await RatingSkillData.aggregate(
            [
                {
                    $match: {
                        "rating_id": {
                            $in: ratingIdArray
                        }
                    }
                },
                {
                    $group:
                        {
                            _id: "$skill_id",
                            count: {$sum: 1}
                        }
                },
                {$sort: {count: order}}


            ]
        );


        if (format == "chart") {
            var SkillNamePositive = [];
            var SkillNameNegative = [];
            var SkillCount = [];
            var AttributeName = [];
            var AttributeCount = [];

            var companyData = await CompanyData.findOne({"_id": companyId});
            if (!companyData)
            {
                res.status(200).json({data: skillRanks, message: "Invalid Company Id "});
            } 
            
            skillRanks.map((skillObj) => {
                skillObj.name = '';
                
                
                companyData.attributes.forEach((attribute) => {
                    var count = 0 ; 
                    let matchingObj = _.find(attribute.positive_skills, (skill) => {
                        return skill._id == skillObj._id;
                    });
                        
                    if (matchingObj) {
                        count = count +skillObj.count;
                    } else {
                        matchingObj = _.find(attribute.negative_skills, (skill) => {
                            return skill._id == skillObj._id;
                        });

                        if (matchingObj) {

                            count = count + skillObj.count;
                        }
                    }
                    if ( count > 0 )
                    {   
                        if (AttributeName.includes(attribute.name) )
                        {
                         
                            var index = AttributeName.findIndex(AttributeName => AttributeName === attribute.name);
                            AttributeCount[index] =  AttributeCount[index] + count ;
                        }
                        else
                        {
                            AttributeCount.push(count);
                            AttributeName.push(attribute.name);         
                        }
                        
                    }
                   
                });

            })
            
            var data = [{"AttributeName": [], "AttributeCount": []}];
            
            var data = [{"AttributeName": AttributeName, "AttributeCount": AttributeCount}];
            
            


            res.status(200).json({data: data, message: "Success"});
        } else {
            skillRanks.map((skillObj) => {
                skillObj.name = '';
                companyData.attributes.forEach((attribute) => {
                    let matchingObj = _.find(attribute.positive_skills, (skill) => {
                        return skill._id == skillObj._id;
                    });
                    if (matchingObj) {
                        skillObj.name = matchingObj.name;
                    } else {
                        matchingObj = _.find(attribute.negative_skills, (skill) => {
                            return skill._id == skillObj._id;
                        });
                        if (matchingObj) {
                            skillObj.name = matchingObj.name;
                        }
                    }
                });
            })
        }

        res.status(200).json({data: skillRanks, message: "Success"});

    } catch (error) {
        res.status(404).json({message: error.message});
    }
}


// Get Skill Rank

export const getSkillRank = async (req, res) => {
    const companyId = req.body.company_id;
    const locationId = req.body.location_id.split(',');
    const startDate = new Date(req.body.start_date);
    const endDate = new Date(req.body.end_date);
    const order = parseInt(req.body.order);
    const format = req.body.format;
    const type = req.body.type.toString();
    const ratingId = [];


    // add try catch
    try {
        const fetchedLocations = await CompanyData.findOne({"_id": companyId}, {location: 1});

        const userLocationId = [];
        if (fetchedLocations)
        {
            if (fetchedLocations.location !== undefined && fetchedLocations.location) {
            fetchedLocations.location.map((location) => {
                userLocationId.push(location._id.toString());
            });
            }    
        }

        // Get Ratings Id From
        if (locationId[0] === "") {
            var rating = await RatingData.aggregate(
                [
                    {
                        $match: {
                            "location_id": {$in: userLocationId},
                            "createdAt": {$gte: new Date(startDate), $lte: new Date(endDate)}
                        }
                    },
                    {
                        $project: {"_id": 1}
                    }
                ]);
        } else {

            var rating = await RatingData.aggregate(
                [
                    {
                        $match: {
                            "location_id": {$in: locationId},
                            "createdAt": {$gte: new Date(startDate), $lte: new Date(endDate)}
                        }
                    },
                    {
                        $project: {"_id": 1}
                    }
                ]);

        }


        const ratingIdArray = rating.map(ratingObj => ratingObj._id.toString());
        // Create an array of ratings id needed
        // rating.forEach( function(ratings) { ratings.push( myDoc._id)  } );

        // Get count of skills from the ratings id
        //res.send(ratingIdArray);
        // NEED TO USE rating_id INSTEAD OF THE ARRAY
        var skillRanks = await RatingSkillData.aggregate(
            [
                {
                    $match: {
                        "rating_id": {
                            $in: ratingIdArray
                        }
                    }
                },
                {
                    $group:
                        {
                            _id: "$skill_id",
                            count: {$sum: 1}
                        }
                },
                {$sort: {count: order}}


            ]
        );

        if (format == "chart") {
            var SkillNamePositive = [];
            var SkillNameNegative = [];
            var SkillCountNegative = [];
            var SkillCountPositive = [];
            var data = [{"SkillName": [], "SkillCount": []}];
            const companyData = await CompanyData.findOne({"_id": companyId});
            if (!companyData)
            {
                res.status(200).json({data: data, message: "Invalid Company Id "});
            } 
            skillRanks.map((skillObj) => {
                skillObj.name = '';
                skillObj.type = '';
                companyData.attributes.forEach((attribute) => {
                    let matchingObj = _.find(attribute.positive_skills, (skill) => {
                        return skill._id == skillObj._id;
                    });
                    if (matchingObj) {
                        skillObj.name = matchingObj.name;
                        skillObj.type = "positive";
                        SkillNamePositive.push(matchingObj.name);
                        SkillCountPositive.push(skillObj.count);
                    } else {
                        matchingObj = _.find(attribute.negative_skills, (skill) => {
                            return skill._id == skillObj._id;
                        });
                        if (matchingObj) {
                            skillObj.name = matchingObj.name;
                            skillObj.type = "negative";
                            SkillNameNegative.push(matchingObj.name);
                            SkillCountNegative.push(skillObj.count);
                        }
                    }
                });
            })
            
            if (type == "positive" && SkillNamePositive.length > 0) {
                var data = [{"SkillName": SkillNamePositive, "SkillCount": SkillCountPositive}];
            }
            if (type == "negative" && SkillNameNegative.length > 0) {
                var data = [{"SkillName": SkillNameNegative, "SkillCount": SkillCountNegative}];
            }


            res.status(200).json({data: data, message: "Success"});
        } else {
            skillRanks.map((skillObj) => {
                skillObj.name = '';
                companyData.attributes.forEach((attribute) => {
                    let matchingObj = _.find(attribute.positive_skills, (skill) => {
                        return skill._id == skillObj._id;
                    });
                    if (matchingObj) {
                        skillObj.name = matchingObj.name;
                    } else {
                        matchingObj = _.find(attribute.negative_skills, (skill) => {
                            return skill._id == skillObj._id;
                        });
                        if (matchingObj) {
                            skillObj.name = matchingObj.name;
                        }
                    }
                });
            })
        }

        res.status(200).json({data: skillRanks, message: "Success"});

    } catch (error) {
        res.status(404).json({message: error.message});
    }

}

// Get Employee Rank

export const getEmployeeRank = async (req, res) => {
    const company_id = req.body.company_id;
    const location_id = req.body.location_id.split(',');
    const start_date = new Date(req.body.start_date);
    const end_date = new Date(req.body.end_date);
    const order = parseInt(req.body.order);
    const rating_id = [];


    // add try catch
    try {

        // Get Ratings Id From
        const fetchedLocations = await CompanyData.findOne({"_id": company_id}, {location: 1});
        const userLocationId = [];
        if (fetchedLocations)
        {
            if (fetchedLocations.location !== undefined && fetchedLocations.location) {
            fetchedLocations.location.map((location) => {
                userLocationId.push(location._id.toString());
            });
            }    
        }

        // Get Ratings Id From
        if (location_id[0] === "") {
            var rating = await RatingData.aggregate(
                [
                    {
                        $match: {
                            "location_id": {$in: userLocationId},
                            "createdAt": {$gte: new Date(start_date), $lte: new Date(end_date)}
                        }
                    },
                    {
                        $project: {"_id": 1}
                    }
                ]);
        } else {
            var rating = await RatingData.aggregate(
                [
                    {
                        $match: {
                            "location_id": {$in: location_id},
                            "createdAt": {$gte: new Date(start_date), $lte: new Date(end_date)}
                        }
                    },
                    {
                        $project: {"_id": 1}
                    }
                ]);

        }


        // Create an array of ratings id needed
        const ratingIdArray = rating.map(ratingObj => ratingObj._id.toString());
        //res.send(ratingIdArray);
        // Get count of skills from the ratings id

        const employee_rank = await RatingEmployeeData.aggregate(
            [
                {
                    $match: {"rating_id": {$in: ratingIdArray}}
                },
                {
                    $group:
                        {
                            _id: "$employee_id",
                            count: {$sum: 1},
                            average: {$avg: "$rating"}
                        }
                },

                {$sort: {count: order, average: order}}


            ]
        );
        //res.status(200).json({data: employee_rank, message: "Success"});
        var count = 0 ; 
        const responseData = await Promise.all(
            employee_rank.map(async (employee) => {
                employee.employeeName = '';
                if (employee._id != "1" && employee._id != 1 && employee._id != "null" )
                {
                    const fetchedEmployee = await UserData.findOne({"_id": employee._id});
                    if (fetchedEmployee) {
                        employee.employeeName = fetchedEmployee.name;
                    }    
                    count = count + 1 ;
                }
                
                return employee;
            }),
        )
        res.status(200).json({data: responseData, message: "Success"});

    } catch (error) {
        res.status(404).json({message: error.message});
    }

}

export const getUserStats = async (req, res) => {
    try {
        const totalUser = await UserData.countDocuments();

        const sevenDaysDateTo = new Date(moment().toISOString());
        const sevenDaysDateFrom = new Date(moment().subtract(7, 'd').toISOString());
        const lastWeekLoggedInUserList = await UserLoginData.aggregate([
            {
                $match: {"createdAt": {$gte: sevenDaysDateFrom, $lte: sevenDaysDateTo}}
            },
            {"$group": {_id: "$user_id", count: {$sum: 1}}},
        ]);
        const totalLastWeekLoggedInUser = _.sumBy(lastWeekLoggedInUserList, function (data) {
            return data.count;
        });

        const riskDaysDateTo = new Date(moment().subtract(8, 'd').toISOString());
        const riskDaysDateFrom = new Date(moment().subtract(21, 'd').toISOString());
        const sevenDaysLoggedInUserArray = _.map(lastWeekLoggedInUserList, '_id');

        const riskLoggedInUserList = await UserLoginData.aggregate([
            {
                $match: {
                    "createdAt": {$gte: riskDaysDateFrom, $lte: riskDaysDateTo},
                    "user_id": {$nin: sevenDaysLoggedInUserArray}
                }
            },
            {"$group": {_id: "$user_id", count: {$sum: 1}}},
        ]);

        const totalRiskLoggedInUser = _.sumBy(riskLoggedInUserList, function (data) {
            return data.count;
        });

        // const disengagedUserDateFrom = new Date(moment().subtract(22,'d').toISOString());
        // const sevenDaysAndRiskUserCombinedArray = [...sevenDaysLoggedInUserArray, _.map(riskLoggedInUserList, '_id')];
        //
        // const disEngagedLoggedInUserList = await UserLoginData.aggregate([
        //     {
        //         $match : {
        //             "createdAt": { $gte: disengagedUserDateFrom },
        //             "user_id": { $nin: sevenDaysAndRiskUserCombinedArray }
        //         }
        //     },
        //     {"$group" : {_id:"$user_id", count:{$sum:1}}},
        // ]);
        //
        // const totalDisEngagedLoggedInUser = _.sumBy(disEngagedLoggedInUserList, function (data) {
        //     return data.count;
        // });

        const responseData = {
            totalUserCount: totalUser,
            activeUserCount: totalLastWeekLoggedInUser,
            riskUserCount: totalRiskLoggedInUser,
            disEngagedUserCount: totalUser - totalLastWeekLoggedInUser - totalRiskLoggedInUser,
        }
        res.status(200).json({data: responseData, message: "Success"});
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

export const getUserStatDetails = async (req, res) => {
    const type = req.query.type;
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 10;
    const skip = (page - 1) * limit;
    if (!type) {
        res.status(409).json({message: 'Invalid request, type is missing.'});
    }
    try {
        if (type === 'activeUsers') {
            const sevenDaysDateTo = new Date(moment().toISOString());
            const sevenDaysDateFrom = new Date(moment().subtract(21, 'd').toISOString());
            const lastWeekLoggedInUserList = await UserLoginData.aggregate([
                {
                    $match: {"createdAt": {$gte: sevenDaysDateFrom, $lte: sevenDaysDateTo}}
                },
                {"$group": {_id: "$user_id", count: {$sum: 1}}},
                {
                    $lookup:
                        {
                            from: 'updated_users',
                            localField: "_id",
                            foreignField: "_id",
                            as: "user"
                        }
                },
                {"$limit": skip + limit},
                {"$skip": skip}
            ]);

            res.status(200).json({data: lastWeekLoggedInUserList, message: "Success"});

        } else if (type === 'riskUsers') {
            const sevenDaysDateTo = new Date(moment().toISOString());
            const sevenDaysDateFrom = new Date(moment().subtract(7, 'd').toISOString());
            const lastWeekLoggedInUserList = await UserLoginData.aggregate([
                {
                    $match: {"createdAt": {$gte: sevenDaysDateFrom, $lte: sevenDaysDateTo}}
                },
                {"$group": {_id: "$user_id", count: {$sum: 1}}},
            ]);

            const riskDaysDateTo = new Date(moment().subtract(8, 'd').toISOString());
            const riskDaysDateFrom = new Date(moment().subtract(21, 'd').toISOString());
            const sevenDaysLoggedInUserArray = _.map(lastWeekLoggedInUserList, '_id');

            const riskLoggedInUserList = await UserLoginData.aggregate([
                {
                    $match: {
                        "createdAt": {$gte: riskDaysDateFrom, $lte: riskDaysDateTo},
                        "user_id": {$nin: sevenDaysLoggedInUserArray}
                    }
                },
                {"$group": {_id: "$user_id", count: {$sum: 1}}},
                {
                    $lookup:
                        {
                            from: 'updated_users',
                            localField: "_id",
                            foreignField: "_id",
                            as: "user"
                        }
                },
                {"$limit": skip + limit},
                {"$skip": skip}
            ]);

            res.status(200).json({data: riskLoggedInUserList, message: "Success"});

        } else if (type === 'disEngagedUsers') {
            const sevenDaysDateTo = new Date(moment().toISOString());
            const sevenDaysDateFrom = new Date(moment().subtract(7, 'd').toISOString());
            const lastWeekLoggedInUserList = await UserLoginData.aggregate([
                {
                    $match: {"createdAt": {$gte: sevenDaysDateFrom, $lte: sevenDaysDateTo}}
                },
                {"$group": {_id: "$user_id", count: {$sum: 1}}},
            ]);
            const totalLastWeekLoggedInUser = _.sumBy(lastWeekLoggedInUserList, function (data) {
                return data.count;
            });

            const riskDaysDateTo = new Date(moment().subtract(8, 'd').toISOString());
            const riskDaysDateFrom = new Date(moment().subtract(21, 'd').toISOString());
            const sevenDaysLoggedInUserArray = _.map(lastWeekLoggedInUserList, '_id');

            const riskLoggedInUserList = await UserLoginData.aggregate([
                {
                    $match: {
                        "createdAt": {$gte: riskDaysDateFrom, $lte: riskDaysDateTo},
                        "user_id": {$nin: sevenDaysLoggedInUserArray}
                    }
                },
                {"$group": {_id: "$user_id", count: {$sum: 1}}},
            ]);
            const totalRiskLoggedInUser = _.sumBy(riskLoggedInUserList, function (data) {
                return data.count;
            });

            const riskLoggedInUserArray = _.map(riskLoggedInUserList, '_id');
            const engagedUserNotInarray = [...sevenDaysLoggedInUserArray, ...riskLoggedInUserArray];
            const userList = await UserMigratedData.aggregate([
                {
                    $match: {
                        _id: {$nin: engagedUserNotInarray}
                    }
                },
                {"$limit": skip + limit},
                {"$skip": skip}
            ]);

            const formattedData = userList.map((userRow) => {
                return {
                    _id: userRow._id,
                    count: 0,
                    user: [userRow]
                }
            });

            res.status(200).json({data: formattedData, message: "Success"});

        } else {
            res.status(409).json({message: 'Invalid request, type is not valid.'});
        }
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}
