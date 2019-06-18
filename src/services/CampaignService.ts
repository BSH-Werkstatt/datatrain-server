import { Campaign } from '../models/campaign';
import { ImageData } from '../models/image';
import { Annotation, AnnotationCreationRequest } from '../models/annotation';

// TODO: Implement with abstract Data and choose type of data depending on Campaign, not directly with Image
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UserService } from './UserService';
import { CampaignConnector } from '../db/CampaignConnector';

export class CampaignService {
  /**
   * Returns the Campaign with the given identifier, if it does not exist, an error will be raised
   * @param id Identifier of the campaign
   */
  get(id: string): Promise<Campaign> {
    const promise = new Promise<Campaign>((resolve, reject) => {
      const db = CampaignConnector.getInstance();
      db.get(id).then(result => {
        if (!result) {
          reject(new Error('Could not get campaign with id: ' + id));
        } else {
          resolve(result);
        }
      });
    });

    return promise;
  }

  /**
   * Returns all campaigns as an array of Campaign objects
   */
  getAll(): Promise<Campaign[]> {
    const promise = new Promise<Campaign[]>((resolve, reject) => {
      const db = CampaignConnector.getInstance();
      db.getAll().then(result => {
        if (!result) {
          reject(new Error('Could not get campaigns'));
        } else {
          resolve(result);
        }
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
    const imageId = this.getNextImageId();

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

    return new Promise((resolve, reject) => {
      multerSingle(request, undefined, async error => {
        if (error) {
          reject(error);
        }

        const image: ImageData = {
          id: imageId,
          campaignId,
          userId: '1',
          annotations: []
        };

        resolve(image);
      });
    });
  }

  /**
   * Generates the next unique identifier for images
   */
  getNextImageId() {
    // TODO: real method once connected to DB
    return '' + Math.floor(Math.random() * 1000000000);
  }

  /**
   * Returns a random Image from all images of the Campaign with the identifier campaignId
   * This method does _not_ return the image file, but only an object conforming to the Image interface
   * @param campaignId Identifier of the Campaign from which an image is to be selected
   */
  getRandomImage(campaignId: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const images = this.getImagesOfCampaign(campaignId);

      if (images.length === 0) {
        reject(new Error('The Campaign with id ' + campaignId + ' does not have any images or does not exist.'));
      }

      let index = Math.floor(Math.random() * images.length);
      if (index >= images.length) {
        index = images.length - 1;
      }

      const chosenPath = images[index];

      const image: ImageData = {
        id: path.basename(chosenPath, path.extname(chosenPath)),
        campaignId,
        userId: '1',
        annotations: []
      };

      // TODO: store in database

      resolve(image);
    });
  }

  /**
   * Returns the paths of the images belonging to a campaign with the identifier campaignId
   * @param campaignId Identifier of the Campaign to get the image paths of
   */
  getImagesOfCampaign(campaignId: string): string[] {
    // TODO: replace with asynchronous functions!

    const campaignPath = __dirname + '/../uploads/' + campaignId;

    if (fs.existsSync(campaignPath)) {
      const files = fs.readdirSync(campaignPath);

      return files;
    } else {
      return [];
    }
  }

  /**
   * Saves the uploaded annotation to the database
   * Returns a Promise with an Annotation response describing uploaded the annotation or an error
   * @param campaignId Identifier of the campaign to which the annotation belongs to
   * @param imageId Identifier of the image to which the annotation belongs to
   * @param request Express request with the rest of the form data (user etc.)
   */
  uploadAnnotation(campaignId: string, imageId: string, request: AnnotationCreationRequest): Promise<Annotation> {
    return new Promise((resolve, reject) => {
      const userId = UserService.getUserIdFromToken(request.userToken);

      const annotation: Annotation = {
        id: 'dummyid',
        points: request.points,
        userId,
        type: request.type,
        label: request.label,
        campaignId,
        imageId
      };

      // TODO: transform for database and store with image

      resolve(annotation);
    });
  }

  /**
   * Generates the next unique identifier for annotations
   */
  getNextAnnotationId() {
    // TODO: real method once connected to DB
    return Math.floor(Math.random() * 1000000000);
  }
}
