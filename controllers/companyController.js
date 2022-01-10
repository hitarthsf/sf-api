import CompanyData from "../models/CompanyData.js";
import { MesssageProvider, Messages } from "../core/index.js";
import aws from "aws-sdk";
import { Readable } from "stream";
import jwt from "jsonwebtoken";

//Action : createCompany
//Comment : Create New Company
export const createCompany = async (req, res) => {
  const company = req.body;
  if (!company.name) {
    res
      .status(409)
      .json({
        message: "Invalid request, one or multiple fields are missing.",
      });
  }

  company.image = "";
  if (req.files) {
    company.image = `company/` + Date.now() + `-${req.files.image.name}`;
    aws.config.update({
      accessKeyId: "AKIATVUCPHF35FWG7ZNI",
      secretAccessKey: "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",
      region: "us-east-1",
      // accessKeyId: process.env.AWS_S3_API_KEY,
      // secretAccessKey: process.env.AWS_S3_ACCESS_KEY,
      // region: process.env.AWS_S3_ACCESS_REGION,
    });
    const s3 = new aws.S3();
    var params = {
      ACL: "public-read",
      Bucket: "sf-ratings-profile-image",
      Body: bufferToStream(req.files.image.data),
      Key: company.image,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        res
          .status(409)
          .json({
            message: "Error occurred while trying to upload to S3 bucket",
          });
      }
    });
  }
  const newCompany = new CompanyData({
    ...company,
    createdAt: new Date().toISOString(),
  });
  try {
    await newCompany.save();
    res.status(201).json(newCompany);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

//Action : getCompany
//Comment : Get All Company Listing Page
export const getCompany = async (req, res) => {
  const page = req.body.page;
  const perPage = parseInt(req.body.perPage);
  const showTotalCount = req.body.showTotalCount;
  const filterGeneralSearch = req.body.filterGeneralSearch;

  if (page) {
    var offSet = perPage * page - perPage;
  }
  try {
    if (filterGeneralSearch != "") {
      var AllCompany = await CompanyData.find({
        name: { $regex: ".*" + filterGeneralSearch + ".*" },
      })
        .skip(offSet)
        .limit(perPage);
      var AllCompanyCount = await CompanyData.find({
        name: { $regex: ".*" + filterGeneralSearch + ".*" },
      }).countDocuments();
    } else {
      var AllCompany = await CompanyData.find().skip(offSet).limit(perPage);
      var AllCompanyCount = await CompanyData.find().countDocuments();
    }

    if (showTotalCount == "true") {
      res
        .status(200)
        .json({ AllCompany: AllCompany, totalCount: AllCompanyCount });
    } else {
      res.status(200).json(AllCompany);
    }
    res.status(200).json(AllCompany);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//Action : getCompanyGet
//Comment : Get All Company Listing For Dropdowns
export const getCompanyGet = async (req, res) => {
  const page = req.body.page;
  const perPage = parseInt(req.body.perPage);
  const showTotalCount = req.body.showTotalCount;
  const filterGeneralSearch = req.body.filterGeneralSearch;

  if (page) {
    var offSet = perPage * page - perPage;
  }
  try {
    var AllCompany = await CompanyData.find();
    res.status(200).json(AllCompany);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};


//Action : getLocationListPost
//Comment : Post Api To Get List of all location of a Company
export const getLocationListPost = async (req, res) => {
  const id = req.body._id;
  try {
    const AllCompany = await CompanyData.findOne({ _id: id });
    res.status(200).json(AllCompany);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//Action : getLocation
//Comment : Get Api To Get List of all location of a Company
export const getLocation = async (req, res) => { 
  const id = req.body._id;
  try {
    const AllLocation = await CompanyData.findOne({ _id: id }, { location: 1 });
    res.status(200).json(companyList);
    res.status(200).json(AllLocation);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};


//Action : updateCompany
//Comment : Update A Company
export const updateCompany = async (req, res) => {
  
  const company = req.body;

  company.image = "";
  if (req.files) {
    company.image = `company/` + Date.now() + `-${req.files.image.name}`;
    aws.config.update({
      accessKeyId: "AKIATVUCPHF35FWG7ZNI",
      secretAccessKey: "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",
      region: "us-east-1",
      // accessKeyId: process.env.AWS_S3_API_KEY,
      // secretAccessKey: process.env.AWS_S3_ACCESS_KEY,
      // region: process.env.AWS_S3_ACCESS_REGION,
    });
    const s3 = new aws.S3();
    var params = {
      ACL: "public-read",
      Bucket: "sf-ratings-profile-image",
      Body: bufferToStream(req.files.image.data),
      Key: company.image,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        res
          .status(409)
          .json({
            message: "Error occurred while trying to upload to S3 bucket",
          });
      }
    });
  }
  const updatedCompany = { ...company, _id: req.body._id };

  await CompanyData.findByIdAndUpdate(req.body._id, updatedCompany, {
    new: true,
  });

  res.json(updatedCompany);
  console.log(updatedCompany);
};


//Action : deleteCompany
//Comment : Delete A Company
export const deleteCompany = async (req, res) => {
  
  const id = req.body._id;

  await CompanyData.findByIdAndRemove(id);

  res.json({ message: "Company deleted successfully." });
};


export const getLocationList = async (req, res) => {
  const id = req.query.company_id;
  if (!id) {
    res
      .status(500)
      .json({
        message: MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND),
      });
  }
  try {
    const fetchedLocations = await CompanyData.findOne(
      { _id: id },
      { location: 1 }
    );
    const companyList = [];
    if (fetchedLocations.location !== undefined && fetchedLocations.location) {
      fetchedLocations.location.map((location) => {
        companyList.push({
          _id: location._id,
          name: location.name,
        });
      });
    }
    res.status(200).json(companyList);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};


//Action : getSkillList
//Comment : Get List Of Skill
export const getSkillList = async (req, res) => {
  const id = req.query.company_id;
  if (!id) {
    res
      .status(500)
      .json({
        message: MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND),
      });
  }
  try {
    const fetchAttributes = await CompanyData.findOne(
      { _id: id },
      { attributes: 1 }
    );
    const skillList = [];
    if (
      fetchAttributes.attributes !== undefined &&
      fetchAttributes.attributes
    ) {
      fetchAttributes.attributes.map((attribute) => {
        if (
          attribute.positive_skills !== undefined &&
          attribute.positive_skills
        ) {
          attribute.positive_skills.map((positiveAttribute) => {
            skillList.push({
              _id: "",
              name: positiveAttribute,
              is_positive: true,
            });
          });
        }
        if (
          attribute.negative_skills !== undefined &&
          attribute.negative_skills
        ) {
          attribute.negative_skills.map((negativeAttribute) => {
            skillList.push({
              _id: "",
              name: negativeAttribute,
              is_positive: false,
            });
          });
        }
      });
    }
    res.status(200).json(skillList);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//Action : bufferToStream
//Comment : General Function For Image 
function bufferToStream(buffer) {
  var stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  return stream;
}

//Action : fetchLocationByLoggedInUser
//Comment : Get List Of Location As Per User
export const fetchLocationByLoggedInUser = async (req, res, token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET_OR_KEY);
  const companyId = req.query.company_id;
  if (!companyId) {
    res
      .status(409)
      .json({ message: "Invalid request, company ID is missing." });
  }
  if (decoded.type === "super_admin") {
    const fetchedLocations = await CompanyData.findOne(
      { _id: companyId },
      { location: 1 }
    );
    res.status(200).json(fetchedLocations);
  } else {
    const fetchedLocations = await CompanyData.find({
      _id: companyId,
      location: { $in: JSON.parse(decoded.location_id) },
    });
    res.status(200).json(fetchedLocations);
  }
};
