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
  if (req.files) {
    imagePath = `location/` + Date.now() + `-${req.files.image.name}`;
    aws.config.update({
      accessKeyId: process.env.AWS_S3_API_KEY,
      secretAccessKey: process.env.AWS_S3_ACCESS_KEY,
      region: process.env.AWS_S3_ACCESS_REGION,
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
    useLocationSkills: req.body.useLocationSkills,
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
    accessKeyId: process.env.AWS_S3_API_KEY,
    secretAccessKey: process.env.AWS_S3_ACCESS_KEY,
    region: process.env.AWS_S3_ACCESS_REGION,
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
      accessKeyId: process.env.AWS_S3_API_KEY,
      secretAccessKey: process.env.AWS_S3_ACCESS_KEY,
      region: process.env.AWS_S3_ACCESS_REGION,
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
    accessKeyId: process.env.AWS_S3_API_KEY,
    secretAccessKey: process.env.AWS_S3_ACCESS_KEY,
    region: process.env.AWS_S3_ACCESS_REGION,
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
    installation_cost: req.body.installation_cost,
    num_tablets: req.body.num_tablets,
    image: imagePath,
    autoMail: req.body.autoMail,
  };

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
        "location.$.location_skills": req.body.location_skills,
      },
    }
  );
  res.json({ message: "Location updated successfully." });
};

export const deleteLocation = async (req, res) => {
  const id = req.body._id;
  const company_id = req.body.company_id;

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
  const responseData = await Promise.all(
    company.location.map(async (location) => {
      location.qr_code = "";
      if (id == location._id) {
        location.qr_code = "qrcode/" + location._id + ".png";
        locationData.push(location);
      }
    })
  );
  const make = "Ford";
  const model = "Mustang";
  const car = { make, model };
  console.log(car);

  res
    .status(201)
    .json({ data: locationData, message: "Location Details Successfully !!" });
};
