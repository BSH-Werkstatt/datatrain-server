import { DatabaseConnector } from './DatabaseConnector';
import { ImageData } from '../models/data';
import { ObjectID } from 'mongodb';
import { Annotation } from '../models/annotation';

export class ImageConnector extends DatabaseConnector {
  collection = 'images';

  /**
   * gets an instance of DatabaseConnector initialized with the correct credentials
   */
  static getInstance(callback: any) {
    // TODO: store in environmental variables
    const db = new ImageConnector('database_dev', 'datatrain', 'datatrain', 'init12345');
    db.connect()
      .then(res => {
        callback(db);
        db.connection.close();
      })
      .catch(err => {
        console.error('An error occured while connecting to the database: ', err);
      });
  }

  /**
   * Returns the campaign with the identifier id
   * @param id campaign identifier
   */
  get(id: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      this.findOne(this.collection, { _id: ObjectID.createFromHexString(id) })
        .then(result => {
          if (result) {
            resolve(ImageData.fromObject(result));
          } else {
            resolve(null);
          }
        })
        .catch(err => {
          console.error('Error while getting the image with id ' + id, err);
        });
    });
  }

  getAllOfCampaign(campaignId: string): Promise<ImageData[]> {
    return new Promise((resolve, reject) => {
      this.find(this.collection, { campaignId })
        .then(result => {
          const images: ImageData[] = [];
          result.forEach(e => {
            images.push(ImageData.fromObject(e));
          });

          resolve(images);
        })
        .catch(err => {
          console.error('Error while getting the image with campaignId ' + campaignId, err);
        });
    });
  }

  /**
   * inserts or updated documents depending if id exists
   * @param image ImageData object
   */
  save(image: ImageData): Promise<any> {
    const self = {
      campaignId: image.campaignId,
      userId: image.userId,
      annotations: image.annotations
    };

    if (image.id) {
      return this.updateDocument(this.collection, { _id: ObjectID.createFromHexString(image.id) }, self);
    } else {
      return this.insertOne(this.collection, self);
    }
  }

  /**
   * Saves the passed annotation under the image with the identifier annotation.imageId
   * @param annotation annotation to be saved with imageId field
   */
  saveAnnotation(annotation: Annotation): Promise<any> {
    return this.updateDocument(
      this.collection,
      { _id: ObjectID.createFromHexString(annotation.imageId) },
      { $push: { annotations: annotation } }
    );
  }
}
