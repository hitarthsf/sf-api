import express from "express";
import { MesssageProvider, Messages } from "../core/index.js";
import AuthUtils from "../utils/AuthUtils.js";
import CompanyData from "../models/CompanyData.js";
import jwt from "jsonwebtoken";

export const getAttribute = async (req, res) => {
  //res.send('THIS GOOD');
  const id = req.body.company_id;
  try {
    //  const AllCompany = await CompanyData.find({"_id":id});
    const AllCompany = await CompanyData.find({ _id: id });
    console.log(id);
    res.status(200).json(AllCompany);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const addAttribute = async (req, res) => {
  const compId = req.body.company_id;
  const positiveSkills = req.body.positiveSkills.split(",").map((skill) => {
    return { name: skill };
  });
  const negativeSkills = req.body.negativeSkills.split(",").map((skill) => {
    return { name: skill };
  });
  var objFriends = {
    name: req.body.name,
    positive_skills: positiveSkills,
    negative_skills: negativeSkills,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await CompanyData.findOneAndUpdate(
    { _id: compId },
    { $push: { attributes: objFriends } },
    function (error, success) {
      if (error) {
        res.status(409).json({ message: "Error in adding attribute" });
      } else {
        res.status(200).json({ message: "Attribute successfully added." });
      }
    }
  );
};

export const editAttribute = async (req, res) => {
  const compId = req.body.company_id;
  console.log(compId);
  var objFriends = {
    name: req.body.name,
    positive_skills: req.body.positive_skills,
    negative_skills: req.body.negative_skills,
  };
  console.log(objFriends);
  await CompanyData.findOneAndUpdate(
    { _id: compId },
    { $push: { attributes: objFriends } },
    function (error, success) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        console.log(success);
        res.send(success);
      }
    }
  );
};

export const updateAttribute = async (req, res) => {
  const id = req.body._id;
  const compId = req.body.company_id;
  console.log(id);
  console.log(compId);
  await CompanyData.updateOne(
    { _id: compId },
    { $pull: { attributes: { _id: id } } },
    { multi: true },
    function (error, success) {
      if (error) {
        console.log(error);
        // res.send(error)
      } else {
        console.log(success);
        // res.send(success)
      }
    }
  );

  console.log(req.body.positive_skills);
  var objFriends = {
    name: req.body.name,
    positive_skills: req.body.positiveSkills.split(","),
    negative_skills: req.body.negativeSkills.split(","),
  };

  CompanyData.findOneAndUpdate(
    { _id: compId },
    { $push: { attributes: objFriends } },
    function (error, success) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        console.log(success);
        res.send(success);
      }
    }
  );
};

export const deleteAttribute = async (req, res) => {
  const id = req.body._id;
  const compId = req.body.company_id;

  // const Company = await CompanyData.findOneAndUpdate({"_id":"6111149b961aa70d06fe58f1"});
  // CompanyData.update( {"_id":"6111149b961aa70d06fe58f1"}, { $pull: { votes: { $gte: 6 } } } )
  // make it dynamic
  await CompanyData.updateOne(
    { _id: compId },
    { $pull: { attributes: { _id: id } } },
    { multi: true },
    function (error, success) {
      if (error) {
        console.log(error);
        // res.send(error)
      } else {
        console.log(success);
        // res.send(success)
      }
    }
  );

  res.json({ message: "Attribute deleted successfully." });
};
