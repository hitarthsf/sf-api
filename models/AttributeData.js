import mongoose from "mongoose";

const attribute = mongoose.Schema({
  name: String,
  positive_skills: Array,
  negative_skills: Array,
});

const LocationData = mongoose.model("attibute", attibute);

export default LocationData;
