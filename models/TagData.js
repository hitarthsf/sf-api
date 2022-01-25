import mongoose from "mongoose";

const tag = mongoose.Schema({
  old_id: Number,
  name: String,
  company_id: String,
  location_id: Array,
});

const TagData = mongoose.model("tag", tag);

export default TagData;
