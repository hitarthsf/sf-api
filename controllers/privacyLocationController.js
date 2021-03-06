import CompanyData from "../models/CompanyData.js";

import { MesssageProvider, Messages } from "../core/index.js";
import _ from "lodash";
export const getPrivacyLocation = async (req, res) => {
  //res.send('THIS GOOD');
  const id = req.body._id;
  const companyId = req.query.company_id;
  if (!companyId) {
    res
      .status(500)
      .json({
        message: MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND),
      });
  }
  try {
    //  const AllCompany = await CompanyData.find({"_id":id});
    // make it dynamic
    const company = await CompanyData.findOne(
      { _id: companyId },
      { privacy_location: 1 }
    );
    const companyData = await CompanyData.findOne({ _id: companyId });
    const userLocationId = [];
    const responseData = await Promise.all(
      company.privacy_location.map(async (locationData) => {
        locationData.locationName = "";
        const fetchedLocation = _.find(companyData.location, (location) => {
          return location._id == locationData.location_id;
        });
        if (fetchedLocation) {
          locationData.location_id = fetchedLocation.name;
        }
      })
    );

    res
      .status(200)
      .json(company.privacy_location ? company.privacy_location : []);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createPrivacyLocation = async (req, res) => {
  console.log(req.body);

  const companyId = req.body.company_id;
  if (!companyId) {
    res
      .status(500)
      .json({
        message: MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND),
      });
  }

  var objFriends = { email: req.body.email, location_id: req.body.location_id };

  CompanyData.findOneAndUpdate(
    // make it dynamic
    { _id: req.body.company_id },
    { $push: { privacy_location: objFriends } },
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

export const deletePrivacyLocation = async (req, res) => {
  const id = req.body._id;

  const companyId = req.query.company_id;
  if (!companyId) {
    res
      .status(500)
      .json({
        message: MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND),
      });
  }

  // const Company = await CompanyData.findOneAndUpdate({"_id":"6111149b961aa70d06fe58f1"});
  // CompanyData.update( {"_id":"6111149b961aa70d06fe58f1"}, { $pull: { votes: { $gte: 6 } } } )
  // make it dynamic
  await CompanyData.updateOne(
    { _id: req.body.company_id },
    { $pull: { privacy_location: { _id: id } } },
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
