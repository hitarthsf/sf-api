import express from 'express';
import RatingData from '../models/RatingData.js';
import RatingEmployeeData from "../models/RatingEmployeeData.js";
import RatingSkillData from "../models/RatingSkillData.js";
import CompanyData from '../models/CompanyData.js';
import UserData from '../models/UsersData.js';
import _ from "lodash";


export const createRating = async (req, res) => {
    const data = req.body;
    const skills = data.skills ? data.skills.split(',') : [];
    const employees = data.employees ? data.employees.split(',') : [];

    const ratingObj = {
        location_id: data.location_id,
        company_id: data.company_id,
        rating: data.rating,
        dropout_page: data.dropout_page ? data.dropout_page : '',
        feedback: data.feedback ? data.feedback : '',
        customer_name: data.customer_name,
        is_standout: data.is_standout ? data.is_standout : 0,
        customer_phone: data.customer_phone ? data.customer_phone : '',
        customer_email: data.customer_email ? data.customer_email : '',
        other_feedback: data.other_feedback ? data.other_feedback : '',
    };

    const rating = new RatingData(ratingObj);
    await rating.save();

    // if positive rating and no employee is selected then assign rating to all the employee and location manager of that location
    // if (employees.length == 0 && data.rating > 3  )
    // {
    //     const employees_ids = await UsersData.aggregate([
    //             {
    //               $match : {"location_id" : data.location_id , "type" : { $in :['employee' , 'location_manager'] }}
    //             }
    //            ]); 
    //     employees_ids.forEach( function(myDoc) { employees.push( myDoc._id)  } );
    // }
    
    if (employees.length > 0) { 
        employees.map(async (employeeId) => {
            
            const savedEmployees = new RatingEmployeeData({
                rating_id: rating._id,
                employee_id: employeeId,
                rating: data.rating,
                location_id: data.location_id,
                company_id: data.company_id,
            });
            //res.send(savedEmployees);
            await savedEmployees.save();
        });
    }

    if (skills.length > 0) {
        skills.map(async (skillId) => {
            const savedSkills = new RatingSkillData({
                rating_id: rating._id,
                skill_id: skillId,
                rating: data.rating,
                location_id: data.location_id,
                company_id: data.company_id,
            });
            await savedSkills.save();
        });
    }
    res.status(201).json(rating);
}

export const fetchRating = async (req, res) => {
    const companyId = req.query.company_id;
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

    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 10;
    const skip = (page - 1) * limit;
    const companyData = await CompanyData.findOne({"_id":companyId});
    const ratings = await RatingData.aggregate([
        {
            $match: {company_id: companyId}
        },
        {
            $lookup: {
                from: 'rating_skills',
                localField: 'rating_id',
                foreignField: 'id',
                "as": "rating_skills"
            }
        },
        // {
        //     $unwind: {
        //         path: "$rating_skills",
        //         preserveNullAndEmptyArrays: false
        //     }
        // },
        {
            $lookup: {
                from: 'rating_employees',
                localField: 'rating_id',
                foreignField: 'id',
                "as": "rating_employees"
            }
        },
        // {
        //     $unwind: {
        //         path: "$rating_employees",
        //         preserveNullAndEmptyArrays: false
        //     }
        // },
        { "$limit": skip + limit },
        { "$skip": skip }
    ]);
    const responseData =  await Promise.all(
        ratings.map(async (rating) => {
            rating.companyName = companyData.name;

            rating.locationName = '';
            const fetchedLocation = _.find(companyData.location, (location) => {
                return location._id == rating.location_id
            });
            if (fetchedLocation) {
                rating.locationName = fetchedLocation.name;
            }

            rating.rating_skills.map(async (ratingSkill) => {
                ratingSkill.skillName = '';
                companyData.attributes.map((attribute) => {
                    const matchingObj = _.find(attribute.positive_skills, (skill) => {
                        return skill._id == ratingSkill.skill_id
                    });
                    if (matchingObj) {
                        ratingSkill.skillName = matchingObj.name;
                    }
                    if (ratingSkill.skillName === '') {
                        const matchingObj = _.find(attribute.negative_skills, {_id: ratingSkill.skill_id});
                        if (matchingObj) {
                            ratingSkill.skillName = matchingObj.name;
                        }
                    }
                });
                return ratingSkill;
            });
            await Promise.all(
                rating.rating_employees.map(async (ratingEmployee) => {
                    ratingEmployee.employeeDetails = await UserData.findOne({"_id":ratingEmployee.employee_id});
                    return ratingEmployee;
                }),
            );
            return rating;
        }),
    )
    res.status(201).json(responseData);
}
