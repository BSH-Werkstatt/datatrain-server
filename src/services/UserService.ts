import { CreateUserRequest, User } from '../models/user';
import { UserConnector } from '../db/UserConnector';
import { UserGroupConnector } from '../db/UsergroupConnector';
import { CreateUserGroupRequest } from '../models/usergroup';
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
  // @TODO : Top priority *********Important
  async loginUser(email: string, password: string): Promise<any> {}
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
  getUserGroup(userGroup: string): Promise<any> {
    return new Promise((resolve, reject) => {
      UserGroupConnector.getInstance((db: UserGroupConnector) => {
        db.getUserGroupByName(userGroup)
          .then(result => {
            db.connection.close();

            if (!result) {
              resolve(new User('ERROR_NOT_FOUND', 'ERROR_NOT_FOUND', 'ERROR_NOT_FOUND'));
            } else {
              resolve(result);
            }
          })
          .catch(e => reject(e));
      });
    });
  }
  saveUserGroup(userGroup: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      UserGroupConnector.getInstance((db: UserGroupConnector) => {
        db.saveUserGroup(userGroup)
          .then(res => {
            if (res) {
              resolve(true);
            }
          })
          .catch(err => {
            console.log(`Failed to save  usergroup : ${err}`);
          });
      });
    });
  }
  /**
   * insert crowd groups to the user
   * @param userId is of the current campaign
   */
  addCrowdGroup(userId: string, groupName: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        UserConnector.getInstance(async (db: UserConnector) => {
          const user: any = await db.get(userId);
          user.group.push(groupName);
          resolve(db.save(user));
        });
      } catch (error) {
        reject('unable to add crowd group 500');
      }
    });
  }
  removeCrowdGroup(userId: string, groupName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        UserConnector.getInstance(async (db: UserConnector) => {
          const user: User = await db.get(userId);
          if (user.group.includes(groupName)) {
            user.group = user.group.filter(val => val !== groupName);
            resolve(db.save(user));
          } else {
            reject('Group name is not valid');
          }
        });
      } catch (error) {
        reject('Unexprected error 500 while removeing the user');
      }
    });
  }
}
