import ScreenSaverData from "../models/ScreenSaverData.js";
import CompanyData from "../models/CompanyData.js";
import aws from "aws-sdk";
import { Readable } from "stream";
import fs from "fs";
import _ from "lodash";

// add screen saver
export const addScreenSaver = async (req, res) => {
  const company_id = req.body.company_id;
  const location_id = req.body.location_id.split(",");
  var name = req.body.name;
  const title = req.body.title;
  const type = req.body.type;
  if (!company_id) {
    res.status(409).json({ data: [], message: "Please add company_id " });
  }

  if (location_id.length == 0) {
    res.status(409).json({ data: [], message: "Please add location_id " });
  }
  if (!title || !type) {
    res
      .status(409)
      .json({
        data: [],
        message: "Invalid request, one or multiple fields are missing.",
      });
  }

  // AWS image upload code
  if (req.files) {
    var name = `screenSaver/` + Date.now() + `-${req.files.files.name}`;
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
      Body: bufferToStream(req.files.files.data),
      Key: name,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        res
          .status(409)
          .json({
            message: "Error occured while trying to upload to S3 bucket",
          });
      }
    });
  }

  const screenSaverObj = {
    location_id: location_id,
    company_id: company_id,
    name: name,
    title: title,
    type: type,
  };

  try {
    const screenSaver = new ScreenSaverData(screenSaverObj);
    await screenSaver.save();
    res
      .status(201)
      .json({
        data: screenSaver,
        message: "Screen Saver Created Successfully !!",
      });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

// update screen saver
export const editScreenSaver = async (req, res) => {
  const company_id = req.body.company_id;
  const location_id = req.body.location_id.split(",");
  var name = req.body.name;
  const title = req.body.title;
  const type = req.body.type;
  const _id = req.body._id;
  if (!company_id) {
    res.status(409).json({ data: [], message: "Please add company_id " });
  }

  if (location_id.length == 0) {
    res.status(409).json({ data: [], message: "Please add location_id " });
  }
  if (!title || !type) {
    res
      .status(409)
      .json({
        data: [],
        message: "Invalid request, one or multiple fields are missing.",
      });
  }

  // AWS image upload code
  if (req.files) {
    var name = `screenSaver/` + Date.now() + `-${req.files.files.name}`;
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
      Body: bufferToStream(req.files.files.data),
      Key: name,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        res
          .status(409)
          .json({
            message: "Error occured while trying to upload to S3 bucket",
          });
      }
    });
  }
  // updated name only if name is there in request of there is image
  if (name) {
    var screenSaverObj = {
      location_id: location_id,
      company_id: company_id,
      name: name,
      title: title,
      type: type,
    };
  } else {
    var screenSaverObj = {
      location_id: location_id,
      company_id: company_id,
      title: title,
      type: type,
    };
  }

  try {
    await ScreenSaverData.findByIdAndUpdate(_id, screenSaverObj, { new: true });

    res
      .status(201)
      .json({
        data: screenSaverObj,
        message: "Screen Saver Updated Successfully !!",
      });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

// get screen saver data with post method
export const fetchScreenSaver = async (req, res) => {
  var company_id = req.body.company_id;

  const page = req.body.page ? req.body.page : 1;
  const limit = req.body.perPage ? parseInt(req.body.perPage) : 1;
  const skip = (page - 1) * limit;
  const filterGeneralSearch = req.body.filterGeneralSearch;
  const companyData = await CompanyData.findOne({ _id: company_id });
  var locationNames = [];
  const screenSaver = await ScreenSaverData.find({ company_id: company_id })
    .skip(skip)
    .limit(limit);
  const screenSaverCount = await ScreenSaverData.find({
    company_id: company_id,
  }).countDocuments();

  try {
    res
      .status(201)
      .json({
        data: screenSaver,
        totalCount: screenSaverCount,
        message: "Screen Saver Listed Successfully !!",
      });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

// delete screen saver data with post method
export const deleteScreenSaver = async (req, res) => {
  var id = req.body._id;
  await ScreenSaverData.findByIdAndRemove(id);

  try {
    res
      .status(201)
      .json({ data: [], message: "Screen Saver Removed Successfully !!" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

function bufferToStream(buffer) {
  var stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  return stream;
}
