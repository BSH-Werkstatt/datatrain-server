import { Get, Route, Post, Put, Controller, Request, Body, SuccessResponse, Response, Security } from 'tsoa';
import express from 'express';

import { ImageData } from '../models/data';
import { Campaign, CampaignCreationRequest, CampaignUpdateRequest, CampaignType } from '../models/campaign';
import { CampaignService } from '../services/CampaignService';
import { AnnotationCreationRequest, Annotation } from '../models/annotation';
import { Leaderboard, LeaderboardCreationRequest, LeaderboardUpdateRequest } from '../models/leaderboard';
import { PredictionResult } from '../models/prediction';
import { Initializer } from '../db/Initializer';
import { UserService } from '../services/UserService';
import { Helper } from '../helper';
import { isJsxFragment } from 'typescript';
import { createSocket } from 'dgram';
import { CodeStarNotifications } from 'aws-sdk';

@Route('campaigns')
export class CampaignsController extends Controller {
  // @Security('jwt', ['user'])
  // @Response('401', 'Unathorized')
  // @SuccessResponse('200', 'OK') @TODO: remove comments when done
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
  public async getCampaign(campaignId: string, @Request() request: express.Request): Promise<Campaign> {
    const user: any = request.user;
    const campaign: any = await new CampaignService().get(campaignId);
    const role: any = await UserService.getUserAssociatedRole(user.email);
    console.log(role);
    if (role.role === 'ADMIN') {
      return campaign;
    } else if (role.role === 'CAMPAIGN_MANAGER' || role.role === 'ANNOTATOR') {
      // chekck he is able to view or now
      const validGroups: string[] = campaign.groups.filter((grp: string) => user.group.includes(grp));
      if (user.id === campaign.ownerId || validGroups.length > 0) {
        return campaign;
      } else {
        return await new Campaign(
          'UNAUTHORIZE',
          'UNAUTHORIZE',
          campaign.type,
          'UNAUTHORIZE',
          'UNAUTHORIZE',
          'UNAUTHORIZE',
          ['UNAUTHORIZE'],
          'UNAUTHORIZE'
        );
      }
    } else {
      return await new Campaign(
        'UNAUTHORIZE',
        'UNAUTHORIZE',
        campaign.type,
        'UNAUTHORIZE',
        'UNAUTHORIZE',
        'UNAUTHORIZE',
        ['UNAUTHORIZE'],
        'UNAUTHORIZE'
      );
    }
  }
  @Post('')
  public async postCampaign(@Body() request: any, @Request() req: express.Request): Promise<Campaign> {
    // only admin can create a campaign
    const user: any = req.user;
    console.log(user);
    const role: any = await UserService.getUserAssociatedRole(user.email);
    // get the id of user from username
    console.log(role);
    const ownerId = await UserService.getUserIdFromUserEmail(request.ownerEmail);
    const postData: CampaignCreationRequest = await Campaign.fromObject(request);
    postData.ownerId = ownerId;
    if (role.role === 'ADMIN') {
      return await new CampaignService().post(postData);
    } else {
      return new Campaign(
        'UNAUTHORIZE',
        'UNAUTHORIZE',
        0,
        'UNAUTHORIZE',
        'UNAUTHORIZE',
        'UNAUTHORIZE',
        ['UNAUTHORIZE'],
        'UNAUTHORIZE'
      );
    }
  }
  @Put('{cId}')
  public async putCampaign(cId: string, @Body() r: any, @Request() re: express.Request): Promise<Campaign> {
    try {
      console.log(re.user);
      const user: any = re.user;
      // get role
      const role = await UserService.getUserAssociatedRole(user.email);
      // get campaign
      const campaign = await new CampaignService().get(cId);
      const updatedReq = await Campaign.fromObject(r);
      // for (const key in updatedReq) {
      //   if (updatedReq.hasOwnProperty(key)) {
      //     const element = updatedReq[key];

      //   }
      // }
      if (role.role === 'ADMIN' || campaign.ownerId === user.id) {
        return await new CampaignService().put(cId, r);
      } else {
        return new Campaign(
          'UNAUTHORIZE',
          'UNAUTHORIZE',
          0,
          'UNAUTHORIZE',
          'UNAUTHORIZE',
          'UNAUTHORIZE',
          ['UNAUTHORIZE'],
          'UNAUTHORIZE'
        );
      }
    } catch (error) {
      console.log(error);
      return new Campaign(
        'UNAUTHORIZE',
        'UNAUTHORIZE',
        0,
        'UNAUTHORIZE',
        'UNAUTHORIZE',
        'UNAUTHORIZE',
        ['UNAUTHORIZE'],
        'UNAUTHORIZE'
      );
    }
  }
  @Get('byURLName/{campaignName}')
  public async getCampaignByURLName(campaignName: string, @Request() request: express.Request): Promise<Campaign> {
    try {
      const user: any = request.user;
      const campaign: any = await new CampaignService().getByURLName(campaignName);
      const role: any = await UserService.getUserAssociatedRole(user.email);
      if (role.role === 'ADMIN') {
        return campaign;
      } else if (role.role === 'CAMPAIGN_MANAGER' || role.role === 'ANNOTATOR') {
        // chekck he is able to view or now
        const validGroups: string[] = campaign.groups.filter((grp: string) => user.group.includes(grp));
        if (user.id === campaign.ownerId || validGroups.length > 0) {
          return campaign;
        } else {
          // tslint:disable-next-line:max-line-length
          return await new Campaign(
            'UNAUTHORIZE',
            'UNAUTHORIZE',
            campaign.type,
            'UNAUTHORIZE',
            'UNAUTHORIZE',
            'UNAUTHORIZE',
            ['UNAUTHORIZE'],
            'UNAUTHORIZE'
          );
        }
      } else {
        return await new Campaign(
          'UNAUTHORIZE',
          'UNAUTHORIZE',
          campaign.type,
          'UNAUTHORIZE',
          'UNAUTHORIZE',
          'UNAUTHORIZE',
          ['UNAUTHORIZE'],
          'UNAUTHORIZE'
        );
      }
    } catch (error) {
      return await new Campaign(
        'INTERNAL_SERVER_ERROR_500',
        'INTERNAL_SERVER_ERROR_500',
        0,
        'INTERNAL_SERVER_ERROR_500',
        'INTERNAL_SERVER_ERROR_500',
        'INTERNAL_SERVER_ERROR_500',
        ['INTERNAL_SERVER_ERROR_500'],
        'INTERNAL_SERVER_ERROR_500'
      );
    }
  }
  @Get('')
  public async getAllCampaigns(@Request() req: express.Request): Promise<Campaign[]> {
    const user: any = req.user;
    let role: any = await UserService.getUserAssociatedRole(user.email);
    role = role.role;
    const allCampaigns: Campaign[] = await new CampaignService().getAll();
    if (role === 'ADMIN') {
      return allCampaigns;
    } else {
      // show all campaign that is visible to annotator or admin
      // filter allCampaign based of user groups
      const filteredCampaign: Campaign[] = [];
      allCampaigns.forEach((element, idx) => {
        if (Helper.isCommonElement(element.groups, user.group)) {
          // add campaign
          if (idx) {
            const removedEle = allCampaigns.splice(idx, 1);
            filteredCampaign.push(removedEle[0]);
          }
        }
      });
      return filteredCampaign;
    }
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
  @Post('{campaignId}/leaderboard')
  public async postLeaderboard(campaignId: string, @Body() request: LeaderboardCreationRequest): Promise<Leaderboard> {
    return await new CampaignService().postLeaderboard(campaignId, request);
  }
  @Put('{campaignId}/leaderboard')
  public async putLeaderboard(campaignId: string, @Body() request: LeaderboardUpdateRequest): Promise<Leaderboard> {
    return await new CampaignService().putLeaderboard(campaignId, request);
  }
  @Post('{campaignId}/campaignImage')
  public async postCampaignImage(campaignId: string, @Request() request: express.Request): Promise<string> {
    return await new CampaignService().uploadCampaignImage(campaignId, request);
  }
  @Get('{campaignId}/campaignImage')
  public async getCampaignImage(campaignId: string): Promise<string> {
    return await new CampaignService().getCampaignImage(campaignId);
  }
  @Post('/addCrowdGroup/{campaignId}')
  public async addCrowdGroup(campaignId: string, @Body() requestBody: any) {
    if (!requestBody.groupName) {
      return await new Promise((resolve, reject) => {
        reject({ message: 'missing fields' });
      });
    }
    return await new CampaignService().addCrowdGroup(campaignId, requestBody.groupName);
  }
  @Post('/removeCrowdGroup/{campaignId}')
  public async removeCrowdGroup(campaignId: string, @Body() requestBody: any) {
    if (!requestBody.groupName) {
      return await new Promise((resolve, reject) => {
        reject({ message: 'missing fields' });
      });
    }
    return await new CampaignService().removeCrowdGroup(campaignId, requestBody.groupName);
  }
}
