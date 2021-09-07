
import CompanyData from '../models/CompanyData.js';


export const getAbusiveWords = async (req,res) => {
    //res.send('THIS GOOD');
    const  id  = req.body._id;
    try {
      //  const AllCompany = await CompanyData.find({"_id":id});
      // make it dynamic
      const AllCompany = await CompanyData.find(  {"_id":"6111149b961aa70d06fe58ed"} ,{ $lookup:
           {
             from: 'location',
             localField: 'ObjectId(location_id)',
             foreignField: 'ObjectId(_id)',
             as: 'location_name'
           }});
      console.log(AllCompany);
        res.status(200).json(AllCompany);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}

export const createAbusiveWords = async(req,res) => {

   console.log(req.body)
    
    var objFriends = { word:req.body.word};
    // make it dynamic
    CompanyData.findOneAndUpdate(
       { _id: "6111149b961aa70d06fe58ed" }, 
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
    
    // const Company = await CompanyData.findOneAndUpdate({"_id":"6111149b961aa70d06fe58f1"});
    // CompanyData.update( {"_id":"6111149b961aa70d06fe58f1"}, { $pull: { votes: { $gte: 6 } } } )
    // make it dynamic
    await CompanyData.updateOne(
       { _id: "6111149b961aa70d06fe58ed" }, 
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