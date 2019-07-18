import { Get, Route, Post, Controller, Request, Body, Put } from 'tsoa';
import express from 'express';
import { TrainingService } from '../services/TrainingService';
import { Training, TrainingCreationRequest, TrainingUpdateRequest } from '../models/training';
import { CampaignConnector } from '../db/CampaignConnector';

@Route('train')
export class TrainingController extends Controller {
  @Get('active/{campaignId}')
  public async getActiveTraining(campaignId: string): Promise<Training> {
    return await new TrainingService().getActive(campaignId);
  }

  @Post('{campaignId}')
  public async postTraining(campaignId: string, @Body() request: TrainingCreationRequest) {
    return await new TrainingService().create(campaignId, request);
  }

  @Put('active/{campaignId}')
  public async putActiveTraining(campaignId: string, @Body() request: TrainingUpdateRequest) {
    return await new TrainingService().updateActive(campaignId, request);
  }
}
