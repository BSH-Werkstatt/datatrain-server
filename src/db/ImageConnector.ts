import { DatabaseConnector } from './DatabaseConnector';
import { ImageData } from '../models/data';
import { ObjectID } from 'mongodb';
import { Annotation } from '../models/annotation';
import { DBConfig } from './dbconfig';

export class ImageConnector extends DatabaseConnector {
  collection = 'images';

  /**
   * gets an instance of DatabaseConnector initialized with the correct credentials
   */
  static getInstance(callback: any) {
    // TODO: store in environmental variables
    try {
      const db = new ImageConnector(DBConfig.host, DBConfig.database, DBConfig.user, DBConfig.password);
      db.connect()
        .then(res => {
          callback(db);
          // db.connection.close();
        })
        .catch(err => {
          console.error('An error occured while connecting to the database: ', err);
        });
    } catch (e) {
      console.error("Error while connecting, maybe database hasn't been started yet?", e);
    }
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
    return new Promise<object>((resolve, reject) => {
      const col = this.db.collection(this.collection);

      col.updateOne(
        { _id: ObjectID.createFromHexString(annotation.imageId) },
        { $push: { annotations: annotation } },
        (err: any, result: any) => {
          if (err) {
            reject(err);
          }

          resolve(result);
        }
      );
    });
  }

  saveAnnotations(imageId: string, annotations: Annotation[]) {
    return new Promise<object>((resolve, reject) => {
      const col = this.db.collection(this.collection);

      col.updateOne(
        { _id: ObjectID.createFromHexString(imageId) },
        { $push: { annotations: { $each: annotations } } },
        (err: any, result: any) => {
          if (err) {
            reject(err);
          }

          resolve(result);
        }
      );
    });
  }
}
