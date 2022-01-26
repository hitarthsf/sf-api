import CategoryData from "../models/CategoryData.js";

export const createCategory = async (req, res) => {
  const name = req.body.name;
  const company_id = req.body.company_id;
  const newCategory = {
    company_id: company_id,
    name: name,
  };

  const category = new CategoryData(newCategory);

  try {
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const getCategory = async (req, res) => {
  //res.send('THIS GOOD');
  const page = req.body.page ? req.body.page : 1;
  const limit = req.body.perPage ? parseInt(req.body.perPage) : 1;
  const skip = (page - 1) * limit;
  const filterGeneralSearch = req.body.filterGeneralSearch;
  try {
    if( filterGeneralSearch )
    {
      const AllCategory = await CategoryData.find({
        company_id: req.body.company_id,
        name: { $regex: ".*" + filterGeneralSearch + ".*" },
      })
        .skip(skip)
        .limit(limit);

        const AllCategoryConut = await CategoryData.find({
          company_id: req.body.company_id,
          name: { $regex: ".*" + filterGeneralSearch + ".*" },
        }).countDocuments();

          res
          .status(200)
          .json({
            data: AllCategory,
            totalCount: AllCategoryConut,
            message: "Category Listing !!",
          });
        
    }
    else{
      const AllCategory = await CategoryData.find({
        company_id: req.body.company_id
      })
        .skip(skip)
        .limit(limit);

        const AllCategoryConut = await CategoryData.find({
          company_id: req.body.company_id,
          
        })
          .countDocuments();
          res
          .status(200)
          .json({
            data: AllCategory,
            totalCount: AllCategoryConut,
            message: "Category Listing !!",
          });
    }
    
    
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const name = req.body.name;
  const company_id = req.body.company_id;
  const updatedCategory = {
    company_id: company_id,
    name: name,
  };

  await CategoryData.findByIdAndUpdate(req.body._id, updatedCategory, {
    new: true,
  });
  res.status(201).json(updatedCategory);
};

export const deleteCategory = async (req, res) => {
  const id = req.body._id;

  await CategoryData.findByIdAndRemove(id);

  res.json({ message: "Category deleted successfully." });
};
