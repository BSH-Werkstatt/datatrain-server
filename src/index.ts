import './controller/CampaignsController';
import './controller/UsersController';
import './controller/HealthcheckController';
import './controller/TrainingController';

import bodyParser from 'body-parser';
import express, { response } from 'express';
import methodOverride from 'method-override';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
// @ts-ignore
import { RegisterRoutes } from './routes';
import { ImagesController } from './controller/ImagesController';
import { UserService } from './services/UserService';
import { User } from './models/user';
import { CodeStarNotifications } from 'aws-sdk';
import { preProcessFile, isNewExpression } from 'typescript';

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/images/:campaignId/:imageId.jpg', (req, res) => {
  if (req.query.userToken) {
    UserService.validateUserToken(req.query.userToken).then(valid => {
      if (valid) {
        ImagesController.serveFromS3(req, res);
      } else {
        res.json({ error: 'Invalid user token' });
      }
    });
  }
});
app.get('/images/:imageId.jpg', (req, res) => {
  if (req.query.userToken) {
    UserService.validateUserToken(req.query.userToken).then(valid => {
      if (valid) {
        ImagesController.serveFromS3(req, res);
      } else {
        res.json({ error: 'Invalid user token' });
      }
    });
  }
});

app.use('/predictions', express.static(__dirname + '/predictions'));
app.use('/docs', express.static(__dirname + '/swagger-ui'));
app.use('/swagger.json', (req, res) => {
  res.sendFile(__dirname + '/swagger.json');
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(methodOverride());

RegisterRoutes(app);
console.log('Starting server on port ' + port + '...');
app.listen(port);
