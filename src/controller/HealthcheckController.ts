import { Get, Route, Controller, Security, Response, SuccessResponse } from 'tsoa';

@Route('healthcheck')
export class Healthcheck extends Controller {
  @Security('jwt', ['user'])
  @Response('401', 'Unathorized')
  @SuccessResponse('200', 'OK')
  @Get('')
  public async healthcheck(): Promise<boolean> {
    return await new Promise<boolean>((resolve, reject) => {
      resolve(true);
    });
  }
}
