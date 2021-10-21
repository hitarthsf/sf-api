import mongoose from 'mongoose';

const rating = mongoose.Schema({
    location_id: String,
    company_id: String,
    rating: Number,
    dropout_page: String,
    feedback: String,
    customer_name: String,
    is_standout: Number,
    customer_phone: String,
    customer_email: String,
    other_feedback: String,
    createdAt: {
        type : Date,
        default: new Date()
    },
    updatedAt: {
        type : Date,
        default: new Date()
    },
});

const RatingMigratedData = mongoose.model('updated_rating', rating);

export default RatingMigratedData;
