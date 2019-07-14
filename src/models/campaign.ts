export class Campaign {
  id: string;
  ownerId: string;
  /**
   * @isInt type
   */
  type: CampaignType;
  name: string;
  urlName: string;
  description: string;
  taxonomy: string[];
  image: string;
  trainingInProgress?: boolean;
  currentTrainingId?: string;
  currentModelFile?: string;

  constructor(
    id: string,
    ownerId: string,
    type: CampaignType,
    name: string,
    urlName: string,
    description: string,
    taxonomy: string[],
    image: string
  ) {
    this.id = id;
    this.ownerId = ownerId;
    this.type = type;
    this.name = name;
    this.urlName = urlName;
    this.description = description;
    this.taxonomy = taxonomy;
    this.image = image;
  }

  static fromObject(object: any) {
    return new Campaign(
      object._id ? object._id.toString() : object.id,
      object.ownerId,
      object.type,
      object.name,
      object.urlName,
      object.description,
      object.taxonomy,
      object.image
    );
  }
}

export enum CampaignType {
  /**
   * @isInt ImageAnnotationCampaign
   */
  ImageAnnotationCampaign = 0
}

export interface CampaignCreationRequest {
  userToken: string;
  /**
   * @isInt type
   */
  type: CampaignType;
  name: string;
  urlName?: string;
  description: string;
  taxonomy: string[];
  image: string;
  ownerId?: string;
}

export interface CampaignUpdateRequest {
  userToken: string;
  campaign: Campaign;
}
