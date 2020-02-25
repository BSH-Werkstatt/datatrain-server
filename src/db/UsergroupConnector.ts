import { DatabaseConnector } from './DatabaseConnector';
import { ObjectId } from 'mongodb';
import { UserGroup, CreateUserGroupRequest } from '../models/usergroup';
import { DBConfig } from './dbconfig';

export class UserGroupConnector extends DatabaseConnector {
  collection = 'userGroup';
  static getInstance(callback: any) {
    try {
      const db = new UserGroupConnector(DBConfig.host, DBConfig.database, DBConfig.user, DBConfig.password);
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
   * Returns the user group with the given user group
   * @param userGroup usergroup entered by the user
   */
  getUserGroupByName(userGroup: string): Promise<UserGroup[]> {
    return new Promise((resolve, reject) => {
      this.find(this.collection, { name: new RegExp(userGroup, 'i') })
        .then(res => {
          console.log(`inside usergroupconnector length of res for userGroup ${userGroup} is ${res.length}`);
          if (res) {
            const userGroups: UserGroup[] = [];
            for (const prop in res) {
              if (Object.prototype.hasOwnProperty.call(res, prop)) {
                userGroups.push(UserGroup.fromObject(res[prop]));
              }
            }
            console.log(`inside usergroupcollection userfroups are ${userGroups}`);
            resolve(userGroups);
          } else {
            resolve(null);
          }
        })
        .catch(err => {
          console.log(`Errpr while finding the userGroup with err ${err}`);
        });
    });
  }
  /**
   * Returns the user group with the given user group
   * @param userGroup usergroup entered by the user
   */
  saveUserGroup(userGroup: string): Promise<boolean> {
    // @TODO: add vaidation if group is akready in db
    return new Promise((resolve, reject) => {
      this.insertOne(this.collection, { name: userGroup })
        .then(res => {
          if (res) {
            resolve(true);
          }
        })
        .catch(err => {
          console.log(`error occure while inserting userGroup err : ${err}`);
          reject(false);
        });
    });
  }
}
