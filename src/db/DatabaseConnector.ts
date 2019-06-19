import { campaignDummy } from '../models/campaign';
import mongodb from 'mongodb';

export class DatabaseConnector {
  host: string;
  database: string;
  user: string;
  password: string;

  db: any;
  connection: any;

  protected constructor(host: string, database: string, user: string, password: string) {
    this.host = host;
    this.database = database;
    this.user = user;
    this.password = password;
  }

  /**
   * gets an instance of DatabaseConnector initialized with the correct credentials
   * @param callback callback function which takes the DatabaseConnector instance as an argument
   */
  static getInstance(callback: any) {
    const db = new DatabaseConnector('database_dev', 'datatrain', 'datatrain', 'init12345');
    db.connect()
      .then(res => {
        callback(db);
        // db.connection.close();
      })
      .catch(err => {
        console.error('An error occured while connecting to the database: ', err);
      });
  }

  // TODO: move initialization into db-init.js
  /**
   * Wrapper around the initialization process
   */
  init() {
    setTimeout(() => {
      this.insertDummyData();
    }, 30000);
  }

  /**
   * Initialized the database with dummy data for testing
   */
  insertDummyData() {
    const collection = this.db.collection('campaigns');

    collection.insertMany(campaignDummy, (err: any, result: any) => {
      if (err) {
        console.error('error while inserting dummy data', err);
      } else {
        console.log('Inserted 2 campaigns into the collection', result);
      }
    });
  }

  /**
   * Stops the execution of the script for ms miliseconds
   * @param ms delay in ms
   */
  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Creates connection to the database
   */
  connect(): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = 'mongodb://' + this.user + ':' + this.password + '@' + this.host + ':27017/' + this.database;
      const client = new mongodb.MongoClient(url, { useNewUrlParser: true });

      // Use connect method to connect to the Server
      client.connect((err, db) => {
        if (err) {
          reject(err);
        }

        this.connection = db;
        this.db = db.db(this.database);
        resolve(this.db);
      });
    });
  }

  /**
   * Inserts one document into a collection
   * @param collection name of the collection
   * @param data document as an object
   */
  insertOne(collection: string, data: object): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      const col = this.db.collection(collection);

      col.insertOne(data, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Inserts many documents into a collection
   * @param collection name of the collection
   * @param data documents as an array of object
   */
  insertMany(collection: string, data: object[]): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      const col = this.db.collection(collection);

      col.insertMany(data, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Inserts one document into a collection
   * @param collection name of the collection
   * @param data document as an object
   */
  updateDocument(collection: string, params: object, data: object): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      const col = this.db.collection(collection);

      this.db.collection(collection).update(params, data, (err: any, result: any) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  /**
   * Queries the collection according the given parameters
   * @param collection database collection
   * @param params query parameters
   */
  find(collection: string, params: object): Promise<object[]> {
    return new Promise<object[]>((resolve, reject) => {
      const col = this.db.collection(collection);

      col.find(params).toArray((err: any, docs: object[]) => {
        if (err) {
          reject(err);
        }

        resolve(docs);
      });
    });
  }

  /**
   * Queries the collection according the given parameters, returns only one result
   * @param collection database collection
   * @param params query parameters
   */
  findOne(collection: string, params: object): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      const col = this.db.collection(collection);

      col.findOne(params, (err: any, docs: object[]) => {
        if (err) {
          reject(err);
        }

        resolve(docs);
      });
    });
  }
}
