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
    name: 'Fruit Campaign',
    description:
      'The campaign is all about fruits!\n\nWe need as many bananas, apples, oranges etc. as we can find. Please upload every fruit you see.\n\nThere are \
about 110 different species of banana. In popular culture and commerce, "banana" usually refers to the soft and sweet kind, \
also known as dessert bananas. Other kinds, or cultivars, of banana have a firmer, starchier fruit. Those are usually called \
plantains. Plantains are mostly used for cooking or fibre.',
    taxonomy: ['Banana', 'Kiwi', 'Lime'],
    image: 'https://www.organicfacts.net/wp-content/uploads/banana.jpg'
  },
  {
    ownerId: res.insertedIds[0],
    type: 0,
    name: 'Washing Machine Campaign',
    description:
      'When something is made with the utmost care, it shows. At Bosch, the same thoughtful attention to detail begins in our \
factories where we test, inspect and perfect every last detail of our dishwashers.',
    taxonomy: ['Washing Machine', 'Control Panel'],
    image: 'https://media3.bosch-home.com/Images/600x/MCIM02055360_Bosch-service-Dishwasher-Support_1600x.jpg'
  },
  {
    ownerId: res.insertedIds[0],
    type: 0,
    name: 'Tableware Campaign',
    description: 'Plates, Forks, Mugs...',
    taxonomy: ['sensitive', 'nonDiswasherSafe', 'intensive'],
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Formal_01.jpg/220px-Formal_01.jpg'
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
