
import CompanyData from '../models/CompanyData.js';


export const getAttribute = async (req,res) => {
    //res.send('THIS GOOD');
    const  id  = req.body._id;
    try {
      //  const AllCompany = await CompanyData.find({"_id":id});
      const AllCompany = await CompanyData.find({"_id":id});
      console.log(id);
        res.status(200).json(AllCompany);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}

export const addAttribute = async (req, res) => {
    
    const  compId  = req.body.compId;
    console.log(compId)
    var objFriends = { name:req.body.name,positive_skills: req.body.positiveSkills.split(","),negative_skills:req.body.negativeSkills.split(",")
    };
    console.log(objFriends);
    CompanyData.findOneAndUpdate(
       { _id: compId}, 
       { $push: { attributes: objFriends  } },
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

export const editAttribute = async (req, res) => {
    const  compId  = req.body.compId;
    console.log(compId)
    var objFriends = { name:req.body.name,positive_skills:req.body.positive_skills,negative_skills:req.body.negative_skills
    };
    console.log(objFriends);
   await CompanyData.findOneAndUpdate(
       { _id: compId }, 
       { $push: { attributes: objFriends  } },
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

export const updateAttribute = async (req, res) => {

     const  id  = req.body._id;
    const  compId  = req.body.compId;
    console.log(id);
    console.log(compId);
     await CompanyData.updateOne(
       { _id: compId }, 
         { $pull: { attributes: { _id: id } } } ,
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

    console.log(req.body.positive_skills)
    var objFriends = { name:req.body.name,positive_skills: req.body.positiveSkills.split(","),negative_skills:req.body.negativeSkills.split(",")
    };
    
    CompanyData.findOneAndUpdate(
       { "_id": compId }, 
       { $push: { attributes: objFriends  } },
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

export const deleteAttribute = async (req, res) => {
    const  id  = req.body._id;
    
    // const Company = await CompanyData.findOneAndUpdate({"_id":"6111149b961aa70d06fe58f1"});
    // CompanyData.update( {"_id":"6111149b961aa70d06fe58f1"}, { $pull: { votes: { $gte: 6 } } } )
    await CompanyData.updateOne(
       { _id: "6111149b961aa70d06fe58ef" }, 
         { $pull: { attributes: { _id: id } } } ,
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
    // const Attribute = Company.findOne( { _id: req.body.id}) 
   // await CompanyData.findOne(
   //     { _id: "610bcc0c029f5c040c655a12" },,
   //    function (error, success) {
   //          if (error) {
   //              console.log(error);
   //              res.send(error)
   //          } else {
   //              console.log(success);
   //              res.send(success)
   //          }
   //      });
   res.json({ message: "Attribute deleted successfully." });
    
}