import { campaignDummy } from './models/campaign';
import mongodb from 'mongodb';

export class DatabaseConnector {
  host: string;
  database: string;
  user: string;
  password: string;

  db: any;

  constructor(host: string, database: string, user: string, password: string) {
    this.host = host;
    this.database = database;
    this.user = user;
    this.password = password;
  }

  init() {
    this.insertDummyData();
  }

  insertDummyData() {
    const collection = this.db.collection('campaigns');

    collection.insertMany(campaignDummy, (err: any, result: any) => {
      console.log('Inserted 2 campaigns into the collection');
    });
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async connect(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const url = 'mongodb://' + this.user + ':' + this.password + '@' + this.host + ':27017/' + this.database;
      const client = new mongodb.MongoClient(url, { useNewUrlParser: true });

      // Use connect method to connect to the Server
      client.connect((err, db) => {
        if (err) {
          reject(err);
        }

        this.db = db.db(this.database);
        resolve(this.db);
      });
    });
  }
}
