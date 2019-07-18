import { Campaign } from '../models/campaign';
import { DatabaseConnector } from './DatabaseConnector';
import { ObjectID, ObjectId } from 'mongodb';
import { DBConfig } from './dbconfig';
import { Training } from '../models/training';

export class CampaignConnector extends DatabaseConnector {
  collection = 'campaigns';

  /**
   * gets an instance of DatabaseConnector initialized with the correct credentials
   */
  static getInstance(callback: any) {
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

  static getActiveTraining(campaignId: string): Promise<Training> {
    return new Promise<Training>((resolve, reject) => {
      CampaignConnector.getInstance((conn: CampaignConnector) => {
        conn
          .get(campaignId)
          .then((campaign: Campaign) => {
            if (campaign && campaign.currentTrainingId) {
              return conn.findOne('training', { _id: ObjectId.createFromHexString(campaign.currentTrainingId) });
            } else {
              conn.connection.close();
              resolve(null);
            }
          })
          .then((training: Training) => {
            conn.connection.close();
            resolve(training);
          })
          .catch(e => {
            conn.connection.close();
            reject(e);
          });
      });
    });
  }

  static getImagesSinceLastTraining(campaignId: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      CampaignConnector.getActiveTraining(campaignId).then(training => {
        let lastDate: string;

        if (training) {
          lastDate = training.timeStart;
        } else {
          lastDate = '';
        }

        CampaignConnector.getInstance((conn: CampaignConnector) => {
          const query = {
            campaignId: ObjectId.createFromHexString(campaignId),
            timestamp: { $gt: lastDate }
          };

          conn.db
            .collection('images')
            .find(query)
            .toArray((err: any, result: any) => {
              if (err) {
                resolve(0);
                throw err;
              }

              conn.connection.close();
              resolve(result.length);
            });
        });
      });
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

  /**
   * inserts or updates documents depending if id exists
   * @param campaign campaign object
   */
  save(campaign: Campaign): Promise<any> {
    const self = {
      id: campaign.id,
      ownerId: campaign.ownerId,
      type: parseInt(campaign.type.toString(), 10),
      name: campaign.name,
      urlName: campaign.urlName,
      description: campaign.description,
      taxonomy: campaign.taxonomy,
      image: campaign.image,
      currentTrainingId: campaign.currentTrainingId ? campaign.currentTrainingId : '',
      trainingInProgress: campaign.trainingInProgress ? campaign.trainingInProgress : false
    };

    if (campaign.id) {
      return this.updateDocument(this.collection, { _id: ObjectId.createFromHexString(campaign.id) }, self);
    } else {
      return this.insertOne(this.collection, self);
    }
  }
}
