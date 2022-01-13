import LocationData from "../models/LocationData.js";
import CompanyData from "../models/CompanyData.js";

import LocationSupportLogData from "../models/LocationSupportLogData.js";
import aws from "aws-sdk";
import { Readable } from "stream";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
export const createLocation = async (req, res) => {
  if (!req.body.name) {
    res
      .status(409)
      .json({
        message: "Invalid request, one or multiple fields are missing.",
      });
  }

  let imagePath = "";
  if (req.files.image) {
    imagePath = `location/` + Date.now() + `-${req.files.image.name}`;
    aws.config.update({
      accessKeyId: "AKIATVUCPHF35FWG7ZNI",
      secretAccessKey: "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",
      region: "us-east-1",
    });
    const s3 = new aws.S3();
    let params = {
      ACL: "public-read",
      Bucket: "sf-ratings-profile-image",
      Body: bufferToStream(req.files.image.data),
      Key: imagePath,
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

  // background image 
  let imagePathBackground = "";
  if (req.files.app_background_image) {
    imagePathBackground = `location_background/` + Date.now() + `-${req.files.app_background_image.name}`;
    aws.config.update({
      accessKeyId: "AKIATVUCPHF35FWG7ZNI",
      secretAccessKey: "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",
      region: "us-east-1",
    });
    const s3 = new aws.S3();
    let params = {
      ACL: "public-read",
      Bucket: "sf-ratings-profile-image",
      Body: bufferToStream(req.files.app_background_image.data),
      Key: imagePathBackground,
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
  // background image 
  var question_id = [];
  if (req.body.question_id.length > 0) {
    question_id = req.body.question_id.split(",");
  }

  var location_skills = [];
  if (req.body.location_skills.length > 0) {
    location_skills = req.body.location_skills.split(",");
  }

  var objFriends = {
    name: req.body.name,
    location_id: req.body.location_id,
    address_1: req.body.address_1,
    address_2: req.body.address_2,
    country_id: req.body.country_id,
    state_id: req.body.state_id,
    city: req.body.city,
    zipcode: req.body.zipcode,
    email: req.body.email,
    contact_no: req.body.contact_no,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    description: req.body.description,
    open_time: req.body.open_time,
    close_time: req.body.close_time,
    invoice_tag_id: req.body.invoice_tag_id,
    hardware_cost: req.body.hardware_cost,
    software_cost: req.body.software_cost,
    app_color: req.body.app_color,
    max_budget_customer_audit: req.body.max_budget_customer_audit,
    installation_cost: req.body.installation_cost,
    num_tablets: req.body.num_tablets,
    autoMail: req.body.autoMail,
    use_location_skills: req.body.useLocationSkills,
    categoryWiseSkill: req.body.categoryWiseSkill,
    showQRCode: req.body.showQRCode,
    multiLocation: req.body.multiLocation,
    showLocationManager: req.body.showLocationManager,
    allowFrequestRatings: req.body.allowFrequestRatings,
    customerAudit: req.body.customerAudit,
    image: imagePath,
    appPassword: req.body.app_password,
    language: req.body.language,
    question_id: question_id,
    location_skills: location_skills,
    hide_team: req.body.showTeam,
    multi_location_id : req.body.multi_location_id.split(","),
    app_background_image: imagePathBackground
  };

  CompanyData.findOneAndUpdate(
    { _id: req.body._id },
    { $push: { location: objFriends } },
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

  // Qr code generation
  const qrOption = {
    margin: 7,
    width: 175,
  };
  const qrString =
    process.env.BASE_URL_LOCAL + "/front/login?=" + req.body.location_id;
  const base64String = await QRCode.toDataURL(qrString, qrOption);
  var imgData = base64String;
  var base64Data = imgData.replace(/^data:image\/png;base64,/, "");
  var qr_image = `qrCode/` + `test.png`;
  var bf = Buffer.from(
    base64String.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  aws.config.update({
    accessKeyId: "AKIATVUCPHF35FWG7ZNI",
    secretAccessKey: "Bk500ixN5JrQ3IVldeSress9Q+dBPX6x3DFIL/qf",
    region: "us-east-1",
  });
  const s3 = new aws.S3();
  var params = {
    ACL: "public-read",
    Bucket: "sf-ratings-profile-image",
    Body: bf,
    Key: qr_image,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.log("Error occured while trying to upload to S3 bucket", err);
      res
        .status(409)
        .json({ message: "Error occured while trying to upload to S3 bucket" });
    }
  });

  // Qr code generation
};

export const getLocation = async (req, res) => {
  //res.send('THIS GOOD');
  try {
    const AllLocation = await LocationData.find();
    res.status(200).json(AllLocation);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const updateSingleLocation = async (req, res) => {
  const location = req.body;
  const id = req.body._id;
  const company_id = req.body.company_id;
  if (req.body.email) {
    await CompanyData.updateOne(
      { _id: company_id, "location._id": req.body._id },
      {
        $set: {
          "location.$.email": req.body.email,
        },
      }
    );
  } else if (req.body.contact_no) {
    await CompanyData.updateOne(
      { _id: company_id, "location._id": req.body._id },
      {
        $set: {
          "location.$.contact_no": req.body.contact_no,
        },
      }
    );
  }

  res.json({ message: "Location updated successfully." });
};

export const updateLocation = async (req, res) => {
  // if (!req.body.name || !req.body.company_id) {
  //     res.status(409).json({ message : 'Invalid request, one or multiple fields are missing.'});
  // }
  // try {
  const location = req.body;
  const id = req.body._id;
  const company_id = req.body.company_id;

  let imagePath = "";
  if (req.files) {
    imagePath = `location/` + Date.now() + `-${req.files.image.name}`;
    aws.config.update({
      accessKeyId: "AKIATVUCPHF35FWG7ZNI",
      secretAccessKey: "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",
      region: "us-east-1",
    });
    const s3 = new aws.S3();
    let params = {
      ACL: "public-read",
      Bucket: "sf-ratings-profile-image",
      Body: bufferToStream(req.files.image.data),
      Key: imagePath,
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
  // background image code starts
  let imagePathBackground = "";
  if (req.files) {
    imagePathBackground = `location_background/` + Date.now() + `-${req.files.app_background_image.name}`;
    aws.config.update({
      accessKeyId: "AKIATVUCPHF35FWG7ZNI",
      secretAccessKey: "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",
      region: "us-east-1",
    });
    const s3 = new aws.S3();
    let params = {
      ACL: "public-read",
      Bucket: "sf-ratings-profile-image",
      Body: bufferToStream(req.files.app_background_image.data),
      Key: imagePathBackground,
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
  //background image code ends 
  // Qr code generation
  const qrOption = {
    margin: 7,
    width: 175,
  };

  const qrString = "http://3.109.87.88/front/login?id=" + req.body.location_id;
  const base64String = await QRCode.toDataURL(qrString, qrOption);
  var imgData = base64String;
  var base64Data = imgData.replace(/^data:image\/png;base64,/, "");
  var qr_image = `qrCode/` + id + `.png`;
  var bf = Buffer.from(
    base64String.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  aws.config.update({
    accessKeyId: "AKIATVUCPHF35FWG7ZNI",
    secretAccessKey: "Bk500ixN5JrQ3IVldeSress9Q+dBPX6x3DFIL/qf",
    region: "us-east-1",
  });
  const s3 = new aws.S3();
  var params = {
    ACL: "public-read",
    Bucket: "sf-ratings-profile-image",
    Body: bf,
    Key: qr_image,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.log("Error occured while trying to upload to S3 bucket", err);
      res
        .status(409)
        .json({ message: "Error occured while trying to upload to S3 bucket" });
    }
  });

  // Qr code generation

  // autoMail:req.body.autoMail ,useLocationSkills:req.body.useLocationSkills , categoryWiseSkill:req.body.categoryWiseSkill ,showQRCode:req.body.showQRCode ,multiLocation:req.body.multiLocation ,showLocationManager:req.body.showLocationManager , allowFrequestRatings:req.body.allowFrequestRatings ,customerAudit:req.body.customerAudit,
  
  var question_id = [];
  if (req.body.question_id.length > 0) {
    question_id = req.body.question_id.split(",");
  }
  var location_skills = [];
  if (req.body.location_skills && req.body.location_skills.length > 0) {
    location_skills = req.body.location_skills.split(",");
  }
  await CompanyData.updateOne(
    { _id: company_id, "location._id": req.body._id },
    {
      $set: {
        "location.$.name": req.body.name,
        "location.$.address_1": req.body.address_1,
        "location.$.address_2": req.body.address_2,
        "location.$.country_id": req.body.country_id,
        "location.$.state_id": req.body.state_id,
        "location.$.city": req.body.city,
        "location.$.zipcode": req.body.zipcode,
        "location.$.contact_no": req.body.contact_no,
        "location.$.description": req.body.description,
        "location.$.open_time": req.body.open_time,
        "location.$.close_time": req.body.close_time,
        "location.$.invoice_tag_id": req.body.invoice_tag_id,
        "location.$.hardware_cost": req.body.hardware_cost,
        "location.$.software_cost": req.body.software_cost,
        "location.$.start_date": req.body.start_date,
        "location.$.autoMail": req.body.autoMail,
        "location.$.allowFrequestRatings": req.body.allowFrequestRatings,

        "location.$.multiLocation": req.body.multiLocation,
        "location.$.customerAudit": req.body.customerAudit,
        "location.$.multi_location_id": req.body.multi_location_id.length > 0  ? req.body.multi_location_id.split(",") : [],
        
        "location.$.email": req.body.email,
        "location.$.installation_cost": req.body.installation_cost,
        "location.$.longitude": req.body.longitude,
        "location.$.latitude": req.body.latitude,
        "location.$.num_tablets": req.body.num_tablets,
        "location.$.image": req.body.imagePath,
        "location.$.app_color": req.body.app_color,
        "location.$.max_budget_customer_audit":
          req.body.max_budget_customer_audit,
        "location.$.autoMail": req.body.autoMail,
        "location.$.showQRCode": req.body.showQRCode,
        "location.$.showLocationManager": req.body.showLocationManager,
        "location.$.appPassword": req.body.app_password,
        "location.$.language": req.body.language,
        "location.$.question_id": req.body.question_id,
        "location.$.location_skills": req.body.location_skills.length > 0  ? req.body.location_skills.split(",") : [] ,
        "location.$.use_location_skills": req.body.useLocationSkills ? req.body.useLocationSkills : '0',
        "location.$.hide_team": req.body.showTeam ? req.body.showTeam : '0',
      },
    }
  );
  res.json({ message: "Location updated successfully." });
  // below function can be used for optimization
  // if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);
  // const updatedLocation = { ...location, _id: req.body._id };
  // await LocationData.findByIdAndUpdate(req.body._id, updatedLocation, { new: true });
  // } catch (e) {
  //     res.status(209).json(e);
  // }
};

export const deleteLocation = async (req, res) => {
  const id = req.body._id;
  const company_id = req.body.company_id;
  console.log(id);

  await CompanyData.updateOne(
    { _id: company_id },
    { $pull: { location: { _id: id } } },
    function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log(success);
      }
    }
  );
  // below function can be used for optimization
  //if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);
  //await LocationData.findByIdAndRemove(id);

  res.json({ message: "Location deleted successfully." });
};

// Add Support Log of location
export const addDiscussLog = async (req, res) => {
  const data = req.body;
  const logObj = {
    location_id: data.location_id,
    text: data.text,
    option: data.option,
  };

  const log = new LocationSupportLogData(logObj);
  await log.save();
  res.json({ message: "Log added successfully" });
};

function bufferToStream(buffer) {
  var stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  return stream;
}

// Get Single Location
export const getSingleLocation = async (req, res) => {
  var id = req.body.location_id;
  var company_id = req.body.company_id;

  var company = await CompanyData.findOne({ _id: company_id });

  var locationData = [];
  var locationAllData = "";
  company.location.map( (location) => {
    location.qr_code = "";
    if (id == location._id) {
      location.qr_code = "qrcode/" + location._id + ".png";
      locationData.push(location);
      location.company_id = company._id ; 
      
      locationAllData = 
      {
        "_id": location._id,
        "question_id": location.question_id,
        "location_skills": location.location_skills,
        "multi_location_id": location.multi_location_id,
        "name": location.name,
        "location_id": location.location_id,
        "address_1": location.address_1,
        "address_2": location.address_2,
        "country_id": location.country_id,
        "state_id": location.state_id,
        "city": location.city,
        "zipcode": location.zipcode,
        "email": location.email,
        "contact_no": location.contact_no,
        "latitude": location.latitude,
        "longitude": location.longitude,
        "description": location.description,
        "open_time": location.open_time,
        "close_time": location.close_time,
        "invoice_tag_id": location._id,
        "hardware_cost": location.hardware_cost,
        "software_cost": location.software_cost,
        "app_color": location.app_color,
        "max_budget_customer_audit": location.max_budget_customer_audit,
        "installation_cost": location.installation_cost,
        "num_tablets": location.num_tablets,
        "autoMail": location.autoMail,
        "useLocationSkills": location.useLocationSkills,
        "categoryWiseSkill": location.categoryWiseSkill,
        "showQRCode": location.showQRCode,
        "multiLocation": location.multiLocation,
        "showLocationManager": location.showLocationManager,
        "allowFrequestRatings": location.allowFrequestRatings,
        "customerAudit": location.customerAudit,
        "image": location.image,
        "appPassword": location.appPassword,
        "language": location.language,
        "start_date": location.start_date,
        "useLocationSkills": location.use_location_skills,
        "company_id": company._id,
        "location_area_id": company._id,

      }
      res
        .status(201)
        .json({ data: locationAllData, message: "Location Details Successfully !!" });
    
    }
  })
  
};
  