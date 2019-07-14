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
  modelFile: string;
}

export interface TrainingUpdateRequest {
  userToken: string;
  currentEpoch: number;
  currentStep: number;
  finished: boolean;
  metric: string;
}

export interface TrainingCreationRequest {
  userToken: string;
  training: Training;
}
