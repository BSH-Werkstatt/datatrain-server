import { Get, Route, Post, Put, Controller, Request, Body, SuccessResponse, Response, Security } from 'tsoa';
import express from 'express';

import { ImageData } from '../models/data';
import { Campaign, CampaignCreationRequest, CampaignUpdateRequest } from '../models/campaign';
import { CampaignService } from '../services/CampaignService';
import { AnnotationCreationRequest, Annotation } from '../models/annotation';
import { Leaderboard, LeaderboardCreationRequest, LeaderboardUpdateRequest } from '../models/leaderboard';
import { PredictionResult } from '../models/prediction';
import { Initializer } from '../db/Initializer';

@Route('campaigns')
export class CampaignsController extends Controller {
  // @Security('jwt', ['user'])
  // @Response('401', 'Unathorized')
  // @SuccessResponse('200', 'OK') @TODO: remove s
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
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Get('{campaignId}')
  public async getCampaign(campaignId: string): Promise<Campaign> {
    return await new CampaignService().get(campaignId);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Post('')
  public async postCampaign(@Body() request: CampaignCreationRequest): Promise<Campaign> {
    return await new CampaignService().post(request);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Put('{campaignId}')
  public async putCampaign(campaignId: string, @Body() request: CampaignUpdateRequest): Promise<Campaign> {
    return await new CampaignService().put(campaignId, request);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Get('byURLName/{campaignName}')
  public async getCampaignByURLName(campaignName: string): Promise<Campaign> {
    return await new CampaignService().getByURLName(campaignName);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Get('')
  public async getAllCampaigns(): Promise<Campaign[]> {
    return await new CampaignService().getAll();
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Post('{campaignId}/images')
  public async postImage(campaignId: string, @Request() request: express.Request): Promise<ImageData> {
    return await new CampaignService().uploadImage(campaignId, request);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Post('{campaignId}/predictions')
  public async requestPrediction(campaignId: string, @Request() request: express.Request): Promise<PredictionResult> {
    return await new CampaignService().requestPrediction(campaignId, request);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Get('{campaignId}/images')
  public async getAllImages(campaignId: string): Promise<ImageData[]> {
    return await new CampaignService().getAllImagesOfCampaign(campaignId);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Get('{campaignId}/images/random')
  public async getRandomImage(campaignId: string): Promise<ImageData> {
    return await new CampaignService().getRandomImage(campaignId);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Post('{campaignId}/images/{imageId}/annotations')
  public async postImageAnnotation(
    campaignId: string,
    imageId: string,
    @Body() request: AnnotationCreationRequest
  ): Promise<Annotation[]> {
    return await new CampaignService().uploadAnnotations(campaignId, imageId, request);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Get('{campaignId}/leaderboard')
  public async getLeaderboard(campaignId: string): Promise<Leaderboard> {
    return await new CampaignService().getLeaderboard(campaignId);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Post('{campaignId}/leaderboard')
  public async postLeaderboard(campaignId: string, @Body() request: LeaderboardCreationRequest): Promise<Leaderboard> {
    return await new CampaignService().postLeaderboard(campaignId, request);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Put('{campaignId}/leaderboard')
  public async putLeaderboard(campaignId: string, @Body() request: LeaderboardUpdateRequest): Promise<Leaderboard> {
    return await new CampaignService().putLeaderboard(campaignId, request);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Post('{campaignId}/campaignImage')
  public async postCampaignImage(campaignId: string, @Request() request: express.Request): Promise<string> {
    return await new CampaignService().uploadCampaignImage(campaignId, request);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Get('{campaignId}/campaignImage')
  public async getCampaignImage(campaignId: string): Promise<string> {
    return await new CampaignService().getCampaignImage(campaignId);
  }
}
