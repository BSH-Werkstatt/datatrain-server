import { ImageConnector } from '../db/ImageConnector';

export class Annotation {
  id: string;
  points: Point[];
  type: string;
  label: string;
  userId: string;
  campaignId: string;
  imageId: string;

  constructor(
    id: string,
    points: Point[],
    type: string,
    label: string,
    userId: string,
    campaignId: string,
    imageId: string
  ) {
    this.id = id;
    this.points = points;
    this.type = type;
    this.label = label;
    this.userId = userId;
    this.campaignId = campaignId;
    this.imageId = imageId;
  }

  static fromObject(object: any): Annotation {
    return new Annotation(
      object.id,
      object.points,
      object.type,
      object.label,
      object.userId,
      object.campaignId,
      object.imageId
    );
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
  points: Point[];
  type: string;
  label: string;
  userToken: string;
}

export interface Point {
  x: number;
  y: number;
}
