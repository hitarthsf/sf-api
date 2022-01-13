import UsersData from "../models/UsersData.js";
import CompanyData from "../models/CompanyData.js";

export const adminMail = async (req, res) => {

    var id = req.query.id;
    var userData = await UsersData.find({"type":"area_manager"});
    
    var locationDataMap = new Map();
    var company_id  = [] ;
    
    var company = await CompanyData.find({});
    await company.map(async (singleCompany) => {
        var location_id = [] ;
         await singleCompany.location.map( async (singelLocation) => {
            location_id.push(singelLocation._id);
        })
        locationDataMap.set(singleCompany._id,location_id);
    })

    
    var userData = await UsersData.find({type:"area_manager"});
    userData.find.map((user) => {
        var userLocation  = locationDataMap.get(user.company_id);
    })
    res.status(200).json({ data: userData, message: "Admin mail cron" });
}