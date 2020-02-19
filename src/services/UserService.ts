import { CreateUserRequest, User } from '../models/user';
import { UserConnector } from '../db/UserConnector';
import { sign } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import rp = require('request-promise'); // because request if already used in parameter
import { TokenConnector } from '../db/TokenConnector';
import { Token } from '../models/token';
import { getTokenSourceMapRange } from 'typescript';
export class UserService {
  /**
   * Returns the ID of the user to whom the passed token belongs to.
   * @param userToken userToken from the request
   */
  static getUserIdFromToken(userToken: string): string {
    // right now we are just passing the user ID as string as the token
    return userToken;
  }

  static validateUserToken(userToken: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (userToken) {
        const userId = UserService.getUserIdFromToken(userToken);

        const service = new UserService();
        service.getUserById(userId).then((user: User) => {
          if (user && user.name !== 'ERROR_NOT_FOUND') {
            resolve(true);
          } else {
            resolve(false);
          }
        });
        return true;
      } else {
        resolve(false);
      }
    });
  }
  static blacklistUserToken(userToken: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      console.log('Inside User Service->blacklistUserToken user token is ', userToken);
      if (userToken) {
        const token = new Token(userToken);
        token.save((savedToken: Token) => {
          console.log('******Token Saved********* with', savedToken, token);
          resolve(true);
        });
      } else {
        resolve(false);
      }
    });
  }
  static checkBlacklistUserToken(userToken: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      console.log('Inside User Service->CheckBlacklistUserToken token is ', userToken);
      if (userToken) {
        TokenConnector.getInstance((db: TokenConnector) => {
          db.get(userToken)
            .then(tokenData => {
              console.log('found user token with token data', tokenData);
              if (tokenData) {
                reject(false);
              } else {
                resolve(true);
              }
            })
            .catch(err => {
              console.log('Unable to find the token err', err.name);
              resolve(true);
            });
        });
      }
    });
  }
  /**
   * creates user according to CreateUserRequest
   * @param request CreateUserRequest
   */
  createUser(request: CreateUserRequest): Promise<User> {
    // TODO: check if email exists
    return new Promise<User>((resolve, reject) => {
      console.log(request, request.email);

      const user = new User('', request.email, request.name);
      user.save((res: User) => {
        console.log(res, user);
        resolve(res);
      });
    });
  }

  /**
   * Gets the user by email
   * @param email unique email of the user
   */
  getUserByEmail(email: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      UserConnector.getInstance((db: UserConnector) => {
        db.getByEmail(email).then(result => {
          db.connection.close();

          if (!result) {
            resolve(new User('ERROR_NOT_FOUND', 'ERROR_NOT_FOUND', 'ERROR_NOT_FOUND'));
          } else {
            resolve(result);
          }
        });
      });
    });
  }

  /**
   * Gets the user by userId
   * @param userId unique userId of the user
   */
  getUserById(userId: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      UserConnector.getInstance((db: UserConnector) => {
        db.get(userId)
          .then(result => {
            db.connection.close();

            if (!result) {
              resolve(new User('ERROR_NOT_FOUND', 'ERROR_NOT_FOUND', 'ERROR_NOT_FOUND'));
            } else {
              resolve(result);
            }
          })
          .catch(e => reject(e)); // fixing unhandel promise error
      });
    });
  }
  // generate JWT Token
  async generateTokne(userEmail: string, secret1: string, secret2: string): Promise<any> {
    const createToken = sign(
      {
        id: userEmail,
        scopes: ['user'] // for now scope is user only
      },
      secret1,
      { expiresIn: '1m' }
    );
    const createRefreshToken = sign(
      {
        id: userEmail,
        scopes: ['user']
      },
      secret2,
      { expiresIn: '7d' }
    );

    return Promise.all([createToken, createRefreshToken]);
  }
  // refresh the current token
  async refreshJWTToken(token: string, refreshToken: string, secret1: string, secret2: string): Promise<any> {
    // let userId : any = -1;
    // try {
    //   const userObject : any = jwt.decode(refreshToken);
    //   userId = userObject.id;
    // } catch (err) {
    //   return {};
    // }
    // if(!userId) {
    //   return {};
    // }
    // @TODO : get the user from data base then move forward
    // to get The current id : crating an interface
    interface JwtData {
      id: string;
      scopes: string[];
      iat: number;
      exp: number;
    }
    // @TODO

    // const refreshSecret : string  = secret2;
    let id = '';
    try {
      jwt.verify(refreshToken, secret2, (err, data: JwtData) => {
        if (err) {
          // console.log('from Userservice->refreshJWT from jwt.verify err', err)
        } else {
          // console.log('from Userservice->refreshJWT from jwt.verify data', data)
          id = data.id;
        }
      });
    } catch (err) {
      return err;
    }
    // console.log('refresh token data from Userservice->refreshJWT id is ', id);
    const [newToken, newRefreshToken] = await this.generateTokne(id, secret1, secret2);
    console.log(' new token and new refresh token data from Userservice->refreshJWT id is ', newToken, newRefreshToken);
    return {
      token: newToken,
      refreshToken: newRefreshToken,
      id // @TODO send the entire user information
    };
  }
  // Login route using crowd
  async loginUser(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const options = {
          method: 'POST',
          uri:
            'https://' +
            process.env.CROWD_AAP +
            ':' +
            process.env.CROWD_PASS +
            '@id.bsh-sdd.com/crowd/rest/usermanagement/1/authentication?username=' +
            email,
          body: {
            value: password
          },
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          json: true // Automatically stringifies the body to JSON
        };
        rp(options)
          .then(async userData => {
            const user = userData;
            // token = sign(
            //   {
            //     id: email,
            //     scopes: ['user']
            //   },
            //   process.env.JWT_SECRET_TOKEN_1,
            //   { expiresIn: 60 * 60 }
            // ); // @TODO: ask and change the exp time
            const [token, refreshToken] = await this.generateTokne(
              email,
              process.env.JWT_SECRET_TOKEN_1,
              process.env.JWT_SECRET_TOKEN_2
            );
            // if user is logged in then store the required info in the db
            // chek information is there or not
            resolve({
              token,
              refreshToken,
              user: {
                firstName: user['first-name'],
                lastName: user['last-name'],
                displayName: user['display-name'],
                email: user.email
              }
            });
          })
          .catch(err => {
            console.log('form userservice', err);
            const errorResponse = {
              statusCode: err.statusCode,
              message: err.message
            };
            console.log(errorResponse);
            reject(errorResponse);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
  protectedService(): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      const flag = true;
      if (flag) {
        resolve('got it');
      } else {
        reject('you cant reach here');
      }
    });
  }
}
