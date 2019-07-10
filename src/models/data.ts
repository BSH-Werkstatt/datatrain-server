import { Annotation } from './annotation';
import { ImageConnector } from '../db/ImageConnector';
import { ObjectID } from 'mongodb';
import dateFormat from 'dateformat';

abstract class Data {
  id: string;
  campaignId: string;
  userId: string;
  annotations: Annotation[];
  timestamp?: string;

  constructor(id: string, campaignId: string, userId: string, annotations: Annotation[], timestamp?: string) {
    this.id = id;
    this.campaignId = campaignId;
    this.userId = userId;
    this.annotations = annotations;
    this.timestamp = timestamp ? timestamp : dateFormat(new Date(), 'isoDateTime');
  }
}

export class ImageData extends Data {
  url: string;

  constructor(
    id: string,
    campaignId: string,
    userId: string,
    annotations: Annotation[],
    url: string,
    timestamp: string
  ) {
    super(id, campaignId, userId, annotations, timestamp);
    this.url = url;
  }

  static fromObject(object: any): ImageData {
    return new ImageData(
      object._id ? object._id.toString() : object.id,
      object.campaignId,
      object.userId,
      object.annotations,
      object.url,
      object.timestamp ? object.timestamp : dateFormat(new Date(), 'isoDateTime')
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
