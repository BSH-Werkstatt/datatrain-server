import { Campaign } from '../models/campaign';
import { ImageData } from '../models/data';
import { Annotation, AnnotationCreationRequest } from '../models/annotation';
import os from 'os';
// TODO: Implement with abstract Data and choose type of data depending on Campaign, not directly with Image
import express from 'express';
import multer from 'multer';
import path from 'path';
import { UserService } from './UserService';
import { CampaignConnector } from '../db/CampaignConnector';
import { ImageConnector } from '../db/ImageConnector';
import { Leaderboard } from '../models/leaderboard';
import { LeaderboardConnector } from '../db/LeaderboardConnector';

import http from 'http';
import fs from 'fs';
import { PredictionResult } from '../models/prediction';

export class CampaignService {
  /**
   * Returns the Campaign with the given identifier, if it does not exist, an error will be raised
   * @param id Identifier of the campaign
   */
  get(id: string): Promise<Campaign> {
    const promise = new Promise<Campaign>((resolve, reject) => {
      CampaignConnector.getInstance((db: CampaignConnector) => {
        db.get(id).then(result => {
          if (!result) {
            reject(new Error('Could not get campaign with id: ' + id));
          } else {
            db.connection.close();
            resolve(result);
          }
        });
      });
    });

    return promise;
  }

  /**
   * Returns all campaigns as an array of Campaign objects
   */
  getAll(): Promise<Campaign[]> {
    const promise = new Promise<Campaign[]>((resolve, reject) => {
      CampaignConnector.getInstance((db: CampaignConnector) => {
        db.getAll().then(result => {
          if (!result) {
            reject(new Error('Could not get all campaigns'));
          } else {
            db.connection.close();
            resolve(result);
          }
        });
      });
    });

    return promise;
  }

  /**
   * Saves the uploaded image from the express request under the folder of the campaign with campaignId.
   * Returns a Promise with an Image response describing uploaded the image file or an error
   * @param campaignId Identifier of the campaign to which the image is uploaded to
   * @param request Express request with the uploaded image file (request.file)
   */
  uploadImage(campaignId: string, request: express.Request): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const userToken = request.query.userToken;
      const userId = UserService.getUserIdFromToken(userToken);

      const image = new ImageData('', campaignId, userId, []);
      image.save((imageData: ImageData) => {
        const imageId = imageData.id;

        // function to save the image
        const storage = multer.diskStorage({
          // passing directory as a string means multer will take care of creating it
          // TODO: directory in a constant
          destination: __dirname + '/../uploads/' + campaignId + '/',
          filename: (req, file, callback) => {
            const filename = file.originalname;
            const ext = path.extname(filename);
            callback(null, imageId + ext);
          }
        });

        const multerSingle = multer({ storage }).single('imageFile');

        multerSingle(request, undefined, async error => {
          if (error) {
            reject(error);
          }
          this.addLeaderboardScoreToUser(campaignId, userId, 1);

          resolve(imageData);
        });
      });
    });
  }

  /**
   * Returns a random Image from all images of the Campaign with the identifier campaignId
   * This method does _not_ return the image file, but only an object of the ImageData class
   * @param campaignId Identifier of the Campaign from which an image is to be selected
   */
  getRandomImage(campaignId: string): Promise<ImageData> {
    return new Promise<ImageData>((resolve, reject) => {
      ImageConnector.getInstance((db: ImageConnector) => {
        // not the most efficient, but will get the job done before we write something better, TODO
        db.getAllOfCampaign(campaignId).then(result => {
          if (!result) {
            reject(new Error('Could not get images of campaign'));
          } else {
            const i = Math.floor(Math.random() * result.length);
            resolve(ImageData.fromObject(result[i]));
          }
        });
      });
    });
  }

  /**
   * basically a random hex string generator
   */
  getAnnotationId(): string {
    const date = new Date();
    const timestamp = date.getTime();
    let str = timestamp.toString(16);

    for (let i = 0; i < 24; i++) {
      str += Math.floor(Math.random() * 16).toString(16);
    }

    return str;
  }

  /**
   * Saves the uploaded annotation to the database
   * Returns a Promise with an Annotation response describing uploaded the annotation or an error
   * @param campaignId Identifier of the campaign to which the annotation belongs to
   * @param imageId Identifier of the image to which the annotation belongs to
   * @param request Express request with the rest of the form data (user etc.)
   */
  uploadAnnotations(campaignId: string, imageId: string, request: AnnotationCreationRequest): Promise<Annotation[]> {
    return new Promise((resolve, reject) => {
      const userId = UserService.getUserIdFromToken(request.userToken);
      const annotations: Annotation[] = [];

      request.items.forEach((item: any) => {
        const annotation = new Annotation(
          this.getAnnotationId(),
          item.points,
          item.type,
          item.label,
          userId,
          campaignId,
          imageId
        );

        annotations.push(annotation);
      });

      Annotation.saveMany(imageId, annotations, (res: any) => {
        this.addLeaderboardScoreToUser(campaignId, userId, annotations.length);

        if (res) {
          resolve(res);
        } else {
          reject('Could not save annotation');
        }
      });
    });
  }

  /**
   * Retrieves all images of the campaign with the identifier campaignId
   * @param campaignId Identifier of the campaign
   */
  getAllImagesOfCampaign(campaignId: string): Promise<ImageData[]> {
    return new Promise<ImageData[]>((resolve, reject) => {
      ImageConnector.getInstance((db: ImageConnector) => {
        // not the most efficient, but will get the job done before we write something better, TODO
        db.getAllOfCampaign(campaignId).then(result => {
          if (!result) {
            reject(new Error('Could not get images of campaign'));
          } else {
            resolve(result);
          }
        });
      });
    });
  }

  /**
   * Retrieves the leaderboard of the campaign with the identifier campaignId
   * @param campaignId Identifier of the campaign
   */
  getLeaderboard(campaignId: string): Promise<Leaderboard> {
    return new Promise<Leaderboard>((resolve, reject) => {
      LeaderboardConnector.getInstance((db: LeaderboardConnector) => {
        // not the most efficient, but will get the job done before we write something better, TODO
        db.get(campaignId).then(result => {
          if (!result) {
            reject(new Error('Could not get leaderboard of campaign'));
          } else {
            resolve(result);
          }
        });
      });
    });
  }
  /**
   * Adds score to the leaderboard entry of the user with userId in the campaign with campaignId
   * @param campaignId campaign identifier
   * @param userId user identifier
   * @param score score to be addded
   */
  addLeaderboardScoreToUser(campaignId: string, userId: string, score: number) {
    LeaderboardConnector.getInstance((db: LeaderboardConnector) => {
      db.get(campaignId)
        .then((res: Leaderboard) => {
          const leaderboard = res;
          leaderboard.addScoreToUser(userId, score);
          leaderboard.save(() => {
            console.log('Saved score for annotating');
          });
        })
        .catch(err => {
          console.error(
            'Error while adding score to user for annotating',
            err,
            'campaignId: ',
            campaignId,
            'userId: ',
            userId
          );
        });
    });
  }

  /**
   * Requests a prediction from the ML server of the image in the request
   * @param campaignId identifier of the campaign, with the model
   * @param request request containing image
   */
  requestPrediction(campaignId: string, request: express.Request): Promise<PredictionResult> {
    return new Promise<PredictionResult>((resolve, reject) => {
      const imageName = Math.floor(Math.random() * 1000000000);

      const storage = multer.diskStorage({
        // passing directory as a string means multer will take care of creating it
        // TODO: directory in a constant
        destination: __dirname + '/../predictions/',
        filename: (req, file, callback) => {
          const filename = file.originalname;
          const ext = path.extname(filename);
          console.log('saved');
          callback(null, imageName + ext);
        }
      });

      const multerSingle = multer({ storage }).single('imageFile');

      multerSingle(request, undefined, async error => {
        if (error) {
          reject(error);
        }
        const url = 'http://backend_dev:80/predictions/' + request.file.filename;
        console.log(url);
        this.get(campaignId).then(campaign => {
          if (campaign) {
            this.requestPredictionFromMLServer(campaign, url, __dirname + '/../predictions/').then(res => {
              resolve(res);
            });
          } else {
            resolve({
              predictionURL: 'Error: campaign with id ' + campaignId + ' does not exist'
            });
          }
        });
      });
    });
  }

  async requestPredictionFromMLServer(campaign: Campaign, url: string, folder: string): Promise<PredictionResult> {
    return new Promise<PredictionResult>((resolve, reject) => {
      const request = require('request');
      try {
        request.post(
          'http://mldev:6000/predictions/',
          {
            json: {
              imageURL: url,
              campaignId: campaign.id,
              campaignName: campaign.name,
              campaignTaxonomy: campaign.taxonomy
            }
          },
          (error: any, res: any, body: any) => {
            if (error) {
              console.error(error);
              reject(error);
            }

            if (body && body.predictionURL) {
              const file = fs.createWriteStream(folder + path.basename(body.predictionURL));
              http.get(body.predictionURL, response => {
                response.pipe(file);
                if (os.hostname().includes('ase.in.tum.de')) {
                  resolve({
                    predictionURL:
                      'http://ios19bsh.ase.in.tum.de/dev/api/predictions/' + path.basename(body.predictionURL)
                  });
                } else {
                  resolve({ predictionURL: os.hostname() + '/predictions/' + path.basename(body.predictionURL) });
                }
              });
            }
          }
        );
      } catch (e) {
        console.error('Error in POST request to ML server: ', e);
      }
    });
  }
}
