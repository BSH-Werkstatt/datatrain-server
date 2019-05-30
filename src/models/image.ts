import { Annotation } from './annotation';

export interface Image {
  id: number;
  campaignId: number;
  userId: number;
  annotations: Annotation[];
}
