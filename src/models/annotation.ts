export class Annotation {
  id: string;
  points: Point[];
  type: string;
  label: string;
  /**
   * @isInt userId
   */
  userId: string;
  /**
   * @isInt campaignId
   */
  campaignId: string;
  /**
   * @isInt imageId
   */
  imageId: string;
}

export interface AnnotationCreationRequest {
  points: Point[];
  type: string;
  label: string;
  /**
   * @isInt userId
   */
  userToken: string;
}

export interface Point {
  x: number;
  y: number;
}
