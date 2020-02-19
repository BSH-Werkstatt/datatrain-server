import { Get, Route, Controller, Security, Response, SuccessResponse } from 'tsoa';

@Route('healthcheck')
export class Healthcheck extends Controller {
  @Get('')
  public async healthcheck(): Promise<boolean> {
    return await new Promise<boolean>((resolve, reject) => {
      resolve(true);
    });
  }
}
