import { Get, Route, Post, Controller, Request, Body, SuccessResponse, Response, Security } from 'tsoa';
import { User, CreateUserRequest } from '../models/user';
import { UserService } from '../services/UserService';
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
  // New Auth Login
  @SuccessResponse('200', 'OK')
  @Response('401', 'Unathorized')
  @Post('/login')
  public async loginUser(@Body() requestBody: any): Promise<any> {
    if (!requestBody.username || !requestBody.password) {
      return new Promise((resolve, reject) => {
        reject('missing field');
      });
    }
    return await new UserService().loginUser(requestBody.username, requestBody.password);
  }
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Get('myuserroute')
  public async protected(): Promise<any> {
    console.log('protected Route');
    return await new UserService().protectedService();
  }
  // moving at the end
  @Get('{userId}')
  public async getUserById(userId: string): Promise<User> {
    return await new UserService().getUserById(userId);
  }
}
