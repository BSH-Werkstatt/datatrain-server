import { Get, Route, Post, Controller, Request, Body, Put, Security, Response, SuccessResponse } from 'tsoa';
import express from 'express';
import { TrainingService } from '../services/TrainingService';
import { Training, TrainingCreationRequest, TrainingUpdateRequest } from '../models/training';
import { CampaignConnector } from '../db/CampaignConnector';

@Route('train')
export class TrainingController extends Controller {
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Get('active/{campaignId}')
  public async getActiveTraining(campaignId: string): Promise<Training> {
    return await new TrainingService().getActive(campaignId);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Post('{campaignId}')
  public async postTraining(campaignId: string, @Body() request: TrainingCreationRequest) {
    return await new TrainingService().create(campaignId, request);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Put('active/{campaignId}')
  public async putActiveTraining(campaignId: string, @Body() request: TrainingUpdateRequest) {
    return await new TrainingService().updateActive(campaignId, request);
  }
}
