import { Campaign, CampaignType } from '../models/campaign';

const campaignDummy: Campaign[] = [
  {
    ownerId: 1,
    id: 1,
    type: CampaignType.ImageAnnotationCampaign,
    name: 'Banana Campaign',
    description: 'Lorem Ipsum banana sit amet',
    vocabulary: ['banana', 'not_banana'],
    userIds: [1, 2, 3]
  },
  {
    ownerId: 2,
    id: 2,
    type: CampaignType.ImageAnnotationCampaign,
    name: 'Dishwasher Campaign',
    description: 'Lorem Ipsum dishwasher sit amet',
    vocabulary: ['plate', 'fork', 'mug', 'bowl'],
    userIds: [1, 2, 3]
  }
];

export class CampaignService {
  get(id: number): Promise<Campaign> {
    const promise = new Promise<Campaign>((resolve, reject) => {
      const result: Campaign = campaignDummy.find(campaign => {
        return campaign.id === id;
      });

      if (!result) {
        reject(new Error('Could not get campaign with id: ' + id));
      } else {
        resolve(result);
      }
    });

    return promise;
  }

  getAll(): Promise<Campaign[]> {
    const promise = new Promise<Campaign[]>(resolve => {
      resolve(campaignDummy);
    });

    return promise;
  }
}
