import mongoose from "mongoose";

const employeeRatingSkills = mongoose.Schema({
  employee_ratings_id :String, 
  skills_id :String,
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

const EmployeeRatingSkillsData = mongoose.model("employee_rating_skills", employeeRatingSkills);

export default EmployeeRatingSkillsData;
