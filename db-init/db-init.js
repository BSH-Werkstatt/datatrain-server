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
    email: 'example@website.org'
  }
]);

var campaignsRes = db.campaigns.insertMany([
  {
    ownerId: res.insertedIds[0],
    type: 0,
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
    ownerId: res.insertedIds[0],
    type: 0,
    name: 'Dishwasher Campaign',
    description:
      'When something is made with the utmost care, it shows. At Bosch, the same thoughtful attention to detail begins in our \
factories where we test, inspect and perfect every last detail of our dishwashers.',
    taxonomy: ['Plate', 'Fork', 'Mug', 'Bowl'],
    image: 'https://media3.bosch-home.com/Images/600x/MCIM02055360_Bosch-service-Dishwasher-Support_1600x.jpg'
  }
]);

db.leaderboards.insertMany([
  {
    campaignId: campaignsRes.insertedIds[0],
    scores: [
      {
        userId: res.insertedIds[0],
        score: 1000
      }
    ]
  },
  {
    campaignId: campaignsRes.insertedIds[1],
    scores: [
      {
        userId: res.insertedIds[0],
        score: 1000
      }
    ]
  }
]);
