import { CreateUserRequest, User } from '../models/user';
import { UserConnector } from '../db/UserConnector';

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
            reject(new Error('Check your e-mail information!'));
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
        db.get(userId).then(result => {
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
}
