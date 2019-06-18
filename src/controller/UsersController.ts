import { Get, Route, Post, Controller, Request, Body } from 'tsoa';
import '../db/DatabaseConnector';

@Route('users')
export class UsersController extends Controller {}
