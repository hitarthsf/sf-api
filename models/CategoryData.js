import mongoose from 'mongoose';

const category = mongoose.Schema({
name:String, 
createdAt: { type : Date, default: new Date()  },
updatedAt: {  type : Date,  default: new Date()}, 
});

const CategoryData = mongoose.model('category', category);

export default CategoryData;