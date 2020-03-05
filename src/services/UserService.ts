import { CreateUserRequest, User } from '../models/user';
import { UserConnector } from '../db/UserConnector';
import { UserGroupConnector } from '../db/UsergroupConnector';
import { Helper } from '../helper';
import { CreateUserGroupRequest } from '../models/usergroup';
import { getTokenSourceMapRange } from 'typescript';
import { CostExplorer } from 'aws-sdk';
export class UserService {
  /**
   * Returns the ID of the user to whom the passed token belongs to.
   * @param userToken userToken from the request
   */
  static getUserIdFromToken(userToken: string): string {
    Helper.getCallStack(this);
    // right now we are just passing the user ID as string as the token
    return userToken;
  }
  static getUserIdFromUserEmail(userEmail: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!userEmail) {
        reject('Email not provided');
      }
      try {
        UserConnector.getInstance((db: UserConnector) => {
          console.log(userEmail);
          db.getByEmail(userEmail)
            .then(result => {
              console.log(result);
              resolve(result.id);
            })
            .catch(err => reject(err));
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  static validateUserToken(userToken: string): Promise<boolean> {
    Helper.getCallStack(this);
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
  static getUserAssociatedGroup(userEmail: string): Promise<any> {
    Helper.getCallStack(this);
    return new Promise<any>((resolve, reject) => {
      try {
        UserConnector.getInstance((db: UserConnector) => {
          db.getByEmail(userEmail)
            .then(result => resolve(result.group))
            .catch(err => reject(err));
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  static getUserAssociatedRole(userEmail: string): Promise<any> {
    Helper.getCallStack(this);
    return new Promise<any>((resolve, reject) => {
      try {
        if (userEmail) {
          UserConnector.getInstance((db: UserConnector) => {
            db.getByEmail(userEmail)
              .then(result => {
                const roles = result.group;
                if (roles.includes(process.env.ADMIN)) {
                  resolve({ role: 'ADMIN', result });
                } else if (roles.includes(process.env.CAMPAIGN_MANAGER)) {
                  resolve({ role: 'CAMPAIGN_MANAGER', result });
                } else {
                  resolve({ role: 'ANNOTATOR', result });
                }
              })
              .catch(err => reject(err));
          });
        } else {
          console.log(userEmail);
          reject('invalid userEmail');
        }
      } catch (error) {
        console.log(error);
        resolve('Error whle geting user group INTERNAL SERVER');
      }
    });
  }
  /**
   * creates user according to CreateUserRequest
   * @param request CreateUserRequest
   */
  createUser(request: CreateUserRequest): Promise<User> {
    Helper.getCallStack(this);
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
    Helper.getCallStack(this);
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
    Helper.getCallStack(this);
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
  getUserGroup(userGroup: string): Promise<any> {
    Helper.getCallStack(this);
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
    Helper.getCallStack(this);
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
    Helper.getCallStack(this);
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
  /**
   * insert crowd groups to the user
   * @param userId is of the current campaign
   */
  removeCrowdGroup(userId: string, groupName: string): Promise<any> {
    Helper.getCallStack(this);
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
