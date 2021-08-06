import LocationData from '../models/LocationData.js';

export const createLocation = async(req,res) => {

   const location = req.body;

   const newLocation = new LocationData({ ...location, createdAt: new Date().toISOString() });
   try {
       await newLocation.save()
       res.status(201).json(newLocation);
   } catch (error) {
       res.status(409).json({ message : error.message})
   }
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
    //const { id } = req.body._id;
    const location = req.body;
    
    // if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);

    const updatedLocation = { ...location, _id: req.body._id };

    await LocationData.findByIdAndUpdate(req.body._id, updatedLocation, { new: true });

    res.json(updatedLocation);
    console.log(updatedLocation)
}

export const deleteLocation = async (req, res) => {
    console.log(req.body)
    const  id  = req.body._id;

    //if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);

    await LocationData.findByIdAndRemove(id);

    res.json({ message: "Location deleted successfully." });
}