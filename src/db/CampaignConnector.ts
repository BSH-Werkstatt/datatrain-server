import { Campaign } from '../models/campaign';
import mongodb from 'mongodb';

import { DatabaseConnector } from './DatabaseConnector';

export class CampaignConnector extends DatabaseConnector {
  collection = 'campaigns';
  /**
   * gets an instance of DatabaseConnector initialized with the correct credentials
   */
  static getInstance(): CampaignConnector {
    const db = new CampaignConnector('database_dev', 'datatrain', 'datatrain', 'init12345');

    return db;
  }

  /**
   * Returns the campaign with the identifier id
   * @param id campaign identifier
   */
  get(id: string): Promise<Campaign> {
    return new Promise((resolve, reject) => {
      this.find(this.collection, { id })
        .then(result => {
          resolve(Campaign.fromObject(result[0]));
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
          console.log(result);
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
