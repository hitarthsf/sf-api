import mongoose from "mongoose";

const screenSaver = mongoose.Schema({
  name: String,
  title: String,
  type: String,
  company_id: String,
  location_id: Array,
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

const ScreenSaverData = mongoose.model("screenSaver", screenSaver);

export default ScreenSaverData;
