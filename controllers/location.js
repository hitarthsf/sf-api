import LocationData from '../models/LocationData.js';
import CompanyData from '../models/CompanyData.js';

export const createLocation = async(req,res) => {

   console.log(req.body)
    
    var objFriends = { name:req.body.name,location_id:req.body.location_id,address_1:req.body.address_1,address_2:req.body.address_2, 
        country_id:req.body.country_id,state_id:req.body.state_id,city:req.body.city,zipcode:req.body.zipcode,email:req.body.email,contact_no:req.body.contact_no,
        latitude:req.body.latitude,longitude:req.body.longitude,description:req.body.description,open_time:req.body.open_time, close_time:req.body.close_time,
        invoice_tag_id:req.body.invoice_tag_id,hardware_cost:req.body.hardware_cost, software_cost:req.body.software_cost ,app_color:req.body.app_color,max_budget_customer_audit:req.body.max_budget_customer_audit ,
        installation_cost:req.body.installation_cost  ,installation_cost:req.body.installation_cost  ,num_tablets:req.body.num_tablets ,
        autoMail:req.body.autoMail ,useLocationSkills:req.body.useLocationSkills , categoryWiseSkill:req.body.categoryWiseSkill ,showQRCode:req.body.showQRCode ,
        multiLocation:req.body.multiLocation ,showLocationManager:req.body.showLocationManager , allowFrequestRatings:req.body.allowFrequestRatings ,customerAudit:req.body.customerAudit ,
    };
    
    CompanyData.findOneAndUpdate(
       { _id: req.body._id }, 
       { $push: { location: objFriends  } },
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

export const getLocation = async (req,res) => {
    //res.send('THIS GOOD');
    try {
        const AllLocation = await LocationData.find();
        res.status(200).json(AllLocation);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}
export const updateLocation = async (req, res) => {
    console.log(req.body)
    
    const location = req.body;
    const  id  = req.body._id;
    //delete
    await CompanyData.updateOne(
       { _id: "6111149b961aa70d06fe58ed" }, 
         { $pull: { location: { _id: id } } } ,
      function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log(success);
            }
        });
    
    
    // add 
    var objFriends = { name:req.body.name,location_id:req.body.location_id,address_1:req.body.address_1,address_2:req.body.address_2, 
        country_id:req.body.country_id,state_id:req.body.state_id,city:req.body.city,zipcode:req.body.zipcode,email:req.body.email,contact_no:req.body.contact_no,
        latitude:req.body.latitude,longitude:req.body.longitude,description:req.body.description,open_time:req.body.open_time, close_time:req.body.close_time,
        invoice_tag_id:req.body.invoice_tag_id,hardware_cost:req.body.hardware_cost, software_cost:req.body.software_cost ,app_color:req.body.app_color,max_budget_customer_audit:req.body.max_budget_customer_audit ,
        installation_cost:req.body.installation_cost  ,installation_cost:req.body.installation_cost  ,num_tablets:req.body.num_tablets ,
        autoMail:req.body.autoMail ,useLocationSkills:req.body.useLocationSkills , categoryWiseSkill:req.body.categoryWiseSkill ,showQRCode:req.body.showQRCode ,
        multiLocation:req.body.multiLocation ,showLocationManager:req.body.showLocationManager , allowFrequestRatings:req.body.allowFrequestRatings ,customerAudit:req.body.customerAudit ,
    };
    
    CompanyData.findOneAndUpdate(
       { _id: "6111149b961aa70d06fe58ed"}, 
       { $push: { location: objFriends  } },
      function (error, success) {
            if (error) {
                console.log(error);
                res.send(error)
            } else {
                console.log(success);
                res.send(success)
            }
        });


    // below function can be used for optimization 
    // if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);
    // const updatedLocation = { ...location, _id: req.body._id };
    // await LocationData.findByIdAndUpdate(req.body._id, updatedLocation, { new: true });

    res.json(updatedLocation);
    console.log(updatedLocation)
}

export const deleteLocation = async (req, res) => {
    
    const  id  = req.body._id;
    console.log(id)
    
    await CompanyData.updateOne(
       { _id: "6111149b961aa70d06fe58ed" }, 
         { $pull: { location: { _id: id } } } ,
      function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log(success);
            }
        });
    // below function can be used for optimization 
    //if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);
    //await LocationData.findByIdAndRemove(id);

    res.json({ message: "Location deleted successfully." });
}