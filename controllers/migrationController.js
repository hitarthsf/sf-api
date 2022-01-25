
import UserLoginData from "../models/UserLoginData.js";
import _ from "lodash";
import mysql from "mysql";
import CompanyData from "../models/CompanyData.js";
import RatingData from "../models/RatingData.js";
import RatingSkillData from "../models/RatingSkillData.js";
import RatingEmployeeData from "../models/RatingEmployeeData.js";
import UsersData from "../models/UsersData.js";
import QRCode from "qrcode";
import aws from "aws-sdk";

//Migration Script For Company, Locations, Company Attributes, Company Skills
export const migrateCompanies = async (req, res) => {
  const connection = mysql.createConnection({
    host: "sf-test.czjpm3va57rx.ap-south-1.rds.amazonaws.com",
    user: "admin",
    port: 3306,
    password: "Rethinksoft",
    database: "ratings_db",
  });
  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");

    // Fetch Company main object
    await connection.query("SELECT * FROM location_area", async (err, rows) => {
      if (err) throw err;
      if (rows.length) {
        Promise.all(
          rows.map(async (company) => {
            const companyObject = company;
            companyObject["old_company_id"] = company.id;
            // Fetch company locations
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
            // Fetch company attributes & skills
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
                console.log('Vishal');
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

export const migrateUsers = async (req, res) => {
  const connection = mysql.createConnection({
    host: "192.168.64.2",
    user: "hitarth29",
    password: "Pfbvq3Ed4l/HMycS",
    database: "ratings_db",
  });
  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");
    const mongoCompanyList = await CompanyData.find();

    await Promise.all(
      mongoCompanyList.map(async (mongoCompany) => {
        const currentCompanyId = mongoCompany.old_company_id;
        await connection.query(
          `SELECT *  , GROUP_CONCAT(DISTINCT user_location.location_id) as location_ids , user_location.user_id as user_id FROM users
                                        LEFT JOIN user_location on users.id = user_location.user_id
                                        WHERE user_location.location_area_id = ${currentCompanyId} GROUP BY user_location.user_id`,
          async (err, rows) => {
            // adding if condition to check that are there any users
            if (rows.length > 0) {
              rows.map(async (rowUser) => {
                console.log("user");
                console.log(rowUser);

                const userData = rowUser;
                userData["company_id"] = mongoCompany._id;
                if (rowUser.location_ids) {
                  var userLocationIDs = [];
                  //console.log('mongoCompany.location', mongoCompany.location, rowUser.location_id);
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

export const migrateRatings = async (req, res) => {
  var page = req.query["page"];
  var skip = (page - 1) * 1000;

  const connection = mysql.createConnection({
    host: "sf-test.czjpm3va57rx.ap-south-1.rds.amazonaws.com",
    user: "admin",
    port: 3306,
    password: "Rethinksoft",
    database: "ratings_db",
  });
  // const connection = mysql.createConnection({
  //     host: '192.168.64.2',
  //     user: 'hitarth29',
  //     password: 'Pfbvq3Ed4l/HMycS',
  //     database: 'ratings_db'
  // });

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");

    // await connection.query(`SELECT
    //         ratings.*,
    //         rating_customer.name as customer_name,
    //         rating_customer.email as customer_email,
    //         rating_customer.phone as customer_phone
    //         from ratings
    //         left join rating_customer on ratings.id = rating_customer.ratings_id
    //         LIMIT 1  `, async (err, ratingRows) => { console.log(ratingRows);} );

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

    await connection.query(`SELECT
            ratings.*,
            rating_customer.name as customer_name,
            rating_customer.email as customer_email,
            rating_customer.phone as customer_phone
            from ratings
            left join rating_customer on ratings.id = rating_customer.ratings_id
            LIMIT 1000 OFFSET ${skip} `, async (err, ratingRows) => {

        ratingRows.map(async (ratingRow) => {

            const ratingObj = ratingRow;
            ratingObj['old_location_id'] = ratingRow.location_id;
            ratingObj['company_id'] = locationDataMap.get(ratingRow.location_id.toString()).companyNodeId;
            ratingObj['location_id'] = locationDataMap.get(ratingRow.location_id.toString()).nodeId;
            ratingObj['old_rating_id'] = ratingRow.id;
            

            const ratingMongoObj = new RatingData({...ratingObj, createdAt: ratingObj['created_at']});
            //await ratingMongoObj.save();
            console.log(ratingMongoObj);

            // skill code
             await connection.query(`SELECT ratings_skill.*, skills.name, skills.type
                from ratings_skill
                left join skills on skills.id = ratings_skill.skills_id
                WHERE ratings_id = ${ratingObj.id}`, async (err, ratingSkills) => {
                ratingObj['skills'] = ratingSkills;

                ratingSkills.map(async (mySqlRatingSkill) => {
                        if (mySqlRatingSkill.name) {
                            let skillId = null;

                            skillId = companyMap.get(locationDataMap.get(ratingObj.old_location_id.toString()).old_company_id).skills.get(mySqlRatingSkill.name);

                            if (skillId) {
                                const ratingSkillMongoObj = new RatingSkillData({
                                    rating_id: ratingMongoObj.id,
                                    skill_id: skillId,
                                    rating: ratingRow.rating,
                                    location_id: ratingObj.location_id,
                                    company_id: ratingObj.company_id,
                                    createdAt: ratingMongoObj.createdAt
                                });
                                //await ratingSkillMongoObj.save();
                                console.log(ratingSkillMongoObj)
                            }
                        }
                });
            });

            await connection.query(`SELECT rating_user.*
                from rating_user
                WHERE ratings_id = ${ratingObj.id}`, async (err, ratingEmployees) => {
                ratingObj['employees'] = ratingEmployees;

                ratingEmployees.map(async (mySqlRatingEmployee) => {
                    if (mySqlRatingEmployee.user_id) {

                            const ratingEmployeeMongoObj = new RatingEmployeeData({
                                rating_id: ratingMongoObj.id,
                                employee_id: userMap.get(mySqlRatingEmployee.user_id.toString()),
                                rating: ratingRow.rating,
                                location_id: ratingObj.location_id,
                                company_id: ratingObj.company_id,
                                createdAt: ratingMongoObj.createdAt
                            });
                            //await ratingEmployeeMongoObj.save();
                            console.log(ratingEmployeeMongoObj)
                    }
                });
            });
        });
    });
  });
  console.log("-----------------  DONE  -------------------");
  res.status(209).json(`total numbers of ratings  are imported.`);
};

// For loop migration
export const migrateRatingsLoop = async (req, res) => {
  var page = req.query["page"] ? req.query["page"] : 1;
  var skip = (page - 1) * 2500;

  const connection = mysql.createConnection({
    host: "sf-test.czjpm3va57rx.ap-south-1.rds.amazonaws.com",
    user: "admin",
    port: 3306,
    password: "Rethinksoft",
    database: "ratings_db",
  });
  // const connection = mysql.createConnection({
  //     host: '192.168.64.2',
  //     user: 'hitarth29',
  //     password: 'Pfbvq3Ed4l/HMycS',
  //     database: 'ratings_db'
  // });

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");

    var countOfTotal = await connection.query(
      `SELECT count(*) as count from ratings`,
      async (err, Tcount) => {
        Tcount.map(async (t_count) => {
          var totalCount = t_count.count;
        });
      }
    );

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
    // static count
    var totalCount = 97123;
    var loopCount = Math.ceil(totalCount / 2500);
    for (var i = 1; i <= loopCount + 1; i++) {
      var limit = i * 2500;
      var offset = (i - 1) * 2500;

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
            ratingObj["rating"] = 0;

            const ratingMongoObj = new RatingData({
              ...ratingObj,
              createdAt: ratingObj["created_at"],
            });
            //await ratingMongoObj.save();
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
                        rating: 0,
                        location_id: ratingObj.location_id,
                        company_id: ratingObj.company_id,
                        createdAt: ratingMongoObj.createdAt,
                      });
                      //await ratingSkillMongoObj.save();
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
                      rating: 0,
                      location_id: ratingObj.location_id,
                      company_id: ratingObj.company_id,
                      createdAt: ratingMongoObj.createdAt,
                    });
                    //await ratingEmployeeMongoObj.save();
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

export const migrateLogins = async (req, res) => {
  const connection = mysql.createConnection({
    host: "sf-test.czjpm3va57rx.ap-south-1.rds.amazonaws.com",
    user: "admin",
    port: 3306,
    password: "Rethinksoft",
    database: "ratings_db",
  });
  // const connection = mysql.createConnection({
  //     host: '192.168.64.2',
  //     user: 'hitarth29',
  //     password: 'Pfbvq3Ed4l/HMycS',
  //     database: 'ratings_db'
  // });
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

export const generateLocationQRcode = async (req, res) => {
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
        aws.config.update({
          accessKeyId: "AKIATVUCPHF35FWG7ZNI",
          secretAccessKey: "Bk500ixN5JrQ3IVldeSress9Q+dBPX6x3DFIL/qf",
          region: "us-east-1",
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
            res
              .status(409)
              .json({
                message: "Error occured while trying to upload to S3 bucket",
              });
          }
        });

        // Qr code generation
      });
    })
  );
};

export const locationSkills = async (req, res) => {
  const connection = mysql.createConnection({
    host: "sf-test.czjpm3va57rx.ap-south-1.rds.amazonaws.com",
    user: "admin",
    port: 3306,
    password: "Rethinksoft",
    database: "ratings_db",
  });

  connection.connect(async (err) => {
    if (err) throw err;
    console.log("You are now connected...");

    var companyObj = await CompanyData.find({
      _id: "61cc461c94a58604f9be7e61",
    });
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

export const testConnection = async (req, res) => {
  console.log("Vishal");
  const connection = mysql.createConnection({
    host: "servefirststack-rds-kch7qcnvlrum.ckhpypuhrn9e.eu-west-2.rds.amazonaws.com",
    user: "servefirst",
    port: 3306,
    password: "Xt444#bcdEh@D2F",
    database: "servefirst",
  });

  return "vishal";
};



//Action : createFromOld
//Comment : Create Rating From Old Ids 
export const createFromOld = async (req, res) => {
  // getting the data from request
  const data = req.body;
  const skills = data.skills ? data.skills.split(",") : [];
  const employees = data.employees ? data.employees.split(",") : [];
  var is_assign = data.employees ? "1" : "0";
  // get location_id and company_id from mongodb 
  var companyData   = await CompanyData.find();
  var mongoLocation = "" ; 
  var mongoCompany = "" ; 
  await companyData.map((comapny) => { comapny.location.map((locationData) =>  { if (locationData.old_location_id == data.location_id) {   mongoLocation = locationData  ; mongoCompany = comapny} } ) }); 

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
      const mongoUser = await UserData.findOne({"old_user_id": employeeId});
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
  await companyData.map((comapny) => { comapny.attribute.forEach((attribute) => {
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
  })
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

}

//Action : Audit Script
//Comment : Copy all audits
export const migrateAudits = async (req, res) => {

  const connection = mysql.createConnection({
    host: "sf-test.czjpm3va57rx.ap-south-1.rds.amazonaws.com",
    user: "admin",
    port: 3306,
    password: "Rethinksoft",
    database: "ratings_db",
  });
}
export const migrateSecondaryLocation = async (req, res) => {

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
  

  // loop for getting data and checking data starts 
  var companyDataLoop = allMongoCompanyObj.map(async (singleCompany) => { 
  singleCompany.location.map(async (locationData) => {
      await connection.query(
        `SELECT * FROM secondary_locations WHERE location_id=${locationData.old_location_id}`,
        async (err, rows) => {
          var secondaryLocation = [];
          rows.map(async (rowData) => {
            
            if (locationDataMap.get(rowData.secondary_location_id.toString())) {
              secondaryLocation.push(
                locationDataMap.get(rowData.secondary_location_id.toString()).nodeId.toString()
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
})
// loop for getting data and checking data ends 

res.status(200).json({"message": "imported" });
}