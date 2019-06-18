import { Get, Route, Post, Controller, Request, Body } from 'tsoa';
import express from 'express';

import { ImageData } from '../models/image';
import { Campaign } from '../models/campaign';
import { CampaignService } from '../services/CampaignService';
import { AnnotationCreationRequest, Annotation } from '../models/annotation';
import '../db/DatabaseConnector';

@Route('campaigns')
export class CampaignsController extends Controller {
  /**
   * @isInt campaignId
   */
  @Get('{campaignId}')
  public async getCampaign(campaignId: string): Promise<Campaign> {
    return await new CampaignService().get(campaignId);
  }

  @Get('')
  public async getAllCampaigns(): Promise<Campaign[]> {
    return await new CampaignService().getAll();
  }

  /**
   * @isInt campaignId
   * see tsoa.json for detailed explanation of request
   */
  @Post('{campaignId}/images')
  public async postImage(campaignId: string, @Request() request: express.Request): Promise<ImageData> {
    return await new CampaignService().uploadImage(campaignId, request);
  }

  /**
   * @isInt campaignId
   */
  @Get('{campaignId}/images/random')
  public async getRandomImage(campaignId: string): Promise<ImageData> {
    return await new CampaignService().getRandomImage(campaignId);
  }

  /**
   * @isInt campaignId
   * @isInt imageId
   */
  @Post('{campaignId}/images/{imageId}/annotations')
  public async postImageAnnotation(
    campaignId: string,
    imageId: string,
    @Body() request: AnnotationCreationRequest
  ): Promise<Annotation> {
    return await new CampaignService().uploadAnnotation(campaignId, imageId, request);
  }
}
