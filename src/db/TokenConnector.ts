import { DatabaseConnector } from './DatabaseConnector';
import { ObjectId } from 'mongodb';
import { Token } from '../models/token';
import { DBConfig } from './dbconfig';

export class TokenConnector extends DatabaseConnector {
  collection = 'tokens';

  /**
   * gets an instance of DatabaseConnector initialized with the correct credentials
   */
  static getInstance(callback: any) {
    try {
      const db = new TokenConnector(DBConfig.host, DBConfig.database, DBConfig.user, DBConfig.password);
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
   * Returns the user with the given _id
   * @param token token of the user
   */
  get(token: string): Promise<Token> {
    return new Promise((resolve, reject) => {
      this.findOne(this.collection, { token: { $qe: token } })
        .then(result => {
          if (result) {
            resolve(Token.fromObject(result));
          } else {
            resolve(null);
          }
        })
        .catch(err => {
          console.error('Error while getting user with _id ' + token, err);
        });
    });
  }

  /**
   * inserts or updates documents depending if id exists
   * @param user Leaderboard object
   */
  save(token: Token): Promise<any> {
    const self = {
      token
    };
    return this.insertOne(this.collection, self);
  }
}
