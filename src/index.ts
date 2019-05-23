import 'reflect-metadata'; // this shim is required
import { createExpressServer } from 'routing-controllers';
import { MainController } from './controller/main-controller';

const port = process.env.PORT || 5000;

const app = createExpressServer({
  controllers: [MainController] // we specify controllers we want to use
});

app.listen(port);
