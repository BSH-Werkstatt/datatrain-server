import { Get, Route, Post, Controller, Request, Body } from 'tsoa';
import express from 'express';

import { ImageData } from '../models/data';
import { Campaign } from '../models/campaign';
import { CampaignService } from '../services/CampaignService';
import { AnnotationCreationRequest, Annotation } from '../models/annotation';
import { Leaderboard } from '../models/leaderboard';
import { CampaignConnector } from '../db/CampaignConnector';
import { PredictionResult } from '../models/prediction';
import { Initializer } from '../db/Initializer';

@Route('campaigns')
export class CampaignsController extends Controller {
  @Get('initialize')
  public async initialize(): Promise<boolean> {
    console.log('Initialization triggered.');

    return new Promise<boolean>((resolve, reject) => {
      try {
        Initializer.init();
        resolve(true);
      } catch (e) {
        resolve(false);
      }
    });
  }

  @Get('{campaignId}')
  public async getCampaign(campaignId: string): Promise<Campaign> {
    return await new CampaignService().get(campaignId);
  }

  @Get('byURLName/{campaignName}')
  public async getCampaignByURLName(campaignName: string): Promise<Campaign> {
    return await new CampaignService().getByURLName(campaignName);
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
  public async requestPrediction(campaignId: string, @Request() request: express.Request): Promise<PredictionResult> {
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
  ): Promise<Annotation[]> {
    return await new CampaignService().uploadAnnotations(campaignId, imageId, request);
  }

  @Get('{campaignId}/leaderboard')
  public async getLeaderboard(campaignId: string): Promise<Leaderboard> {
    return await new CampaignService().getLeaderboard(campaignId);
  }
}
