import mongoose from "mongoose";

const tag = mongoose.Schema({
  name: String,
  company_id: String,
  location_id: Array,
});

const TagData = mongoose.model("tag", tag);

export default TagData;
