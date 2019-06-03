import { Get, Route, Post, Controller, Request, Body } from 'tsoa';
import express from 'express';

import { ImageData } from '../models/image';
import { Campaign } from '../models/campaign';
import { CampaignService } from '../services/CampaignService';
import { AnnotationCreationRequest, Annotation } from '../models/annotation';

@Route('campaigns')
export class CampaignsController extends Controller {
  /**
   * @isInt campaignId
   */
  @Get('{campaignId}')
  public async getCampaign(campaignId: number): Promise<Campaign> {
    return await new CampaignService().get(campaignId);
  }

  @Get('')
  public async getAllCampaigns(): Promise<Campaign[]> {
    return await new CampaignService().getAll();
  }

  /**
   * @isInt campaignId
   */
  @Post('{campaignId}/images')
  public async postImage(campaignId: number, @Request() request: express.Request): Promise<ImageData> {
    return await new CampaignService().uploadImage(campaignId, request);
  }

  /**
   * @isInt campaignId
   */
  @Get('{campaignId}/images/random')
  public async getRandomImage(campaignId: number): Promise<ImageData> {
    return await new CampaignService().getRandomImage(campaignId);
  }

  /**
   * @isInt campaignId
   * @isInt imageId
   */
  @Post('{campaignId}/images/{imageId}/annotations')
  public async postImageAnnotation(
    campaignId: number,
    imageId: number,
    @Body() request: AnnotationCreationRequest
  ): Promise<Annotation> {
    return await new CampaignService().uploadAnnotation(campaignId, imageId, request);
  }
}
