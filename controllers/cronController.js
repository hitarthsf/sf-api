import UsersData from "../models/UsersData.js";

export const adminMail = async (req, res) => {

    var id = req.query.id;
    var userData = await UsersData.find({});
}