import mongoose from 'mongoose';

const ratingSkillData = mongoose.Schema({
    rating_id: String,
    skill_id: String,
    rating: Number,
    location_id: String,
    company_id: String,
});

const RatingSkillData = mongoose.model('rating_skills', ratingSkillData);

export default RatingSkillData;
