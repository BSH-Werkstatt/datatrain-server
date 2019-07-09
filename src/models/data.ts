import { Annotation } from './annotation';
import { ImageConnector } from '../db/ImageConnector';
import { ObjectID } from 'mongodb';

abstract class Data {
  id: string;
  campaignId: string;
  userId: string;
  url: string;
  annotations: Annotation[];

  constructor(id: string, campaignId: string, userId: string, annotations: Annotation[], url: string) {
    this.id = id;
    this.campaignId = campaignId;
    this.userId = userId;
    this.annotations = annotations;
    this.url = url;
  }
}

export class ImageData extends Data {
  static fromObject(object: any): ImageData {
    return new ImageData(
      object._id ? object._id.toString() : object.id,
      object.campaignId,
      object.userId,
      object.annotations,
      object.url
    );
  }

  save(callback: any) {
    ImageConnector.getInstance((connector: ImageConnector) => {
      connector.save(this).then(res => {
        if (!this.id) {
          this.id = res.insertedId.toString();
        }
        connector.connection.close();

        callback(this);
      });
    });
  }
}
