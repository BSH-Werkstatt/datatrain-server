import { Campaign, CampaignType } from '../models/campaign';
import { ImageData } from '../models/image';
import { Annotation, AnnotationCreationRequest } from '../models/annotation';

// TODO: Implement with abstract Data and choose type of data depending on Campaign, not directly with Image
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const campaignDummy: Campaign[] = [
  {
    ownerId: 1,
    id: 1,
    type: CampaignType.ImageAnnotationCampaign,
    name: 'Banana Campaign',
    description:
      'The campaign is all about bananas!\n\nWe need as much bananas as we can. Please upload every banana you see.\n\nThere are \
about 110 different species of banana. In popular culture and commerce, "banana" usually refers to the soft and sweet kind, \
also known as dessert bananas. Other kinds, or cultivars, of banana have a firmer, starchier fruit. Those are usually called \
plantains. Plantains are mostly used for cooking or fibre.',
    vocabulary: ['Banana', 'Not Banana'],
    image: 'https://www.organicfacts.net/wp-content/uploads/banana.jpg'
  },
  {
    ownerId: 2,
    id: 2,
    type: CampaignType.ImageAnnotationCampaign,
    name: 'Dishwasher Campaign',
    description:
      'When something is made with the utmost care, it shows. At Bosch, the same thoughtful attention to detail begins in our \
factories where we test, inspect and perfect every last detail of our dishwashers.',
    vocabulary: ['Plate', 'Fork', 'Mug', 'Bowl'],
    image: 'https://media3.bosch-home.com/Images/600x/MCIM02055360_Bosch-service-Dishwasher-Support_1600x.jpg'
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
  uploadImage(campaignId: number, request: express.Request): Promise<ImageData> {
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
          userId: 1,
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
    return Math.floor(Math.random() * 1000000000);
  }

  /**
   * Returns a random Image from all images of the Campaign with the identifier campaignId
   * This method does _not_ return the image file, but only an object conforming to the Image interface
   * @param campaignId Identifier of the Campaign from which an image is to be selected
   */
  getRandomImage(campaignId: number): Promise<ImageData> {
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
        id: parseInt(path.basename(chosenPath, path.extname(chosenPath)), 10),
        campaignId,
        userId: 1,
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
  getImagesOfCampaign(campaignId: number): string[] {
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
  uploadAnnotation(campaignId: number, imageId: number, request: AnnotationCreationRequest): Promise<Annotation> {
    return new Promise((resolve, reject) => {
      const annotation: Annotation = {
        id: this.getNextAnnotationId(),
        points: request.points,
        userId: request.userId,
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
