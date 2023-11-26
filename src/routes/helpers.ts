import jwt from "jsonwebtoken";
import { ERoles } from "../models/UserModel.js";
import AuthoriseError from "./Errors/AuthoriseError.js";

const checkUserAuthorization = (req, res, next) => {
  if (req.headers.authorization) {
    const token: string = req.headers.authorization.split(" ")[1];
    if (token) {
      const data = jwt.verify(token, process.env.TOKEN_SECRET);
      if (data && typeof data !== "string") {
        const userToken = data._doc;
        if (userToken.role === ERoles.admin) {
          return next();
        }
      }
    }
  }
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
