import CompanyData from "../models/CompanyData.js";
import { Messages, MesssageProvider } from "../core/index.js";

export const getAbusiveWords = async (req, res) => {
  const id = req.body._id;
  const companyId = req.body.company_id;
  const page = req.body.page ? req.body.page : 1;
  var limit = req.body.perPage ? parseInt(req.body.perPage) : 1;
   
  const skip = (page - 1) * limit;
  limit = page * limit ;
  const filterGeneralSearch = req.body.filterGeneralSearch;

  if (!companyId) {
    res
      .status(500)
      .json({
        message: MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND),
      });
  }
  
  try {
    //  const AllCompany = await CompanyData.find({"_id":id});
    // make it dynamic
    const company = await CompanyData.findOne(
      { _id: companyId },
    );
    var abusiveWord = [] ; 
    var count =  0  ; 
    var filterCount  = 0 ; 
    await  company.abusive_word.map(async ( word ) => {  
      // counts for filter
      if (filterGeneralSearch)
      {
       if (word.word.toLowerCase().includes(filterGeneralSearch.toLowerCase()) )
       {
        filterCount = filterCount + 1 ; 
       }
      } 
      
      // getting the loop with conditions 
      if ( parseInt(count) >= parseInt(skip) && parseInt(count) < parseInt(limit)   ) 
      {
       if (filterGeneralSearch)
       {
        if (word.word.toLowerCase().includes(filterGeneralSearch.toLowerCase()) )
        {
          var objWord = { "_id" :word._id , "name" : word.word , "createdAt" : word.createdAt  }
          abusiveWord.push(objWord);
        }
       } 
       else{
        var objWord = { "_id" :word._id , "name" : word.word , "createdAt" : word.createdAt  }
        abusiveWord.push(objWord); 
       }
      }
      count = count + 1 ; 
      
    } );   
    if (filterGeneralSearch)
    {
      res.status(200).json({
        data: abusiveWord,
        totalCount: filterCount,
        message: "Abusive Word Listing !!",
      });
    }
    else
    {
      res.status(200).json({
        data: abusiveWord,
        totalCount: count,
        message: "Abusive Word Listing !!",
      });

    }
    
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createAbusiveWords = async (req, res) => {
  const companyId = req.body.company_id;
  if (!companyId) {
    res
      .status(500)
      .json({
        message: MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND),
      });
  }
  var objFriends = { word: req.body.word };
  // make it dynamic
  CompanyData.findOneAndUpdate(
    { _id: companyId },
    { $push: { abusive_word: objFriends } },
    function (error, success) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        console.log(success);
        res.send(success);
      }
    }
  );
};

export const deleteAbusiveWords = async (req, res) => {
  const id = req.body._id;

  const companyId = req.body.company_id;
  if (!companyId) {
    res
      .status(500)
      .json({
        message: MesssageProvider.messageByKey(Messages.KEYS.ID_NOT_FOUND),
      });
  }

  // const Company = await CompanyData.findOneAndUpdate({"_id":"6111149b961aa70d06fe58f1"});
  // CompanyData.update( {"_id":"6111149b961aa70d06fe58f1"}, { $pull: { votes: { $gte: 6 } } } )
  // make it dynamic
  await CompanyData.updateOne(
    { _id: req.body.company_id },
    { $pull: { abusive_word: { "_id": id } } },
    { multi: true },
    function (error, success) {
      if (error) {
        console.log(error);
        // res.send(error)
      } else {
        console.log(success);
        // res.send(success)
      }
    }
  );

  res
      .status(200)
      .json({
        message: "Abusive word deleted",
      });
};
