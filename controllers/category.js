import CategoryData from '../models/CategoryData.js';

export const createCategory = async(req,res) => {

   
   const name       = req.body.name ;
   const company_id = req.body.company_id ;
   const newCategory = {
        company_id:     company_id,
        name:           name
    };

   const category = new CategoryData(newCategory);
        
   try {
       await category.save()
       res.status(201).json(category);
   } catch (error) {
       res.status(409).json({ message : error.message})
   }
}

export const getCategory = async (req,res) => {
    //res.send('THIS GOOD');
    try {
        const AllCategory = await CategoryData.find({"company_id":req.body.company_id});
        res.status(200).json(AllCategory);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}

export const updateCategory = async (req, res) => {
    
    const name       = req.body.name ;
    const company_id = req.body.company_id ;
    const updatedCategory = {
        company_id:     company_id,
        name:           name
    };
    

    await CategoryData.findByIdAndUpdate(req.body._id, updatedCategory, { new: true });
    res.status(201).json(updatedCategory);
    
}

export const deleteCategory = async (req, res) => {
    
    const  id  = req.body._id;

    await CategoryData.findByIdAndRemove(id);

    res.json({ message: "Category deleted successfully." });
}