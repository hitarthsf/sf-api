import mongoose from "mongoose";

const customer_audit_question = mongoose.Schema({
  name: String,
  company_id: String,
  max_score: String,
  question: Array,
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

const CustomerAuditQuestionData = mongoose.model(
  "customer_audit_question",
  customer_audit_question
);

export default CustomerAuditQuestionData;
