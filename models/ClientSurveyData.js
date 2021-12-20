import mongoose from 'mongoose';

const clientSurvey = mongoose.Schema({
    comapny_id:String,
    questionAnswer : Array , 
    createdAt: {
        type : Date,
        default: new Date()
    },
    updatedAt: {
        type : Date,
        default: new Date()
    },
});

const ClientSurveyData = mongoose.model('client_survey', clientSurvey);

export default ClientSurveyData ;