import 'reflect-metadata'; // this shim is required
import { createExpressServer } from 'routing-controllers';
import { MainController } from './controller/main-controller';
import { ImageController } from './controller/image-controller';

const port = process.env.PORT || 5000;

const app = createExpressServer({
  controllers: [MainController, ImageController] // we specify controllers we want to use
});

app.listen(port);
