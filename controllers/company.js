import CompanyData from '../models/CompanyData.js';

export const createCompany = async(req,res) => {

   const company = req.body;

   const newCompany = new CompanyData({ ...company, createdAt: new Date().toISOString() });
   try {
       await newCompany.save()
       res.status(201).json(newCompany);
   } catch (error) {
       res.status(409).json({ message : error.message})
   }
}

export const getCompany = async (req,res) => {
    //res.send('THIS GOOD');
    try {
        const AllCompany = await CompanyData.find();
        res.status(200).json(AllCompany);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}

export const getLocation = async (req,res) => {
    //res.send('THIS GOOD');
    const  id  = req.body._id;
    try {
        const AllCompany = await CompanyData.find({"_id":id});
        res.status(200).json(AllCompany);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}

export const updateCompany = async (req, res) => {
    console.log(req.body)
    //const { id } = req.body._id;
    const company = req.body;
    
    // if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);

    const updatedCompany = { ...company, _id: req.body._id };

    await CompanyData.findByIdAndUpdate(req.body._id, updatedCompany, { new: true });

    res.json(updatedCompany);
    console.log(updatedCompany)
}
export const updateLocation = async (req, res) => {
  //  console.log(req.body)
    var objFriends = { name:req.body.name,location_id:req.body.location_id,address_1:req.body.address_1,address_2:req.body.address_2, 
        country_id:req.body.country_id,state_id:req.body.state_id,city:req.body.city,zipcode:req.body.zipcode,email:req.body.email,contact_no:req.body.contact_no,
        latitude:req.body.latitude,longitude:req.body.longitude,description:req.body.description,open_time:req.body.open_time, close_time:req.body.close_time,
        invoice_tag_id:req.body.invoice_tag_id,hardware_cost:req.body.hardware_cost, software_cost:req.body.software_cost
    };
   await CompanyData.findOneAndUpdate(
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

export const deleteCompany = async (req, res) => {
    console.log(req.body)
    const  id  = req.body._id;

    //if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);

    await CompanyData.findByIdAndRemove(id);

    res.json({ message: "Company deleted successfully." });
}


export const migration = async (req, res) => {
    const  id  = req.body._id;
    
    const Company = await CompanyData.findOneAndUpdate({"_id":"610c11a6abe1ca0797648fc5"});
    CompanyData.update( {"_id":"610c11a6abe1ca0797648fc5"}, { $pull: { votes: { $gte: 6 } } } )
    await CompanyData.update(
       { _id: "610c11a6abe1ca0797648fc5" }, 
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
   

    
}

export const getActionPlan = async (req,res) => {
    //res.send('THIS GOOD');
    const  id  = req.body._id;
    try {
      //  const AllCompany = await CompanyData.find({"_id":id});
      const AllCompany = await CompanyData.find({"_id":"6111149b961aa70d06fe58ed"});
        res.status(200).json(AllCompany);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}
   