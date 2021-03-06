import mongoose from "mongoose";

const company = mongoose.Schema({
  name: String,
  privacy_link: String,
  privacy_text: String,
  is_active: String,
  category_wise_skill: String,
  mobileiron_group_id: String,
  account_type: String,
  allow_cppq: String,
  image: String,
  color: String,
  hubspot_transaction_mails: String,
  old_company_id: Number,
  skills: Array,
  location: [
    {
      location_area_id: String,
      location_id: String,
      customer_location_id: String,
      skill_id: String,
      name: String,
      address_1: String,
      address_2: String,
      city: String,
      state_id: String,
      country_id: String,
      zipcode: String,
      email: String,
      contact_no: String,
      is_active: String,
      latitude: String,
      longitude: String,
      description: String,
      open_time: String,
      close_time: String,
      image: String,
      invoice_tag_id: String,
      hardware_cost: String,
      show_qr_code: String,
      is_show_location: String,
      software_cost: String,
      num_tablets: String,
      start_date: String,
      mobileiron_user_created: String,
      allow_frequent_ratings: String,
      installation_cost: String,
      max_budget_customer_audit: String,
      app_color: String,
      autoMail: String,
      useLocationSkills: String,
      categoryWiseSkill: String,
      billing_start_date: String,
      billing_frequency: String,
      showQRCode: String,
      category_wise_skill: String,
      multiLocation: String,
      allow_complain_mails: String,
      use_location_skills: String,
      is_multilocation: String,
      showLocationManager: String,
      allowFrequestRatings: String,
      customerAudit: String,
      old_location_id: String,
      hide_team: String,
      show_customer_audit: String,
      password: String,
      appPassword: String,
      language: String,
      question_id: Array,
      location_skills: Array,
      multi_location_id: Array,
      app_background_image:String
    },
  ],
  user_location: [{ user_id: Number, location_id: String }],
  ratings: [
    {
      location_id: String,
      employee_id: String,
      rating: String,
      out_of: String,
      feedback: String,
      other_feedback: String,
      is_negative: String,
    },
  ],
  attributes: [
    {
      id: String,
      name: String,
      is_active: String,
      createdAt: { type: Date, default: new Date() },
      positive_skills: [
        {
          name: String,
          old_skill_id: String,
        },
      ],
      negative_skills: [
        {
          name: String,
          old_skill_id: String,
        },
      ],
      updatedAt: { type: Date, default: new Date() },
      deletedAt: { type: Date, default: new Date() },
      attribute_skills: [
        {
          id: String,
          attribute_id: String,
          skill_id: String,
          createdAt: { type: Date, default: new Date() },
          updatedAt: { type: Date, default: new Date() },
          deletedAt: { type: Date, default: new Date() },
        },
      ],
    },
  ],
  skill_profile: [
    {
      id: String,
      name: String,
      skill_id: Array,
      createdAt: { type: Date, default: new Date() },
      updatedAt: { type: Date, default: new Date() },
      deletedAt: { type: Date, default: new Date() },
    },
  ],
  abusive_word: [
    {
      id: String,
      word: String,
      createdAt: { type: Date, default: new Date() },
      updatedAt: { type: Date, default: new Date() },
      deletedAt: { type: Date, default: new Date() },
    },
  ],
  privacy_location: [
    {
      id: String,
      location_id: String,
      email: String,
      createdAt: { type: Date, default: new Date() },
      updatedAt: { type: Date, default: new Date() },
      deletedAt: { type: Date, default: new Date() },
    },
  ],
  action_plan: [
    {
      id: String,
      title: String,
      description: String,
      is_active: String,
      createdAt: { type: Date, default: new Date() },
      updatedAt: { type: Date, default: new Date() },
      deletedAt: { type: Date, default: new Date() },
    },
  ],
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
  old_company_id: Number,
});

const CompanyData = mongoose.model("company", company);

export default CompanyData;
