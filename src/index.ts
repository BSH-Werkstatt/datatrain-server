import './controller/CampaignsController';
import bodyParser from 'body-parser';
import express from 'express';
import methodOverride from 'method-override';
import './db/DatabaseConnector';

// @ts-ignore
import { RegisterRoutes } from './routes';
import { DatabaseConnector } from './db/DatabaseConnector';
const port = process.env.PORT || 5000;

const app = express();
app.use('/images', express.static(__dirname + '/uploads'));

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
