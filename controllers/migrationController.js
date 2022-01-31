import UserLoginData from "../models/UserLoginData.js";
import _ from "lodash";
import mysql from "mysql";
import CompanyData from "../models/CompanyData.js";
import RatingData from "../models/RatingData.js";
import RatingSkillData from "../models/RatingSkillData.js";
import RatingEmployeeData from "../models/RatingEmployeeData.js";
import UsersData from "../models/UsersData.js";
import TagData from "../models/TagData.js";
import QRCode from "qrcode";
import aws from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

//Method : Company Script
//Comment : Migration Script For Company, Locations, Company Attributes, Company Skills
export const migrateCompanies = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");

    // Get all Company details from MYSQL
    await connection.query("SELECT * FROM location_area", async (err, rows) => {
      if (err) throw err;
      if (rows.length) {
        Promise.all(
          rows.map(async (company) => {
            const companyObject = company;
            companyObject["old_company_id"] = company.id;
            // Fetch Company's All Locations
            await connection.query(
              `SELECT *, location.id as old_location_id FROM location WHERE location_area_id = ${company.id}`,
              async (err, rows) => {
                companyObject["location"] = rows;
              }
            );

            //Get Abusive Words
            await connection.query(
              `SELECT * FROM abusive_words`,
              async (err, row) => {
                companyObject["abusive_word"] = row;
              }
            );

            // Fetch Company's Attributes & Skills
            await connection.query(
              `SELECT 
                            attribute.id as attributeId, 
                            attribute.name as attributeName, 
                            attribute.created_at as createdAt, 
                            attribute.updated_at as updatedAt, 
                            attribute.deleted_at as deletedAt, 
                            skills.id as id, 
                            skills.name as name, 
                            skills.type as type 
                        FROM skills
                        LEFT JOIN location_area_skills on skills.id = location_area_skills.skill_id
                        LEFT JOIN location_area  on location_area.id = location_area_skills.location_area_id
                        LEFT JOIN attribute_skills on skills.id = attribute_skills.skill_id
                        LEFT JOIN attribute on attribute_skills.attribute_id = attribute.id
                        WHERE location_area.id=${company.id} AND attribute.id IS NOT NULL AND skills.is_active = 1 AND attribute.is_active = 1`,
              async (err, rows) => {
                const attributeRawGroupedData = _.chain(rows)
                  .groupBy("attributeId")
                  .map((value, key) => ({
                    attributeId: key,
                    value: value,
                  }))
                  .value();

                const attributes = [];
                attributeRawGroupedData.forEach((attributeRow) => {
                  if (attributeRow.value.length > 0) {
                    const positiveSkills = [];
                    const negativeSkills = [];
                    attributeRow.value.map((attributeValueRow) => {
                      if (attributeValueRow.type == 1) {
                        positiveSkills.push({
                          name: attributeValueRow.name,
                          old_skill_id: attributeValueRow.id,
                        });
                      } else {
                        negativeSkills.push({
                          name: attributeValueRow.name,
                          old_skill_id: attributeValueRow.id,
                        });
                      }
                    });
                    attributes.push({
                      createdAt: attributeRow.value[0].createdAt,
                      updatedAt: attributeRow.value[0].updatedAt,
                      deletedAt: attributeRow.value[0].deletedAt,
                      name: attributeRow.value[0].attributeName,
                      positive_skills: positiveSkills,
                      negative_skills: negativeSkills,
                    });
                  }
                });
                companyObject["attributes"] = attributes;
                console.log("Vishal");
                const newCompany = new CompanyData({
                  ...companyObject,
                  createdAt: new Date().toISOString(),
                });
                await newCompany.save();
                console.log(
                  `import successful for companyName: ${newCompany.name}, companyId: ${newCompany._id}`
                );
              }
            );
          })
        ).then((value) => {
          res.status(209).json(`total ${rows.length} companies are imported.`);
        });
      } else {
        res.status(409).json({ message: "No companies found." });
      }
    });
  });
};

//Method : Users Script
//Comment : Migrate all roles user Employee, Admin, Manager and Super Admin
export const migrateUsers = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");
    const mongoCompanyList = await CompanyData.find();

    await Promise.all(
      mongoCompanyList.map(async (mongoCompany) => {
        const currentCompanyId = mongoCompany.old_company_id;
        await connection.query(
          `SELECT *, GROUP_CONCAT(DISTINCT user_location.location_id) as location_ids , user_location.user_id as user_id FROM users LEFT JOIN user_location on users.id = user_location.user_id WHERE user_location.location_area_id = ${currentCompanyId} GROUP BY user_location.user_id`,
          async (err, rows) => {
            //Add User if any exists
            if (rows.length > 0) {
              rows.map(async (rowUser) => {
                console.log("user");
                console.log(rowUser);

                const userData = rowUser;
                userData["company_id"] = mongoCompany._id;
                if (rowUser.location_ids) {
                  var userLocationIDs = [];

                  const fetchedLocation = _.find(
                    mongoCompany.location,
                    (location) => {
                      if (
                        rowUser.location_ids
                          .split(",")
                          .includes(location.old_location_id)
                      ) {
                        userLocationIDs.push(location._id);
                      }
                    }
                  );

                  userData["location_id"] =
                    userLocationIDs.length > 0 ? userLocationIDs : "";
                  userData["old_user_id"] = rowUser.user_id;
                  const mongoUserData = new UsersData({
                    ...userData,
                    createdAt: new Date().toISOString(),
                  });
                  await mongoUserData.save();
                }
              });
            }
          }
        );
        console.log(
          `import successful for companyName: ${mongoCompany.name}, companyId: ${mongoCompany._id}`
        );
      })
    ).then((value) => {
      res
        .status(209)
        .json(`total ${mongoCompanyList.length} company users are imported.`);
    });
  });
};

//Method : Migrate Ratings
//Comment : Migrate all Ratings
export const migrateRatings = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });

  var page = req.query["page"];
  var skip = (page - 1) * 1000;

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");
    const allMongoCompanyObj = await CompanyData.find();

    var companyMap = new Map();
    // location object
    var locationDataMap = new Map();
    // all company loop
    var companyDataLoop = allMongoCompanyObj.map(async (singleCompany) => {
      // getting skill loop
      var skillMap = new Map();
      singleCompany.attributes.forEach((attribute) => {
        // Positive Skills
        if (attribute.positive_skills.length > 0) {
          attribute.positive_skills.map(async (positiveSkills) => {
            skillMap.set(positiveSkills.name, positiveSkills._id);
          });
        }
        //Negative Skills
        if (attribute.negative_skills.length > 0) {
          attribute.negative_skills.map(async (negativeSkills) => {
            skillMap.set(negativeSkills.name, negativeSkills._id);
          });
        }
      });

      //Setting Location Object
      singleCompany.location.map(async (location) => {
        var locationObject = {
          nodeId: location._id,
          companyNodeId: singleCompany._id,
          old_company_id: singleCompany.old_company_id,
        };
        locationDataMap.set(location.old_location_id, locationObject);
      });

      // setting company object
      var compnayObject = {
        nodeId: singleCompany._id,
        skills: skillMap,
      };
      companyMap.set(singleCompany.old_company_id, compnayObject);
    });
    // user array
    var userArray = [];
    var userMap = new Map();
    const allUser = await UsersData.find();
    allUser.map(async (user) => {
      userMap.set(user.old_user_id, user._id);
    });

    await connection.query(
      `SELECT
            ratings.*,
            rating_customer.name as customer_name,
            rating_customer.email as customer_email,
            rating_customer.phone as customer_phone
            from ratings
            left join rating_customer on ratings.id = rating_customer.ratings_id
            LIMIT 1000 OFFSET ${skip} `,
      async (err, ratingRows) => {
        ratingRows.map(async (ratingRow) => {
          const ratingObj = ratingRow;
          ratingObj["old_location_id"] = ratingRow.location_id;
          ratingObj["company_id"] = locationDataMap.get(
            ratingRow.location_id.toString()
          ).companyNodeId;
          ratingObj["location_id"] = locationDataMap.get(
            ratingRow.location_id.toString()
          ).nodeId;
          ratingObj["old_rating_id"] = ratingRow.id;

          const ratingMongoObj = new RatingData({
            ...ratingObj,
            createdAt: ratingObj["created_at"],
          });
          await ratingMongoObj.save();
          console.log(ratingMongoObj);

          // skill code
          await connection.query(
            `SELECT ratings_skill.*, skills.name, skills.type
                from ratings_skill
                left join skills on skills.id = ratings_skill.skills_id
                WHERE ratings_id = ${ratingObj.id}`,
            async (err, ratingSkills) => {
              ratingObj["skills"] = ratingSkills;

              ratingSkills.map(async (mySqlRatingSkill) => {
                if (mySqlRatingSkill.name) {
                  let skillId = null;

                  skillId = companyMap
                    .get(
                      locationDataMap.get(ratingObj.old_location_id.toString())
                        .old_company_id
                    )
                    .skills.get(mySqlRatingSkill.name);

                  if (skillId) {
                    const ratingSkillMongoObj = new RatingSkillData({
                      rating_id: ratingMongoObj.id,
                      skill_id: skillId,
                      rating: ratingRow.rating,
                      location_id: ratingObj.location_id,
                      company_id: ratingObj.company_id,
                      createdAt: ratingMongoObj.createdAt,
                    });
                    await ratingSkillMongoObj.save();
                    console.log(ratingSkillMongoObj);
                  }
                }
              });
            }
          );

          await connection.query(
            `SELECT rating_user.*
                from rating_user
                WHERE ratings_id = ${ratingObj.id}`,
            async (err, ratingEmployees) => {
              ratingObj["employees"] = ratingEmployees;

              ratingEmployees.map(async (mySqlRatingEmployee) => {
                if (mySqlRatingEmployee.user_id) {
                  const ratingEmployeeMongoObj = new RatingEmployeeData({
                    rating_id: ratingMongoObj.id,
                    employee_id: userMap.get(
                      mySqlRatingEmployee.user_id.toString()
                    ),
                    rating: ratingRow.rating,
                    location_id: ratingObj.location_id,
                    company_id: ratingObj.company_id,
                    createdAt: ratingMongoObj.createdAt,
                  });
                  await ratingEmployeeMongoObj.save();
                  console.log(ratingEmployeeMongoObj);
                }
              });
            }
          );
        });
      }
    );
  });
  console.log("-----------------  DONE  -------------------");
  res.status(209).json(`total numbers of ratings  are imported.`);
};

// For loop migration
export const migrateRatingsLoop = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });

  // static count
  var RECORD_COUNT = 50000;
  var totalCount = 100000;
  var loopCount = Math.ceil(totalCount / RECORD_COUNT);

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");
  
    const allMongoCompanyObj = await CompanyData.find();
    var companyMap = new Map();
    // location object
    var locationDataMap = new Map();
    // all company loop
    var companyDataLoop = allMongoCompanyObj.map(async (singleCompany) => {
      // getting skill loop
      var skillMap = new Map();
      singleCompany.attributes.forEach((attribute) => {
        // Positive Skills
        if (attribute.positive_skills.length > 0) {
          attribute.positive_skills.map(async (positiveSkills) => {
            skillMap.set(positiveSkills.name, positiveSkills._id);
          });
        }
        //Negative Skills
        if (attribute.negative_skills.length > 0) {
          attribute.negative_skills.map(async (negativeSkills) => {
            skillMap.set(negativeSkills.name, negativeSkills._id);
          });
        }
      });

      //Setting locatino object
      singleCompany.location.map(async (location) => {
        var locationObject = {
          nodeId: location._id,
          companyNodeId: singleCompany._id,
          old_company_id: singleCompany.old_company_id,
        };
        locationDataMap.set(location.old_location_id, locationObject);
      });

      // setting company object
      var compnayObject = {
        nodeId: singleCompany._id,
        skills: skillMap,
      };
      companyMap.set(singleCompany.old_company_id, compnayObject);
    });
    // user array
    var userArray = [];
    var userMap = new Map();
    const allUser = await UsersData.find();
    allUser.map(async (user) => {
      userMap.set(user.old_user_id, user._id);
    });
    
    // replace 2 with loopCount in below line to start loop
    for (var i = 1; i <= loopCount + 1; i++) {
      var limit = i * RECORD_COUNT;
      var offset = (i - 1) * RECORD_COUNT;

      await connection.query(
        `SELECT
              ratings.*,
              rating_customer.name as customer_name,
              rating_customer.email as customer_email,
              rating_customer.phone as customer_phone
              from ratings
              left join rating_customer on ratings.id = rating_customer.ratings_id
              LIMIT ${limit} OFFSET ${offset} `,
        async (err, ratingRows) => {
          ratingRows.map(async (ratingRow) => {
            const ratingObj = ratingRow;
            ratingObj["old_location_id"] = ratingRow.location_id;
            ratingObj["company_id"] = locationDataMap.get(
              ratingRow.location_id.toString()
            ).companyNodeId;
            ratingObj["location_id"] = locationDataMap.get(
              ratingRow.location_id.toString()
            ).nodeId;
            ratingObj["old_rating_id"] = ratingRow.id;
            ratingObj["rating"] = ratingRow.rating;

            const ratingMongoObj = new RatingData({
              ...ratingObj,
              createdAt: ratingObj["created_at"],
            });
            await ratingMongoObj.save();
            console.log(ratingMongoObj);

            // skill code
            await connection.query(
              `SELECT ratings_skill.*, skills.name, skills.type
                  from ratings_skill
                  left join skills on skills.id = ratings_skill.skills_id
                  WHERE ratings_id = ${ratingObj.id}`,
              async (err, ratingSkills) => {
                ratingObj["skills"] = ratingSkills;

                ratingSkills.map(async (mySqlRatingSkill) => {
                  if (mySqlRatingSkill.name) {
                    let skillId = null;

                    skillId = companyMap
                      .get(
                        locationDataMap.get(
                          ratingObj.old_location_id.toString()
                        ).old_company_id
                      )
                      .skills.get(mySqlRatingSkill.name);

                    if (skillId) {
                      const ratingSkillMongoObj = new RatingSkillData({
                        rating_id: ratingMongoObj.id,
                        skill_id: skillId,
                        rating: ratingRow.rating,
                        location_id: ratingObj.location_id,
                        company_id: ratingObj.company_id,
                        createdAt: ratingMongoObj.createdAt,
                      });
                      await ratingSkillMongoObj.save();
                      console.log(ratingSkillMongoObj);
                    }
                  }
                });
              }
            );

            await connection.query(
              `SELECT rating_user.*
                  from rating_user
                  WHERE ratings_id = ${ratingObj.id}`,
              async (err, ratingEmployees) => {
                ratingObj["employees"] = ratingEmployees;

                ratingEmployees.map(async (mySqlRatingEmployee) => {
                  if (mySqlRatingEmployee.user_id) {
                    const ratingEmployeeMongoObj = new RatingEmployeeData({
                      rating_id: ratingMongoObj.id,
                      employee_id: userMap.get(
                        mySqlRatingEmployee.user_id.toString()
                      ),
                      rating: ratingRow.rating,
                      location_id: ratingObj.location_id,
                      company_id: ratingObj.company_id,
                      createdAt: ratingMongoObj.createdAt,
                    });
                    await ratingEmployeeMongoObj.save();
                    console.log(ratingEmployeeMongoObj);
                  }
                });
              }
            );
          });
        }
      );
    }
  });
  console.log("-----------------  DONE  -------------------");
  res.status(209).json(`total numbers of ratings  are imported.`);
};

//Method : Migrate User Login
//Comment : Migrate all login logs for users
export const migrateLogins = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");
  });

  await connection.query(`SELECT * FROM user_logins`, async (err, rows) => {
    rows.map(async (row) => {
      const mongoUser = await UserMigratedData.findOne({
        old_user_id: row.user_id,
      });
      if (mongoUser) {
        const userLoginObj = new UserLoginData({
          user_id: mongoUser._id,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
          old_user_login_id: row.id,
        });
        await userLoginObj.save();
        console.log(`userLoginObject ${userLoginObj.id} saved`, userLoginObj);
      }
    });
    res.status(209).json(`total ${rows.length} user login data are imported.`);
  });
};

//Method : Generate QR Code
//Comment : Generate QR Code For All Locations
export const generateLocationQRcode = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });

  const mongoCompanyList = await CompanyData.find();

  await Promise.all(
    mongoCompanyList.map(async (mongoCompany) => {
      mongoCompany.location.map(async (location) => {
        // Qr code generation
        const qrOption = {
          margin: 7,
          width: 175,
        };
        const qrString =
          process.env.BASE_URL_LOCAL + "/front/login?=" + location.location_id;
        const base64String = await QRCode.toDataURL(qrString, qrOption);
        var imgData = base64String;
        var base64Data = imgData.replace(/^data:image\/png;base64,/, "");
        var qr_image = `qrCode/` + location.id + `.png`;
        var bf = Buffer.from(
          base64String.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        );

        //Set AWS creds
        aws.config.update({
          accessKeyId: process.env.AWS_S3_API_KEY,
          secretAccessKey: process.env.AWS_S3_ACCESS_KEY,
          region: process.env.AWS_S3_ACCESS_REGION,
        });

        const s3 = new aws.S3();
        var params = {
          ACL: "public-read",
          Bucket: "sf-ratings-profile-image",
          Body: bf,
          Key: qr_image,
        };

        s3.upload(params, (err, data) => {
          if (err) {
            console.log(
              "Error occured while trying to upload to S3 bucket",
              err
            );
            res.status(409).json({
              message: "Error occured while trying to upload to S3 bucket",
            });
          }
        });
        // Qr code generation
      });
    })
  );
};

//Method : Location Skills Table
//Comment : Get all locations skills
export const locationSkills = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");

    var companyObj = await CompanyData.find();
    await Promise.all(
      companyObj.map(async (singleCompany) => {
        var locationSkill = [];
        var skillMap = new Map();
        singleCompany.attributes.forEach((attribute) => {
          // Positive Skills
          if (attribute.positive_skills.length > 0) {
            attribute.positive_skills.map(async (positiveSkills) => {
              skillMap.set(positiveSkills.old_skill_id, positiveSkills._id);
            });
          }
          //Negative Skills
          if (attribute.negative_skills.length > 0) {
            attribute.negative_skills.map(async (negativeSkills) => {
              skillMap.set(negativeSkills.old_skill_id, negativeSkills._id);
            });
          }
        });

        // location loop
        singleCompany.location.map(async (locationData) => {
          await connection.query(
            `SELECT * FROM location_area_skills WHERE location_id= ${locationData.old_location_id}`,
            async (err, rows) => {
              var locationSkill = [];
              rows.map(async (rowData) => {
                if (skillMap.get(rowData.skill_id.toString())) {
                  locationSkill.push(
                    skillMap.get(rowData.skill_id.toString()).toString()
                  );
                }
              });

              console.log(locationSkill);
              var companyUpdate = await CompanyData.updateOne(
                { _id: singleCompany._id, "location._id": locationData._id },
                {
                  $set: {
                    "location.$.location_skills": locationSkill,
                  },
                }
              );
            }
          );
        });
      })
    );
  });
};

//Action : createFromOld
//Comment : Create Rating From Old Ids
export const createFromOld = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });

  // getting the data from request
  const data = req.body;
  const skills = data.skills ? data.skills.split(",") : [];
  const employees = data.employees ? data.employees.split(",") : [];
  var is_assign = data.employees ? "1" : "0";
  // get location_id and company_id from mongodb
  var companyData = await CompanyData.find();
  var mongoLocation = "";
  var mongoCompany = "";
  await companyData.map((comapny) => {
    comapny.location.map((locationData) => {
      if (locationData.old_location_id == data.location_id) {
        mongoLocation = locationData;
        mongoCompany = comapny;
      }
    });
  });

  // creating rating object
  const ratingObj = {
    location_id: mongoLocation._id,
    company_id: mongoCompany._id,
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
          location_id: data.location_id,
          type: { $in: ["employee", "location_manager"] },
        },
      },
    ]);
    employees_ids.forEach(function (myDoc) {
      employees.push(myDoc._id);
    });
  }

  if (employees.length > 0) {
    // get user from monogo
    employees.map(async (employeeId) => {
      const mongoUser = await UserData.findOne({ old_user_id: employeeId });
      const savedEmployees = new RatingEmployeeData({
        rating_id: rating._id,
        employee_id: mongoUser._id,
        rating: data.rating,
        location_id: data.location_id,
        company_id: data.company_id,
      });
      console.log(savedEmployees);

      await savedEmployees.save();
    });
  }

  // getting the skill array from the company
  // getting skill loop
  var skillMap = new Map();
  await companyData.map((comapny) => {
    comapny.attribute.forEach((attribute) => {
      // Positive Skills
      if (attribute.positive_skills.length > 0) {
        attribute.positive_skills.map(async (positiveSkills) => {
          skillMap.set(positiveSkills.old_skill_id, positiveSkills._id);
        });
      }
      //Negative Skills
      if (attribute.negative_skills.length > 0) {
        attribute.negative_skills.map(async (negativeSkills) => {
          skillMap.set(negativeSkills.old_skill_id, negativeSkills._id);
        });
      }
    });
  });

  if (skills.length > 0) {
    skills.map(async (skillId) => {
      const savedSkills = new RatingSkillData({
        rating_id: rating._id,
        skill_id: skillMap.get(skillId.toString()),
        rating: data.rating,
        location_id: data.location_id,
        company_id: data.company_id,
      });
      await savedSkills.save();
    });
  }

  res.status(201).json(rating);
};

//Action : Tag Script
//Comment : Copy all Tags
export const migrateTags = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");
  });

  //Get all company and location ids
  const allCompanyObj = await CompanyData.find();
  var locationDataMap = new Map();
  var companyDataMap = new Map();
  await allCompanyObj.map(async (singleCompany) => {
    //Setting Company Objects
    companyDataMap.set(singleCompany.old_company_id, singleCompany._id);

    //Setting Location Objects
    singleCompany.location.map(async (location) => {
      var locationObject = {
        nodeId: location._id,
        companyNodeId: singleCompany._id,
        old_company_id: singleCompany.old_company_id,
      };
      locationDataMap.set(location.old_location_id, location._id);
    });
  });

  //Get all Tags from mysql
  await connection.query(`SELECT * FROM tag`, async (err, rows) => {
    rows.map(async (row) => {
      //Get Company for The Tag
      await connection.query(
        `SELECT * FROM tag_region where tag_id = ${row.id}`,
        async (err, tagArearows) => {
          tagArearows.map(async (tagArearow) => {
            var companyId = companyDataMap.get(tagArearow.location_area_id);

            //Get all Locations
            await connection.query(
              `SELECT * FROM tag_location where tag_id = ${row.id}`,
              async (err, tagArearows) => {}
            );

            const tagObj = new TagData({
              old_id: row.id,
              name: row.name,
              company_id: companyId,
              location_id: [],
              createdAt: new Date(row.created_at),
              updatedAt: new Date(row.updated_at),
            });
            console.log(tagObj);
          });
        }
      );

      //await tagObj.save();
    });
    res.status(209).json(`total ${rows.length} user login data are imported.`);
  });
};

//Action : Audit Script
//Comment : Copy all audits
export const migrateAudits = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");
    const allCompanyObj = await CompanyData.find();
    var locationDataMap = new Map();
    var companyDataMap = new Map();
    await allCompanyObj.map(async (singleCompany) => {
      //Setting Company Objects
      companyDataMap.set(singleCompany.old_company_id, singleCompany._id);

      //Setting Location Objects
      singleCompany.location.map(async (location) => {
        var locationObject = {
          nodeId: location._id,
          companyNodeId: singleCompany._id,
          old_company_id: singleCompany.old_company_id,
        };
        locationDataMap.set(location.old_location_id, location._id);
      });
    });

    res.status(201).json(allCompanyObj);
  });
};

export const migrateSecondaryLocation = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");

    const allMongoCompanyObj = await CompanyData.find();

    var companyMap = new Map();
    // location object
    var locationDataMap = new Map();

    // loop start for company
    var companyDataLoop = allMongoCompanyObj.map(async (singleCompany) => {
      //Setting locatino object
      singleCompany.location.map(async (location) => {
        var locationObject = {
          nodeId: location._id,
          companyNodeId: singleCompany._id,
          old_company_id: singleCompany.old_company_id,
        };
        locationDataMap.set(location.old_location_id, locationObject);
      });
    });

    // loop ends for company

    // loop start for company
    var companyDataLoop = allMongoCompanyObj.map(async (singleCompany) => {
      //Setting locatino object
      singleCompany.location.map(async (location) => {
        var locationObject = {
          nodeId: location._id,
          companyNodeId: singleCompany._id,
          old_company_id: singleCompany.old_company_id,
        };
        locationDataMap.set(location.old_location_id, locationObject);
      });
    });

    // loop ends for company

    // loop for getting data and checking data starts
    var companyDataLoop = allMongoCompanyObj.map(async (singleCompany) => {
      singleCompany.location.map(async (locationData) => {
        await connection.query(
          `SELECT * FROM secondary_locations WHERE location_id=${locationData.old_location_id}`,
          async (err, rows) => {
            var secondaryLocation = [];
            rows.map(async (rowData) => {
              if (
                locationDataMap.get(rowData.secondary_location_id.toString())
              ) {
                secondaryLocation.push(
                  locationDataMap
                    .get(rowData.secondary_location_id.toString())
                    .nodeId.toString()
                );
              }
            });

            console.log(secondaryLocation);
            var companyUpdate = await CompanyData.updateOne(
              { _id: singleCompany._id, "location._id": locationData._id },
              {
                $set: {
                  "location.$.secondary_location": secondaryLocation,
                },
              }
            );
          }
        );
        const allCompanyObj = await CompanyData.find();
        var locationDataMap = new Map();
        await allCompanyObj.map(async (singleCompany) => {
          //Setting locatino object
          singleCompany.location.map(async (location) => {
            var locationObject = {
              nodeId: location._id,
              companyNodeId: singleCompany._id,
              old_company_id: singleCompany.old_company_id,
            };
            locationDataMap.set(location.old_location_id, location._id);
          });
        });
        console.log(locationDataMap);
        res.status(201).json(locationDataMap);
      });
    });
  });
  // loop for getting data and checking data ends

  res.status(200).json({ message: "imported" });
};

//Action : Test Connection
//Comment : Test DB connection
export const testConnection = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");
    res.status(201).json("You are now connectd...");
  });
};

//Action : saveRatingData
//Comment : saveRatingData
export const saveRatingData = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });

  // static count
  var RECORD_COUNT = 5000;
  var totalCount = 150000;
  var loopCount = Math.ceil(totalCount / RECORD_COUNT);

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");
    const allMongoCompanyObj = await CompanyData.find();

    var companyMap = new Map();
    // location object
    var locationDataMap = new Map();
    // all company loop
    var companyDataLoop = allMongoCompanyObj.map(async (singleCompany) => {
      //Setting Location Object
      singleCompany.location.map(async (location) => {
        var locationObject = {
          nodeId: location._id,
          companyNodeId: singleCompany._id,
          old_company_id: singleCompany.old_company_id,
        };
        locationDataMap.set(location.old_location_id, locationObject);
      });
    });

    // Decalre an array for rating
    var ratingArray = [];
    
    for (let i = 0; i < loopCount + 1; i++) {
      // if(i === 0) {
      //   var limit = RECORD_COUNT;
      //   var offset = 0;
      // } else {
      //   var limit = i * RECORD_COUNT;
      //   var offset = (i - 1) * RECORD_COUNT;
      // }
      var offset = i * RECORD_COUNT;
      var query_string = `SELECT
      ratings.*,
      rating_customer.name as customer_name,
      rating_customer.email as customer_email,
      rating_customer.phone as customer_phone
      from ratings
      left join rating_customer on ratings.id = rating_customer.ratings_id 
      LIMIT ${RECORD_COUNT} OFFSET ${offset}`;
      console.log('-----'+i+'-----');
      console.log(query_string);
      // Rating query starts
      var ratingsDataArray = await connection.query(
        `SELECT
            ratings.*,
            rating_customer.name as customer_name,
            rating_customer.email as customer_email,
            rating_customer.phone as customer_phone
            from ratings
            left join rating_customer on ratings.id = rating_customer.ratings_id 
            LIMIT ${RECORD_COUNT} OFFSET ${offset}`,
        async (err, ratingRows) => {
          var getData = ratingRows.map(async (ratingRow) => {
            const ratingObj = ratingRow;
            ratingObj["old_location_id"] = ratingRow.location_id;
            ratingObj["company_id"] = locationDataMap.get(
              ratingRow.location_id.toString()
            ).companyNodeId;
            ratingObj["location_id"] = locationDataMap.get(
              ratingRow.location_id.toString()
            ).nodeId;
            ratingObj["old_rating_id"] = ratingRow.id;

            const ratingMongoObj = new RatingData({
              ...ratingObj,
              createdAt: ratingObj["created_at"],
            });

            ratingArray.push(ratingMongoObj);
          });
          Promise.all(getData);
          Promise.all(getData).then(async () => {            
            RatingData.insertMany(ratingArray, (err, docs) => {
              if (err) {
                console.log(i);
                console.log("Insert Error", err);
                //console.log("Insert Error", err);
              } else {
                console.log(i);
                console.log("Successful Insert");
                ratingArray = [];
              }
            });
          });
        }
      );
      console.log("Loop Ends ");
    }
  });
  res.status(200).json(`Ratings imported`);
};

//Action : saveRatingEmployee
//Comment : Save Employee for Ratings
export const saveRatingEmployee = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");
  });

  //Get All Users
  var userMap = new Map();
  const allUser = await UsersData.find();
  allUser.map(async (user) => {
    userMap.set(parseInt(user.old_user_id), user._id.toString());
  });

  //Get All Ratings
  var ratingMap = new Map();
  const allRatings = await RatingData.find();
  allRatings.map(async (rating) => {
    var ratingObject = {
      ratingNewId: rating._id,
      ratingOldId: rating.old_rating_id,
    };
    ratingMap.set(rating.old_rating_id, ratingObject);
  });

  //Get All Company and Locations
  const allCompanyObj = await CompanyData.find();
  var locationDataMap = new Map();
  var companyDataMap = new Map();
  await allCompanyObj.map(async (singleCompany) => {
    //Setting Company Objects
    companyDataMap.set(singleCompany.old_company_id, singleCompany._id);

    //Setting Location Objects
    singleCompany.location.map(async (location) => {
      locationDataMap.set(location.old_location_id, location._id);
    });
  });

  // Decalre an array for rating
  var ratingEmpArray = [];

  //Get All Employee Ratings
  for (let i = 0; i < 2; i++) {
    connection.query(
      `SELECT *, rating_user.user_id as rating_user_id,location.id as location_id, location.location_area_id as location_area_id
    from rating_user
    LEFT JOIN ratings on ratings.id = rating_user.ratings_id
    LEFT JOIN location on location.id = ratings.location_id
    WHERE rating_user.user_id != 0 limit 2`,
      async (err, ratingEmpRows) => {
        var getData = ratingEmpRows.map(async (ratingEmpRow) => {
          const ratingEmpObj = new Object();

          ratingEmpObj["rating_id"] = ratingMap
            .get(ratingEmpRow.ratings_id.toString())
            .ratingNewId.toString();
          ratingEmpObj["sfv1_old_rating_id"] = parseInt(
            ratingEmpRow.ratings_id
          );

          ratingEmpObj["employee_id"] = userMap.get(
            ratingEmpRow.rating_user_id
          );
          ratingEmpObj["sfv1_old_employee_id"] = ratingEmpRow.rating_user_id;

          ratingEmpObj["rating"] = ratingEmpRow.rating;

          ratingEmpObj["location_id"] = locationDataMap
            .get(ratingEmpRow.location_id.toString())
            .toString();
          ratingEmpObj["sfv1_old_location_id"] = ratingEmpRow.location_id;

          ratingEmpObj["company_id"] = companyDataMap
            .get(ratingEmpRow.location_area_id)
            .toString();
          ratingEmpObj["sfv1_old_company_id"] = ratingEmpRow.location_area_id;

          const ratingEmpMongoObj = new RatingEmployeeData({
            ...ratingEmpObj,
            createdAt: ratingEmpRow.created_at,
          });
          console.log(ratingEmpMongoObj);
          ratingEmpArray.push(ratingEmpMongoObj);
        });

        await Promise.all(getData);
        Promise.all(getData).then(() => {
          RatingEmployeeData.insertMany(ratingEmpArray);
          console.log(ratingEmpArray);
          console.log("Rating Employee Saved");
          ratingEmpArray = [];
        });
      }
    );
  }
  console.log("Finish");
};

//Action : Only Rating  Skill
//Comment : saveRatingSkillData
export const saveRatingSkillData = async (req, res) => {
  const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: 3306,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
  });
  var skillMap = new Map();
  const allMongoCompanyObj = await CompanyData.find();
  // All company loop
  var companyDataLoop = allMongoCompanyObj.map(async (singleCompany) => {
    //Getting Skill Loop

    singleCompany.attributes.forEach((attribute) => {
      //Positive Skills
      if (attribute.positive_skills.length > 0) {
        attribute.positive_skills.map(async (positiveSkills) => {
          skillMap.set(positiveSkills.name, positiveSkills._id);
        });
      }
      //Negative Skills
      if (attribute.negative_skills.length > 0) {
        attribute.negative_skills.map(async (negativeSkills) => {
          skillMap.set(negativeSkills.name, negativeSkills._id);
        });
      }
    });
  });

  const allMongoRatingObj = await RatingData.find();
  var ratingMap = new Map();
  allMongoRatingObj.map(async (rating) => {
    var ratingObj = {
      id: rating._id,
      rating: rating.rating,
    };
    ratingMap.set(rating.old_rating_id, ratingObj);
  });

  var ratingArray = [];
  // query starts
  for (let i = 0; i < 2; i++) {
    var ratingsDataArray = connection.query(
      `SELECT ratings_skill.id , ratings_skill.ratings_id , ratings_skill.skills_id , ratings_skill.created_at , ratings_skill.updated_at ,skills.id as skill_id ,  skills.name as skill_name from ratings_skill left join skills on skills.id = ratings_skill.skills_id limit 2`,
      async (err, ratingSkillRows) => {
        var getData = ratingSkillRows.map(async (ratingRow) => {
          console.log(ratingMap.get(ratingRow.id.toString()));
          const ratingMongoObj = {
            rating_id: ratingMap.get(ratingRow.id.toString()).id,
            sfv1_old_rating_id: ratingRow.id,
            skill_id: skillMap.get(ratingRow.skill_name.toString()),
            sfv1_old_skill_id: ratingRow.skill_id,
            rating: ratingMap.get(ratingRow.id.toString()).rating,
            updatedAt: ratingRow.updated_at,
            createdAt: ratingRow.created_at,
          };

          ratingArray.push(ratingMongoObj);
        });
        await Promise.all(getData);
        Promise.all(getData).then(() => {
          RatingSkillData.insertMany(ratingArray);
          console.log(ratingArray);
          console.log("Rating Skill Saved");
          ratingArray = [];
        });
      }
    );
  }
  res.status(200).json(`Ratings Skills saved `);
};
