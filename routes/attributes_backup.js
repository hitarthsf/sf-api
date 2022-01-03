import express from "express";
import { MesssageProvider, Messages } from "../core/index.js";
import AuthUtils from "../utils/AuthUtils.js";

const { Router } = express;

import { default as passport } from "../utils/passport.js";

const attributesRoutes = Router();

import {
  getAttribute,
  addAttribute,
  updateAttribute,
  deleteAttribute,
} from "../controllers/attribute.js";

attributesRoutes.post(
  "/fetchAttribute",

  passport.authenticate(process.env.JWT_SCHEME, { session: false }),
  (request, response) => {
    return getAttribute(request, response);
    const token = AuthUtils.retrieveToken(request.headers);
    if (AuthUtils.hasPermission(token, request.body.company_id)) {
      // valid token
      return getAttribute(request, response);
    } else {
      // invalid token
      response.status(401).send({
        success: false,
        message: MesssageProvider.messageByKey(Messages.KEYS.WRONG_SESSION),
      });
    }
  }
);

attributesRoutes.post(
  "/addAttribute",
  passport.authenticate(process.env.JWT_SCHEME, { session: false }),
  (request, response) => {
    const token = AuthUtils.retrieveToken(request.headers);
    if (AuthUtils.hasPermission(token, request.body.company_id)) {
      // valid token
      return addAttribute(request, response);
    } else {
      // invalid token
      response.status(401).send({
        success: false,
        message: MesssageProvider.messageByKey(Messages.KEYS.WRONG_SESSION),
      });
    }
  }
);

attributesRoutes.post(
  "/deleteAttribute",
  passport.authenticate(process.env.JWT_SCHEME, { session: false }),
  (request, response) => {
    const token = AuthUtils.retrieveToken(request.headers);
    if (AuthUtils.hasPermission(token, request.body.company_id)) {
      // valid token
      return deleteAttribute(request, response);
    } else {
      // invalid token
      response.status(401).send({
        success: false,
        message: MesssageProvider.messageByKey(Messages.KEYS.WRONG_SESSION),
      });
    }
  }
);

attributesRoutes.post(
  "/updateAttribute",
  passport.authenticate(process.env.JWT_SCHEME, { session: false }),
  (request, response) => {
    const token = AuthUtils.retrieveToken(request.headers);
    if (AuthUtils.hasPermission(token, request.body.company_id)) {
      // valid token
      return updateAttribute(request, response);
    } else {
      // invalid token
      response.status(401).send({
        success: false,
        message: MesssageProvider.messageByKey(Messages.KEYS.WRONG_SESSION),
      });
    }
  }
);

export default attributesRoutes;
