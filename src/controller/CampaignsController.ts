import { Get, Route, Query, Controller } from 'tsoa';

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
}
