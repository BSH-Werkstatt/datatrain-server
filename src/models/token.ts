import { TokenConnector } from '../db/TokenConnector';

export class Token {
  token: string;

  constructor(token: string) {
    this.token = token;
  }

  static fromObject(object: any) {
    return new Token(object.token);
  }

  save(callback: any) {
    TokenConnector.getInstance((connector: TokenConnector) => {
      connector.save(this).then((res: { token: string }) => {
        if (!this.token) {
          this.token = res.token;
        }
        connector.connection.close();

        callback(this);
      });
    });
  }
}

export interface CreateTokenRequest {
  token: string;
}
