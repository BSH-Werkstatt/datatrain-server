import { Get, Route, Post, Controller, Request, Body, Put } from 'tsoa';
import express from 'express';
import { TrainingService } from '../services/TrainingService';
import { Training, TrainingCreationRequest, TrainingUpdateRequest } from '../models/training';

@Route('train')
export class TrainingController extends Controller {
  @Get('active/{campaignId}')
  public async getActive(campaignId: string): Promise<Training> {
    return await new TrainingService().getActive(campaignId);
  }

  @Post('{campaignId}')
  public async postActive(campaignId: string, @Body() request: TrainingCreationRequest) {
    console.log('thing1');
    return await new TrainingService().create(campaignId, request);
  }

  @Put('active/{campaignId}')
  public async putActive(campaignId: string, @Body() request: TrainingUpdateRequest) {
    return await new TrainingService().updateActive(campaignId, request);
  }
}
