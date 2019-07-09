const adminUsers = [
  { name: 'Admin', email: 'admin.admin@bshg.com' },
  { name: 'iPraktikum', email: 'ipraktikum.bsh@tum.de' }
];
const devUsers = [
  { name: 'TL01', email: 'taylor.lei@tum.de' },
  { name: 'EAO', email: 'emil.oldenburg@tum.de' },
  { name: 'susi123', email: 'susanne.winkler@tum.de' },
  { name: 'bsen', email: 'baris.sen@tum.de' },
  { name: 'borjaSC', email: 'borja-sanchez.clemente@tum.de' }
];
const fridgeCampaignUsers = [
  { name: 'johnny92', email: 'john.doe@bshg.de' },
  { name: 'XxmoeplordxX', email: 'moep@bshg.de' },
  { name: 'Jane Doe', email: 'jane.doe@bshg.de' },
  { name: 'The Doctor', email: 'john.smith@bshg.de' },
  { name: 'Mr.Lorem Ipsum', email: 'max.mustermann@bshg.de' }
];

export const DBInit = {
  users: adminUsers.concat(devUsers).concat(fridgeCampaignUsers),
  campaigns: [
    {
      ownerEmail: 'admin.admin@bshg.com',
      type: 0,
      name: 'Fridge',
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
      urlName: 'fridge',
      users: devUsers.concat(fridgeCampaignUsers)
    },
    {
      ownerEmail: 'admin.admin@bshg.com',
      type: 0,
      name: 'Washing Machines and Control Panels',
      description: 'In this campaign we are trying to differentiate between washing machines and their control panels.',
      taxonomy: ['Washing Machine', 'Control Panel'],
      image:
        'https://media3.bosch-home.com/Images/600x/MCIM02959487_Bosch_Product_Selector_WM_1240_1240_mobile_VP1.jpg',
      urlName: 'washing-machines-and-control-panels',
      users: devUsers.concat(fridgeCampaignUsers)
    },
    {
      ownerEmail: 'admin.admin@bshg.com',
      type: 0,
      name: 'Washing Machines and Dryers',
      description: 'We are collecting data to tell washing machines and dryers apart.',
      taxonomy: ['Washing Machine', 'Dryer'],
      image:
        'https://www.appliancesonline.com.au/public/images/product/wtw87565au/external/9kg-Bosch-Heat-Pump-Dryer-WTW87565AU-high.jpeg',
      urlName: 'washing-machines-and-dryers',
      users: devUsers.concat(fridgeCampaignUsers)
    },
    {
      ownerEmail: 'admin.admin@bshg.com',
      type: 0,
      name: 'Tableware',
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
      urlName: 'tableware',
      users: devUsers.concat(fridgeCampaignUsers)
    },
    {
      ownerEmail: 'iPraktikum@tum.de',
      type: 0,
      name: 'Dummy Developers',
      description: 'This is the dummy campaign for developers - testing.',
      taxonomy: ['Foo', 'Bar', 'Moep', 'Hotdog', 'Not Hotdog', 'Penguin'],
      image: 'https://www.safetyandhealthmagazine.com/ext/resources/images/safety-tips/yellow-hardhat.jpg',
      urlName: 'dummy-developers',
      users: devUsers.concat(adminUsers)
    }
  ]
};
