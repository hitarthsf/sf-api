import mongoose from 'mongoose';

const ratingEmployeeData = mongoose.Schema({
    rating_id: String,
    employee_id: String,
    rating: Number,
    location_id: String,
    company_id: String,
});

const RatingMigratedEmployeeData = mongoose.model('updated_rating_employee', ratingEmployeeData);

export default RatingMigratedEmployeeData;
