import mongoose from "mongoose";

const location_support_log = mongoose.Schema({
  option: String,
  text: String,
  location_id: String,
});

const LocationSupportLogData = mongoose.model(
  "location_support_log",
  location_support_log
);

export default LocationSupportLogData;
