import CompanyData from "../models/CompanyData.js";

export const createSkillProfile = async (req, res) => {
  const skillProfileObj = {
    name: req.body.name,
    skill_id: req.body.skill.split(","),
  };
  const company_id = req.body.company_id;

  try {
    CompanyData.findOneAndUpdate(
      { _id: company_id },
      { $push: { skill_profile: skillProfileObj } },
      function (error, success) {}
    );
    res.status(200).json({ message: "Skill Profile Added Successfully !" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const fetchSkillProfile = async (req, res) => {
  const company_id = req.body.company_id;

  try {
    var skillProfile = await CompanyData.findOne({ _id: company_id });
    res
      .status(200)
      .json({
        data: skillProfile.skill_profile,
        message: "Skill Profile Listing !",
      });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const editSkillProfile = async (req, res) => {
  const company_id = req.body.company_id;

  try {
    await CompanyData.updateOne(
      { _id: company_id, "skill_profile._id": req.body._id },
      {
        $set: {
          "skill_profile.$.name": req.body.name,
          "skill_profile.$.skill_id": req.body.skill.split(","),
        },
      }
    );
    res.status(200).json({ message: "Skill Profile Updated Successfully !" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteSkillProfile = async (req, res) => {
  const company_id = req.body.company_id;
  const id = req.body._id;
  try {
    await CompanyData.updateOne(
      { _id: company_id },
      { $pull: { skill_profile: { _id: id } } },
      function (error, success) {}
    );
    res.status(200).json({ message: "Skill Profile Deleted Successfully !" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const singleSkillProfile = async (req, res) => {
  const company_id = req.body.company_id;
  const id = req.body._id;
  try {
    var profile = "";
    var company = await CompanyData.findOne({ _id: company_id });
    company.skill_profile.map((skillProfile) => {
      if (skillProfile._id == id) {
        profile = skillProfile;
      }
    });

    res
      .status(200)
      .json({ data: profile, message: "Skill Profile Deleted Successfully !" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
