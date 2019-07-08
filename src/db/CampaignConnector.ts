import { Campaign } from '../models/campaign';
import { DatabaseConnector } from './DatabaseConnector';
import { ObjectID, ObjectId } from 'mongodb';
import { ImageConnector } from './ImageConnector';
import { ImageData } from '../models/data';
import { UserConnector } from './UserConnector';
import { User } from '../models/user';
import { DBConfig } from './dbconfig';

import path from 'path';
import fs from 'fs';

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
   * Initializes the BSH campaigns
   * @param ms delay in ms
   */
  static init() {
    console.log('--------------------------------------');
    console.log('--- INITIALIZATION PROCESS STARTED ---');
    console.log('--------------------------------------');

    const uploadsFolder = './uploads/';

    if (!fs.existsSync(uploadsFolder)) {
      fs.mkdirSync(uploadsFolder);
    }

    UserConnector.getInstance((userConnector: UserConnector) => {
      userConnector.getByEmail('admin.admin@bshg.com').then((user: User) => {
        console.log('Initializing as user: ' + user.id + ', ' + user.email);

        CampaignConnector.getInstance((connector: CampaignConnector) => {
          connector.getAll().then((campaigns: Campaign[]) => {
            console.log('There are ' + campaigns.length + ' campaigns in the database.');
            campaigns.forEach((campaign: Campaign) => {
              CampaignConnector.initCampaign(campaign, user.id);
            });
          });
        });
      });
    });
  }

  static initCampaign(campaign: Campaign, userId: string) {
    // we'll remove this later
    console.log('Initializing "' + campaign.name + '"...');

    const datasetFolder = './datasets/' + campaign.name + '/';
    const uploadsFolder = './uploads/';

    if (!fs.existsSync(datasetFolder)) {
      console.log('Campaign "' + campaign.name + '" initialization process complete (no folder).');
      return;
    }

    const files = fs.readdirSync(datasetFolder);
    const campaignId = campaign.id;

    if (files.length <= 0) {
      console.log('Campaign "' + campaign.name + '" initialization process complete (no data).');
      return;
    }

    if (!fs.existsSync(uploadsFolder + campaignId)) {
      fs.mkdirSync(uploadsFolder + campaignId);
    }

    console.log('Found ' + files.length + ' files');
    ImageConnector.getInstance((connector: ImageConnector) => {
      const images: object[] = [];

      files.forEach((file: string) => {
        images.push(
          ImageData.fromObject({
            campaignId,
            userId,
            annotations: []
          })
        );
      });

      connector
        .insertMany(connector.collection, images)
        .then((result: any) => {
          connector.connection.close();

          let i = 0;
          files.forEach((file: string, index: number) => {
            fs.copyFile(
              datasetFolder + file,
              uploadsFolder + campaign.id + '/' + result.insertedIds[index] + '.jpg',
              (err: any) => {
                if (err) {
                  console.error('Error copying ' + file, err);
                }
              }
            );
            i++;

            if (i % 10 && i > 0) {
              console.log('Copied ' + i + '/' + files.length + ' files.');
            }
          });

          console.log('Preparing to update campaign document of ' + campaign.name);
          DatabaseConnector.getInstance((databaseConnector: DatabaseConnector) => {
            databaseConnector
              .updateDocument(
                'campaigns',
                { _id: ObjectID.createFromHexString(campaign.id) },
                {
                  initialized: true
                }
              )
              .then(res => {
                databaseConnector.connection.close();
                console.log('Campaign "' + campaign.name + '" initialization process complete.');
              })
              .catch(err => {
                console.error('Failed to update campaign document of ' + campaign.name);
              });
          });
        })
        .catch(err => {
          console.error('Failed to insert images of ' + campaign.name);
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
}
