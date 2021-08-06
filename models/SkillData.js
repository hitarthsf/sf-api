import mongoose from 'mongoose';

const skill = mongoose.Schema({
name:String, 
type:String,
categories_id:String,
is_active:String,
createdAt: { type : Date, default: new Date()  },
updatedAt: {  type : Date,  default: new Date()}, 
});

const SkillData = mongoose.model('skill', skill);

export default SkillData;