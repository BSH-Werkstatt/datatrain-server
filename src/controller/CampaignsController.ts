import { Get, Route, Post, Controller, Request, Body } from 'tsoa';
import express from 'express';

import { ImageData } from '../models/data';
import { Campaign } from '../models/campaign';
import { CampaignService } from '../services/CampaignService';
import { AnnotationCreationRequest, Annotation } from '../models/annotation';
import { Leaderboard } from '../models/leaderboard';

@Route('campaigns')
export class CampaignsController extends Controller {
  @Get('{campaignId}')
  public async getCampaign(campaignId: string): Promise<Campaign> {
    return await new CampaignService().get(campaignId);
  }

  @Get('')
  public async getAllCampaigns(): Promise<Campaign[]> {
    return await new CampaignService().getAll();
  }

  @Post('{campaignId}/images')
  public async postImage(campaignId: string, @Request() request: express.Request): Promise<ImageData> {
    return await new CampaignService().uploadImage(campaignId, request);
  }

  @Post('{campaignId}/predictions')
  public async requestPrediction(campaignId: string, @Request() request: express.Request): Promise<any> {
    return await new CampaignService().requestPrediction(campaignId, request);
  }

  @Get('{campaignId}/images')
  public async getAllImages(campaignId: string): Promise<ImageData[]> {
    return await new CampaignService().getAllImagesOfCampaign(campaignId);
  }

  @Get('{campaignId}/images/random')
  public async getRandomImage(campaignId: string): Promise<ImageData> {
    return await new CampaignService().getRandomImage(campaignId);
  }

  @Post('{campaignId}/images/{imageId}/annotations')
  public async postImageAnnotation(
    campaignId: string,
    imageId: string,
    @Body() request: AnnotationCreationRequest
  ): Promise<Annotation> {
    return await new CampaignService().uploadAnnotations(campaignId, imageId, request);
  }

  @Get('{campaignId}/leaderboard')
  public async getLeaderboard(campaignId: string): Promise<Leaderboard> {
    return await new CampaignService().getLeaderboard(campaignId);
  }
}
