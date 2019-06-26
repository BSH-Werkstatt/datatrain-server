db.createUser({
  user: 'datatrain',
  pwd: 'init12345',
  roles: [
    {
      role: 'readWrite',
      db: 'datatrain'
    }
  ]
});

var res = db.users.insertMany([
  {
    name: 'Example Examplovič Examplovski',
    email: 'example@website.org'
  },
  {
    name: 'John Doe',
    email: 'john.doe@bsh.de'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@bsh.de'
  }
]);

var campaignsRes = db.campaigns.insertMany([
  {
    ownerId: res.insertedIds[0],
    type: 0,
    name: 'Fridge Campaign',
    description:
      "In this campagin, we're asking you to label as many images of fridge contents as you can!\n\n\
      We preparetd some images for you, but feel free to take pictures of any fridge you find and annotate it!",
    taxonomy: [
      'Tomato',
      'Lime',
      'Kohlrabi',
      'Kiwi',
      'Iceberg Lettuce',
      'Ginger',
      'Eggplant',
      'Cucumber',
      'Cauliflower',
      'Banana'
    ],
    image: 'https://media.mnn.com/assets/images/2018/11/inside_refrigerator.jpg.653x0_q80_crop-smart.jpg',
    initialized: false
  },
  {
    ownerId: res.insertedIds[0],
    type: 0,
    name: 'Washing Machines and Control Panels',
    description:
      'When something is made with the utmost care, it shows. At Bosch, the same thoughtful attention to detail begins in our \
factories where we test, inspect and perfect every last detail of our dishwashers.',
    taxonomy: ['Washing Machine', 'Control Panel'],
    image: 'https://media3.bosch-home.com/Images/600x/MCIM02055360_Bosch-service-Dishwasher-Support_1600x.jpg',
    initialized: false
  },
  {
    ownerId: res.insertedIds[0],
    type: 0,
    name: 'Washing Machines and Dryers',
    description:
      'When something is made with the utmost care, it shows. At Bosch, the same thoughtful attention to detail begins in our \
factories where we test, inspect and perfect every last detail of our dishwashers.',
    taxonomy: ['Washing Machine', 'Dryer'],
    image:
      'https://www.appliancesonline.com.au/public/images/product/wtw87565au/external/9kg-Bosch-Heat-Pump-Dryer-WTW87565AU-high.jpeg',
    initialized: false
  },
  {
    ownerId: res.insertedIds[0],
    type: 0,
    name: 'Tableware Campaign',
    description:
      'Help us recognize what kind of tableware is sensitive, requires intensive cleaning or is non-dishwasher safe.',
    taxonomy: ['Sensitive', 'Non-Diswasher Safe', 'Intensive'],
    image: 'https://media3.bosch-home.com/Images/600x/MCIM02055360_Bosch-service-Dishwasher-Support_1600x.jpg',
    initialized: false
  }
]);

db.leaderboards.insertMany([
  {
    campaignId: campaignsRes.insertedIds[0],
    scores: [
      {
        userId: res.insertedIds[0],
        score: 1000
      },
      {
        userId: res.insertedIds[1],
        score: 500
      },
      {
        userId: res.insertedIds[2],
        score: 250
      }
    ]
  },
  {
    campaignId: campaignsRes.insertedIds[1],
    scores: [
      {
        userId: res.insertedIds[0],
        score: 1000
      },
      {
        userId: res.insertedIds[1],
        score: 500
      },
      {
        userId: res.insertedIds[2],
        score: 250
      }
    ]
  },
  {
    campaignId: campaignsRes.insertedIds[2],
    scores: [
      {
        userId: res.insertedIds[0],
        score: 1000
      },
      {
        userId: res.insertedIds[1],
        score: 500
      },
      {
        userId: res.insertedIds[2],
        score: 250
      }
    ]
  },
  {
    campaignId: campaignsRes.insertedIds[3],
    scores: [
      {
        userId: res.insertedIds[0],
        score: 1000
      },
      {
        userId: res.insertedIds[1],
        score: 500
      },
      {
        userId: res.insertedIds[2],
        score: 250
      }
    ]
  }
]);
