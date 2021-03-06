import CompanyData from "../models/CompanyData.js";

export const getActionPlan = async (req, res) => {
  //res.send('THIS GOOD');
  //const  id  = req.body._id;
  try {
    //  const AllCompany = await CompanyData.find({"_id":id});
    // make it dynamic
    const AllCompany = await CompanyData.findOne({
      _id: "617fb45ad1bf0ec9a8cd3863",
    });

    console.log(AllCompany);
    res.status(200).json({ data: AllCompany.action_plan, message: "Success" });
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