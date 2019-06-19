import { Get, Route, Post, Controller, Request, Body } from 'tsoa';
import { User, CreateUserRequest } from '../models/user';
import { UserService } from '../services/UserService';

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
}
