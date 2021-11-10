import LocationData from '../models/LocationData.js';
import CompanyData from '../models/CompanyData.js';

import LocationSupportLogData from '../models/LocationSupportLogData.js';
import aws from "aws-sdk";
import {Readable} from "stream";

export const createLocation = async(req,res) => {

    if (!req.body.name) {
        res.status(409).json({ message : 'Invalid request, one or multiple fields are missing.'});
    }

    let imagePath = '';
    if (req.files) {
        imagePath = `location/` + Date.now() + `-${req.files.image.name}`;
        aws.config.update({
            accessKeyId: "AKIATVUCPHF35FWG7ZNI",
            secretAccessKey: "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",
            region: "us-east-1"
        });
        const s3 = new aws.S3();
        let params = {
            ACL: 'public-read',
            Bucket: "sf-ratings-profile-image",
            Body: bufferToStream(req.files.image.data),
            Key: imagePath
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.log('Error occured while trying to upload to S3 bucket', err);
                res.status(409).json({ message : 'Error occurred while trying to upload to S3 bucket'});
            }
        });
    }

    var objFriends = { name:req.body.name,location_id:req.body.location_id,address_1:req.body.address_1,address_2:req.body.address_2,
        country_id:req.body.country_id,state_id:req.body.state_id,city:req.body.city,zipcode:req.body.zipcode,email:req.body.email,contact_no:req.body.contact_no,
        latitude:req.body.latitude,longitude:req.body.longitude,description:req.body.description,open_time:req.body.open_time, close_time:req.body.close_time,
        invoice_tag_id:req.body.invoice_tag_id,hardware_cost:req.body.hardware_cost, software_cost:req.body.software_cost ,app_color:req.body.app_color,max_budget_customer_audit:req.body.max_budget_customer_audit ,
        installation_cost:req.body.installation_cost  ,num_tablets:req.body.num_tablets ,
        autoMail:req.body.autoMail ,useLocationSkills:req.body.useLocationSkills , categoryWiseSkill:req.body.categoryWiseSkill ,showQRCode:req.body.showQRCode ,
        multiLocation:req.body.multiLocation ,showLocationManager:req.body.showLocationManager , allowFrequestRatings:req.body.allowFrequestRatings ,customerAudit:req.body.customerAudit , image: imagePath
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

    if (!req.body.name || !req.body.company_id) {
        res.status(409).json({ message : 'Invalid request, one or multiple fields are missing.'});
    }

    const location = req.body;
    const  id  = req.body._id;
    const  company_id  = req.body.company_id;
    let imagePath = '';
    //delete
     // CompanyData.updateOne(
     //   { _id:company_id},
     //     { $pull: { location: { _id: id } } } ,
     //  function (error, success) {
     //        if (error) {
     //            console.log(error);
     //        } else {
     //            console.log(success);
     //        }
     //    });

    //  if (req.files) {
    //     imagePath = `location/` + Date.now() + `-${req.files.image.name}`;
    //     aws.config.update({
    //         accessKeyId: "AKIATVUCPHF35FWG7ZNI",
    //         secretAccessKey: "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",
    //         region: "us-east-1"
    //     });
    //     const s3 = new aws.S3();
    //     let params = {
    //         ACL: 'public-read',
    //         Bucket: "sf-ratings-profile-image",
    //         Body: bufferToStream(req.files.image.data),
    //         Key: imagePath
    //     };

    //     s3.upload(params, (err, data) => {
    //         if (err) {
    //             console.log('Error occured while trying to upload to S3 bucket', err);
    //             res.status(409).json({ message : 'Error occurred while trying to upload to S3 bucket'});
    //         }
    //     });
    // }


    // add
    var objFriends = { name:req.body.name,location_id:req.body.location_id,address_1:req.body.address_1,address_2:req.body.address_2,
        country_id:req.body.country_id,state_id:req.body.state_id,city:req.body.city,zipcode:req.body.zipcode,email:req.body.email,contact_no:req.body.contact_no,
        latitude:req.body.latitude,longitude:req.body.longitude,description:req.body.description,open_time:req.body.open_time, close_time:req.body.close_time,
        invoice_tag_id:req.body.invoice_tag_id,hardware_cost:req.body.hardware_cost, software_cost:req.body.software_cost ,app_color:req.body.app_color,max_budget_customer_audit:req.body.max_budget_customer_audit ,
        installation_cost:req.body.installation_cost  ,installation_cost:req.body.installation_cost  ,num_tablets:req.body.num_tablets ,
        autoMail:req.body.autoMail ,useLocationSkills:req.body.useLocationSkills , categoryWiseSkill:req.body.categoryWiseSkill ,showQRCode:req.body.showQRCode ,
        multiLocation:req.body.multiLocation ,showLocationManager:req.body.showLocationManager , allowFrequestRatings:req.body.allowFrequestRatings ,customerAudit:req.body.customerAudit     };

    CompanyData.findOneAndUpdate(
       { _id: company_id},
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
    res.json({ message: "Location updated successfully." });
    res.json(updatedLocation);
    console.log(updatedLocation)
}

export const deleteLocation = async (req, res) => {

    const  id  = req.body._id;
    const  company_id  = req.body.company_id;
    console.log(id)

    await CompanyData.updateOne(
       { _id: company_id },
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

// Add Support Log of location
export const addDiscussLog = async (req, res) => 
{
    const data = req.body;
    const logObj = {
        location_id: data.location_id,
        text: data.text,
        option: data.option,
    };

    const log = new LocationSupportLogData(logObj);
    await log.save();
       res.json({ message: "Log added successfully" });
}

    


function bufferToStream(buffer) {
    var stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    return stream;
}
