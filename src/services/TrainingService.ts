import { Training, TrainingCreationRequest, TrainingUpdateRequest } from '../models/training';
import { UserService } from './UserService';
import { UserConnector } from '../db/UserConnector';
import { CampaignConnector } from '../db/CampaignConnector';
import { Campaign } from '../models/campaign';
import dateFormat from 'dateformat';
import { CampaignService } from './CampaignService';

export class TrainingService {
  collection = 'training';

  static async triggerTraining(campaign: Campaign): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const request = require('request');
      console.log(process.env.ML_HOST + '/train/');
      try {
        request.post(
          process.env.ML_HOST + '/train/',
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

  static async triggerAutomatedTraining(campaignId: string) {
    console.log(campaignId);
    CampaignConnector.getImagesSinceLastTraining(campaignId).then(imagesSinceLastTraining => {
      if (imagesSinceLastTraining > 100) {
        console.log('images since last training: ', imagesSinceLastTraining, '... triggering training...');
        const training: Training = {
          id: '', // will be completed by server
          campaignId,
          timeStart: '', // will be completed by server
          currentEpoch: 0,
          epochs: 5, // default value
          currentStep: 0,
          steps: 100, // default value
          metrics: [],
          finished: false
        };

        const ts = new TrainingService();
        ts.createTraining(campaignId, training);
      }
    });
  }

  getActive(campaignId: string): Promise<Training> {
    return CampaignConnector.getActiveTraining(campaignId);
  }

  create(campaignId: string, request: TrainingCreationRequest): Promise<Training> {
    return new Promise<Training>((resolve, reject) => {
      const userId = UserService.getUserIdFromToken(request.userToken);
      const hasCapability = UserConnector.userHasCapabilityForCampaigns(userId);

      if (hasCapability) {
        return this.createTraining(campaignId, request.training);
      }
    });
  }

  createTraining(campaignId: string, training: Training): Promise<Training> {
    return new Promise<Training>((resolve, reject) => {
      CampaignConnector.getInstance((conn: CampaignConnector) => {
        const trainingWithoutId = training;
        training.timeStart = dateFormat(new Date(), 'isoDateTime');
        delete trainingWithoutId.id;

        conn
          .get(campaignId)
          .then((campaign: Campaign) => {
            console.log(campaign);
            if (!campaign.trainingInProgress) {
              conn.insertOne(this.collection, trainingWithoutId).then((result: any) => {
                const trainingId = result.insertedId;
                trainingWithoutId.id = trainingId;
                console.log('Inserted training object: ', trainingWithoutId);

                campaign.currentTrainingId = trainingId;
                campaign.trainingInProgress = true;
                conn.save(campaign);

                training.id = trainingId;

                console.log(
                  'Saved new trainingId ' + trainingId + ' to Campaign ' + campaignId + ', triggering training on ML'
                );
                TrainingService.triggerTraining(campaign).then((trainingResult: any) => {
                  console.log('Trigger training result: ', trainingResult);
                });

                conn.connection.close();
                resolve(training);
              });
            } else {
              this.getActive(campaignId).then((activeTraining: Training) => {
                conn.connection.close();
                resolve(activeTraining);
              });
            }
          })
          .catch(e => {
            console.error('Error during training creation: ', e);
            conn.connection.close();
            reject(e);
          });
      });
    });
  }

  updateActive(campaignId: string, request: TrainingUpdateRequest): Promise<Training> {
    return new Promise<Training>((resolve, reject) => {
      CampaignConnector.getInstance((conn: CampaignConnector) => {
        this.getActive(campaignId).then((training: Training) => {
          training.currentStep = request.currentStep ? request.currentStep : training.currentStep;
          training.currentEpoch = request.currentEpoch ? request.currentEpoch : training.currentEpoch;
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
                conn.connection.close();
                resolve(training);
              });
            })
            .catch(e => {
              conn.connection.close();
              reject(e);
            });
        });
      });
    });
  }
}
