import CustomerAuditQuestionData from '../models/CustomerAuditQuestionData.js';


// Add Customr Audit Question Set
export const addCustomerAuditQuestion = async(req,res) => {

	var company_id 			= req.body.company_id;
	var name 				= req.body.name;
	var total_question 		= parseInt(req.body.total_question);
	var question = [];
	for (var i = 1; i <= total_question; i++) {
		
		
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
				"option"		: eval("req.body.option_"+i) ? eval("req.body.option_"+i) : [],
				
			}
		question.push(questionArrayObj);

	}
	var questionObj = {

        company_id:     company_id,
        name:           name,
        question:       question
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

	var id 					= req.body._id;
	var company_id 			= req.body.company_id;
	var name 				= req.body.name;
	var total_question 		= parseInt(req.body.total_question);
	var question = [];
	for (var i = 1; i <= total_question; i++) {
		
		
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
				"option"		: eval("req.body.option_"+i) ? eval("req.body.option_"+i) : [],
				
			}
		question.push(questionArrayObj);

	}
	
	var questionObj = {

        company_id:     company_id,
        name:           name,
        question:       question
    };

    try {
    	await CustomerAuditQuestionData.findByIdAndUpdate(id, questionObj, { new: true });
		
		res.status(201).json({data: questionObj, message: "Profile Question Updated Successfully !!"});
	} catch (error) {
       res.status(409).json({ message : error.message})
   	}
}

// Fetch Customr Audit Question Set
export const fetchCustomerAuditQuestion = async(req,res) => {

	var company_id 			= req.body.company_id;
	const page = req.body.page ? req.body.page : 1;
    const limit = req.body.perPage ? parseInt(req.body.perPage) : 1;
    const skip = (page - 1) * limit;

    var question 			= await CustomerAuditQuestionData.find({"company_id" : company_id}).skip(skip).limit(limit); 
    var questionCount 		= await CustomerAuditQuestionData.find({"company_id" : company_id}).countDocuments();  
    
    try {
    	
		res.status(201).json({data: question , totalCount: questionCount, message: "Profile Question Fetched Successfully !!"});
	} catch (error) {
       res.status(409).json({ message : error.message})
   	}
}


// Delete Customr Audit Question Set
export const deleteCustomerAuditQuestion = async(req,res) => {

	var id   = req.body._id;  
        
	var question 			= await CustomerAuditQuestionData.findByIdAndRemove(id); 

    try {
    	
		res.status(201).json({data: question, message: "Profile Question Deleted Successfully !!"});
	} catch (error) {
       res.status(409).json({ message : error.message})
   	}
}


// Get Only Single Customer Audit Question Set
export const fetchSingleCustomerAuditQuestion = async(req,res) => {

	var id   = req.body._id;  
        
	var question 			= await CustomerAuditQuestionData.findOne({"_id":id}); 

    try {
    	
		res.status(201).json({data: question, message: "Profile Question Fetch Successfully !!"});
	} catch (error) {
       res.status(409).json({ message : error.message})
   	}
}


// Add Customer Audit 
export const addCustomerAudit = async(req,res) => {

	 
        
	var question 			= await CustomerAuditQuestionData.findOne({"_id":id}); 

    try {
    	
		res.status(201).json({data: question, message: "Profile Question Created Successfully !!"});
	} catch (error) {
       res.status(409).json({ message : error.message})
   	}
}