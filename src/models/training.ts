import { stringify } from 'querystring';

export interface Training {
  id: string;
  campaignId: string;
  timeStart: string;
  currentEpoch: number;
  epochs: number;
  currentStep: number;
  steps: number;
  metrics: string[];
  finished: boolean;
}

export interface TrainingUpdateRequest {
  currentEpoch: number;
  currentStep: number;
  finished: boolean;
  metric: string;
}

export interface TrainingCreationRequest {
  userToken: string;
  training: Training;
}
