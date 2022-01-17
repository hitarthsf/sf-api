import mongoose from "mongoose";

const customer_audit_answers = mongoose.Schema({
  customer_audit_id: String,
  question: String,
  answer: String,
  score: Number,
  notes: String,
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

const CustomerAuditAnswersData = mongoose.model(
  "customer_audit_answers",
  customer_audit_answers
);

export default CustomerAuditAnswersData;
