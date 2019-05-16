import express from 'express';
import RunPython from './runPython';

const app = express();
const port = 8080; // default port to listen

// define a route handler for the default home page
app.get('/', (req, res) => {
  console.log('Someone connected.');

  const python = new RunPython('./src/demo.py', 'This is a message from index.js');
  python.getPromise().then(
    (data: string) => {
      console.log(data.toString());
      res.send('Hello World! ' + data.toString());
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
