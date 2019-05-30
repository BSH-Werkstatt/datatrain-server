import { Annotation } from './annotation';

export interface ImageData {
  id: number;
  campaignId: number;
  userId: number;
  annotations: Annotation[];
}
