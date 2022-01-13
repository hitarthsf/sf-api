import UsersData from "../models/UsersData.js";

export const adminMail = async (req, res) => {

    var id = req.query.id;
    var userData = await UsersData.find({});
    res.status(200).json({ data: userData, message: "Admin mail cron" });
}