import mongoose from 'mongoose';

const customer_audit = mongoose.Schema({
audit_set_question_id: String ,
creator_id:String, 
company_id : String ,
location_id: String ,
tag_id: String ,
unique_id: String ,
start_date: String ,
end_date: String ,
email: String ,
budget: String ,
max_score: Number ,
total_score: Number ,
average_score: Number ,
is_legit: Number ,
is_breakfast: Number ,
is_lunch: Number ,
is_dinner: Number ,
additional_notes: String ,
createdAt: { type : Date, default: new Date()  },
updatedAt: {  type : Date,  default: new Date()}, 
});

const CustomerAuditData = mongoose.model('customer_audit', customer_audit);

export default CustomerAuditData;