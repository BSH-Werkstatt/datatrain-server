var users = ['admin.admin@bshg.com', 'taylor.lei@tum.de', 'ipraktikum.bsh@tum.de'];
var userObjects = [];

for (var i = 0; i < users.length; i++) {
  userObjects.push({
    name: users[i].toLowerCase().split('@')[0],
    email: users[i].toLowerCase()
  });
}

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

var res = db.users.insertMany(userObjects);

for (var i = 0; i < users.length; i++) {
  userObjects[i].userId = res.insertedIds[i];
  userObjects[i].score = 0;
}

var campaignsRes = db.campaigns.insertMany([
  {
    ownerId: res.insertedIds[0],
    type: 0,
    name: 'Fridge',
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
    initialized: false,
    urlName: 'fridge'
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
    initialized: false,
    urlName: 'washing-machines-and-control-panels'
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
    initialized: false,
    urlName: 'washing-machines-and-dryers'
  },
  {
    ownerId: res.insertedIds[0],
    type: 0,
    name: 'Tableware',
    description:
      'Help us recognize what kind of tableware is sensitive, requires intensive cleaning or is non-dishwasher safe.',
    taxonomy: ['Sensitive', 'Non-Diswasher Safe', 'Intensive'],
    image: 'https://media3.bosch-home.com/Images/600x/MCIM02055360_Bosch-service-Dishwasher-Support_1600x.jpg',
    initialized: false,
    urlName: 'tableware'
  },
  {
    ownerId: res.insertedIds[0],
    type: 0,
    name: 'Dummy Developers',
    description: 'This is the dummy campaign for developers - testing.',
    taxonomy: ['Foo', 'Bar', 'Moep', 'Hotdog', 'Not Hotdog', 'Penguin'],
    image: 'https://www.safetyandhealthmagazine.com/ext/resources/images/safety-tips/yellow-hardhat.jpg',
    initialized: false,
    urlName: 'dummy-developers'
  }
]);

db.leaderboards.insertMany([
  {
    campaignId: campaignsRes.insertedIds[0],
    scores: userObjects
  },
  {
    campaignId: campaignsRes.insertedIds[1],
    scores: userObjects
  },
  {
    campaignId: campaignsRes.insertedIds[2],
    scores: userObjects
  },
  {
    campaignId: campaignsRes.insertedIds[3],
    scores: userObjects
  },
  {
    campaignId: campaignsRes.insertedIds[4],
    scores: userObjects
  }
]);
