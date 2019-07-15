import { Training, TrainingCreationRequest, TrainingUpdateRequest } from '../models/training';
import { DatabaseConnector } from '../db/DatabaseConnector';
import { ObjectId } from 'bson';
import { UserService } from './UserService';
import { UserConnector } from '../db/UserConnector';
import { CampaignConnector } from '../db/CampaignConnector';
import { Campaign } from '../models/campaign';
import http from 'http';
export class TrainingService {
  collection = 'training';

  getActive(campaignId: string): Promise<Training> {
    return new Promise<Training>((resolve, reject) => {
      CampaignConnector.getInstance((conn: CampaignConnector) => {
        conn
          .get(campaignId)
          .then((campaign: Campaign) => {
            if (campaign.currentTrainingId) {
              return conn.findOne(this.collection, { _id: ObjectId.createFromHexString(campaign.currentTrainingId) });
            } else {
              resolve(null);
            }
          })
          .then((training: Training) => {
            resolve(training);
          })
          .catch(e => {
            reject(e);
          });
      });
    });
  }

  create(campaignId: string, request: TrainingCreationRequest): Promise<Training> {
    return new Promise<Training>((resolve, reject) => {
      const userId = UserService.getUserIdFromToken(request.userToken);
      const hasCapability = UserConnector.userHasCapabilityForCampaigns(userId);

      if (hasCapability) {
        CampaignConnector.getInstance((conn: CampaignConnector) => {
          const trainingWithoutId = request.training;
          delete trainingWithoutId.id;
          conn
            .get(campaignId)
            .then((campaign: Campaign) => {
              console.log(campaign);
              if (!campaign.trainingInProgress) {
                conn.insertOne(this.collection, trainingWithoutId).then((result: any) => {
                  const trainingId = result.insertedId;

                  campaign.currentTrainingId = trainingId;
                  campaign.trainingInProgress = true;
                  conn.save(campaign);

                  request.training.id = trainingId;
                  console.log('started training');
                  this.triggerTraining(campaign);
                  resolve(request.training);
                });
              } else {
                this.getActive(campaignId).then((training: Training) => {
                  resolve(training);
                });
              }
            })
            .catch(e => {
              console.error('Error during training creation: ', e);
              reject(e);
            });
        });
      }
    });
  }

  updateActive(campaignId: string, request: TrainingUpdateRequest): Promise<Training> {
    return new Promise<Training>((resolve, reject) => {
      CampaignConnector.getInstance((conn: CampaignConnector) => {
        this.getActive(campaignId).then((training: Training) => {
          training.currentStep = request.currentStep;
          training.currentEpoch = request.currentEpoch;
          training.finished = request.finished;
          // @ts-ignore
          training.id = training._id;

          if (request.metric) {
            training.metrics.push(request.metric);
          }

          conn
            .updateDocument(
              this.collection,
              // @ts-ignore
              { _id: training.id },
              training
            )
            .then((result: any) => {
              conn.get(campaignId).then(campaign => {
                campaign.currentTrainingId = training.id;
                campaign.trainingInProgress = !training.finished;
                conn.save(campaign);
                resolve(training);
              });
            })
            .catch(e => {
              reject(e);
            });
        });
      });
    });
  }

  async triggerTraining(campaign: Campaign): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const request = require('request');
      try {
        request.post(
          process.env.ML_HOST + 'train/',
          {
            json: {
              campaignId: campaign.id.toString(),
              taxonomy: campaign.taxonomy
            }
          },
          (error: any, res: any, body: any) => {
            if (error) {
              console.error(error);
              reject(error);
            }

            if (body && body.training) {
              resolve(body.training === parseInt(body.training, 10));
            }
          }
        );
      } catch (e) {
        console.error('Error in POST request to ML server: ', e);
      }
    });
  }
}
