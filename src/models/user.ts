import { UserConnector } from '../db/UserConnector';

export class User {
  id: string;
  email: string;
  name: string;

  constructor(id: string, email: string, name: string) {
    this.id = id;
    this.email = email;
    this.name = name;
  }

  static fromObject(object: any) {
    return new User(object._id ? object._id.toString() : object.id, object.email, object.name);
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
}
