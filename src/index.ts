import express from 'express';
const runPython = require('./runPython');

const app = express();
const port = 8080; // default port to listen

// define a route handler for the default home page
app.get('/', (req, res) => {
  console.log('Someone connected.');

  runPython('./src/demo.py', 'This is a message from index.js').then(
    (data: string) => {
      console.log(data.toString());
      res.send('Hello World!' + data.toString());
    },
    (error: Error) => {
      console.log(error);
    }
  );
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
