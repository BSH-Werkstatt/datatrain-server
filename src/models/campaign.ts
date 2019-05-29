export interface Campaign {
  id: number;
  ownerId: number;
  type: CampaignType;
  name: string;
  description: string;
  vocabulary: string[];
  userIds: number[];
}

export enum CampaignType {
  ImageAnnotationCampaign
}
