import CompanyData from "../models/CompanyData.js";
import UsersData from "../models/UsersData.js";
import RatingData from "../models/RatingData.js";
import RatingEmployeeData from "../models/RatingEmployeeData.js";
import RatingSkillData from "../models/RatingSkillData.js";
import ScreenSaverData from "../models/ScreenSaverData.js";

//Action : locationLogin
//Comment : Location Login
export const locationLogin = async (req, res) => {
    try {
        // Get Location Data 
    const companyData = await CompanyData.find({});
    // Company Loop Starts
    companyData.map(async (company) => {  company.location.map( async ( location) => {
            if(location.location_id == req.body.location) 
            {
                if (req.body.password)
                {
                    if (req.body.password == location.appPassword)
                    {
                        res.status(200).json({"status" : 200 , "message" : "Location","data" : location ,"allow_cppq" : 1, "url" :"" , "hexnode_flag" : 0});
                    }
                    else
                    {
                        res.status(400).json({ message: "Invalid Password"});
                    }   
                }
                else
                {
                    res.status(200).json({"status" : 200 , "message" : "Location","data" : location ,"allow_cppq" : 1 , "url" :"", "hexnode_flag" : 0 } );
                }
            }
        })
    })    
    }
    catch(error) 
    {
        res.status(404).json({ message: error.message });
    }
}

//Action : skillList
//Comment : Skill List
export const skillList = async (req, res) => {
    
  try {
    // Get Location Data 
    const companyData = await CompanyData.find({});
    var skillMap = new Map();
    const skill = [] ; 
    // Company Loop Starts
    companyData.map(async (company) => {  company.location.map( async ( location) => {
        if(location._id == req.body.location_id) 
        {
            //var locationData = location;
            // Getting Skill Loop
            company.attributes.forEach((attribute) => {
                // Check Condition for Positive Skills 
                if (attribute.positive_skills.length > 0 && req.body.type == 1 ) {
                attribute.positive_skills.map(async (positiveSkills) => {
                    // Check If Use Location Skill is on 
                    if (location.use_location_skills == "1")
                    {
                        if (location.location_skills.includes( positiveSkills._id) )
                        {
                            var skillObj = {"name" : positiveSkills.name , "id" : positiveSkills._id};
                            skill.push(skillObj);
                        }
                    }
                    else
                    {
                        var skillObj = {"name" : positiveSkills.name , "id" : positiveSkills._id};   
                        skill.push(skillObj);
                    }
                });
                }
                // Check Condition for Negative Skills
                if (attribute.negative_skills.length > 0 && req.body.type == 0) {
                attribute.negative_skills.map(async (negativeSkills) => {
                    // Check If Use Location Skill is on 
                    if (location.use_location_skills == "1")
                    {
                        if (location.location_skills.includes( positiveSkills._id) )
                        {
                            var skillObj = {"name" : positiveSkills.name , "id" : positiveSkills._id};
                            skill.push(skillObj);
                        }
                    }
                    else
                    {
                        var skillObj = {"name" : positiveSkills.name , "id" : positiveSkills._id};   
                        skill.push(skillObj);
                    }
                    
                });
                }
            });
        }
        })
    })
    // Company Loop Ends
    res.status(200).json({"status" : 200 , "message" : "List of skill" , "url" : "", "data_new": [] ,"data" : skill});
    }
    catch(error) 
    {
        res.status(404).json({ message: error.message });
    }
}

export const employeeList = async (req, res) => {
    try {

    // Get Location Data 
    const companyData = await CompanyData.find({});
    var userData = await UsersData.find({});
    var locationData = "";
    // Company Loop Starts
    companyData.map(async (company) => {  company.location.map( async ( location) => {
        if(location._id == req.body.location_id) 
        {
             locationData = location ;
        }
    })
    })
    // Company Loop Ends
    var userList = [] ;
    // User Loop Starts
    userData.map(async (user) => {  
        if (user.location_id.includes( req.body.location_id))
        {
            var userObj = { "name" : user.name , "id" : user._id , "image" : "" }
            userList.push(userObj)
        }
    })
    // User Loop Ends
    res.status(200).json({"status" : 200 , "message" : "List of Employee" , "url" : "" ,"data" : userList , "url" : "",
       "qrcode" : "" ,"isMultiLocation" : 0  , "hide_team":locationData.hide_team , "allow_cppq":0  });
    }
    catch(error) 
    {
        res.status(404).json({ message: error.message });
    }
}

//Action : saveDetails
//Comment : Save Rating 

export const saveDetails = async (req, res) => {
    // Get Location Data 
    const companyData       = await CompanyData.find({});
    var mongoLocationId     = "";
    var mongoCompanyId      = "";
    // Company Loop Starts
    companyData.map(async (company) => {  company.location.map( async ( location) => {
        if(location._id == req.body.location_id) 
        {
            mongoLocationId = location._id ;
            mongoCompanyId  = company._id ;
        }
    })
    })
    // Company Loop Ends
    
    const data = req.body;
    
    const skills = data.skill_id ? data.skill_id.split(",") : [];
    const employees =  data.employee_id ;
    var is_assign = data.employee_id ? "1" : "0";
  
    const ratingObj = {
      location_id: mongoLocationId,
      company_id: mongoCompanyId,
      rating: data.rating,
      dropout_page: data.dropout_page ? data.dropout_page : "",
      feedback: data.feedback ? data.feedback : "",
      customer_name: data.customer_name,
      is_standout: data.is_standout ? data.is_standout : 0,
      customer_phone: data.customer_phone ? data.customer_phone : "",
      customer_email: data.customer_email ? data.customer_email : "",
      other_feedback: data.other_feedback ? data.other_feedback : "",
      is_assign: is_assign,
    };
  
    const rating = new RatingData(ratingObj);
    await rating.save();
  
    // if positive rating and no employee is selected then assign rating to all the employee and location manager of that location
    if (employees.length == 0 && data.rating > 3) {
      const employees_ids = await UserData.aggregate([
        {
          $match: {
            location_id: data.mongoLocationId,
            type: { $in: ["employee", "location_manager"] },
          },
        },
      ]);
      employees_ids.forEach(function (myDoc) {
        employees.push(myDoc._id);
      });
    }
  
    if (employees) {
      
        const savedEmployees = new RatingEmployeeData({
          rating_id: rating._id,
          employee_id: employees,
          rating: data.rating,
          location_id: mongoLocationId,
          company_id: mongoCompanyId,
        });
        //res.send(savedEmployees);
        await savedEmployees.save();
      
    }
  
    if (skills) {
      skills.map(async (skillId) => {
        const savedSkills = new RatingSkillData({
          rating_id: rating._id,
          skill_id: skillId,
          rating: data.rating,
          location_id: mongoLocationId,
          company_id: mongoCompanyId,
        });
        await savedSkills.save();
      });
    }
    res.status(200).json({"status" : 200 , "message" : "Rating Added"  ,"data" : []});
}

//Action : getAllData
//Comment : Sync all data api 
export const getAllData = async (req, res) => {  

    // Company Loop Starts
    const companyData   = await CompanyData.find({});
    var userData        = await UsersData.find({});
    var locationData    =  "" ;
    var skillPositive   = [] ; 
    var skillNegative   = [] ; 
     companyData.map(async (company) => {  company.location.map( async ( location) => {
        if(location._id == req.body.main_location) 
        {   
            locationData = location;
             // Getting Skill Loop
             company.attributes.forEach((attribute) => {
                // Check Condition for Positive Skills 
                if (attribute.positive_skills.length > 0  ) {
                attribute.positive_skills.map(async (positiveSkills) => {
                    // Check If Use Location Skill is on 
                    if (location.use_location_skills == "1")
                    {
                        if (location.location_skills.includes( positiveSkills._id) )
                        {
                            var skillObj = {"name" : positiveSkills.name , "id" : positiveSkills._id};
                            skillPositive.push(skillObj);
                        }
                    }
                    else
                    {
                        var skillObj = {"name" : positiveSkills.name , "id" : positiveSkills._id};   
                        skillPositive.push(skillObj);
                    }
                });
                }
                // Check Condition for Negative Skills
                if (attribute.negative_skills.length > 0 ) {
                attribute.negative_skills.map(async (negativeSkills) => {
                    // Check If Use Location Skill is on 
                    if (location.use_location_skills == "1")
                    {
                        if (location.location_skills.includes( negativeSkills._id) )
                        {
                            var skillObj = {"name" : negativeSkills.name , "id" : negativeSkills._id};
                            skillNegative.push(skillObj);
                        }
                    }
                    else
                    {
                        var skillObj = {"name" : negativeSkills.name , "id" : negativeSkills._id};   
                        skillNegative.push(skillObj);
                    }
                    
                });
                }
            });
            
        }
        
        })
    })

    var userList = [] ;
    // User Loop Starts
    userData.map(async (user) => {  
        if (user.location_id.includes( req.body.main_location))
        {
            var userObj = { "name" : user.name , "id" : user._id , "image" : "" }
            userList.push(userObj)
        }
    })


    // Screen Saver 
    const screenSaver = await ScreenSaverData.find({ company_id: company_id }); 
    var screenSaverData = [];
    screenSaver.map((singelScreenSaver) => screenSaverData.push(singelScreenSaver) );
    

    // make final object
    var allDetails = {
        "name" : locationData.name,
        "id"   : locationData._id,
        "app_color" : locationData.app_color,
        "is_multilocation" : 0,
        "app_default_language":"english",
        "employee" : userList,
        "skill_positive"  : skillPositive ,
        "skill_negative"  : skillNegative ,
        "url" : "",
        "screen_saveer" : screenSaverData,
        "skill_flag" : 0 ,
        "qr_code" : ""

    }

    res.status(200).json({"status" : 200 , "message" : "All details"  ,"data" : allDetails});
}


//Action : skillFlag
//Comment : Skill Flag

export const skillFlag = async (req, res) => {

    var flag = { "flag" : 0 }
    res.status(200).json({"status" : 200 , "message" : "Flag of skill"  ,"data" : flag});
}

export const curlFunction = async (req, res) => {
  
}

