
import CompanyData from '../models/CompanyData.js';


import {
    MesssageProvider,
    Messages,
} from '../core/index.js';

export const getPrivacyLocation = async (req,res) => {
    //res.send('THIS GOOD');
    const  id  = req.body._id;
    const company_id = req.body.company_id;
    try {
      //  const AllCompany = await CompanyData.find({"_id":id});
      // make it dynamic
      const AllCompany = await CompanyData.find({"_id":company_id});
      console.log(id);
        res.status(200).json(AllCompany);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}

export const createPrivacyLocation = async(req,res) => {

   console.log(req.body)
    
    var objFriends = { email:req.body.email , location_id:req.body.location_id};
    
    CompanyData.findOneAndUpdate(
        // make it dynamic
       { _id: req.body.company_id }, 
       { $push: { privacy_location: objFriends  } },
      function (error, success) {
            if (error) {
                console.log(error);
                res.send(error)
            } else {
                console.log(success);
                res.send(success)
            }
        });
    
}

export const deletePrivacyLocation = async(req,res) => {

   const  id  = req.body._id;
    
    // const Company = await CompanyData.findOneAndUpdate({"_id":"6111149b961aa70d06fe58f1"});
    // CompanyData.update( {"_id":"6111149b961aa70d06fe58f1"}, { $pull: { votes: { $gte: 6 } } } )
    // make it dynamic
    await CompanyData.updateOne(
       { _id: req.body.company_id }, 
         { $pull: { privacy_location: { _id: id } } } ,
         { multi: true },
      function (error, success) {
            if (error) {
                console.log(error);
                // res.send(error)
            } else {
                console.log(success);
                // res.send(success)
            }
        });
    
}