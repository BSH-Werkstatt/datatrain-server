import { Training, TrainingCreationRequest, TrainingUpdateRequest } from '../models/training';
import { DatabaseConnector } from '../db/DatabaseConnector';
import { ObjectId } from 'bson';
import { UserService } from './UserService';
import { UserConnector } from '../db/UserConnector';
import { CampaignConnector } from '../db/CampaignConnector';
import { Campaign } from '../models/campaign';

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
            console.log();
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
      console.log('thing');
      const userId = UserService.getUserIdFromToken(request.userToken);
      const hasCapability = UserConnector.userHasCapabilityForCampaigns(userId);

      if (hasCapability) {
        CampaignConnector.getInstance((conn: CampaignConnector) => {
          const trainingWithoutId = request.training;
          delete trainingWithoutId.id;
          conn
            .insertOne(this.collection, trainingWithoutId)
            .then((result: any) => {
              const trainingId = result.insertedId;

              conn.get(campaignId).then((campaign: Campaign) => {
                campaign.currentTrainingId = trainingId;
              });

              request.training.id = trainingId;
              resolve(request.training);
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
      const userId = UserService.getUserIdFromToken(request.userToken);
      const hasCapability = UserConnector.userHasCapabilityForCampaigns(userId);

      if (hasCapability) {
        CampaignConnector.getInstance((conn: CampaignConnector) => {
          this.getActive(campaignId).then((training: Training) => {
            training.currentStep = request.currentStep;
            training.currentEpoch = request.currentEpoch;
            training.finished = request.finished;

            if (request.metric) {
              training.metrics.push();
            }

            conn
              .updateDocument(
                this.collection,
                { campaignId: ObjectId.createFromHexString(campaignId), active: true },
                training
              )
              .then((result: any) => {
                conn.get(campaignId).then(campaign => {
                  // campaign.currentTrainingId = result
                  console.log(result);
                  if (!training.finished) {
                    campaign.trainingInProgress = true;
                  } else {
                    campaign.trainingInProgress = false;
                  }

                  conn.save(campaign);
                });
                resolve(training);
              })
              .catch(e => {
                reject(e);
              });
          });
        });
      }
    });
  }
}
