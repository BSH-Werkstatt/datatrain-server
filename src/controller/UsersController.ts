import { Get, Route, Post, Controller, Request, Body, SuccessResponse, Response, Security } from 'tsoa';
import { User, CreateUserRequest } from '../models/user';
import { UserService } from '../services/UserService';
import { UserGroup, CreateUserGroupRequest } from '../models/usergroup';
import { rejects } from 'assert';
import { json } from 'body-parser';

@Route('users')
export class UsersController extends Controller {
  @Get('byEmail/{email}')
  public async getUserByEmail(email: string): Promise<User> {
    return await new UserService().getUserByEmail(email);
  }

  @Post('')
  public async createUser(@Body() request: CreateUserRequest): Promise<User> {
    return await new UserService().createUser(request);
  }
  @Post('/login')
  public async loginUser(@Body() requestBody: any): Promise<any> {
    if (!requestBody.username || !requestBody.password) {
      return new Promise((resolve, reject) => {
        reject('missing field');
      });
    }
    return await new UserService().loginUser(requestBody.username, requestBody.password);
  }
  @Get('groups/{userGroup}')
  public async getUserGroup(userGroup: string): Promise<UserGroup[]> {
    return await new UserService().getUserGroup(userGroup);
  }
  @Post('groups')
  public async saveUserGroup(@Body() requestBody: any): Promise<boolean> {
    if (!requestBody.name) {
      return await new Promise((resolve, reject) => {
        reject('missing field');
      });
    }
    return await new UserService().saveUserGroup(requestBody.name);
  }
  @Post('/addCrowdGroup/{campaignId}')
  public async addCrowdGroup(campaignId: string, @Body() requestBody: any) {
    if (!requestBody.groupName) {
      return await new Promise((resolve, reject) => {
        reject({ message: 'missing fields' });
      });
    }
    return await new UserService().addCrowdGroup(campaignId, requestBody.groupName);
  }
  @Post('/removeCrowdGroup/{campaignId}')
  public async removeCrowdGroup(campaignId: string, @Body() requestBody: any) {
    if (!requestBody.groupName) {
      return await new Promise((resolve, reject) => {
        reject({ message: 'missing fields' });
      });
    }
    return await new UserService().removeCrowdGroup(campaignId, requestBody.groupName);
  }
  // moving at the end
  @Get('{userId}')
  public async getUserById(userId: string): Promise<User> {
    return await new UserService().getUserById(userId);
  }
}
