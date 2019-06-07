export interface Campaign {
  /**
   * @isInt id
   */
  id: number;
  /**
   * @isInt ownerId
   */
  ownerId: number;
  type: CampaignType;
  name: string;
  description: string;
  vocabulary: string[];
  image: string;
}

export enum CampaignType {
  /**
   * @isInt ImageAnnotationCampaign
   */
  ImageAnnotationCampaign = 0
}
