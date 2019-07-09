import AWS from 'aws-sdk';

import path from 'path';
import fs from 'fs';
import { DBConfig } from '../db/dbconfig';

export class S3ImageService {
  private s3: AWS.S3;

  constructor() {
    AWS.config.update({
      accessKeyId: DBConfig.awsKeyId,
      secretAccessKey: DBConfig.awsKeySecret
    });

    this.s3 = new AWS.S3();
  }

  uploadImageByPath(filePath: string, imageId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (path.extname(filePath).toLowerCase() !== '.jpg' && path.extname(filePath).toLowerCase() !== '.jpeg') {
        console.log('Wrong file extension.', filePath);
      }

      // configuring parameters
      const params = {
        Bucket: 'datatrain-static',
        Body: fs.createReadStream(filePath),
        Key: 'images/' + imageId + '.jpg'
      };

      this.s3.upload(params, (err: any, data: any) => {
        // handle error
        if (err) {
          console.error('Error while uploading', err);
          reject(err);
        }

        // success
        if (data) {
          console.log('Uploaded in:', data.Location);
          resolve(data.Location);
        }
      });
    });
  }
}
