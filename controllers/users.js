import UsersData from '../models/UsersData.js';
import aws from 'aws-sdk';
import fs from 'fs';
import {Readable} from 'stream';

export const createUser = async(req,res) => {

   const user = req.body;
   if (!user.type) {
       res.status(409).json({ message : 'User type is missing.'});
   }
    if (!user.name || !user.email || !user.password) {
        res.status(409).json({ message : 'Invalid request, one or multiple fields are missing.'});
    }
   switch (user.type) {
       case 'manager':
            if (!user.location_area || !user.location || !user.company_id) {
                res.status(409).json({ message : 'Invalid request, one or multiple fields are missing.'});
            }
            break;
       case 'employee':
           if (!user.location_area || !user.location || !user.company_id) {
               res.status(409).json({ message : 'Invalid request, one or multiple fields are missing.'});
           }
           break;
       case 'admin':
           if (!user.location_area || !user.company_id) {
               res.status(409).json({ message : 'Invalid request, one or multiple fields are missing.'});
           }
           break;
   }
   if (req.body.location_id) {
        user.location_id = req.body.location_id.split(',');
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
    const  type  = req.body.type;
    //res.send('THIS GOOD');
    try {
        const AllUser = await UsersData.find().where('type').equals(type);
        res.status(200).json(AllUser);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}

export const updateUser = async (req, res) => {
    console.log(req.body)
    //const { id } = req.body._id;
    const user = req.body;
    // if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);
    const updatedUser = { ...user, _id: req.body._id };

    await UsersData.findByIdAndUpdate(req.body._id, updatedUser, { new: true });

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
