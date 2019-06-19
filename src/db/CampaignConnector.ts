import { Campaign } from '../models/campaign';
import { DatabaseConnector } from './DatabaseConnector';
import { ObjectID } from 'mongodb';

export class CampaignConnector extends DatabaseConnector {
  collection = 'campaigns';

  /**
   * gets an instance of DatabaseConnector initialized with the correct credentials
   */
  static getInstance(callback: any) {
    const db = new CampaignConnector('database_dev', 'datatrain', 'datatrain', 'init12345');
    db.connect()
      .then(res => {
        callback(db);
      })
      .catch(err => {
        console.error('An error occured while connecting to the database: ', err);
      });
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
