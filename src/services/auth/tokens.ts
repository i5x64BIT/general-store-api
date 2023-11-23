import jwt from "jsonwebtoken";

const secret = process.env.TOKEN_SECRET || "pink-turtle";
const blacklist = [];
/**
 *
 * @param payload object to be saved in the token
 * @param timeout optional expiretion in ms
 */
const createToken = (payload: any, timeout = 900) => {
  const options: jwt.SignOptions = { algorithm: "HS256", expiresIn: "15m" };
  console.log(payload);
  const token = jwt.sign({ ...payload }, secret, options);
  return token;
};
const deleteToken = (token: string) => {
  blacklist.push(token);
};

export { createToken, deleteToken };
