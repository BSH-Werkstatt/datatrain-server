/**
 * to initialize the DB a file called db-init.js has to be present in the db/ folder of the compiled code
 *
 */

const adminUsers = [
  { name: 'Admin', email: 'admin.admin@bshg.com' },
  { name: 'iPraktikum', email: 'ipraktikum.bsh@tum.de' }
];
const devUsers = [
  { name: 'TL01', email: 'username@tum.de' },
  { name: 'EAO', email: 'username1@tum.de' },
  { name: 'susi123', email: 'username2@tum.de' },
  { name: 'bosen', email: 'username3@tum.de' },
  { name: 'borjSC', email: 'username4@tum.de' }
];
const fridgeCampaignUsers = [
  { name: 'john92', email: 'username5@bshg.de' },
  { name: 'XxmoeplordxX', email: 'username6@bshg.de' },
  { name: 'Jane Doe', email: 'username7@bshg.de' },
  { name: 'The Doctor', email: 'username8@bshg.de' },
  { name: 'Mr.Lorem Ipsum', email: 'username9@bshg.de' }
];

export default {
  users: adminUsers.concat(devUsers).concat(fridgeCampaignUsers),
  campaigns: [
    {
      ownerEmail: 'admin.admin@bshg.com',
      type: 0,
      name: 'Camera in the Fridge',
      description:
        "In this campaign, we're asking you to label as many images of fridge contents as you can!\n\n\
        We have prepared some images for you, but feel free to take pictures of any fridge you find and annotate it!",
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
      urlName: 'camera-in-the-fridge',
      users: devUsers.concat(fridgeCampaignUsers)
    },
    {
      ownerEmail: 'admin.admin@bshg.com',
      type: 0,
      name: 'MARK',
      description: 'In this campaign we are trying to differentiate between washing machines and their control panels.',
      taxonomy: ['Washing Machine', 'Control Panel'],
      image:
        'https://media3.bosch-home.com/Images/600x/MCIM02959487_Bosch_Product_Selector_WM_1240_1240_mobile_VP1.jpg',
      urlName: 'mark',
      users: devUsers.concat(fridgeCampaignUsers)
    },
    {
      ownerEmail: 'admin.admin@bshg.com',
      type: 0,
      name: 'MARK: Avantgarde',
      description: 'We are collecting data to tell washing machines and dryers apart.',
      taxonomy: ['Washing Machine', 'Tumble Dryer'],
      image:
        'https://www.appliancesonline.com.au/public/images/product/wtw87565au/external/9kg-Bosch-Heat-Pump-Dryer-WTW87565AU-high.jpeg',
      urlName: 'mark-avantgarde',
      users: devUsers.concat(fridgeCampaignUsers)
    },
    {
      ownerEmail: 'admin.admin@bshg.com',
      type: 0,
      name: 'MyLoadingWay',
      description: 'Help us recognize what kind of tableware is in the picture.',
      taxonomy: [
        'Wine Glass',
        'Bowl',
        'Glass',
        'Cup',
        'Plate',
        'Sharp Knife',
        'Pot',
        'Tupper Box',
        'Cutting Board',
        'Cutlery',
        'Chopsticks'
      ],
      image: 'https://media3.bosch-home.com/Images/600x/MCIM02055360_Bosch-service-Dishwasher-Support_1600x.jpg',
      urlName: 'myloadingway',
      users: devUsers.concat(fridgeCampaignUsers)
    },
    {
      ownerEmail: 'ipraktikum.bsh@tum.de',
      type: 0,
      name: 'Dummy Developers',
      description: 'This is the dummy campaign for developers - testing.',
      taxonomy: ['Foo', 'Bar', 'Exzellenz', 'Hotdog', 'Not Hotdog', 'Penguin', 'Brügge'],
      image: 'https://www.safetyandhealthmagazine.com/ext/resources/images/safety-tips/yellow-hardhat.jpg',
      urlName: 'dummy-developers',
      users: devUsers.concat(adminUsers)
    }
  ]
};
