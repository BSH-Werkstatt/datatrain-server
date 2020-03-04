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
// @TODO: add typescript support as well
const passport = require('passport');
const { BasicStrategy } = require('@natlibfi/passport-atlassian-crowd');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
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
app.use(
  session({
    name: 'name',
    secret: 'process.env.COOKIE_SECRET',
    resave: false,
    saveUninitialized: false,
    cookie: {},
    store: new MongoStore({
      // tslint:disable-next-line:max-line-length
      url: `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:27017/${process.env.DB_DATABASE}`,
      ttl: 90 * 24 * 60 * 60 // Hold Session for 90 Days
    })
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/success', (req, res) => {
  const user: any = req.user;
  res.redirect(`/users/${user.email}`);
});
app.get('/error', (req, res) => res.send('error logging in'));
app.use(bodyParser.urlencoded({ extended: false }));
passport.serializeUser((user: any, cb: any) => {
  // console.log(`serializing user with user `);
  // console.log(user.emails[0].value);
  cb(null, user.emails[0].value);
});

passport.deserializeUser(async (id: any, cb: any) => {
  console.log(id);
  console.log(`frmo deserialize user`);
  id = id.toLowerCase();
  const user = await new UserService().getUserByEmail(id);
  // console.log(`deserializing user id ${user.id} and user: `);
  // console.log(user);
  cb(null, user);
});
passport.use(
  new BasicStrategy({
    url: process.env.CROWD_URL,
    appName: process.env.CROWD_APP,
    appPassword: process.env.CROWD_PASS,
    fetchGroupMembership: true
  })
);
app.post(
  '/login',
  passport.authenticate('atlassian-crowd-basic', { failureRedirect: '/error', session: true }),
  (req, res) => {
    // res.send(req.user);
    res.redirect(200, '/success');
  }
);
app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.send(`please login`);
});
app.get('/logout', (req, res, next) => {
  req.logout();
  res.send(`logged out`);
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
