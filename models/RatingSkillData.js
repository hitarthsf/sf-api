import mongoose from 'mongoose';

const ratingSkillData = mongoose.Schema({
    rating_id: mongoose.Schema.ObjectId,
    skill_id: String,
    rating: Number,
    location_id: String,
    company_id: String,
});

const RatingSkillData = mongoose.model('rating_skill', ratingSkillData);

export default RatingSkillData;
