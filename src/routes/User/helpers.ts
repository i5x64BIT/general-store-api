import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ERoles } from "../../models/UserModel.js";
import AuthoriseError from "../Errors/AuthoriseError.js";

const getHashString = async (input: String) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(Buffer.from(input), saltRounds);
  return hash.toString();
};
const checkUserAuthorization = (req, res, next) => {
  if (req.body.token) {
    const token = req.body.token;
    if (jwt.verify(token, process.env.TOKEN_SECRET)) {
      const decoded: any = jwt.decode(token);
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

export { getHashString, checkUserAuthorization };
