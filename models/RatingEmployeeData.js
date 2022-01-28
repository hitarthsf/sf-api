import mongoose from "mongoose";

const ratingEmployeeData = mongoose.Schema({
  rating_id: String,
  sfv1_old_rating_id : Number,
  employee_id: String,
  sfv1_old_employee_id : Number,
  rating: Number,
  location_id: String,
  sfv1_old_location_id : Number,
  company_id: String,
  sfv1_old_company_id : Number,
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
});

const RatingEmployeeData = mongoose.model(
  "rating_employee",
  ratingEmployeeData
);

export default RatingEmployeeData;
