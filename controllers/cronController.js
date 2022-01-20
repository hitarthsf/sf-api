import UsersData from "../models/UsersData.js";
import CompanyData from "../models/CompanyData.js";
import RatingData from "../models/RatingData.js";
import RatingEmployeeData from "../models/RatingEmployeeData.js";
import hbs from "nodemailer-express-handlebars";
import * as nodemailer from "nodemailer";
import * as path from "path";
import _ from "lodash";


export const adminMail = async (req, res) => {

    
    var userData = await UsersData.find({"type":"area_manager"});
    
    var locationDataMap = new Map();
    
    
    var companyData = await CompanyData.find({});
    // await company.map(async (singleCompany) => {
    //     var location_id = [] ;
    //      await singleCompany.location.map( async (singelLocation) => {
    //         location_id.push(singelLocation._id);
    //     })
    //     locationDataMap.set(singleCompany._id,location_id);
    // })
    
    var userData = await UsersData.find({type:"area_manager"});
    //    var userLocation  = locationDataMap.get("617fb45ad1bf0ec9a8cd3863");
    // get current week date 
    
    var start_date = new Date().toISOString().slice(0, 10)
    var enddate  = new Date();
    enddate.setDate(enddate.getDate() - 7);
    var end_date = enddate.toISOString().slice(0, 10); 
    var average = "0.0";
    var count   = "0";
    var location_id = [] ;
    userData.map(async (user) => {
        var company = await CompanyData.find({_id : user.company_id });
        await company.map(async (singleCompany) => {
           
             await singleCompany.location.map( async (singelLocation) => {
                location_id.push(singelLocation._id);
            })
          
        })
    })
    // get average count 
    average = await RatingData.aggregate([
        
        {
          $group: {
            _id: "_id",
            average: { $avg: "$rating" },
          },
        },
      ]);

      // get rating count 
     count = await RatingData.aggregate([
       
        {
          $count: "rating",
        },
      ]);
      
      // top location rank 
      const location_rank = await RatingData.aggregate([
        {
          $group: {
            _id: "$location_id",
            count: { $sum: 1 },
            average: { $avg: "$rating" },
          },
        },
        { $sort: { count: -1, average: -1 } },
        { $limit: 1 },
      ]);
      // get location name
      const responseData = await Promise.all(
        location_rank.map(async (locationData) => {
          locationData.locationName = "";
          const fetchedLocation = _.find(companyData.location, (location) => {
              if (location_id.includes(location._id))
              {
                return location._id == locationData._id;
              }
            
          });
          if (fetchedLocation) {
            locationData.locationName = fetchedLocation.name;
          }
        })
      );


      //Employee Rank
      // add rating id and locoation id condition
      const employee_rank = await RatingEmployeeData.aggregate([
       
        {
          $group: {
            _id: "$employee_id",
            count: { $sum: 1 },
            average: { $avg: "$rating" },
          },
        },
  
        { $sort: { count: -1, average: -1 } },
        { $limit: 1 },
      ]);

      const responseEmployeeData = await Promise.all(
        employee_rank.map(async (employee) => {
          employee.employeeName = "";
          if (
            employee._id != "1" &&
            employee._id != 1 &&
            employee._id != null &&
            employee._id != "undefined" &&
            employee._id != "null"
          ) {
              //console.log(employee._id);
            const fetchedEmployee = await UsersData.findOne({ _id: employee._id.toString() });
            if (fetchedEmployee) {
              employee.employeeName = fetchedEmployee.name;
            }
          }
        return employee;
        })
      );
      const data = [{ rating: average[0].average, count : count , location_rank : location_rank , employee_rank : employee_rank  }];
      // Email sending code
    const filePath = path.join(process.cwd(), "email");
    const logopath = path.join(process.cwd(), "email/images/logo.png");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hitarth.rc@@gmail.com",
        pass: "mrdldgjyzjfofnek",
      },
    });

    const handlebarOptions = {
      viewEngine: {
        partialsDir: filePath,
        defaultLayout: false,
      },
      viewPath: filePath,
    };

    transporter.use("compile", hbs(handlebarOptions));
    const mailOptions = {
      from: "youremail@gmail.com",
      to: "hitarth.rc@gmail.com",
      subject: "Mail",
      template: "cronMial",
      context: {
        average: average[0].average,
        count: count[0].rating,
        location_rank: location_rank[0].locationName,
        employee_rank: employee_rank[0].employeeName,
        
      },
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    // Email sending code end
    res.status(200).json({ data: data, message: "Admin mail cron" });
}