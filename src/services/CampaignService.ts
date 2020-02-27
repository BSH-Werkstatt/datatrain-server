import { Campaign, CampaignCreationRequest, CampaignUpdateRequest } from '../models/campaign';
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
import { Leaderboard, LeaderboardCreationRequest, LeaderboardUpdateRequest } from '../models/leaderboard';
import { LeaderboardConnector } from '../db/LeaderboardConnector';

import http from 'http';
import fs from 'fs';
import { PredictionResult } from '../models/prediction';
import { S3ImageService } from './S3ImageService';

import dateFormat from 'dateformat';
import jo from 'jpeg-autorotate';
import { UserConnector } from '../db/UserConnector';
import { User, USER_TYPES } from '../models/user';
import { ObjectId } from 'bson';
import { TrainingService } from './TrainingService';

export class CampaignService {
  /**
   * Returns the Campaign with the given identifier, if it does not exist, an error will be raised
   * @param id Identifier of the campaign
   */
  get(id: string): Promise<Campaign> {
    const promise = new Promise<Campaign>((resolve, reject) => {
      CampaignConnector.getInstance((db: CampaignConnector) => {
        db.get(id).then(result => {
          db.connection.close();

          if (!result) {
            reject(new Error('Could not get campaign with id: ' + id));
          } else {
            resolve(result);
          }
        });
      });
    });

    return promise;
  }

  /**
   * generates a new url name for a campaign, which is unique
   * @param name name of the campaign
   */
  campaignBuildNewURLName(name: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const urlName = name.toLocaleLowerCase().replace(' ', '-');

      CampaignConnector.getInstance((campaignConn: CampaignConnector) => {
        campaignConn.getByURLName(urlName).then(res => {
          if (!res) {
            resolve(urlName);
          } else {
            resolve(urlName + Math.floor(Math.random() * 100000));
          }
        });
      });
    });
  }

  /**
   * creates a campaign according to a CampaignCreationRequest
   * @param request a CampaignCreationRequest object
   */
  post(request: CampaignCreationRequest): Promise<Campaign> {
    console.log('Got POST request to create a campaign');

    return new Promise<Campaign>((resolve, reject) => {
      const userId = UserService.getUserIdFromToken(request.userToken);
      const hasCapabilityPromise = UserConnector.userHasCapabilityForCampaigns(userId);

      hasCapabilityPromise
        .then((hasCapability: boolean) => {
          if (hasCapability) {
            CampaignConnector.getInstance((campaignConn: CampaignConnector) => {
              request.ownerId = userId;

              this.campaignBuildNewURLName(request.name).then(urlName => {
                request.urlName = urlName;
                const campaign = Campaign.fromObject(request);

                campaignConn.save(campaign).then(campaignResult => {
                  campaign.id = campaignResult.insertedId.toString();
                  resolve(campaign);
                  console.log('Campaign ' + campaign.id + ' created.');
                });
              });
            });
          } else {
            reject('hasCapability = false');
          }
        })
        .catch(e => {
          const reason = 'User ' + userId + ' does not have the capability to create a campaign: ' + e;
          console.error(reason);
          reject(reason);
        });
    });
  }

  /**
   * updates a campaign according to a CampaignCreationRequest
   * @param request a CampaignCreationRequest object
   */
  put(campaignId: string, request: CampaignUpdateRequest): Promise<Campaign> {
    console.log('Got PUT request to update campaign ' + campaignId);

    return new Promise<Campaign>((resolve, reject) => {
      const userId = UserService.getUserIdFromToken(request.userToken);
      const hasCapabilityPromise = UserConnector.userHasCapabilityForCampaigns(userId);

      hasCapabilityPromise
        .then((hasCapability: boolean) => {
          if (hasCapability) {
            CampaignConnector.getInstance((campaignConn: CampaignConnector) => {
              request.campaign.id = campaignId;
              const campaign = campaignConn.save(request.campaign);

              console.log('Campaign ' + campaignId + ' updated.');
              resolve(campaign);
            });
          } else {
            reject('hasCapability = false');
          }
        })
        .catch(e => {
          const reason = 'User ' + userId + ' does not have the capability to create a campaign: ' + e;
          console.error(reason);
          reject(reason);
        });
    });
  }

  /**
   * Returns the Campaign with the given url name, if it does not exist, an error will be raised
   * @param urlName url name of the campaign
   */
  getByURLName(urlName: string): Promise<Campaign> {
    const promise = new Promise<Campaign>((resolve, reject) => {
      CampaignConnector.getInstance((db: CampaignConnector) => {
        db.getByURLName(urlName).then(result => {
          db.connection.close();

          if (!result) {
            reject(new Error('Could not get campaign with id: ' + urlName));
          } else {
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
          db.connection.close();

          if (!result) {
            reject(new Error('Could not get all campaigns'));
          } else {
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
  uploadImage(
    campaignId: string,
    request: express.Request,
    doNotAddScore?: boolean,
    makePublic?: boolean
  ): Promise<ImageData> {
    if (!makePublic) {
      makePublic = false;
    }

    return new Promise((resolve, reject) => {
      // @ts-ignore
      const userToken = request.query.userToken;
      const userId = UserService.getUserIdFromToken(userToken);

      const image = new ImageData('', campaignId, userId, [], '', dateFormat(new Date(), 'isoDateTime'));
      image.save((imageData: ImageData) => {
        const imageId = imageData.id;

        // function to save the image
        const storage = multer.diskStorage({
          // passing directory as a string means multer will take care of creating it
          // TODO: directory in a constant
          destination: __dirname + '/../uploads/' + campaignId + '/',
          filename: (req, file, callback) => {
            const ext = '.jpg';

            if (
              path.extname(file.originalname).toLowerCase() !== '.jpg' &&
              path.extname(file.originalname).toLowerCase() !== '.jpeg'
            ) {
              reject('Wrong file extension.');
            }

            callback(null, imageId + ext);
          }
        });

        const multerSingle = multer({ storage }).single('imageFile');

        multerSingle(request, undefined, async error => {
          if (error) {
            reject(error);
          }

          if (!doNotAddScore && campaignId) {
            this.addLeaderboardScoreToUser(campaignId, userId, 1);
          }
          const s3 = new S3ImageService();

          const filename = __dirname + '/../uploads/' + campaignId + '/' + imageId + '.jpg';
          jo.rotate(filename, { quality: 100 })
            .then(({ buffer, orientation, dimensions, quality }) => {
              console.log(`Orientation was ${orientation}`);
              console.log(`Dimensions after rotation: ${dimensions.width}x${dimensions.height}`);

              return new Promise((res, rej) => {
                const ws = fs.createWriteStream(filename);
                ws.write(buffer);
                ws.end(() => {
                  console.log('Finished rotating image');
                });
                ws.on('finish', () => {
                  res(true);
                });
                ws.on('error', rej);
              });
            })
            .catch(err => {
              if (err.code === jo.errors.correct_orientation) {
                console.log('The orientation of the image ' + imageId + ' is already correct!');
              } else if (err.code === jo.errors.no_orientation) {
                console.log('There is no orientation on the image ' + imageId + '!');
              } else if (err.code === jo.errors.unknown_orientation) {
                console.log('The orientation on the image ' + imageId + ' is not known!');
              } else {
                console.log('Error while rotating image: ', err);
              }

              return null;
            })
            .then(res => {
              return s3.uploadImageByPath(filename, imageId, makePublic);
            })
            .then(url => {
              image.url = url;
              image.id = imageId;
              image.save((result: any) => {
                TrainingService.triggerAutomatedTraining(campaignId);

                resolve(imageData);
              });

              fs.unlink(filename, () => {
                console.log('Tmp file deleted.');
              });
            })
            .catch(err => {
              console.error('Error while uploading image: ', err);
            });
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
          db.connection.close();

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
          imageId,
          dateFormat(new Date(), 'isoDateTime')
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
          db.connection.close();

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
          db.connection.close();

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
   * creates the leaderboard for a campaign according to a LeaderboardCreationRequest
   * @param campaignId id of the updated campaign
   * @param request a LeaderboardCreationRequest object
   */
  postLeaderboard(campaignId: string, request: LeaderboardCreationRequest): Promise<Leaderboard> {
    return new Promise<Leaderboard>((resolve, reject) => {
      console.log('Got POST request to create the loaderboard of the campaign ' + campaignId);

      const userId = UserService.getUserIdFromToken(request.userToken);
      const hasCapabilityPromise = UserConnector.userHasCapabilityForCampaigns(userId);

      hasCapabilityPromise
        .then((hasCapability: boolean) => {
          if (hasCapability) {
            LeaderboardConnector.getInstance((leaderboardConn: LeaderboardConnector) => {
              request.campaignId = campaignId;

              leaderboardConn.save(Leaderboard.fromObject(request)).then(leaderboardResult => {
                console.log('Leaderboard of campaign ' + campaignId + ' created.');

                const leaderboard = leaderboardResult.ops[0];
                leaderboard.id = leaderboardResult.insertedId.toString();
                resolve(leaderboard);
              });
            });
          } else {
            reject('hasCapability = false');
          }
        })
        .catch(e => {
          const reason = 'User ' + userId + ' does not have the capability to create a campaign: ' + e;
          console.error(reason);
          reject(reason);
        });
    });
  }

  /**
   * updates the leaderboard for a campaign according to a LeaderboardUpdateRequest
   * @param campaignId id of the updated campaign
   * @param request a LeaderboardUpdateRequest object
   */
  putLeaderboard(campaignId: string, request: LeaderboardUpdateRequest): Promise<Leaderboard> {
    return new Promise<Leaderboard>((resolve, reject) => {
      console.log('Got PUT request to update loaderboard of the campaign ' + campaignId);

      const userId = UserService.getUserIdFromToken(request.userToken);
      const hasCapabilityPromise = UserConnector.userHasCapabilityForCampaigns(userId);

      hasCapabilityPromise
        .then((hasCapability: boolean) => {
          if (hasCapability) {
            LeaderboardConnector.getInstance((leaderboardConn: LeaderboardConnector) => {
              request.leaderboard.campaignId = campaignId;
              const leaderboard = leaderboardConn.save(request.leaderboard);

              console.log('Leaderboard of campaign ' + campaignId + ' updated.');
              resolve(leaderboard);
            });
          } else {
            reject('hasCapability = false');
          }
        })
        .catch(e => {
          const reason = 'User ' + userId + ' does not have the capability to create a campaign: ' + e;
          console.error(reason);
          reject(reason);
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
          db.connection.close();

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
        const url = process.env.SELF_HOST + 'predictions/' + request.file.filename;
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
          process.env.ML_HOST + '/predictions/',
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
                resolve({ predictionURL: process.env.SELF_HOST + 'predictions/' + path.basename(body.predictionURL) });
              });
            }
          }
        );
      } catch (e) {
        console.error('Error in POST request to ML server: ', e);
      }
    });
  }

  /**
   * Uploads the campaign image as an ImageData for campaignId = ""
   * @param campaignId id of the campaign
   * @param request request with the image
   */
  uploadCampaignImage(campaignId: string, request: express.Request): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.uploadImage(campaignId, request, false, true).then((imageData: ImageData) => {
        const url = imageData.url;

        ImageConnector.getInstance((conn: ImageConnector) => {
          conn.deleteOne(conn.collection, { imageId: ObjectId.createFromHexString(imageData.id) }).then(() => {
            conn.connection.close();
            resolve(url);
          });
        });
      });
    });
  }

  /**
   * Gets the url of the campaign image
   * @param campaignId id of the campaign
   */
  getCampaignImage(campaignId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.get(campaignId).then((campaign: Campaign) => {
        resolve(campaign.image);
      });
    });
  }
  /**
   * insert crowd groups to the user
   * @param campaignId is of the current campaign
   */
  // @TODO: perform error handeling not going to catch block fix*
  addCrowdGroup(campaignId: string, groupName: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        CampaignConnector.getInstance(async (db: CampaignConnector) => {
          const campaign: any = await db.get(campaignId);
          campaign.groups.push(groupName);
          db.save(campaign);
        });
        resolve('crowd grp added');
      } catch (error) {
        resolve('unable to add crowd group 500');
      }
    });
  }
}
