import { CreateUserRequest, User } from '../models/user';
import { UserConnector } from '../db/UserConnector';
import { sign } from 'jsonwebtoken';
import rp = require('request-promise'); // because request if already used in parameter
// import { resolve } from 'dns';
// import { rejects } from 'assert';
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

  // Login route using crowd
  async loginUser(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let token: any = null;
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
          .then(userData => {
            const user = userData;
            console.log('from userservice.ts....');
            console.log(user);
            token = sign(
              {
                id: email,
                scopes: ['user']
              },
              'secret',
              { expiresIn: 60 * 60 }
            ); // @TODO: ask and change the exp time
            resolve({
              token,
              user
            });
          })
          .catch(err => {
            reject(err);
          });
      } catch (error) {
        reject(error);
      }
    });
    // const user = await User.findOne({ where: { email } });
    // verify the user from crowd

    // const user: any = {
    //   id: 'some@email.com',
    // }; // make a request to the crowd api @TODO

    // console.log('inside userservice ts')
    // console.log(token);
    // // return token;
    // return new Promise((resolve, reject) => {
    //   if (token) {
    //     resolve({
    //       token,
    //       user
    //     });
    //   } else {
    //     reject({
    //       message: 'unknown error'
    //     });
    //   }
    // });
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
