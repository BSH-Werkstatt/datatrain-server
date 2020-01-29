import * as express from 'express';
import * as jwt from 'jsonwebtoken';
const secretKey = 'secret';
export function expressAuthentication(request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
  if (securityName === 'api_token') {
    console.log('indide api_token form authntication.ts');
    return Promise.reject('invalid auth type');
  }

  if (securityName === 'jwt') {
    let token =
      request.body.token || request.query.token || request.headers['x-access-token'] || request.headers.authorization;
    // console.log('token is ', token, 'from authntication.ts...');
    if (!token) {
      return new Promise((resolve, reject) => {
        reject({ message: 'token not provided' });
      });
    }
    if (token.includes('Bearer ')) {
      const newToken = token.split(' ');
      token = newToken[1];
    }
    return new Promise((resolve, reject) => {
      try {
        jwt.verify(token, secretKey, (err: any, decoded: any) => {
          if (err) {
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
        console.log(err);
        reject(err);
      }
    });
  }
  return Promise.reject({ message: 'unexcpected error' });
}
