import CategoryData from '../models/CategoryData.js';

export const createCategory = async(req,res) => {

   const category = req.body;

   const newCategory = new CategoryData({ ...category, createdAt: new Date().toISOString() });
   try {
       await newCategory.save()
       res.status(201).json(newCategory);
   } catch (error) {
       res.status(409).json({ message : error.message})
   }
}

export const getCategory = async (req,res) => {
    //res.send('THIS GOOD');
    try {
        const AllCategory = await CategoryData.find();
        res.status(200).json(AllCategory);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}

export const updateCategory = async (req, res) => {
    console.log(req.body)
    //const { id } = req.body._id;
    const category = req.body;
    
    // if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);

    const updatedCategory = { ...category, _id: req.body._id };

    await CategoryData.findByIdAndUpdate(req.body._id, updatedCategory, { new: true });

    res.json(updatedCategory);
    console.log(updatedCategory)
}

export const deleteCategory = async (req, res) => {
    console.log(req.body)
    const  id  = req.body._id;

    //if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);

    await CategoryData.findByIdAndRemove(id);

    res.json({ message: "Category deleted successfully." });
}