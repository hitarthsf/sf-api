import StateData from "../models/StateData.js";
import { MesssageProvider, Messages } from "../core/index.js";
export const getStateList = async (req, res) => {
  try {
    const allStates = await StateData.find({}, { name: 1, country_id: 1 });
    res.status(200).json(allStates);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
