import CompanyData from "../models/CompanyData.js";

import { MesssageProvider, Messages } from "../core/index.js";
import _ from "lodash";
export const getPrivacyLocation = async (req, res) => {
  //res.send('THIS GOOD');
  const id = req.body.company_id;
  const page = req.body.page ? req.body.page : 1;
  var limit = req.body.perPage ? parseInt(req.body.perPage) : 1;
  const skip = (page - 1) * limit;
  limit = page * limit ;
  if (!id) {
    res
      .status(500)
      .json({
        message: MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND),
      });
  }
  try {
    const AllCompany = await CompanyData.findOne({ _id: id });
    var privacyLocationArray = [] ; 
    var count =  0  ; 
    
    
    await  AllCompany.privacy_location.map(async ( privacyLocation ) => {  
     
      // getting the loop with conditions 
      if ( parseInt(count) >= parseInt(skip) && parseInt(count) < parseInt(limit)   ) 
      {
      
        var privacyLocationObj = { "_id" :privacyLocation._id , "createdAt" : privacyLocation.createdAt  }
        privacyLocationArray.push(privacyLocationObj); 
       
      }
      count = count + 1 ; 
      
    } );   
      res.status(200).json({
        data: privacyLocationArray,
        totalCount: count,
        message: "Privacy Location!!",
      });

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
