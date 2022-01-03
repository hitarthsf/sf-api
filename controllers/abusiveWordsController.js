import CompanyData from "../models/CompanyData.js";
import { Messages, MesssageProvider } from "../core/index.js";

//Action : getAbusiveWords
//Comment : Get All Abusive Words For Current Company
export const getAbusiveWords = async (req, res) => {
  const id = req.body._id;
  const companyId = req.query.company_id;
  if (!companyId) {
    res.status(500).json({
      message: MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND),
    });
  }
  
  try {
    const company = await CompanyData.findOne(
      { _id: companyId },
      { abusive_word: 1 }
    );
    res.status(200).json(company.abusive_word ? company.abusive_word : []);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//Action : createAbusiveWords
//Comment : Create Abusive Word for Active Company
export const createAbusiveWords = async (req, res) => {
  const companyId = req.body.company_id;
  if (!companyId) {
    res.status(500).json({
      message: MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND),
    });
  }

  var objFriends = { word: req.body.word };

  CompanyData.findOneAndUpdate(
    { _id: companyId },
    { $push: { abusive_word: objFriends } },
    function (error, success) {
      if (error) {        
        res.send(error);
      } else {
        res.send(success);
      }
    }
  );
};

//Action : deleteAbusiveWords
//Comment : Delete Abusive Word
export const deleteAbusiveWords = async (req, res) => {
  const id = req.body._id;
  const companyId = req.body.company_id;
  if (!companyId) {
    res.status(500).json({
      message: MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND),
    });
  }

  await CompanyData.updateOne(
    { _id: companyId },
    { $pull: { abusive_word: { _id: id } } },
    { multi: true },
    function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log(success);
      }
    }
  );
};
