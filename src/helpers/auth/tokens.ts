import jwt from 'jsonwebtoken'

const secret = process.env.TOKEN_SECRET || 'pink-turtle';

/**
 * 
 * @param data data object to be saved in the token
 * @param timeout optional expiretion in ms
 */
const createToken = (data: any, timeout? : number) => {
  const options : any = { algorithm: 'RS256' }
  if(timeout) options.expiresIn = timeout;

  const token = jwt.sign(data, secret, options);
  return token;
}
