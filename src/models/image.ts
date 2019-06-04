import { Annotation } from './annotation';

export interface ImageData {
  /**
   * @isInt id
   */
  id: number;
  /**
   * @isInt campaignId
   */
  campaignId: number;
  /**
   * @isInt userId
   */
  userId: number;
  annotations: Annotation[];
}
