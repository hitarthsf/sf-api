import CompanyData from "../models/CompanyData.js";

export const getActionPlan = async (req, res) => {
  //res.send('THIS GOOD');
  const companyId = req.body.company_id;
  const page = req.body.page ? req.body.page : 1;
  var limit = req.body.perPage ? parseInt(req.body.perPage) : 1;
  const skip = (page - 1) * limit;
  limit = page * limit ;
  const filterGeneralSearch = req.body.filterGeneralSearch;
  try {
    
    //  const AllCompany = await CompanyData.find({"_id":id});
    // make it dynamic
    const AllCompany = await CompanyData.findOne({
      _id: req.body.company_id,
    });
    var actionPlan = [] ; 
    var count =  0  ; 
    await  AllCompany.action_plan.map( async ( plan ) => {  
      // getting the loop with conditions 
      if ( parseInt(count) >= parseInt(skip) && parseInt(count) < parseInt(limit)   ) 
      {
       
        var objPlan = { "_id" :plan._id , "title" : plan.title , "description" : plan.description , "is_active" :  plan.is_active   , "createdAt" : plan.createdAt  }
        actionPlan.push(objPlan); 
       
      }
      count = count + 1 ; 

    });
    
    res.status(200).json({ data: actionPlan, message: "Success" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const addActionPlan = async (req, res) => {
  var objFriends = {
    title: req.body.title,
    description: req.body.description,
    is_active: req.body.is_active,
  };
  // make it dynamic
  CompanyData.findOneAndUpdate(
    { _id: "617fb45ad1bf0ec9a8cd3863" },
    { $push: { action_plan: objFriends } },
    function (error, success) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        console.log(success);
        res.send(success);
      }
    }
  );
};

export const updateActionPlan = async (req, res) => {
  const id = req.body._id;
  // make it dynamic

  await CompanyData.updateOne(
    { _id: "617fb45ad1bf0ec9a8cd3863" },
    { $pull: { action_plan: { _id: id } } },
    { multi: true },
    function (error, success) {
      if (error) {
        console.log(error);
        // res.send(error)
      } else {
        console.log(success);
        // res.send(success)
      }
    }
  );

  var objFriends = {
    title: req.body.title,
    description: req.body.description,
    is_active: req.body.is_active,
  };
  // make it dynamic
  CompanyData.findOneAndUpdate(
    { _id: "617fb45ad1bf0ec9a8cd3863" },
    { $push: { action_plan: objFriends } },
    function (error, success) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        console.log(success);
        res.send(success);
      }
    }
  );
};

export const deleteActionPlan = async (req, res) => {
  const id = req.body._id;
  // make it dynamic
  await CompanyData.updateOne(
    { _id: req.body.company_id },
    { $pull: { action_plan: { _id: id } } },
    { multi: true },
    function (error, success) {
      if (error) {
        console.log(error);
        // res.send(error)
      } else {
        console.log(success);
        // res.send(success)
      }
    }
  );
  res.status(200).json({ data: [], message: "Action Plan Deleted" });
};


//Action : createActionPlanSkill
//Comment : Create Action Plan Skill Table 
export const createActionPlanSkill = async (req, res) => {

  const locationId  = req.body.location_id.split(",");
  const month       = req.body.month;
  const year        = req.body.year;


// Declaring match variable to match all the filters with proper conditions
const match = {};
// Location Filter
if (locationId) {
  match.location_id = { $in: locationId };
}
// month filter
if (month ) {
  match.created_at  =  { $month: month } ;
}
// year filter
// if (year ) {
//   match.created_at  =  { $year: year } ;
// }

var rating = await RatingData.aggregate([
  { $addFields: { ratingId: { $toString: "$_id" } } },

  {
    $match: match,
  },
  {
    $project: { _id: 1   },
  },
]);


const ratingIdArray = rating.map((ratingObj) => ratingObj._id.toString());

var skillRanks = await RatingSkillData.aggregate([
{
  $match: {
    rating_id: {
      $in: ratingIdArray,
    },
  },
},
{
  $group: {
    _id: "$skill_id",
    count: { $sum: 1 },
  },
},
{ $sort: { count: order } },
]);

}