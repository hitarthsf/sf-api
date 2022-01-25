import CompanyData from "../models/CompanyData.js";
import UsersData from "../models/UsersData.js";
import EmployeeRatingData from "../models/EmployeeRating.js";
import EmployeeRatingSkillsData from "../models/EmployeeRatingSkills.js";
import _ from "lodash";


export const getSkill = async (req, res) => {
    
    var comapany = await CompanyData.findOne({_id : req.body.company_id});  
    
    var skillArray = [] ; 

    comapany.attributes.forEach((attribute) => {
        // Positive Skills
        if (attribute.positive_skills.length > 0 && req.body.type == 1) {
          attribute.positive_skills.map(async (positiveSkills) => {
              // check if this is the skill we need from employee skills
              ;
              if ( comapany.employee_skill.includes(positiveSkills._id))
              {
                skillArray.push(positiveSkills);
              }
          });
        }
        //Negative Skills
        if (attribute.negative_skills.length > 0 && req.body.type == 0) {
          attribute.negative_skills.map(async (negativeSkills) => {
            // check if this is the skill we need from employee skills
            if ( comapany.employee_skill.includes(negativeSkills._id))
            {
              skillArray.push(negativeSkills);
            }
          });
        }
      });

     res
      .status(200)
      .json({ data:skillArray, message: "Get Skills For Employee Feedback" });
}


//Action    : saveFeedback
//Usage     : save employee feedback

export const saveFeedback = async (req, res) => {

    var skills = req.body.skill_id;

    // save employee rating data 
    const employeeRatingObj = {
        location_id : req.body.location_id,
        company_id  : req.body.company_id,
        user_id     : req.body.user_id,
        employee_id : req.body.employee_id,
        rating      : req.body.rating,
        is_anonymous : req.body.is_anonymous,
        feedback    : req.body.feedback,
    }

    try{
        const employeeRating    = new EmployeeRatingData(employeeRatingObj);
        var employeeRatingSaved = await employeeRating.save();

        // save skills 
        if(skills.length > 0 )
        {
            skills.map(async (skillID) => { 
                const employeeRatingSkillObj = {
                    skills_id : skillID,
                    employee_ratings_id : employeeRatingSaved._id,
                }
                const employeeRatingSkill    = new EmployeeRatingSkillsData(employeeRatingSkillObj);
                await employeeRatingSkill.save();
            }); 
        }

        res
      .status(201)
      .json({ data:employeeRatingSaved, message: "Employee Feedback Saved" });
    }
    catch (error) {
        res.status(409).json({ message: error.message });
    }
}

//Action    : employeeList
//Usage     : employee Listing 

export const employeeList = async (req, res) => {

    
    // get all user 
    var users = await UsersData.find( { _id: { $ne: req.body.auth_user_id.toString() } , location_id : req.body.location_id   , type : "employee" }   );
    
    // looping to get formated data 
    res
    .status(201)
    .json({ data:users, message: "Employee List" });

}
