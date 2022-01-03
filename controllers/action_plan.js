import CompanyData from "../models/CompanyData.js";

//Action : getActionPlan
//Comment : Get all Action Plans for Active Company
export const getActionPlan = async (req, res) => {
  try {
    const AllCompany = await CompanyData.findOne({
      _id: "617fb45ad1bf0ec9a8cd3863",
    });
    res.status(200).json({ data: AllCompany.action_plan, message: "Success" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//Action : addActionPlan
//Comment : Add new Action Plans for Active Company
export const addActionPlan = async (req, res) => {
  var objFriends = {
    title: req.body.title,
    description: req.body.description,
    is_active: req.body.is_active,
  };

  CompanyData.findOneAndUpdate(
    { _id: "617fb45ad1bf0ec9a8cd3863" },
    { $push: { action_plan: objFriends } },
    function (error, success) {
      if (error) {
        res.send(error);
      } else {
        res.send(success);
      }
    }
  );
};

//Action : updateActionPlan
//Comment : Update Action Plans for Active Company
export const updateActionPlan = async (req, res) => {
  const id = req.body._id;
  await CompanyData.updateOne(
    { _id: "617fb45ad1bf0ec9a8cd3863" },
    { $pull: { action_plan: { _id: id } } },
    { multi: true },
    function (error, success) {
      if (error) {
        //res.send(error)
      } else {
        //res.send(success)
      }
    }
  );

  var objFriends = {
    title: req.body.title,
    description: req.body.description,
    is_active: req.body.is_active,
  };
  
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

//Action : deleteActionPlan
//Comment : Delete Action Plan
export const deleteActionPlan = async (req, res) => {
  const id = req.body._id;
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
