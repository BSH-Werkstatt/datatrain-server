export class Campaign {
  id: string;
  ownerId: string;
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
    console.log(object);
    return new Campaign(
      object.id,
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

// TODO: move initialization into db-init.js
export const campaignDummy: Campaign[] = [
  {
    ownerId: '1',
    id: '1',
    type: CampaignType.ImageAnnotationCampaign,
    name: 'Banana Campaign',
    description:
      'The campaign is all about bananas!\n\nWe need as much bananas as we can. Please upload every banana you see.\n\nThere are \
about 110 different species of banana. In popular culture and commerce, "banana" usually refers to the soft and sweet kind, \
also known as dessert bananas. Other kinds, or cultivars, of banana have a firmer, starchier fruit. Those are usually called \
plantains. Plantains are mostly used for cooking or fibre.',
    taxonomy: ['Banana', 'Not Banana'],
    image: 'https://www.organicfacts.net/wp-content/uploads/banana.jpg'
  },
  {
    ownerId: '2',
    id: '2',
    type: CampaignType.ImageAnnotationCampaign,
    name: 'Dishwasher Campaign',
    description:
      'When something is made with the utmost care, it shows. At Bosch, the same thoughtful attention to detail begins in our \
factories where we test, inspect and perfect every last detail of our dishwashers.',
    taxonomy: ['Plate', 'Fork', 'Mug', 'Bowl'],
    image: 'https://media3.bosch-home.com/Images/600x/MCIM02055360_Bosch-service-Dishwasher-Support_1600x.jpg'
  }
];
