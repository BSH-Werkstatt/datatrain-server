import { DatabaseConnector } from './DatabaseConnector';
import { ObjectId } from 'mongodb';
import { User } from '../models/user';
import { DBConfig } from './dbconfig';

export class UserConnector extends DatabaseConnector {
  collection = 'users';

  /**
   * gets an instance of DatabaseConnector initialized with the correct credentials
   */
  static getInstance(callback: any) {
    // TODO: store in environmental variables
    try {
      const db = new UserConnector(DBConfig.host, DBConfig.database, DBConfig.user, DBConfig.password);
      db.connect()
        .then(res => {
          callback(db);
          // db.connection.close();
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
   * inserts or updates documents depending if id exists
   * @param leaderboard Leaderboard object
   */
  save(user: User): Promise<any> {
    const self = {
      email: user.email,
      name: user.name
    };

    if (user.id) {
      return this.updateDocument(this.collection, { _id: ObjectId.createFromHexString(user.id) }, self);
    } else {
      return this.insertOne(this.collection, self);
    }
  }
}
