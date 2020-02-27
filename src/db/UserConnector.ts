import { DatabaseConnector } from './DatabaseConnector';
import { ObjectId } from 'mongodb';
import { User, USER_TYPES } from '../models/user';
import { DBConfig } from './dbconfig';

export class UserConnector extends DatabaseConnector {
  collection = 'users';

  static userHasCapabilityForCampaigns(userId: string): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
      UserConnector.getInstance((userConn: UserConnector) => {
        userConn
          .get(userId)
          .then((user: User) => {
            if (user.userType === USER_TYPES.ADMIN || user.userType === USER_TYPES.CAMPAIGN_OWNER) {
              res(true);
            }
            {
              res(false);
            }
          })
          .catch(e => {
            console.error('Error fetching user capabilities: ', e);
            // throw e;
            rej(e); // fixing promise handling err
          });
      });
    });
  }

  /**
   * gets an instance of DatabaseConnector initialized with the correct credentials
   */
  static getInstance(callback: any) {
    try {
      const db = new UserConnector(DBConfig.host, DBConfig.database, DBConfig.user, DBConfig.password);
      db.connect()
        .then(res => {
          callback(db);
        })
        .catch(err => {
          console.error('An error occured while connecting to the database: ', err);
        });
    } catch (e) {
      console.error("Error while connecting, maybe database hasn't been started yet?", e);
    }
  }

  /**
   * Returns the user with the given email
   * @param email email of the user
   */
  getByEmail(email: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.findOne(this.collection, { email })
        .then(result => {
          if (result) {
            resolve(User.fromObject(result));
          } else {
            resolve(null);
          }
        })
        .catch(err => {
          console.error('Error while getting user with email ' + email, err);
        });
    });
  }

  /**
   * Returns the user with the given _id
   * @param userId _id of the user
   */
  get(userId: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.findOne(this.collection, { _id: ObjectId.createFromHexString(userId) })
        .then(result => {
          if (result) {
            resolve(User.fromObject(result));
          } else {
            resolve(null);
          }
        })
        .catch(err => {
          console.error('Error while getting user with _id ' + userId, err);
        });
    });
  }

  /**
   * inserts or updates documents depending if id exists
   * @param user Leaderboard object
   */
  save(user: User): Promise<any> {
    const self = {
      email: user.email,
      name: user.name,
      userType: user.userType ? user.userType : USER_TYPES.ANNOTATOR,
      group: user.group
    };

    if (user.id) {
      return this.updateDocument(this.collection, { _id: ObjectId.createFromHexString(user.id) }, self);
    } else {
      return this.insertOne(this.collection, self);
    }
  }
}
