import hubspot from "@hubspot/api-client";
const API_KEY = "d2ba2004-5a85-4475-bf5d-91ac88d87090";
const hubspotClient = new hubspot.Client({
  apiKey: API_KEY,
});

//Hubspot Function to Send Mail to Users
export const sendMail = async (req, res) => {
  //Message Settings
  const message = {
    from: req.body.from,
    to: req.body.to,
    replyTo: req.body.replyTo,
  };

  //Contact Detail
  const contactProperties = req.body.contactProperties;

  //Custum Values
  const customProperties = req.body.customProperties;

  const PublicSingleSendRequestEgg = {
    message,
    contactProperties,
    customProperties,
    emailId: req.body.emailId,
  };

  try {
    const apiResponse =
      await hubspotClient.marketing.transactional.singleSendApi.sendEmail(
        PublicSingleSendRequestEgg
      );
    res.status(201).json(apiResponse.body);
  } catch (e) {
    e.message === "HTTP request failed"
      ? res.status(400).json(e.response)
      : res.status(400).json(e);
  }
};

//Hubspot Method Create Contact (User)
export const getHubspotCompanies = async (req, res) => {
  try {
    const apiResponse = await hubspotClient.crm.companies.getAll();
    res.status(201).json(apiResponse);
  } catch (e) {
    e.message === "HTTP request failed"
      ? res.status(400).json(e.response)
      : res.status(400).json(e);
  }
};

//Hubspot Method Create Contact
export const createContact = async (req, res) => {
  const properties = {
    company: req.body.company,
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phone: req.body.phone,
    website: req.body.website,
  };

  const SimplePublicObjectInput = { properties };

  try {
    const apiResponse = await hubspotClient.crm.contacts.basicApi.create(
      SimplePublicObjectInput
    );
    res.status(201).json(apiResponse.body);
  } catch (e) {
    e.message === "HTTP request failed"
      ? res.status(400).json(e.response)
      : res.status(400).json(e);
  }
};

//Hubspot Metod to Delete Contact
export const deleteContact = async (req, res) => {
  const contactId = req.body.contactId;
  try {
    const apiResponse = await hubspotClient.crm.contacts.basicApi.archive(
      contactId
    );
    res.status(201).json(apiResponse);
  } catch (e) {
    e.message === "HTTP request failed"
      ? res.status(400).json(e.response)
      : res.status(400).json(e);
  }
};

//Hubspot Method Assign Contact to Company
export const assignContactToCompany = async (req, res) => {
  //   const contactId = "667551";
  //   const toObjectType = "company";
  //   const after = undefined;
  //   const limit = 500;

  const companyId = "3407645494";
  const toObjectType = "contact";
  const toObjectId = "667551";
  const associationType = "7655212425";
  try {
    // const apiResponse = await hubspotClient.crm.contacts.associationsApi.getAll(
    //   contactId,
    //   toObjectType,
    //   after,
    //   limit
    // );

    const apiResponse =
      await hubspotClient.crm.companies.associationsApi.create(
        companyId,
        toObjectType,
        toObjectId,
        associationType
      );
    res.status(201).json(apiResponse.body);
  } catch (e) {
    e.message === "HTTP request failed"
      ? res.status(400).json(e.response)
      : res.status(400).json(e);
  }
};
