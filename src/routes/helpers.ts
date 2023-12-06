import jwt from "jsonwebtoken";
import { ERoles } from "../models/UserModel.js";
import AuthoriseError from "./Errors/AuthoriseError.js";

const checkUserAuthorization = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    const data = jwt.verify(token, process.env.TOKEN_SECRET);
    if (data && typeof data !== "string") {
      if (data.role === ERoles.admin) {
        return next();
      }
    }
  }
  throw new AuthoriseError();
};

export { checkUserAuthorization };
