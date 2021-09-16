import CompanyData from '../models/CompanyData.js';
import {Messages, MesssageProvider} from "../core/index.js";


export const getAbusiveWords = async (req,res) => {
    const  id  = req.body._id;
    const companyId = req.query.company_id;
    if (!companyId) {
        res.status(500).json({message : MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND)});
    }
    console.log('companyId', companyId);
    try {
      //  const AllCompany = await CompanyData.find({"_id":id});
      // make it dynamic
      const company = await CompanyData.findOne(  {"_id":companyId}, {abusive_word: 1});
        res.status(200).json(company.abusive_word ? company.abusive_word : []);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}

export const createAbusiveWords = async(req,res) => {
    const companyId = req.body.company_id;
    if (!companyId) {
        res.status(500).json({message : MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND)});
    }
    var objFriends = { word:req.body.word};
    // make it dynamic
    CompanyData.findOneAndUpdate(
       { _id: companyId },
       { $push: { abusive_word: objFriends  } },
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

export const deleteAbusiveWords = async(req,res) => {

   const  id  = req.body._id;
    const companyId = req.body.company_id;
    if (!companyId) {
        res.status(500).json({message : MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND)});
    }

    // const Company = await CompanyData.findOneAndUpdate({"_id":"6111149b961aa70d06fe58f1"});
    // CompanyData.update( {"_id":"6111149b961aa70d06fe58f1"}, { $pull: { votes: { $gte: 6 } } } )
    // make it dynamic
    await CompanyData.updateOne(
       { _id: companyId },
         { $pull: { abusive_word: { _id: id } } } ,
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
