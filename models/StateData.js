import mongoose from "mongoose";

const state = mongoose.Schema({
  name: String,
  country_id: Number,
  state_api_id: Number,
  created_at: {
    type: Date,
    default: new Date(),
  },
  updated_at: {
    type: Date,
    default: new Date(),
  },
});

const StateData = mongoose.model("state", state);

export default StateData;
