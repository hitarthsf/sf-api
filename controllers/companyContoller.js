import CompanyData from "../models/CompanyData.js";
import { MesssageProvider, Messages } from "../core/index.js";
import aws from "aws-sdk";
import { Readable } from "stream";
import jwt from "jsonwebtoken";

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

export const getCompany = async (req, res) => {
  //res.send('THIS GOOD');
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

/// get Compaany list
export const getCompanyGet = async (req, res) => {
  //res.send('THIS GOOD');
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

export const getLocationListPost = async (req, res) => {
  //res.send('THIS GOOD');
  const id = req.body._id;
  try {
    const AllCompany = await CompanyData.findOne({ _id: id });
    const companyList = [];
    // if (fetchedLocations.location !== undefined && fetchedLocations.location) {
    //     fetchedLocations.location.map((location) => {
    //         companyList.push({
    //             _id: location._id,
    //             name: location.name,
    //         });
    //     });
    // }

    res.status(200).json(AllCompany);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getLocation = async (req, res) => {
  //res.send('THIS GOOD');
  const id = req.body._id;
  try {
    const AllCompany = await CompanyData.findOne({ _id: id }, { location: 1 });
    // const companyList = [];
    // if (fetchedLocations.location !== undefined && fetchedLocations.location) {
    //     fetchedLocations.location.map((location) => {
    //         companyList.push({
    //             _id: location._id,
    //             name: location.name,
    //         });
    //     });
    // }
    res.status(200).json(companyList);
    res.status(200).json(AllCompany);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateCompany = async (req, res) => {
  console.log(req.body);
  //const { id } = req.body._id;
  const company = req.body;

  // if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);

  company.image = "";
  if (req.files) {
    company.image = `company/` + Date.now() + `-${req.files.image.name}`;
    aws.config.update({
      accessKeyId: "AKIATVUCPHF35FWG7ZNI",
      secretAccessKey: "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",
      region: "us-east-1",
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
export const updateLocation = async (req, res) => {
  console.log(req.body);

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
    image: qr_image,
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
};

export const deleteCompany = async (req, res) => {
  console.log(req.body);
  const id = req.body._id;

  //if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);

  await CompanyData.findByIdAndRemove(id);

  res.json({ message: "Company deleted successfully." });
};

export const migration = async (req, res) => {
  const id = req.body._id;

  const Company = await CompanyData.findOneAndUpdate({
    _id: "610c11a6abe1ca0797648fc5",
  });
  CompanyData.update(
    { _id: "610c11a6abe1ca0797648fc5" },
    { $pull: { votes: { $gte: 6 } } }
  );
  await CompanyData.update(
    { _id: "610c11a6abe1ca0797648fc5" },
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
};

export const getActionPlan = async (req, res) => {
  //res.send('THIS GOOD');
  const id = req.body._id;
  try {
    //  const AllCompany = await CompanyData.find({"_id":id});
    const AllCompany = await CompanyData.find({
      _id: "6111149b961aa70d06fe58ed",
    });
    res.status(200).json(AllCompany);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
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

function bufferToStream(buffer) {
  var stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  return stream;
}

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
