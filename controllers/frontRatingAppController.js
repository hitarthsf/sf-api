import UsersData from "../models/UsersData.js";
import CompanyData from "../models/CompanyData.js";

import _ from "lodash";

export const locationLogin = async (req, res) => {
  const locationId = req.body.locationId;
  console.log(locationId);
  const allCompany = await CompanyData.find();

  // check location from comapny data
  if (allCompany.length > 0) {
    allCompany.map(async (company) => {
      const fetchedLocation = _.find(company.location, (location) => {
        location.companyId = "";
        if (location.location_id != "" && location.location_id == locationId ) {
          location.companyId = company._id;
          location.location_area_id = company._id;
          res.status(200).json(location);
        }
      });
    });
  }
  res.status(500).json({ message: "Invalid Locaiton ID" });
};

export const getSkills = async (req, res) => {
  const companyId = req.body.companyId;
  const locationId = req.body.locationId;
  const type = req.body.type;

  const companyData = await CompanyData.findOne({ _id: companyId });
  var locationData  = ""; 
  const dataLocation = await companyData.location.forEach((locations) => { if (locationId == locations._id) { locationData = locations }   }); 
<<<<<<< HEAD:controllers/frontRatingApp.js
=======
  
  
  
>>>>>>> 00ad4a55785ad2c94201b543266fa8100e4d6156:controllers/frontRatingAppController.js
  // check skills from comapny data
  var skills = [];
  if (type == "positive") {
    const data = await companyData.attributes.forEach((attribute) => {
      
      let matchingObj = _.find(attribute.positive_skills, (skill) => {
        if ( locationData.use_location_skills == "1" )
        { 
          if (locationData.location_skills.includes(skill._id))
          {
            skills.push(skill);  
          }
        }
        else
        {
          skills.push(skill);  
        }
<<<<<<< HEAD:controllers/frontRatingApp.js
=======
        
>>>>>>> 00ad4a55785ad2c94201b543266fa8100e4d6156:controllers/frontRatingAppController.js
      });
    });
  } else {
    const data = await companyData.attributes.forEach((attribute) => {
      var count = 0;
      let matchingObj = _.find(attribute.negative_skills, (skill) => {
<<<<<<< HEAD:controllers/frontRatingApp.js
=======
        console.log(skill._id)
>>>>>>> 00ad4a55785ad2c94201b543266fa8100e4d6156:controllers/frontRatingAppController.js
        if ( locationData.use_location_skills == "1" )
        {
          if (locationData.location_skills.includes(skill._id))
          {
            skills.push(skill);  
          }
        }
        else
        {
          skills.push(skill);  
        }
      });
    });
  }

  res.status(200).json(skills);
};

export const getEmployee = async (req, res) => {
  const companyId = req.body.companyId;
  const locationId = req.body.locationId;
  const type = req.body.type.split(",");

  let allUser = [];
  if (locationId) {
    allUser = await UsersData.find({
      type: { $in: type },
      location_id: { $in: [locationId] },
    });
  } else if (companyId) {
    allUser = await UsersData.find({
      type: type,
      company_id: companyId,
    });
  } else {
    allUser = await UsersData.find().where("type").equals(type);
  }
  res.status(200).json(allUser);
};
