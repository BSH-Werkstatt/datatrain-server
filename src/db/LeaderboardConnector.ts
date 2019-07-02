import { DatabaseConnector } from './DatabaseConnector';
import { ObjectId, ObjectID } from 'mongodb';
import { Leaderboard } from '../models/leaderboard';

export class LeaderboardConnector extends DatabaseConnector {
  collection = 'leaderboards';

  /**
   * gets an instance of DatabaseConnector initialized with the correct credentials
   */
  static getInstance(callback: any) {
    // TODO: store in environmental variables
    const db = new LeaderboardConnector('database_dev', 'datatrain', 'datatrain', 'init12345');
    db.connect()
      .then(res => {
        callback(db);
      })
      .catch(err => {
        console.error('An error occured while connecting to the database: ', err);
      });
  }

  /**
   * Returns the leaderboard of the campaign with the identifier id
   * @param campaignId campaign identifier
   */
  get(campaignId: string): Promise<Leaderboard> {
    return new Promise((resolve, reject) => {
      this.findOne(this.collection, { campaignId: ObjectId.createFromHexString(campaignId) })
        .then(result => {
          if (result) {
            resolve(Leaderboard.fromObject(result));
          } else {
            resolve(null);
          }
        })
        .catch(err => {
          console.error('Error while getting the leaderboard with campaign id ' + campaignId, err);
        });
    });
  }

  /**
   * inserts or updates documents depending if id exists
   * @param leaderboard Leaderboard object
   */
  save(leaderboard: Leaderboard): Promise<any> {
    const scores: any = [];

    leaderboard.scores.forEach(e => {
      scores.push({
        userId: ObjectId.createFromHexString(e.userId),
        score: e.score,
        email: e.email ? e.email : 'unknown',
        name: e.name ? e.name : 'unknown'
      });
    });

    const self = {
      campaignId: ObjectId.createFromHexString(leaderboard.campaignId),
      scores
    };

    if (leaderboard.id) {
      return this.updateDocument(
        this.collection,
        { campaignId: ObjectID.createFromHexString(leaderboard.campaignId) },
        self
      );
    } else {
      return this.insertOne(this.collection, self);
    }
  }
}
