import CompanyMigratedData from '../models/CompanyMigratedData.js';
import UserMigratedData from '../models/UserMigratedData.js';
import RatingMigratedData from '../models/RatingMigratedData.js';
import RatingMigratedSkillData from '../models/RatingMigratedSkillData.js';
import RatingMigratedEmployeeData from '../models/RatingMigratedEmployeeData.js';
import UserLoginData from '../models/UserLoginData.js';
import _ from 'lodash';
import mysql from 'mysql';
import mongoose from "mongoose";
import CompanyData from "../models/CompanyData.js";

export const migrateCompanies = async (req, res) => {

    const connection = mysql.createConnection({
        host: '192.168.64.2',
        user: 'hitarth29',
        password: 'Pfbvq3Ed4l/HMycS',
        database: 'ratings_db'
    });
    connection.connect(async (err) => {
        if (err) throw err
        console.log('You are now connected...');

        // Fetch Company main object
        await connection.query('SELECT * FROM location_area', async (err, rows) => {
            if (err) throw err
            if (rows.length) {
                Promise.all(
                    rows.map(async (company) => {
                        const companyObject = company;
                        companyObject['old_company_id'] = company.id;
                        // Fetch company locations
                        await connection.query(`SELECT *, location.id as old_location_id FROM location 
                            LEFT JOIN location_area la on la.id = location.location_area_id 
                            WHERE location_area_id = ${company.id}`, async (err, rows) => {
                            companyObject['location'] = rows;
                        });
                        
                        // Fetch company attributes & skills
                        await connection.query(`SELECT 
                            attribute.id as attributeId, 
                            attribute.name as attributeName, 
                            attribute.created_at as createdAt, 
                            attribute.updated_at as updatedAt, 
                            attribute.deleted_at as deletedAt, 
                            skills.id as id, 
                            skills.name as name, 
                            skills.type as type 
                        FROM skills
                        LEFT JOIN location_area_skills on skills.id = location_area_skills.skill_id
                        LEFT JOIN location_area  on location_area.id = location_area_skills.location_area_id
                        LEFT JOIN attribute_skills on skills.id = attribute_skills.skill_id
                        LEFT JOIN attribute on attribute_skills.attribute_id = attribute.id
                        WHERE location_area.id=${company.id} AND attribute.id IS NOT NULL AND skills.is_active = 1 AND attribute.is_active = 1`, async (err, rows) => {
                            const attributeRawGroupedData = _.chain(rows)
                                .groupBy('attributeId')
                                .map((value, key) => ({
                                    attributeId: key,
                                    value: value
                                }))
                                .value();

                            const attributes = [];
                            attributeRawGroupedData.forEach((attributeRow) => {
                                if (attributeRow.value.length > 0) {
                                    const positiveSkills = [];
                                    const negativeSkills = [];
                                    attributeRow.value.map((attributeValueRow) => {
                                        if (attributeValueRow.type == 1) {
                                            positiveSkills.push({
                                                name: attributeValueRow.name,
                                            });
                                        } else {
                                            negativeSkills.push({
                                                name: attributeValueRow.name,
                                            })
                                        }
                                    });
                                    attributes.push({
                                        createdAt: attributeRow.value[0].createdAt,
                                        updatedAt: attributeRow.value[0].updatedAt,
                                        deletedAt: attributeRow.value[0].deletedAt,
                                        name: attributeRow.value[0].attributeName,
                                        positive_skills: positiveSkills,
                                        negative_skills: negativeSkills,
                                    });
                                }
                            });
                            companyObject['attributes'] = attributes;

                            const newCompany = new CompanyMigratedData({...companyObject, createdAt: new Date().toISOString()});
                            await newCompany.save();
                            console.log(`import successful for companyName: ${newCompany.name}, companyId: ${newCompany._id}`);
                        });
                    }),
                ).then((value) => {
                    res.status(209).json(`total ${rows.length} companies are imported.`);
                });
            } else {
                res.status(409).json({ message : 'No companies found.'});
            }
        });
    });
}

export const migrateUsers = async (req, res) => {
    const connection = mysql.createConnection({
         host: '192.168.64.2',
        user: 'hitarth29',
        password: 'Pfbvq3Ed4l/HMycS',
        database: 'ratings_db'
    });
    connection.connect(async (err) => {
        if (err) throw err
        console.log('You are now connected...');
        const mongoCompanyList = await CompanyMigratedData.find();

        await Promise.all(
            mongoCompanyList.map(async (mongoCompany) => {
                const currentCompanyId = mongoCompany.old_company_id;
                await connection.query(`SELECT *  , GROUP_CONCAT(DISTINCT user_location.location_id) as location_ids , user_location.user_id as user_id FROM users
                                        LEFT JOIN user_location on users.id = user_location.user_id
                                        WHERE user_location.location_area_id = ${currentCompanyId} GROUP BY user_location.user_id`, async (err, rows) => {
                    // adding if condition to check that are there any users                                            
                    if (rows.length > 0 )
                    {
                        rows.map(async (rowUser) => {
                        console.log("user");
                        console.log(rowUser);

                        const userData = rowUser;
                        userData['company_id'] = mongoCompany._id;
                        if (rowUser.location_ids ) {
                            var userLocationIDs = [] ;
                         //console.log('mongoCompany.location', mongoCompany.location, rowUser.location_id);
                            const fetchedLocation = _.find(mongoCompany.location, (location) => {
                                if (rowUser.location_ids.split(',').includes(location.old_location_id) )
                                {
                                    userLocationIDs.push(location._id);
                                }
                                
                            });
                            userData['location_id'] = userLocationIDs.length > 0  ? userLocationIDs : '';
                            userData['old_user_id'] = rowUser.user_id;
                            const mongoUserData = new UserMigratedData({...userData, createdAt: new Date().toISOString()});
                            await mongoUserData.save();
                        }
                    });
                 }
                    
                });
                console.log(`import successful for companyName: ${mongoCompany.name}, companyId: ${mongoCompany._id}`);
            }),
        ).then((value) => {
            res.status(209).json(`total ${mongoCompanyList.length} company users are imported.`);
        });
    });
}

export const migrateRatings = async (req,res) => {
    const oldCompanyId= req.query['company_id'];
    if (!oldCompanyId) {
        res.status(209).json(`company Id is missing from request.`);
    }
    console.log('oldCompanyId', oldCompanyId);
    const connection = mysql.createConnection({
        host: '192.168.64.2',
        user: 'hitarth29',
        password: 'Pfbvq3Ed4l/HMycS',
        database: 'ratings_db'
    });
    connection.connect(async (err) => {
        if (err) throw err
        console.log('You are now connected...');
        const mongoCompanyObj = await CompanyMigratedData.findOne({old_company_id: oldCompanyId});

        mongoCompanyObj.location.map(async (location) => {
            console.log('location', location);

            await connection.query(`SELECT ratings.*,rating_customer.name as customer_name, rating_customer.email as customer_email, rating_customer.phone as customer_phone
                from ratings 
                left join location on ratings.location_id = location.id 
                left join rating_customer on ratings.id = rating_customer.ratings_id 
                WHERE ratings.location_id= ${location.old_location_id}`, async (err, ratingRows) => {

                ratingRows.map(async (ratingRow) => {

                    const ratingObj = ratingRow;

                    ratingObj['location_id'] = location._id;
                    ratingObj['company_id'] = mongoCompanyObj._id;
                    ratingObj['old_location_id'] = ratingRow.location_id;
                    ratingObj['old_rating_id'] = ratingRow.id;

                    const ratingMongoObj = new RatingMigratedData({...ratingObj, createdAt: ratingObj['created_at']});
                    await ratingMongoObj.save();

                    await connection.query(`SELECT ratings_skill.*, skills.name, skills.type 
                        from ratings_skill 
                        left join skills on skills.id = ratings_skill.skills_id 
                        WHERE ratings_id = ${ratingObj.id}`, async (err, ratingSkills) => {
                        ratingObj['skills'] = ratingSkills;

                        ratingSkills.map(async (mySqlRatingSkill) => {
                                if (mySqlRatingSkill.name) {
                                    let skillId = null;
                                    mongoCompanyObj.attributes.forEach((attribute) => {
                                        if (mySqlRatingSkill.type == 1) {
                                            const matchingObj = _.find(attribute.positive_skills, {name: mySqlRatingSkill.name});
                                            if (matchingObj) {
                                                skillId = matchingObj._id;
                                            }
                                        } else {
                                            const matchingObj = _.find(attribute.negative_skills, {name: mySqlRatingSkill.name});
                                            if (matchingObj) {
                                                skillId = matchingObj._id;
                                            }
                                        }
                                    });
                                    if (skillId) {
                                        const ratingSkillMongoObj = new RatingMigratedSkillData({
                                            rating_id: ratingMongoObj.id,
                                            skill_id: skillId,
                                            rating: ratingObj.rating,
                                            location_id: ratingObj.location_id,
                                            company_id: ratingObj.company_id,
                                            createdAt: ratingMongoObj.createdAt
                                        });
                                        await ratingSkillMongoObj.save();
                                    }
                                }
                        });
                    });

                    await connection.query(`SELECT rating_user.* 
                        from rating_user
                        WHERE ratings_id = ${ratingObj.id}`, async (err, ratingEmployees) => {
                        ratingObj['employees'] = ratingEmployees;

                        ratingEmployees.map(async (mySqlRatingEmployee) => {
                            if (mySqlRatingEmployee.user_id) {
                                const mongoEmployee = await UserMigratedData.findOne({old_user_id: mySqlRatingEmployee.user_id});
                                if (mongoEmployee) {
                                    const ratingEmployeeMongoObj = new RatingMigratedEmployeeData({
                                        rating_id: ratingMongoObj.id,
                                        employee_id: mongoEmployee._id,
                                        rating: ratingObj.rating,
                                        location_id: ratingObj.location_id,
                                        company_id: ratingObj.company_id,
                                        createdAt: ratingMongoObj.createdAt
                                    });
                                    await ratingEmployeeMongoObj.save();
                                }
                            }
                        });
                    });

                });
            });
        });
    });
res.status(209).json(`total ${ratingRows.length} ratings  are imported.`);
}

export const migrateLogins = async (req,res) => {
    const connection = mysql.createConnection({
        host: '192.168.64.2',
        user: 'hitarth29',
        password: 'Pfbvq3Ed4l/HMycS',
        database: 'ratings_db'
    });
    connection.connect(async (err) => {
        if (err) throw err
        console.log('You are now connected...');
    });

    await connection.query(`SELECT * FROM user_logins`, async (err, rows) => {
        rows.map(async (row) => {
            const mongoUser = await UserMigratedData.findOne({old_user_id: row.user_id});
            if (mongoUser) {
                const userLoginObj = new UserLoginData({
                    user_id: mongoUser._id,
                    createdAt: new Date(row.created_at),
                    updatedAt: new Date(row.updated_at),
                    old_user_login_id: row.id
                });
                await userLoginObj.save();
                console.log(`userLoginObject ${userLoginObj.id} saved`, userLoginObj);
            }
        });
        res.status(209).json(`total ${rows.length} user login data are imported.`);
    });
}

export const updateMigratedLocationNames = async (req, res) => {
    const connection = mysql.createConnection({
         host: '192.168.64.2',
        user: 'hitarth29',
        password: 'Pfbvq3Ed4l/HMycS',
        database: 'ratings_db'
    });
    connection.connect(async (err) => {
        if (err) throw err
        console.log('You are now connected...');

        const companyList = await CompanyData.find();
        await Promise.all(
            companyList.map(async (companyObj) => {
                const companyId= companyObj._id;
                console.log('companyObj', companyObj._id, companyObj.old_company_id);
                console.log('saaaaaa', `SELECT * FROM location WHERE location_area_id= ${companyObj.old_company_id}`);
                await connection.query(`SELECT * FROM location WHERE location_area_id= ${companyObj.old_company_id}`, async (err, rows) => {
                    rows.map(async (mySQLRow) => {
                        await CompanyData.update({_id:companyId}, {$set:{
                                "location.$[updateLocation].name": mySQLRow.name,
                            }}, {
                            "arrayFilters": [
                                {"updateLocation.old_location_id" : mySQLRow.id}
                            ]
                        }, (error, result) => {
                            if (error) {
                                console.log('errorerror', companyId, mySQLRow.name);
                            }
                            console.log('resultresult', companyId, mySQLRow.name);
                        });
                    });
                });
            }),
        )
    });
}
