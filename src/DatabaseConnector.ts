import mongoose from 'mongoose';

// TODO: remove after docker solution
let INITIAL_CONNECTION_MADE = false;

export class DatabaseConnector {
  host: string;
  db: string;
  user: string;
  password: string;

  conn: any;

  constructor(host: string, db: string, user: string, password: string) {
    this.host = host;
    this.db = db;
    this.user = user;
    this.password = password;
  }

  init() {
    this.connect()
      .then(connection => {
        this.conn = connection;
        console.log('Initial connection to ' + this.host + '/' + this.db + ' established.');
        this.checkTablesExist();
      })
      .catch(err => {
        console.error('Initial connection could not be established:', err);
      });
  }

  checkTablesExist() {}

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async connect(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      /*
            The database docker image needs some time to start up,
            before we find a better solution this gives it 10 seconds
            this is really only relevant for the initial connection
        */
      // TODO: find solution in docker for this
      if (!INITIAL_CONNECTION_MADE) {
        await this.sleep(5000);
      }

      // TODO: add user+pwd
      mongoose.connect('mongodb://' + this.host + ':27017/' + this.db, { useNewUrlParser: true });

      const conn = mongoose.connection;
      conn.on('error', (err: any) => {
        reject(err);
      });
      conn.once('open', () => {
        INITIAL_CONNECTION_MADE = true;

        resolve(conn);
      });
    });
  }
}
