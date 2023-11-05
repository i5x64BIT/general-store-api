import jwt from 'jsonwebtoken'

const secret = process.env.TOKEN_SECRET || 'pink-turtle';

/**
 * 
 * @param payload object to be saved in the token
 * @param timeout optional expiretion in ms
 */
const createToken = (payload: any, timeout? : number) => {
  const options : any = { algorithm: 'RS256' }
  if(timeout) options.expiresIn = timeout;

  const token = jwt.sign(payload, secret, options);
  return token;
}

export { createToken };
