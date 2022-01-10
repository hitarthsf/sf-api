import ClientSurveyData from "../models/ClientSurveyData.js";

//Action : addClientSurvey
//Comment : Add New Client Survey
export const addClientSurvey = async (req, res) => {
  var question_answer = [];

  for (var i = 1; i <= 15; i++) {
    var object = { question_id: i, answer: eval("req.body.answer_" + i) };
    question_answer.push(object);
  }

  // add the entry to DB
  const clinetSurveyObj = {
    comapny_id: req.body.company_id,
    questionAnswer: question_answer,
  };

  const clientSurvey = new ClientSurveyData(clinetSurveyObj);
  await clientSurvey.save();
  res.status(201).json(clientSurvey);
};
