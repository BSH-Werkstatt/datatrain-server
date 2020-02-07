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
app.use(async (req, res, next) => {
  let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.authorization;
  let refreshToken = req.headers['x-refresh-token'] as string;
  if (token) {
    if (token.includes('Bearer ')) {
      token = token.split(' ')[1];
    }
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET_TOKEN_1);
      (req as any).user = decode;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        if (refreshToken) {
          if (refreshToken.includes('Bearer ')) {
            refreshToken = refreshToken.split(' ')[1];
          }
          // tslint:disable-next-line:max-line-length
          const newTokens = await new UserService().refreshJWTToken(
            token,
            refreshToken,
            process.env.JWT_SECRET_TOKEN_1,
            process.env.JWT_SECRET_TOKEN_2
          );
          if (newTokens.token && newTokens.refreshToken) {
            res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
            res.set('x-token', newTokens.token);
            res.set('x-refresh-token', newTokens.refreshToken);
            (req as any).user = newTokens.id; // @TODO : send the entire userinformation
          }
        } else {
          res.status(400).json({
            name: 'RefreshTokenNotFound',
            message: 'Unable to find the refresh token inside global middleware'
          });
        }
      }
    }
  }
  // @TODO: ** important delete the previosly generated token
  /*
   * @TODO : insert the token into database
   */
  next();
});
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
