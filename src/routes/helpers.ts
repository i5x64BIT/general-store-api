import jwt from "jsonwebtoken";
import { ERoles } from "../models/UserModel.js";
import AuthoriseError from "./Errors/AuthoriseError.js";

const checkUserAuthorization = (req, res, next) => {
  if (req.body.token) {
    const token = req.body.token;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    if (decoded && typeof decoded !== "string") {
      const tokenUser = decoded._doc;
      if (
        tokenUser._id === req.params.userId ||
        tokenUser.role === ERoles.admin
      ) {
        return next();
      }
    }
  }
  throw new AuthoriseError();
};

export { checkUserAuthorization };
