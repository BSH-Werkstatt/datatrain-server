export default class RunPython {
  promise: Promise<any>;

  constructor(script: string, arg1: string) {
    this.promise = new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      const pythonScript = spawn('python', [script, arg1]);

      pythonScript.stdout.on('data', (data: string) => {
        resolve(data);
      });

      pythonScript.stderr.on('data', (data: string) => {
        reject(new Error('Something went wrong! ' + data));
      });
    });
  }

  getPromise() {
    return this.promise;
  }
}
