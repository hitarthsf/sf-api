import TagData from "../models/TagData.js";
import CompanyData from "../models/CompanyData.js";
import aws from "aws-sdk";
import { Readable } from "stream";
import fs from "fs";
import _ from "lodash";

// add tag
export const addTag = async (req, res) => {
  const company_id = req.body.company_id;
  const location_id = req.body.location_id.split(",");
  var name = req.body.name;
  const title = req.body.title;
  const type = req.body.type;
  if (!company_id) {
    res.status(409).json({ data: [], message: "Please add company_id " });
  }

  if (location_id.length == 0) {
    res.status(409).json({ data: [], message: "Please add location_id " });
  }
  if (!name) {
    res.status(409).json({ data: [], message: "Please add name" });
  }

  const tagObj = {
    location_id: location_id,
    company_id: company_id,
    name: name,
  };

  try {
    const tag = new TagData(tagObj);
    await tag.save();
    res.status(201).json({ data: tag, message: "Tag Created Successfully !!" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

// update tag
export const editTag = async (req, res) => {
  const company_id = req.body.company_id;
  const location_id = req.body.location_id.split(",");
  var name = req.body.name;
  const _id = req.body._id;
  if (!company_id) {
    res.status(409).json({ data: [], message: "Please add company_id " });
  }

  if (location_id.length == 0) {
    res.status(409).json({ data: [], message: "Please add location_id " });
  }
  if (!name) {
    res.status(409).json({ data: [], message: "Please add name " });
  }

  var tagObj = {
    location_id: location_id,
    company_id: company_id,
    name: name,
  };

  try {
    await TagData.findByIdAndUpdate(_id, tagObj, { new: true });

    res
      .status(201)
      .json({ data: tagObj, message: "Tag Updated Successfully !!" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

// get Tag data with post method
export const fetchTag = async (req, res) => {
  const page = req.body.page ? req.body.page : 1;
  const limit = req.body.perPage ? parseInt(req.body.perPage) : 1;
  const skip = (page - 1) * limit;
  const filterGeneralSearch = req.body.filterGeneralSearch;
  var company_id = req.body.company_id;

  const companyData = await CompanyData.findOne({ _id: company_id });

  if (filterGeneralSearch != "") {
    var tag = await TagData.find({
      name: { $regex: ".*" + filterGeneralSearch + ".*" },
      company_id: company_id,
    })
      .skip(skip)
      .limit(limit);
    var tagCount = await TagData.find({
      name: { $regex: ".*" + filterGeneralSearch + ".*" },
      company_id: company_id,
    }).countDocuments();
  } else {
    var tag = await TagData.find({ company_id: company_id })
      .skip(skip)
      .limit(limit);
    var tagCount = await TagData.find({
      company_id: company_id,
    }).countDocuments();
  }

  try {
    res
      .status(201)
      .json({
        data: tag,
        totalCount: tagCount,
        message: "Tag Listed Successfully !!",
      });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

// delete tag data with post method
export const deleteTag = async (req, res) => {
  var id = req.body._id;
  await TagData.findByIdAndRemove(id);

  try {
    res.status(201).json({ data: [], message: "Tag Removed Successfully !!" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

function bufferToStream(buffer) {
  var stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  return stream;
}
