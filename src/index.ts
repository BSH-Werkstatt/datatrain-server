import express from 'express';
import RunPython from './runPython';
import path from 'path';

const app = express();
const port = process.env.PORT ? process.env.PORT : 5000;

app.get('/', express.static(path.join(__dirname, 'dist/bsh-gotcha')));

// define a route handler for the default home page
app.get('/api/python', (req, res) => {
  console.log('Someone connected.');

  const python = new RunPython('./demo.py', 'This is a message from index.js');
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
