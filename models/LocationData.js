import mongoose from "mongoose";

const location = mongoose.Schema({
  location_area_id: String,
  location_id: String,
  customer_location_id: String,
  skills: Array,
  name: String,
  address_1: String,
  address_2: String,
  city: String,
  state_id: String,
  country_id: String,
  zipcode: String,
  email: String,
  contact_no: String,
  latitude: String,
  longitude: String,
  description: String,
  open_time: String,
  close_time: String,
  image: Array,
  invoice_tag_id: String,
  hardware_cost: String,
  software_cost: String,
  num_tablets: String,
  start_date: String,
  installation_cost: String,
  max_budget_customer_audit: String,
  app_color: String,
  autoMail: String,
  useLocationSkills: String,
  categoryWiseSkill: String,
  showQRCode: String,
  multiLocation: String,
  showLocationManager: String,
  allowFrequestRatings: String,
  customerAudit: String,
  secondary_location : Array,
});

const LocationData = mongoose.model("location", location);

export default LocationData;
