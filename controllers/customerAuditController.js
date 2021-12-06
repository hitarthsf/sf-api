import CustomerAuditQuestionData from '../models/CustomerAuditQuestionData.js';
import CustomerAuditData from '../models/CustomerAuditData.js';
import UserData from '../models/UsersData.js';
import CompanyData from '../models/CompanyData.js';
import CustomerAuditAnswersData from '../models/CustomerAuditAnswersData.js';
import * as nodemailer from 'nodemailer';
import fs from 'fs';
import * as path from 'path';
import Email from 'email-templates';
import hbs from 'nodemailer-express-handlebars';
import _ from "lodash";
// Add Customr Audit Question Set
export const addCustomerAuditQuestion = async(req,res) => {

	var company_id 			= req.body.company_id;
	var name 				= req.body.name;
	var total_question 		= parseInt(req.body.total_question);
	var question = [];
	
	var max_score = 0 ; 
	for (var i = 1; i <= total_question; i++) {
		var option = [];
		for (var opt = 0; opt <= 10; opt++) {
			
			var optionName 	= "req.body.option_"+i+"_"+opt+"_name";
			var optionValue = "req.body.option_"+i+"_"+opt+"_value";
			if (eval(optionName) )
			{
				var optionArray = {

				"name" : eval(optionName),
				"score" : eval(optionValue),
				}	
				var max_score = parseInt(max_score) + parseInt(eval(optionValue)); 
				option.push(optionArray)
			} 
		}

		var questionArrayObj = 
			{
				"question" 		: eval("req.body.question_"+i)   , 
				"category" 		: eval("req.body.category_"+i) ? eval("req.body.category_"+i) : "" ,  
				"type" 			: eval("req.body.type_"+i) ? eval("req.body.type_"+i) : "" ,
				"is_nps" 		: eval("req.body.is_nps_"+i) ? parseInt(eval("req.body.is_nps_"+i)) : 0 ,
				"is_feedback" 	: eval("req.body.is_feedback_"+i) ? parseInt(eval("req.body.is_feedback_"+i)) : 0,
				"requried"		: eval("req.body.requried_"+i) ? parseInt(eval("req.body.requried_"+i)) : 0,
				"minimum_characters"		: eval("req.body.minimum_characters_"+i) ? parseInt(eval("req.body.minimum_characters_"+i)) : 0,
				"order"			: parseInt(eval("req.body.order_"+i)) ? parseInt(eval("req.body.order_"+i)) : 0 ,
				"option"		: option.length > 0  ? option : [],
				
			}
		question.push(questionArrayObj);

	}

	var questionObj = {

        company_id:     company_id,
        name:           name,
        question:       question,
        max_score :     max_score 
    };

   	

    try {
		var questionSave = new CustomerAuditQuestionData(questionObj);
		await questionSave.save();
		res.status(201).json({data: questionSave, message: "Profile Question Created Successfully !!"});
	} catch (error) {
       res.status(409).json({ message : error.message})
   	}
}


// Edit Customr Audit Question Set
export const editCustomerAuditQuestion = async(req,res) => {

	var _id 							= req.body._id;
	var company_id 			= req.body.company_id;
	var name 						= req.body.name;
	var total_question 	= parseInt(req.body.total_question);
	var question = [];
	var option = [];
	var max_score = 0 ; 
	for (var i = 1; i <= total_question; i++) {
		var option = [];
		for (var opt = 0; opt <= 10; opt++) {
			
			var optionName 	= "req.body.option_"+i+"_"+opt+"_name";
			var optionValue = "req.body.option_"+i+"_"+opt+"_value";
			if (eval(optionName) )
			{
				var optionArray = {

				"name" : eval(optionName),
				"score" : eval(optionValue),
				}	
				var max_score = parseInt(max_score) + parseInt(eval(optionValue)); 
				option.push(optionArray)
			} 
		}

		var questionArrayObj = 
			{
				"question" 			: eval("req.body.question_"+i)   , 
				"category" 			: eval("req.body.category_"+i) ? eval("req.body.category_"+i) : "" ,  
				"type" 					: eval("req.body.type_"+i) ? eval("req.body.type_"+i) : "" ,
				"is_nps" 				: eval("req.body.is_nps_"+i) ? parseInt(eval("req.body.is_nps_"+i)) : 0 ,
				"is_feedback" 	: eval("req.body.is_feedback_"+i) ? parseInt(eval("req.body.is_feedback_"+i)) : 0,
				"requried"			: eval("req.body.requried_"+i) ? parseInt(eval("req.body.requried_"+i)) : 0,
				"minimum_characters"		: eval("req.body.minimum_characters_"+i) ? parseInt(eval("req.body.minimum_characters_"+i)) : 0,
				"order"					: parseInt(eval("req.body.order_"+i)) ? parseInt(eval("req.body.order_"+i)) : 0 ,
				"option"				: option.length > 0  ? option : [],
				
			}
		question.push(questionArrayObj);

	}

	var questionObj = {
				company_id:     company_id,
        name:           name,
        question:       question,
        max_score :     max_score 
    };

   	

    try {
    	await CustomerAuditQuestionData.findByIdAndUpdate(_id, questionObj, { new: true });
		
		res.status(201).json({data: questionObj, message: "Profile Question Updated Successfully !!"});
	} catch (error) {
       res.status(409).json({ message : error.message})
   	}
}

// Fetch Customr Audit Question Set
export const fetchCustomerAuditQuestion = async(req,res) => {

		var company_id 			= req.body.company_id;
		const page 					= req.body.page ? req.body.page : 1;
    const limit 				= req.body.perPage ? parseInt(req.body.perPage) : 1;
    const skip 					= (page - 1) * limit;
    const  filterGeneralSearch  = req.body.filterGeneralSearch ;  
    if (filterGeneralSearch != "")
    {
    	var question 					= await CustomerAuditQuestionData.find({"company_id" : company_id , "name": {$regex: ".*" + filterGeneralSearch + ".*"}}).skip(skip).limit(limit); 
    	var questionCount 		= await CustomerAuditQuestionData.find({"company_id" : company_id ,"name": {$regex: ".*" + filterGeneralSearch + ".*"}}).countDocuments();  	
    }
    else
    {
    	var question 					= await CustomerAuditQuestionData.find({"company_id" : company_id}).skip(skip).limit(limit); 
    	var questionCount 		= await CustomerAuditQuestionData.find({"company_id" : company_id}).countDocuments();  	
    }
    
    
   try {
    	res.status(200).json({data: question , totalCount: questionCount, message: "Profile Question Fetched Successfully !!"});
		} catch (error) {
      res.status(409).json({ message : error.message})
   	}
}


// Delete Customr Audit Question Set
export const deleteCustomerAuditQuestion = async(req,res) => {

	var id   					= req.body._id;  
  var question 			= await CustomerAuditQuestionData.findByIdAndRemove(id); 

    try {
    	
		res.status(201).json({data: question, message: "Profile Question Deleted Successfully !!"});
	} catch (error) {
       res.status(409).json({ message : error.message})
   	}
}


// Get Only Single Customer Audit Question Set
export const fetchSingleCustomerAuditQuestion = async(req,res) => {

	var id   					= req.body._id;  
  var question 			= await CustomerAuditQuestionData.findOne({"_id":id}); 

    try {
    	
		res.status(200).json({data: question, message: "Profile Question Fetch Successfully !!"});
	} catch (error) {
       res.status(409).json({ message : error.message})
   	}
}


// Add Customer Audit 
export const addCustomerAudit = async(req,res) => {

	var data 	= req.body;

	var auditObj = {

        company_id:     		data.company_id,
        location_id:     		data.location_id ? data.location_id : null,
        tag_id:     				data.tag_id ? data.tag_id : null,
        audit_set_question_id:  data.audit_set_question_id,
        start_date:     		data.start_date ? data.start_date : "" ,
        end_date:     			data.end_date ? data.end_date : "" ,
        email:     					data.email,
        budget:     				parseInt(data.budget),
        additional_notes:   data.additional_notes,
        is_breakfast:     	parseInt(data.is_breakfast),
        is_lunch:     			parseInt(data.is_lunch),
        is_dinner:     			parseInt(data.is_dinner),
        creator_id:     		data.creator_id ?  data.creator_id : null,
    };

    // Getting Data for Email 
    var locationName = null;
    if (data.location_id)
    {
    	var companyData = await CompanyData.findOne({"_id" : data.company_id});
	    
	    const fetchedLocation = _.find(companyData.location, (location) => {	
	    						if (location._id == data.location_id)
	    						{
	    							locationName = location.name ; 
	    						}
	                
	            });	
    }
    
     // Email sending code 
    const filePath = path.join(process.cwd(), 'email');
    const logopath = path.join(process.cwd(), 'email/images/logo.png');
    
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hitarth.rc@@gmail.com',
    pass: 'mrdldgjyzjfofnek'
    }
  });
  
  const handlebarOptions = {
    viewEngine: {
        partialsDir: filePath,
        defaultLayout: false,
    },
    viewPath: filePath,
	};

	transporter.use('compile', hbs(handlebarOptions))
  const mailOptions = {
    	from: 'youremail@gmail.com',
	  to: data.email,
	  subject: 'Customer Audit',
   template	: 'audit' ,
   context: {
       additional_notes	: data.additional_notes,
       start_date				: data.start_date,
       end_date					: data.end_date,
       locationName			: locationName,
       budget						: data.budget

   }
    
  };
  
  transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
	    console.log(error);
	  } else {
	    console.log('Email sent: ' + info.response);
	  }
	}); 

	// Email sending code end

    try {
    	var auditSave = new CustomerAuditData(auditObj);
			await auditSave.save();
    	
			res.status(201).json({data: auditSave, message: "Customer Audit Created Successfully !!"});
	} catch (error) {
       res.status(409).json({ message : error.message})
   	}
}


// edit Customer Audit 
export const editCustomerAudit = async(req,res) => {

	var data 	= req.body;

	var auditObj = {

        company_id:     		data.company_id,
        location_id:     		data.location_id ? data.location_id : null,
        tag_id:     			data.tag_id ? data.tag_id : null,
        audit_set_question_id:  data.audit_set_question_id,
        start_date:     		data.start_date ? data.start_date : "" ,
        end_date:     			data.end_date ? data.end_date : "" ,
        email:     				data.email,
        budget:     			parseInt(data.budget),
        additional_notes:     	data.additional_notes,
        is_breakfast:     		parseInt(data.is_breakfast),
        is_lunch:     			parseInt(data.is_lunch),
        is_dinner:     			parseInt(data.is_dinner),
        creator_id:     		data.creator_id ?  data.creator_id : null,
    };

     // Getting Data for Email 
    var locationName = null;
    if (data.location_id)
    {
    	var companyData = await CompanyData.findOne({"_id" : data.company_id});
	    
	    const fetchedLocation = _.find(companyData.location, (location) => {	
	    						if (location._id == data.location_id)
	    						{
	    							locationName = location.name ; 
	    						}
	                
	            });	
    }
    // Email sending code 
    const filePath = path.join(process.cwd(), 'email');
    const logopath = path.join(process.cwd(), 'email/images/logo.png');
    
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hitarth.rc@@gmail.com',
    pass: 'mrdldgjyzjfofnek'
    }
  });
  
  const handlebarOptions = {
    viewEngine: {
        partialsDir: filePath,
        defaultLayout: false,
    },
    viewPath: filePath,
	};

	transporter.use('compile', hbs(handlebarOptions))
  const mailOptions = {
    	from: 'youremail@gmail.com',
	  to: data.email,
	  subject: 'Customer Audit',
   template	: 'audit' ,
   context: {
       additional_notes	: data.additional_notes,
       start_date				: data.start_date,
       end_date					: data.end_date,
       locationName			: locationName,
       budget						: data.budget

   }
    
  };
  
  transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
	    console.log(error);
	  } else {
	    console.log('Email sent: ' + info.response);
	  }
	}); 

	// Email sending code end

    try {
    	await CustomerAuditData.findByIdAndUpdate(data._id, auditObj, { new: true });
    	
		res.status(201).json({data: auditObj, message: "Customer Audit Updated Successfully !!"});
	} catch (error) {
       res.status(409).json({ message : error.message})
   	}
}

//Delete Customer Audit 
export const deleteCustomerAudit = async(req,res) => {

	var id   = req.body._id;  
        
	var question 			= await CustomerAuditData.findByIdAndRemove(id); 

    try {
    	
    	
		res.status(200).json({data: [], message: "Customer Audit Deleted Successfully !!"});
	} catch (error) {
       res.status(409).json({ message : error.message})
   	}
}


//Fetch Customer Audit 
export const fetchCustomerAudit = async(req,res) => {
 	
	const company_id 	= req.body.company_id;
	const page 				= req.body.page ? req.body.page : 1;
  const limit 			= req.body.perPage ? parseInt(req.body.perPage) : 1;
  const skip 				= (page - 1) * limit; 
  const filterGeneralSearch  = req.body.filterGeneralSearch ;  

	if (filterGeneralSearch != "")
	{
		var auditCount 		= await CustomerAuditData.find({"company_id" : company_id,  "email": {$regex: ".*" + filterGeneralSearch + ".*"}}).countDocuments();		
		var audit 				= await CustomerAuditData.aggregate([
			 {
	        $match: {company_id: company_id ,  email: {$regex: ".*" + filterGeneralSearch + ".*"} }
	     },
	     { "$sort": { createdAt : -1} },	
	     { "$skip": skip },
			 { "$limit":limit }
	     
	    ]);  
	}
	else
	{
		var auditCount 		= await CustomerAuditData.find({"company_id" : company_id}).countDocuments();		
		var audit 				= await CustomerAuditData.aggregate([
			 {
	        $match: {company_id: company_id }
	     },	
	     { "$sort": { createdAt : -1} },
	     { "$skip": skip },
			 { "$limit":limit }
	     
	    ]);  	
	}
	

	const responseData =  await Promise.all(
			audit.map(async (auditData) => { 
				
				auditData.creatorName = "";
				auditData.companyName = "";
				var company = await	 CompanyData.findOne({"_id":auditData.company_id});
				auditData.companyName = company.name;
				if (auditData.creator_id != null )
				{
					
					var creator = await	 UserData.findOne({"_id":auditData.creator_id});
					auditData.creatorName = creator.name ;	

				}
				return auditData;
			}),
		);
    try {
    	
    	
		res.status(200).json({data: audit, totalCount : auditCount ,  message: "Customer Audit Fetched Successfully !!"});
	} catch (error) {
       res.status(409).json({ message : error.message})
   	}
}


// get single customer aduit for front 
export const fetchFrontCustomerAudit = async(req,res) => {

	const _id 				= req.body._id;
	const page 				= req.body.page ? req.body.page : 1;
  const limit 			= req.body.perPage ? parseInt(req.body.perPage) : 1;
  const skip 				= (page - 1) * limit; 

	var audit 				= await CustomerAuditData.findOne({"_id" : _id});		

  var question  		= await CustomerAuditQuestionData.findOne({"_id" : audit.audit_set_question_id});
  var count  				= 0 ; 
  var questionArray = [] ;
  const responseData =  await Promise.all(
			question.question.map(async (questionData) => { 
				count = count + 1 ;			
				if (count > skip && count <= skip + limit  )
				{
					questionArray.push(questionData);
				}

				return questionData;
			}),
		);
  try{
  res.status(200).json({data: questionArray, totalCount : count, message: "Customer Audit Fetched Front Successfully !!"});
  } catch (error) {
       res.status(409).json({ message : error.message})
   	}
}

// store question and answer 

export const answerCustomerAudit = async(req,res) => { 

	const customer_aduit_id 				= req.body.customer_aduit_id;
	const total_question 						= req.body.totalCount;
	var max_score = 0 ; 
	try { 
	for (var i = 1; i <= total_question; i++) {

		var answerObj = {
				customer_audit_id : req.body.customer_aduit_id,
        question 					: eval("req.body.question_"+i),  
        answer 						: eval("req.body.answer_"+i),
        score 						: eval("req.body.score_"+i) ? eval("req.body.score_"+i) : 0  ,
        note 							: eval("req.body.note_"+i) ? eval("req.body.note_"+i) : "" ,
    };
    var answerSave = new CustomerAuditAnswersData(answerObj);
		await answerSave.save();
	}
	res.status(200).json({data: [], message: "Customer Audit Fetched Front Successfully !!"});

	} catch (error) {
       res.status(409).json({ message : error.message})
   	}
}



