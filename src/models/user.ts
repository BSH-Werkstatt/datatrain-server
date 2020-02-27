import { UserConnector } from '../db/UserConnector';

export const USER_TYPES = {
  ANNOTATOR: 'annotator',
  ADMIN: 'admin',
  CAMPAIGN_OWNER: 'campaign_owner'
};

export class User {
  id: string;
  email: string;
  name: string;
  userType?: string;
  group: string[];
  constructor(id: string, email: string, name: string, userType?: string, group?: string[]) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.group = group ? group : ['bshintranetidm-users'];
    this.userType = userType ? userType : USER_TYPES.ANNOTATOR;
  }

  static fromObject(object: any) {
    return new User(
      object._id ? object._id.toString() : object.id,
      object.email,
      object.name,
      object.userType ? object.userType : USER_TYPES.ANNOTATOR,
      object.group ? object.group : ['bshintranetidm-users']
    );
  }

  save(callback: any) {
    UserConnector.getInstance((connector: UserConnector) => {
      connector.save(this).then(res => {
        if (!this.id) {
          this.id = res.insertedId;
        }
        connector.connection.close();

        callback(this);
      });
    });
  }
}

export interface CreateUserRequest {
  email: string;
  name: string;
  userType?: string;
  groups?: string[];
}
