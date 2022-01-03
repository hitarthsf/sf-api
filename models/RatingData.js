import mongoose from "mongoose";

const rating = mongoose.Schema({

    location_id: String,
    company_id: String,
    user_id: String,
    out_of : String,
    rating: Number,
    dropout_page: String,
    feedback: String,
    customer_name: String,
    is_standout: Number,
    is_negative : Number,
    is_resolved : Number,
    is_active : Number,
    user_attented_id :Number,
    resloved_time : String,
    comment : String,
    source : String,
    is_assign : Number,
    fraud : Number,
    device_id : String,
    customer_phone: String,
    customer_email: String,
    other_feedback: String,
    old_location_id: String,
    old_rating_id: String,
    other_feedback: String,
    rating_comments:Array,
    createdAt: {
        type : Date,
        default: new Date()
    },
    updatedAt: {
        type : Date,
        default: new Date()
    },

});

const RatingData = mongoose.model("rating", rating);

export default RatingData;
