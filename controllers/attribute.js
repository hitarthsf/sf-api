import CompanyData from "../models/CompanyData.js";

//Action : getAttribute
//Comment : Get all attributes for Company
export const getAttribute = async (req, res) => {
  const id = req.body.company_id;
  try {
    const AllCompany = await CompanyData.find({ _id: id });
    res.status(200).json(AllCompany);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//Action : addAttribute
//Comment : Add New Attribute In Company
export const addAttribute = async (req, res) => {
  const compId = req.body.company_id;
  const positiveSkills = req.body.positiveSkills.split(",").map((skill) => {
    return { name: skill };
  });
  const negativeSkills = req.body.negativeSkills.split(",").map((skill) => {
    return { name: skill };
  });
  var objFriends = {
    name: req.body.name,
    positive_skills: positiveSkills,
    negative_skills: negativeSkills,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await CompanyData.findOneAndUpdate(
    { _id: compId },
    { $push: { attributes: objFriends } },
    function (error, success) {
      if (error) {
        res.status(409).json({ message: "Error in adding attribute" });
      } else {
        res.status(200).json({ message: "Attribute successfully added." });
      }
    }
  );
};

//Action : editAttribute
//Comment : Edit Attribute In Company
export const updateAttribute = async (req, res) => {
  const id = req.body._id;
  const compId = req.body.company_id;
  await CompanyData.updateOne(
    { _id: compId },
    { $pull: { attributes: { _id: id } } },
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
    name: req.body.name,
    positive_skills: req.body.positiveSkills.split(","),
    negative_skills: req.body.negativeSkills.split(","),
  };

  CompanyData.findOneAndUpdate(
    { _id: compId },
    { $push: { attributes: objFriends } },
    function (error, success) {
      if (error) {
        res.send(error);
      } else {
        res.send(success);
      }
    }
  );
};

//Action : deleteAttribute
//Comment : Delete Attribute In Company
export const deleteAttribute = async (req, res) => {
  const id = req.body._id;
  const compId = req.body.company_id;

  await CompanyData.updateOne(
    { _id: compId },
    { $pull: { attributes: { _id: id } } },
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

  res.json({ message: "Attribute deleted successfully." });
};
