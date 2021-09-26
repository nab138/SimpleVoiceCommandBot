const { exec } = require('child_process')
module.exports = speechToText;
function speechToText(input){
  return new Promise((resolve, reject) => {
    exec(`python utils/stt.py ${input}`, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          reject(error)
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          reject(stderr)
      }
      resolve(stdout)
    });
  })
}