export interface Annotation {
  /**
   * @isInt id
   */
  id: number;
  points: Point[];
  type: string;
  label: string;
  /**
   * @isInt userId
   */
  userId: number;
  /**
   * @isInt campaignId
   */
  campaignId: number;
  /**
   * @isInt imageId
   */
  imageId: number;
}

export interface AnnotationCreationRequest {
  points: Point[];
  type: string;
  label: string;
  /**
   * @isInt userId
   */
  userId: number;
}

export interface Point {
  x: number;
  y: number;
}
