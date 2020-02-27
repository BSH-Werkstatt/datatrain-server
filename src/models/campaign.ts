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
  groups?: string[];
  constructor(
    id: string,
    ownerId: string,
    type: CampaignType,
    name: string,
    urlName: string,
    description: string,
    taxonomy: string[],
    image: string,
    trainingInProgress?: boolean,
    currentTrainingId?: string,
    groups?: string[]
  ) {
    this.id = id;
    this.ownerId = ownerId;
    this.type = type;
    this.name = name;
    this.urlName = urlName;
    this.description = description;
    this.taxonomy = taxonomy;
    this.image = image;
    this.groups = groups ? groups : ['ml-users'];
    if (trainingInProgress) {
      this.trainingInProgress = trainingInProgress;
    }

    if (currentTrainingId) {
      this.currentTrainingId = currentTrainingId;
    }
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
      object.image,
      object.trainingInProgress ? object.trainingInProgress.toString() : false,
      object.currentTrainingId ? object.currentTrainingId.toString() : null,
      object.groups ? object.groups : ['ml-users']
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
  group?: string[];
}

export interface CampaignUpdateRequest {
  userToken: string;
  campaign: Campaign;
}
