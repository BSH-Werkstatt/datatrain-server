/**
 * to initialize the DB a file called db-init.js has to be present in the db/ folder of the compiled code
 *
 */

const adminUsers = [
  { name: 'Admin', email: 'admin.admin@bshg.com', group: ['ml-users'] },
  { name: 'iPraktikum', email: 'ipraktikum.bsh@tum.de', group: ['ml-users'] }
];
const devUsers = [
  { name: 'TL01', email: 'taylor.lei@tum.de', group: ['ml-users'] },
  { name: 'EAO', email: 'emil.oldenburg@tum.de', group: ['ml-users'] },
  { name: 'susi123', email: 'susanne.winkler@tum.de', group: ['ml-users'] },
  { name: 'bsen', email: 'baris.sen@tum.de', group: ['ml-users'] },
  { name: 'borjaSC', email: 'borja-sanchez.clemente@tum.de', group: ['ml-users'] }
];
const fridgeCampaignUsers = [
  { name: 'johnny92', email: 'john.doe@bshg.de', group: ['ml-users'] },
  { name: 'XxmoeplordxX', email: 'moep@bshg.de', group: ['ml-users'] },
  { name: 'Jane Doe', email: 'jane.doe@bshg.de', group: ['ml-users'] },
  { name: 'The Doctor', email: 'john.smith@bshg.de', group: ['ml-users'] },
  { name: 'Mr.Lorem Ipsum', email: 'max.mustermann@bshg.de', group: ['ml-users'] }
];
const userGroup = [{ name: 'GROUP-1' }, { name: 'grp-1' }, { name: 'abc' }, { name: 'ade' }, { name: 'def' }];
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
      users: devUsers.concat(fridgeCampaignUsers),
      group: ['ml-users']
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
      users: devUsers.concat(fridgeCampaignUsers),
      group: ['ml-users']
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
      users: devUsers.concat(fridgeCampaignUsers),
      group: ['ml-users']
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
      users: devUsers.concat(fridgeCampaignUsers),
      group: ['ml-users']
    },
    {
      ownerEmail: 'ipraktikum.bsh@tum.de',
      type: 0,
      name: 'Dummy Developers',
      description: 'This is the dummy campaign for developers - testing.',
      taxonomy: ['Foo', 'Bar', 'Exzellenz', 'Hotdog', 'Not Hotdog', 'Penguin', 'Brügge'],
      image: 'https://www.safetyandhealthmagazine.com/ext/resources/images/safety-tips/yellow-hardhat.jpg',
      urlName: 'dummy-developers',
      users: devUsers.concat(adminUsers),
      group: ['ml-users']
    }
  ],
  userGroup
};
