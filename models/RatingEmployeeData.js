import mongoose from 'mongoose';

const ratingEmployeeData = mongoose.Schema({
    rating_id: mongoose.Schema.ObjectId,
    employee_id: String,
    rating: Number,
    location_id: String,
    company_id: String,
});

const RatingEmployeeData = mongoose.model('rating_employee', ratingEmployeeData);

export default RatingEmployeeData;
