import SkillData from "../models/SkillData.js";

export const createSkill = async (req, res) => {
  const skill = req.body;

  const newSkill = new SkillData({
    ...skill,
    createdAt: new Date().toISOString(),
  });
  try {
    await newSkill.save();
    res.status(201).json(newSkill);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const getSkill = async (req, res) => {
  //res.send('THIS GOOD');
  try {
    const AllSkill = await SkillData.find();
    res.status(200).json(AllSkill);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateSkill = async (req, res) => {
  console.log(req.body);
  //const { id } = req.body._id;
  const skill = req.body;

  // if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);

  const updatedSkill = { ...skill, _id: req.body._id };

  await SkillData.findByIdAndUpdate(req.body._id, updatedSkill, { new: true });

  res.json(updatedSkill);
  console.log(updatedSkill);
};

export const deleteSkill = async (req, res) => {
  console.log(req.body);
  const id = req.body._id;

  //if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No company with id: ${id}`);

  await SkillData.findByIdAndRemove(id);

  res.json({ message: "skill deleted successfully." });
};
