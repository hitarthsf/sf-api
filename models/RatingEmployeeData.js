import mongoose from "mongoose";

const ratingEmployeeData = mongoose.Schema({
  rating_id: String,
  employee_id: String,
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

const RatingEmployeeData = mongoose.model(
  "rating_employee",
  ratingEmployeeData
);

export default RatingEmployeeData;
