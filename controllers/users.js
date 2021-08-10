import UsersData from '../models/UsersData.js';

export const createUser = async(req,res) => {

   const user = req.body;

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