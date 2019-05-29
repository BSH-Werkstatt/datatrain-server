import { Controller, Param, Body, Get, Post, Put, Delete } from 'routing-controllers';

@Controller()
export class ImageController {
  @Get('/images')
  getAll() {
    return 'This action returns all images';
  }

  @Get('/images/random')
  getRandom() {
    return 'This action returns a random image';
  }

  @Get('/images/dummy')
  getDummy() {
    return 'This action returns a dummy image';
  }

  @Get('/images/:id')
  getOne(@Param('id') id: number) {
    return 'This action returns image #' + id;
  }

  @Post('/images')
  post(@Body() image: any) {
    return 'Saving image...';
  }

  @Put('/images/:id')
  put(@Param('id') id: number, @Body() user: any) {
    return 'Updating an image...';
  }

  @Delete('/images/:id')
  remove(@Param('id') id: number) {
    return 'Removing image...';
  }
}
