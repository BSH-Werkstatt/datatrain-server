export class UserGroup {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  static fromObject(object: any) {
    if (object) {
      const newObj = new UserGroup(object.name);
      return newObj;
    }
  }
}

export interface CreateUserGroupRequest {
  name: string;
}
