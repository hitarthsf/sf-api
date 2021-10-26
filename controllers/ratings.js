import express from 'express';
import RatingData from '../models/RatingData.js';
import RatingEmployeeData from "../models/RatingEmployeeData.js";
import RatingSkillData from "../models/RatingSkillData.js";
import UsersData from "../models/UsersData.js";

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
    if (employees.length == 0 && data.rating > 3  )
    {
        const employees_ids = await UsersData.aggregate([
                {
                  $match : {"location_id" : data.location_id , "type" : { $in :['employee' , 'location_manager'] }}
                }
               ]); 
        employees_ids.forEach( function(myDoc) { employees.push( myDoc._id)  } );
    }
    
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
    const company_id = req.query.company_id;
    // const ratings = await RatingData.find({company_id: company_id}, {
    //     $lookup: {
    //         from: 'rating_skills',
    //         localField: 'rating_id',
    //         foreignField: '_id',
    //         "as": "L"
    //     }
    // })

    const ratings = await RatingData.aggregate([
        {
            $match: {company_id: company_id}
        },
        {
            $lookup: {
                from: 'rating_skills',
                localField: 'rating_id',
                foreignField: 'id',
                "as": "rating_skills"
            }
        },
        {
            $lookup: {
                from: 'rating_employees',
                localField: 'rating_id',
                foreignField: 'id',
                "as": "rating_employees"
            }
        }
    ]);
    res.status(201).json(ratings);
}
