import mongoose from "mongoose";

const employeeRating = mongoose.Schema({
  location_id :String, 
  comapany_id :String,
  user_id :String,
  employee_id :String,
  rating :String,
  is_anonymous :String,
  feedback :String,
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

const EmployeeRatingData = mongoose.model("employee_rating", employeeRating);

export default EmployeeRatingData;
