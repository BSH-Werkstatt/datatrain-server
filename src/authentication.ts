import * as express from 'express';
import * as jwt from 'jsonwebtoken';
// import Userservice from './services/UserService'
const secretKey = process.env.JWT_SECRET_TOKEN_1;
/**
 * @TODO : check the token is there in the db
 * @TODO : if it is in the db then reject with the expired token message
 * @TODO : if not there then do the rest of the thing
 */
export function expressAuthentication(request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
  if (securityName === 'api_token') {
    console.log('indide api_token form authntication.ts');
    return Promise.reject('invalid auth type');
  }

  if (securityName === 'jwt') {
    let token =
      request.body.token || request.query.token || request.headers['x-access-token'] || request.headers.authorization;
    let refreshToken = request.headers['x-refresh-token'] as string; // typecast it into string
    //  or request.headers['x-refresh-token'] as string
    if (!token && !refreshToken) {
      console.log('token not provided');
      return new Promise((resolve, reject) => {
        reject({ message: 'token not provided' });
      });
    }
    if (token.includes('Bearer ')) {
      const newToken = token.split(' ');
      token = newToken[1];
    }
    if (refreshToken.includes('Bearer ')) {
      const newToken = refreshToken.split(' ');
      refreshToken = newToken[1];
    }
    return new Promise((resolve, reject) => {
      try {
        jwt.verify(token, secretKey, (err: any, decoded: any) => {
          if (err) {
            // check the error type
            if (err.name === 'TokenExpiredError') {
              // go and check the refresh token
              jwt.verify(refreshToken, process.env.JWT_SECRET_TOKEN_2, (error, decode) => {
                // else reject with msg of invalid or excpired token
                if (error) {
                  console.log('from auth.ts error on verifying refresh token', error.name);
                  reject(error);
                } else {
                  console.log('from auth.ts data on verifying refresh token', decode);
                  // generate the refresh token and send it to the
                  resolve(decode);
                }
              });
            }
            reject(err);
          } else {
            // Check if JWT contains all required scopes
            for (const scope of scopes) {
              if (!decoded.scopes.includes(scope)) {
                reject(new Error('JWT does not contain required scope.'));
              }
            }
            resolve(decoded);
          }
        });
      } catch (err) {
        // err
        console.log('inside autentication ts');
        console.log(err.name);
        reject(err);
      }
    });
  }
  return Promise.reject({ message: 'unexcpected error' });
}
