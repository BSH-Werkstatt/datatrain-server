import { Campaign } from '../models/campaign';
import { DatabaseConnector } from './DatabaseConnector';
import { ObjectID } from 'mongodb';
import { DBConfig } from './dbconfig';

export class CampaignConnector extends DatabaseConnector {
  collection = 'campaigns';

  /**
   * gets an instance of DatabaseConnector initialized with the correct credentials
   */
  static getInstance(callback: any) {
    // TODO: store in environmental variables
    try {
      const db = new CampaignConnector(DBConfig.host, DBConfig.database, DBConfig.user, DBConfig.password);
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
   * Returns the campaign with the identifier id
   * @param id campaign identifier
   */
  get(id: string): Promise<Campaign> {
    return new Promise((resolve, reject) => {
      this.findOne(this.collection, { _id: ObjectID.createFromHexString(id) })
        .then(result => {
          if (result) {
            resolve(Campaign.fromObject(result));
          } else {
            resolve(null);
          }
        })
        .catch(err => {
          console.error('Error while getting campaign with id ' + id, err);
        });
    });
  }

  /**
   * Returns the campaign with the url name
   * @param urlName campaign url name
   */
  getByURLName(urlName: string): Promise<Campaign> {
    return new Promise((resolve, reject) => {
      this.findOne(this.collection, { urlName })
        .then(result => {
          if (result) {
            resolve(Campaign.fromObject(result));
          } else {
            resolve(null);
          }
        })
        .catch(err => {
          console.error('Error while getting campaign with url name ' + urlName, err);
        });
    });
  }

  /**
   * Returns all campaigns
   */
  getAll(): Promise<Campaign[]> {
    return new Promise((resolve, reject) => {
      this.find(this.collection, {})
        .then(result => {
          const campaigns: Campaign[] = [];
          result.forEach(e => {
            campaigns.push(Campaign.fromObject(e));
          });

          resolve(campaigns);
        })
        .catch(err => {
          console.error('Error while getting campaigns', err);
        });
    });
  }
}
