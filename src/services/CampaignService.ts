import { Campaign, CampaignType } from '../models/campaign';
import { Image } from '../models/image';
import express from 'express';
import multer from 'multer';

const campaignDummy: Campaign[] = [
  {
    ownerId: 1,
    id: 1,
    type: CampaignType.ImageAnnotationCampaign,
    name: 'Banana Campaign',
    description: 'Lorem Ipsum banana sit amet',
    vocabulary: ['banana', 'not_banana'],
    userIds: [1, 2, 3]
  },
  {
    ownerId: 2,
    id: 2,
    type: CampaignType.ImageAnnotationCampaign,
    name: 'Dishwasher Campaign',
    description: 'Lorem Ipsum dishwasher sit amet',
    vocabulary: ['plate', 'fork', 'mug', 'bowl'],
    userIds: [1, 2, 3]
  }
];

export class CampaignService {
  /**
   * Returns the Campaign with the given identifier, if it does not exist, an error will be raised
   * @param id Identifier of the campaign
   */
  get(id: number): Promise<Campaign> {
    const promise = new Promise<Campaign>((resolve, reject) => {
      const result: Campaign = campaignDummy.find(campaign => {
        return campaign.id === id;
      });

      if (!result) {
        reject(new Error('Could not get campaign with id: ' + id));
      } else {
        resolve(result);
      }
    });

    return promise;
  }

  /**
   * Returns all campaigns as an array of Campaign objects
   */
  getAll(): Promise<Campaign[]> {
    const promise = new Promise<Campaign[]>(resolve => {
      resolve(campaignDummy);
    });

    return promise;
  }

  /**
   * Saves the uploaded image from the express request under the folder of the campaign with campaignId.
   * Returns a Promise with an Image response describing uploaded the image file or an error
   * @param campaignId Identifier of the campaign to which the image is uploaded to
   * @param request Express request with the uploaded image file (request.file)
   */
  uploadImage(campaignId: number, request: express.Request): Promise<Image> {
    const imageId = this.getNextImageId();
    const image: Image = {
      id: imageId,
      campaignId,
      userId: 1,
      annotations: []
    };

    const storage = multer.diskStorage({
      // passing directory as a string means multer will take care of creating it
      destination: 'uploads/' + campaignId + '/',
      filename: (req, file, callback) => {
        callback(null, imageId + '.jpg');
      }
    });

    const multerSingle = multer({ storage }).single('imageFile');

    return new Promise((resolve, reject) => {
      multerSingle(request, undefined, async error => {
        if (error) {
          reject(error);
        }

        resolve(image);
      });
    });
  }

  /**
   * Generates the next unique identifier for images
   */
  getNextImageId() {
    // TODO: real method once connected to DB
    return Math.floor(Math.random() * 1000000000);
  }
}
