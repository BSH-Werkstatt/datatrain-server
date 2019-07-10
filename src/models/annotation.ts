import { ImageConnector } from '../db/ImageConnector';
import dateFormat from 'dateformat';

export class Annotation {
  id: string;
  points: Point[];
  type: string;
  label: string;
  userId: string;
  campaignId: string;
  imageId: string;
  timestamp: string;

  constructor(
    id: string,
    points: Point[],
    type: string,
    label: string,
    userId: string,
    campaignId: string,
    imageId: string,
    timestamp: string
  ) {
    this.id = id;
    this.points = points;
    this.type = type;
    this.label = label;
    this.userId = userId;
    this.campaignId = campaignId;
    this.imageId = imageId;
    this.timestamp = timestamp;
  }

  static fromObject(object: any): Annotation {
    return new Annotation(
      object.id,
      object.points,
      object.type,
      object.label,
      object.userId,
      object.campaignId,
      object.imageId,
      object.timestamp ? object.timestamp : dateFormat(new Date(), 'isoDateTime')
    );
  }

  static saveMany(imageId: string, annotations: Annotation[], callback: any) {
    ImageConnector.getInstance((connector: ImageConnector) => {
      connector.saveAnnotations(imageId, annotations).then(res => {
        connector.connection.close();

        callback(annotations);
      });
    });
  }

  save(callback: any) {
    ImageConnector.getInstance((connector: ImageConnector) => {
      connector.saveAnnotation(this).then(res => {
        connector.connection.close();

        callback(this);
      });
    });
  }
}

export interface AnnotationCreationRequest {
  items: AnnotationCreationRequestItem[];
  userToken: string;
}

export interface AnnotationCreationRequestItem {
  points: Point[];
  type: string;
  label: string;
}

export interface Point {
  x: number;
  y: number;
}
