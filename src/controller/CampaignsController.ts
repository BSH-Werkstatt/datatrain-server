import { Get, Route, Post, Controller, Response, SuccessResponse, Request } from 'tsoa';
import express from 'express';

import { ImageData } from '../models/image';
import { Campaign } from '../models/campaign';
import { CampaignService } from '../services/CampaignService';

@Route('campaigns')
export class CampaignsController extends Controller {
  @Get('{id}')
  public async getCampaign(id: number): Promise<Campaign> {
    return await new CampaignService().get(id);
  }

  @Get('')
  public async getAllCampaigns(): Promise<Campaign[]> {
    return await new CampaignService().getAll();
  }

  @Post('{id}/images')
  public async postImage(id: number, @Request() request: express.Request): Promise<ImageData> {
    return await new CampaignService().uploadImage(id, request);
  }

  @Get('{campaignId}/images/random')
  public async getRandomImage(campaignId: number): Promise<ImageData> {
    return await new CampaignService().getRandomImage(campaignId);
  }
}
