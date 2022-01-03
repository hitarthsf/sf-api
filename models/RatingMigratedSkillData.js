import mongoose from "mongoose";

const ratingSkillData = mongoose.Schema({
  rating_id: String,
  skill_id: String,
  rating: Number,
  location_id: String,
  company_id: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
});

const RatingMigratedSkillData = mongoose.model(
  "updated_rating_skill",
  ratingSkillData
);

export default RatingMigratedSkillData;
