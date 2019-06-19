import { Campaign } from '../models/campaign';
import { ImageData } from '../models/data';
import { Annotation, AnnotationCreationRequest } from '../models/annotation';

// TODO: Implement with abstract Data and choose type of data depending on Campaign, not directly with Image
import express from 'express';
import multer from 'multer';
import path from 'path';
import { UserService } from './UserService';
import { CampaignConnector } from '../db/CampaignConnector';
import { ImageConnector } from '../db/ImageConnector';

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
  uploadAnnotation(campaignId: string, imageId: string, request: AnnotationCreationRequest): Promise<Annotation> {
    return new Promise((resolve, reject) => {
      const userId = UserService.getUserIdFromToken(request.userToken);

      const annotation = new Annotation(
        this.getAnnotationId(),
        request.points,
        userId,
        request.type,
        request.label,
        campaignId,
        imageId
      );

      annotation.save((res: any) => {
        resolve(res);
      });

      reject('Could not save annotation');
    });
  }

  getAllImages(campaignId: string): ImageData[] {
    return [];
  }
}
