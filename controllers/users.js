import UsersData from '../models/UsersData.js';
import CompanyData from '../models/CompanyData.js';
import aws from 'aws-sdk';
import fs from 'fs';
import {Readable} from 'stream';
import _ from "lodash";

export const createUser = async(req,res) => {

    const user = req.body;
    if (!user.type) {
       res.status(409).json({ message : 'User type is missing.'});
    }
    if (user.type.includes(['super_admin', 'area_manager', 'location_manager', 'employee'])) {
        res.status(409).json({ message : 'Invalid user type is passed.'});
    }
    if (!user.name || !user.email || !user.password) {
        res.status(409).json({ message : 'Invalid request, one or multiple fields are missing.'});
    }
   switch (user.type) {
       case 'location_manager':
            if (!user.location_area || !user.location_id || !user.company_id ) {
                res.status(409).json({ message : 'Invalid request, one or multiple fields are missing.'});
            }
            break;
       case 'employee':
           if (!user.location_area || !user.location || !user.company_id) {
               res.status(409).json({ message : 'Invalid request, one or multiple fields are missing.'});
           }
           break;
       case 'area_manager':
           if (!user.location_area || !user.location_area || !user.company_id) {
               res.status(409).json({ message : 'Invalid request, one or multiple fields are missing.'});
           }
           break;
   }
   if (req.body.location_id) {
        user.location_id = req.body.location_id.split(',');
   }
   if (req.body.location) {
        user.location_id = req.body.location.split(',');
   }
   const userCheck = await UsersData.findOne({
       email: user.email
   });
   if (userCheck) {
       res.status(409).json({ message : 'User already exist with the same email.'});
   }
   user.image = '';
   if (req.files) {
       user.image = `userAvatar/` + Date.now() + `-${req.files.image.name}`;
       aws.config.update({
           accessKeyId: "AKIATVUCPHF35FWG7ZNI",
           secretAccessKey: "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",
           region: "us-east-1"
       });
       const s3 = new aws.S3();
       var params = {
           ACL: 'public-read',
           Bucket: "sf-ratings-profile-image",
           Body: bufferToStream(req.files.image.data),
           Key: user.image
       };

       s3.upload(params, (err, data) => {
           if (err) {
               console.log('Error occured while trying to upload to S3 bucket', err);
               res.status(409).json({ message : 'Error occured while trying to upload to S3 bucket'});
           }
       });
   }

   const newUser = new UsersData({ ...user, createdAt: new Date().toISOString() });
   try {
       await newUser.save()
       res.status(201).json(newUser);
   } catch (error) {
       res.status(409).json({ message : error.message})
   }
}

export const getUser = async (req,res) => {
   // console.log(req.body)
    const  type         = req.body.type;
    const  company_id   = req.body.company_id;
    const  page         = req.body.page;
    const  perPage      = parseInt(req.body.perPage) ; 
    const  showTotalCount = req.body.showTotalCount ;  
    const filterGeneralSearch = req.body.filterGeneralSearch ;  


    if (page)
    {
        var offSet = (perPage * page ) - perPage ; 
    }   
    
    try {
        if ( company_id &&  filterGeneralSearch )
        {

            var AllUser = await UsersData.find({
                                                "$or": [
                                                {"name": {$regex: ".*" + filterGeneralSearch + ".*"}}, 
                                                {"email": {$regex: ".*" + filterGeneralSearch + ".*"}},
                                                {"phone": {$regex: ".*" + filterGeneralSearch + ".*"}}
                                                ]
                                            }).where("company_id").equals(company_id).where('type').equals(type).where('company_id').equals(company_id).skip(offSet).limit(perPage);    
            var AllUserCount = await UsersData.find({
                                                "$or": [
                                                {"name": {$regex: ".*" + filterGeneralSearch + ".*"}}, 
                                                {"email": {$regex: ".*" + filterGeneralSearch + ".*"}},
                                                {"phone": {$regex: ".*" + filterGeneralSearch + ".*"}}
                                                ]
                                            }).where("company_id").equals(company_id).where('type').equals(type).where('company_id').equals(company_id).countDocuments();       
            
        }
        else if ( company_id)
        {
            var AllUser = await UsersData.find({"company_id" : company_id}).where('type').equals(type).skip(offSet).limit(perPage);    
            var AllUserCount = await UsersData.find({"company_id" : company_id}).where('type').equals(type).countDocuments();    
            
        }
        else
        {
            var AllUser = await UsersData.find().where('type').equals(type).skip(offSet).limit(perPage);    
            var AllUserCount = await UsersData.find().where('type').equals(type).countDocuments();    
        }
        if (showTotalCount == "true") 
        {
            res.status(200).json({"Alluser" :AllUser , "totalCount" : AllUserCount});    
        }
        else
        {
            res.status(200).json(AllUser);    
        }
        
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}

export const singleUser = async (req,res) => {
    //console.log(req.body)
    const  id  = req.query.id;

    try {
        const User = await UsersData.find().where('_id').equals(id);
        res.status(200).json(User);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}

export const updateUser = async (req, res) => {
    console.log(req.body)
    //const { id } = req.body._id;
    const user = req.body;
    // if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);
     user.image = '';
     if (req.body.location) {
        user.location_id = req.body.location.split(',');
   }
   if (req.files) {
       user.image = `userAvatar/` + Date.now() + `-${req.files.image.name}`;
       aws.config.update({
           accessKeyId: "AKIATVUCPHF35FWG7ZNI",
           secretAccessKey: "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",
           region: "us-east-1"
       });
       const s3 = new aws.S3();
       var params = {
           ACL: 'public-read',
           Bucket: "sf-ratings-profile-image",
           Body: bufferToStream(req.files.image.data),
           Key: user.image
       };

       s3.upload(params, (err, data) => {
           if (err) {
               console.log('Error occured while trying to upload to S3 bucket', err);
               res.status(409).json({ message : 'Error occured while trying to upload to S3 bucket'});
           }
       });
   }
    const updatedUser = { ...user, _id: req.body._id };


    await UsersData.findByIdAndUpdate(req.body._id, updatedUser, { new: true });
console.log('updatedUser', updatedUser);
    res.json(updatedUser);
    console.log(updatedUser)
}
export const deleteUser = async (req, res) => {
    console.log(req.body)
    const  id  = req.body._id;

    //if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);

    await UsersData.findByIdAndRemove(id);

    res.json({ message: "User deleted successfully." });
}

export const checkUserHasCompanyAccess = async (req) => {

}

function bufferToStream(buffer) {
    var stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    return stream;
}

export const uploadPhoto = async (req, res) => {
    aws.config.update({
        accessKeyId: "AKIATVUCPHF35FWG7ZNI",
        secretAccessKey: "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",
        region: "us-east-1"
    });
    const s3 = new aws.S3();
    var params = {
        ACL: 'public-read',
        Bucket: "sf-ratings-profile-image",
        Body: bufferToStream(req.files.image.data),
        Key: `userAvatar/${req.files.image.name}`
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.log('Error occured while trying to upload to S3 bucket', err);
        }

        if (data) {
            console.log('locationUrl', key);
            res.json({ message: "User photo uploaded successfully." });
        }
    });
}

export const getUsersByType = async (req,res) => {
    const  type  = req.query.type;
    const companyId = req.query.company_id;
    const locationId = req.query.location_id
    if (!type) {
        res.status(409).json({ message : 'type is mandatory field.'});
    }
    try {
        let allUser = [];
        if (locationId) {
            allUser = await UsersData.find({
                "location_id": {$in: [locationId]}
            });
        } else if(companyId) {
            allUser = await UsersData.find({
                type: type,
                company_id: companyId,
            });
        } else {
            allUser = await UsersData.find().where('type').equals(type);
        }
        res.status(200).json(allUser);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}

export const getLocationIdByUser = async (req,res) => {
    const id  = req.query.id;
    
    if (!id) {
        res.status(409).json({ message : 'id is mandatory field.'});
    }

    var user = await UsersData.findOne({_id : id });

    switch (user.type) {
       case 'super_admin':
            var company = await CompanyData.findOne({_id : '617fb45ad1bf0ec9a8cd3863' });
            var location_id = [];
            var fetchedLocation = _.find(company.location, (location) => {

                        location_id.push(location._id);
                        
                    });

            res.status(200).json({"loaction_id": location_id.join(",") , "company_id": "617fb45ad1bf0ec9a8cd3863"});    
            break;

       case 'area_manager':
            var company = await CompanyData.findOne({_id : user.company_id });
            var location_id = [];
            var fetchedLocation =await _.find(company.location, (location) => {
                
                        location_id.push(location._id);
                        
                    });

            res.status(200).json({"loaction_id": location_id.join(",") , "company_id": user.company_id });
            break;

       default:
           res.status(200).json({"loaction_id": user.location_id.join(",") , "company_id": user.company_id}); 
           break;
   }
   

}
// Get Location Name and Id By User ID
export const getLocationByUser = async (req,res) => {
    const id  = req.query.id;
    
    if (!id) {
        res.status(409).json({ message : 'id is mandatory field.'});
    }

    var user = await UsersData.findOne({_id : id });
    var userLocation = [];
    switch (user.type) {
       case 'super_admin':
            var company = await CompanyData.findOne({_id : '617fb45ad1bf0ec9a8cd3863' });

            var fetchedLocation = _.find(company.location, (location) => {
                        var objLocation = {"_id":location._id,"name" : location.name} ;
                        userLocation.push(objLocation);
                        
                    });

            res.status(200).json(userLocation );    
            break;

       case 'area_manager':
            var company = await CompanyData.findOne({_id : user.company_id });
            
            var fetchedLocation = await _.find(company.location, (location) => {
                
                        var objLocation = {"_id":location._id,"name" : location.name} ;
                        userLocation.push(objLocation);
                        
                    });

            res.status(200).json( userLocation );
            break;

       default:
            var company = await CompanyData.findOne({_id : user.company_id });

           const responseData = await Promise.all(
                user.location_id.map(async (locationData) => {
                    const fetchedLocation = _.find(company.location, (location) => {

                        if (location._id == locationData)
                        {  
                            var objLocation = {"_id":location._id,"name" : location.name} ;
                            userLocation.push(objLocation);
                        }
                         
                    });
                   
                }),
            )
           res.status(200).json(userLocation ); 
           break;
   }
   

}



