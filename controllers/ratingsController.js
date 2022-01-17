import express from "express";
import mongoose from "mongoose";
import RatingData from "../models/RatingData.js";
import RatingEmployeeData from "../models/RatingEmployeeData.js";
import RatingSkillData from "../models/RatingSkillData.js";
import CompanyData from "../models/CompanyData.js";
import UserData from "../models/UsersData.js";
import _ from "lodash";

export const createRating = async (req, res) => {
  const data = req.body;
  const skills = data.skills ? data.skills.split(",") : [];
  const employees = data.employees ? data.employees.split(",") : [];
  var is_assign = data.employees ? "1" : "0";

  const ratingObj = {
    location_id: data.location_id,
    company_id: data.company_id,
    rating: data.rating,
    dropout_page: data.dropout_page ? data.dropout_page : "",
    feedback: data.feedback ? data.feedback : "",
    customer_name: data.customer_name,
    is_standout: data.is_standout ? data.is_standout : 0,
    customer_phone: data.customer_phone ? data.customer_phone : "",
    customer_email: data.customer_email ? data.customer_email : "",
    other_feedback: data.other_feedback ? data.other_feedback : "",
    is_assign: is_assign,
  };

  const rating = new RatingData(ratingObj);
  await rating.save();

  // if positive rating and no employee is selected then assign rating to all the employee and location manager of that location
  if (employees.length == 0 && data.rating > 3) {
    const employees_ids = await UserData.aggregate([
      {
        $match: {
          location_id: data.location_id,
          type: { $in: ["employee", "location_manager"] },
        },
      },
    ]);
    employees_ids.forEach(function (myDoc) {
      employees.push(myDoc._id);
    });
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
};

export const fetchRating = async (req, res) => {
  const companyId = req.body.company_id;
  const start_date = new Date(req.body.start_date);
  const end_date = new Date(req.body.end_date);
  const ObjectId = mongoose.Types.ObjectId;
  if (req.body.rating == "") {
    var rating = [1, 2, 3, 4, 5];
  } else {
    var rating = [parseInt(req.body.rating)];
  }

  if (!companyId) {
    res.status(409).json({ message: "Invalid request, Company Id is missing" });
  }
  // const ratings = await RatingData.find({companyId: companyId}, {
  //     $lookup: {
  //         from: 'rating_skills',
  //         localField: 'rating_id',
  //         foreignField: '_id',
  //         "as": "L"
  //     }
  // })

  const page = req.body.page ? req.body.page : 1;
  const limit = req.body.perPage ? parseInt(req.body.perPage) : 1;
  const skip = (page - 1) * limit;
  const companyData = await CompanyData.findOne({ _id: companyId });
  const ratingsCount = await RatingData.find({
    company_id: companyId,
    rating: { $in: rating },
    createdAt: { $gte: new Date(start_date), $lte: new Date(end_date) },
  }).countDocuments();
  const ratings = await RatingData.aggregate([
    {
      $match: {
        company_id: companyId,
        rating: { $in: rating },
        createdAt: { $gte: new Date(start_date), $lte: new Date(end_date) },
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: skip + limit },
    { $skip: skip },
    { $addFields: { ratingId: { $toString: "$_id" } } },
    {
      $lookup: {
        from: "rating_skills",
        localField: "ratingId",
        foreignField: "rating_id",
        as: "rating_skills",
      },
    },
    // {
    //     $unwind: {
    //         path: "$rating_skills",
    //         preserveNullAndEmptyArrays: false
    //     }
    // },
    {
      $lookup: {
        from: "rating_employees",
        localField: "ratingId",
        foreignField: "rating_id",
        as: "rating_employees",
      },
    },
    // {
    //     $unwind: {
    //         path: "$rating_employees",
    //         preserveNullAndEmptyArrays: false
    //     }
    // },
  ]);

  const responseData = await Promise.all(
    ratings.map(async (rating) => {
      rating.companyName = companyData.name;

      rating.locationName = "";

      if (!rating.is_assign) {
        rating.is_assign = 0;
      }
      const fetchedLocation = _.find(companyData.location, (location) => {
        return location._id == rating.location_id;
      });
      if (fetchedLocation) {
        rating.locationName = fetchedLocation.name;
      }
      rating.skillName = [];
      rating.rating_skills.map(async (ratingSkill) => {
        rating.skillName = [];
        companyData.attributes.map((attribute) => {
          const matchingObj = _.find(attribute.positive_skills, (skill) => {
            return skill._id == ratingSkill.skill_id;
          });
          if (matchingObj) {
            rating.skillName.push(matchingObj.name);
          }
          if (ratingSkill.skillName === "") {
            const matchingObj = _.find(attribute.negative_skills, {
              _id: ratingSkill.skill_id,
            });
            if (matchingObj) {
              rating.skillName.push(matchingObj.name);
            }
          }
        });
        if (rating.skillName > 0) {
          rating.skillName = rating.skillName.join(",");
        }

        return ratingSkill;
      });
      if (rating.rating_employees.length > 0) {
        await Promise.all(
          rating.rating_employees.map(async (ratingEmployee) => {
            if (
              ratingEmployee.employee_id != "null" &&
              ratingEmployee.employee_id != null
            ) {
              ratingEmployee.employeeDetails = await UserData.findOne({
                _id: ratingEmployee.employee_id,
              });
              return ratingEmployee;
            }
          })
        );
      }

      return rating;
    })
  );
  res.status(200).json({ ratings: ratings, ratingCount: ratingsCount });
};

export const singleRating = async (req, res) => {
  const companyId = req.body.company_id;
  const ObjectId = mongoose.Types.ObjectId;
  const id = req.body.rating_id;
  if (!id) {
    res.status(409).json({ message: "Invalid request, Id is missing" });
  }

  const ratings = await RatingData.aggregate([
    {
      $match: { _id: ObjectId(id) },
    },
    { $addFields: { ratingId: { $toString: "$_id" } } },
    {
      $lookup: {
        from: "rating_skills",
        localField: "ratingId",
        foreignField: "rating_id",
        as: "rating_skills",
      },
    },

    {
      $lookup: {
        from: "rating_employees",
        localField: "ratingId",
        foreignField: "rating_id",
        as: "rating_employees",
      },
    },
  ]);
  const companyData = await CompanyData.findOne({ _id: companyId });
  const responseData = await Promise.all(
    ratings.map(async (rating) => {
      rating.companyName = companyData.name;
      if (!rating.is_assign) {
        rating.is_assign = 0;
      }
      rating.locationName = "";
      const fetchedLocation = _.find(companyData.location, (location) => {
        return location._id == rating.location_id;
      });
      if (fetchedLocation) {
        rating.locationName = fetchedLocation.name;
      }
      rating.skillName = [];
      var commets_data = [] ; 
      rating.rating_skills.map(async (ratingSkill) => {
        companyData.attributes.map((attribute) => {
          const matchingObj = _.find(attribute.positive_skills, (skill) => {
            return skill._id == ratingSkill.skill_id;
          });
          if (matchingObj) {
            rating.skillName.push(matchingObj.name);
          }
          if (ratingSkill.skillName === "") {
            const matchingObj = _.find(attribute.negative_skills, {
              _id: ratingSkill.skill_id,
            });
            if (matchingObj) {
              rating.skillName.push(matchingObj.name);
            }
          }
        });
        //rating.skillName = rating.skillName.join(",");
        return ratingSkill;
      });
      await Promise.all(
        rating.rating_employees.map(async (ratingEmployee) => {
          ratingEmployee.employeeDetails = await UserData.findOne({
            _id: ratingEmployee.employee_id,
          });
          rating.EmployeeName = ratingEmployee.employeeDetails.name;
          return ratingEmployee;
        })
      );
      await Promise.all(
            rating.rating_comments.map(async (comment_data_array) => {
              comment_data_array.user_name = "";
              comment_data_array.image =
                "https://app.servefirst.co.uk/front/images/user.png";
              var user_data = await UserData.findOne({
                _id: comment_data_array.user_id,
              });
              comment_data_array.user_name = user_data.name;
              commets_data.push(comment_data_array);
            })
          );
      rating.rating_comments = commets_data;
      return rating;
    })
  );
  res.status(200).json({ data: ratings, message: "Success" });
};

export const complaintManagement = async (req, res) => {
  const companyId = req.body.company_id;
  const negativeRating = ["1", "2", "3"];
  const start_date = new Date(req.body.start_date);
  const end_date = new Date(req.body.end_date);
  if (!companyId) {
    res.status(409).json({ message: "Invalid request, companyId is missing" });
  }
  const page = req.body.page ? req.body.page : 1;
  const limit = req.body.perPage ? parseInt(req.body.perPage) : 1;
  const skip = (page - 1) * limit;

  const ratingsCount = await RatingData.find({
    company_id: companyId,
    rating: { $lte: 3 },
    customer_email: { $ne: "" },
    createdAt: { $gte: new Date(start_date), $lte: new Date(end_date) },
  }).countDocuments();
  const ratings = await RatingData.aggregate([
    {
      $match: {
        company_id: companyId,
        rating: { $lte: 3 },
        customer_email: { $ne: "" },
        createdAt: { $gte: new Date(start_date), $lte: new Date(end_date) },
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: skip + limit },
    { $skip: skip },
  ]);
  const companyData = await CompanyData.findOne({ _id: companyId });
  const responseData = await Promise.all(
    ratings.map(async (rating) => {
      rating.companyName = companyData.name;

      rating.locationName = "";
      const fetchedLocation = _.find(companyData.location, (location) => {
        return location._id == rating.location_id;
      });
      if (fetchedLocation) {
        rating.locationName = fetchedLocation.name;
      }

      return rating;
    })
  );
  res.status(200).json({ ratings: ratings, ratingCount: ratingsCount });
};

// rating detail chat
export const ratingChat = async (req, res) => {
  const rating_id = req.body.rating_id;

  var comment = {
    user_id: req.body.user_id,
    comments: req.body.comments,
  };
  var rating = await RatingData.findOneAndUpdate(
    { _id: rating_id },
    { $push: { rating_comments: comment } },
    { upsert: true, new: true }
  );

  var ratings = await RatingData.find({ _id: rating_id });

  var commets_data = [];
  const responseData = await Promise.all(
    ratings.map(async (rating) => {
        if ( rating.rating_comments.length > 0 )
        {
            await Promise.all(
            rating.rating_comments.map(async (comment_data_array) => {
              comment_data_array.user_name = "";
              comment_data_array.image =
                "https://app.servefirst.co.uk/front/images/user.png";
              var user_data = await UserData.findOne({
                _id: comment_data_array.user_id,
              });
              comment_data_array.user_name = user_data.name;
              commets_data.push(comment_data_array);
            })
          );
        }
      
      return rating;
    })
  );

  res.status(200).json({ comments: commets_data });
};
