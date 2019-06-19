import { LeaderboardConnector } from '../db/LeaderboardConnector';
import { ObjectId } from 'mongodb';

export class LeaderboardScore {
  userId: string;
  /**
   * @isInt score
   */
  score: number;

  constructor(userId: string, score: number) {
    this.userId = userId;
    this.score = score;
  }

  static fromObject(object: any): LeaderboardScore {
    return new LeaderboardScore(object.userId.toString(), object.score);
  }
}

export class Leaderboard {
  id: string;
  campaignId: string;
  scores: LeaderboardScore[];

  constructor(id: string, campaignId: string, scores: LeaderboardScore[]) {
    this.id = id;
    this.campaignId = campaignId;
    this.scores = scores;
  }

  static fromObject(object: any): Leaderboard {
    const scores: LeaderboardScore[] = [];

    object.scores.forEach((s: any) => {
      scores.push(LeaderboardScore.fromObject(s));
    });

    return new Leaderboard(object._id ? object._id.toString() : object.id, object.campaignId.toString(), scores);
  }

  save(callback: any) {
    LeaderboardConnector.getInstance((connector: LeaderboardConnector) => {
      connector.save(this).then((res: any) => {
        connector.connection.close();

        callback(this);
      });
    });
  }

  addScoreToUser(userId: string, score: number) {
    this.scores.forEach(e => {
      if (e.userId === userId) {
        e.score += score;
      }
    });
  }
}
