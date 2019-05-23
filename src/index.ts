import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 5000;

// define a route handler for the default home page
app.get('', (req, res) => {
  console.log('Someone connected.');

  res.send('Hello World!');
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
