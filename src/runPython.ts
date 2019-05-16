let runPython = (script: string, arg1: string) => {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    const pythonScript = spawn('python', [script, arg1]);

    pythonScript.stdout.on('data', (data: string) => {
      resolve(data);
    });

    pythonScript.stderr.on('data', (data: string) => {
      reject(new Error('Something went wrong! ' + data));
    });
  });
};

module.exports = runPython;
