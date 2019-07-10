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

import { S3ImageService } from '../services/S3ImageService';

export class Initializer {
  /**
   * Initializes the BSH campaigns
   * this means user, campaign and leaderboards + files (currently images, via initCampaignFiles())
   */
  static init() {
    console.log(
      '--------------------------------------\n--- INITIALIZATION PROCESS STARTED ---\n--------------------------------------\n'
    );

    let DBInit: { users: any[]; campaigns: any[] } = {
      users: [],
      campaigns: []
    };

    try {
      DBInit = require('./db-init').default;
      // do stuff
    } catch (ex) {
      console.error('No db-init present!');
      return;
    }

    let insertedUserIds: string[];
    const campaignsUsers: any[][] = [];

    let insertedCampaigns: any[];
    let insertedCampaignIds: string[];

    DatabaseConnector.getInstance((conn: DatabaseConnector) => {
      console.log(`Preparing to insert ${DBInit.users.length} users...`);
      // insert users
      conn
        .insertMany('users', DBInit.users)
        .then((result: any) => {
          console.log(`Inserted ${result.insertedCount} users...`);
          insertedUserIds = result.insertedIds;

          // process campaigns
          const campaigns: object[] = [];
          DBInit.campaigns.forEach(campaign => {
            const campaignUsers = campaign.users;
            campaignsUsers.push(campaignUsers);

            const ownerEmail = campaign.ownerEmail;
            const ownerId = insertedUserIds[DBInit.users.map(u => u.email).indexOf(ownerEmail)];

            delete campaign.ownerEmail;
            delete campaign.users;

            // @ts-ignore
            campaign.ownerId = ownerId;

            campaigns.push(campaign);
          });

          console.log(`Preparing to insert ${campaigns.length} campaigns...`);
          return conn.insertMany('campaigns', campaigns);
        })
        .then((result: any) => {
          console.log(`Inserted ${result.insertedCount} campaigns...`);
          insertedCampaigns = result.ops;
          insertedCampaignIds = result.insertedIds;

          // process leaderboards
          const leaderboards: object[] = [];
          for (let i = 0; i < result.insertedCount; i++) {
            const campaignId = result.insertedIds[i];
            const scores: any[] = [];

            campaignsUsers[i].forEach(user => {
              const userId = insertedUserIds[DBInit.users.map(u => u.email).indexOf(user.email)];

              scores.push({
                name: user.name,
                email: user.email,
                score: 0,
                userId
              });
            });

            const leaderboard = {
              campaignId,
              scores
            };

            leaderboards.push(leaderboard);
          }

          console.log(`Preparing to insert ${leaderboards.length} leaderboards...`);
          return conn.insertMany('leaderboards', leaderboards);
        })
        .then((result: any) => {
          console.log(`Inserted ${result.insertedCount} leaderboards...`);
          const adminId = insertedUserIds[0]; // assumed

          // process campaign data
          insertedCampaigns.forEach((campaign, i) => {
            campaign.id = insertedCampaignIds[i];
            this.initCampaignFiles(campaign, adminId);
          });
        })
        .catch(e => {
          console.error('Error during init: ', e);
        });
    });
  }

  /**
   * initializes the files of the given campaign using files present in the datasets/:campaignUrlName folder
   * @param campaign campaign object
   * @param userId id of the user to insert all the files as (usually and admin user)
   */
  static initCampaignFiles(campaign: Campaign, userId: string) {
    // we'll remove this later
    console.log('Initializing "' + campaign.name + ' Campaign"...');

    const datasetFolder = './datasets/' + campaign.urlName + '/';

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

    console.log('Found ' + files.length + ' files');
    ImageConnector.getInstance((connector: ImageConnector) => {
      const images: object[] = [];

      files.forEach((file: string) => {
        images.push({
          url: '',
          campaignId,
          userId,
          annotations: []
        });
      });

      // first insert ImageData objects to the DB
      connector
        .insertMany(connector.collection, images)
        .then((result: any) => {
          connector.connection.close();
          const s3 = new S3ImageService();

          let i = 0;
          // now upload these using the ids (insertedIds) as names to the S3 bucket
          files.forEach((file: string, index: number) => {
            s3.uploadImageByPath(datasetFolder + file, result.insertedIds[index])
              .then(url => {
                i++;

                if ((i % 10 === 0 || i === files.length) && i > 0) {
                  console.log('Uploaded ' + i + '/' + files.length + ' files to the bucket.');
                }

                // now save the url to the ImageData document
                ImageConnector.getInstance((conn: ImageConnector) => {
                  conn.get(result.insertedIds[index].toString()).then(imageData => {
                    imageData.url = url;
                    imageData.save((iData: ImageData) => {
                      console.log('Uploaded URL and saved for ' + iData.id);
                    });
                  });
                });
              })
              .catch(err => {
                console.error('Error while uploading: ', err);
              });
          });

          console.log('Campaign "' + campaign.name + '" initialization process complete.');
        })
        .catch(err => {
          console.error('Failed to insert images of ' + campaign.name);
        });
    });
  }
}
