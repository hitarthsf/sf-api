import UsersData from '../models/UsersData.js';
import AWS from 'aws-sdk';

export const createUser = async(req,res) => {

   const user = req.body;
   if (req.body.location_id) {
        user.location_id = req.body.location_id.split(',');
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

export const uploadPhoto = async (req, res) => {
    // AWS.config.update({
    //     accessKeyId: "AKIATVUCPHF35FWG7ZNI", // Access key ID
    //     secretAccesskey: "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", // Secret access key
    //     region: "ap-south-1" //Region
    // })
    AWS.config = new AWS.Config();
    AWS.config.accessKeyId = "AKIATVUCPHF35FWG7ZNI";
    AWS.config.secretAccessKey = "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";
    // AWS.config.loadFromPath('./AwsConfig.json');
    const s3 = new AWS.S3();

    // Binary data base64
    const fileContent  = Buffer.from(req.files.image.data, 'binary');

    // Setting up S3 upload parameters
    const params = {
        Bucket: "sf-ratings-profile-image",
        Key: req.files.image.name, // File name you want to save as in S3
        Body: fileContent
    };
    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            res.json({ message: "User photo uploaded successfully." });
        }
        res.send({
            "response_code": 200,
            "response_message": "Success",
            "response_data": data
        });
    });
    res.json({ message: "User photo uploaded successfully." });
}
