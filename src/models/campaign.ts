export class Campaign {
  id: string;
  ownerId: string;
  /**
   * @isInt type
   */
  type: CampaignType;
  name: string;
  description: string;
  taxonomy: string[];
  image: string;

  constructor(
    id: string,
    ownerId: string,
    type: CampaignType,
    name: string,
    description: string,
    taxonomy: string[],
    image: string
  ) {
    this.id = id;
    this.ownerId = ownerId;
    this.type = type;
    this.name = name;
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

/*
  Dummy data we are using for testing
*/
