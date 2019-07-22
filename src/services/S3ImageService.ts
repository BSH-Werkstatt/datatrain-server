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

  /**
   * uploads a file to the S3 bucket given a path to the file (and as name to save it under)
   * @param filePath path to the uploaded file
   * @param name name to save the file on S3 (without extension)
   */
  uploadImageByPath(filePath: string, name: string, makePublic?: boolean): Promise<any> {
    if (!makePublic) {
      makePublic = false;
    }

    return new Promise((resolve, reject) => {
      // extension check now only performed for JPEG images
      // TODO: should be extended to a more general check (for different campaign types)
      if (path.extname(filePath).toLowerCase() !== '.jpg' && path.extname(filePath).toLowerCase() !== '.jpeg') {
        console.log('Wrong file extension.', filePath);
      }

      // configuring parameters
      const params = {
        Bucket: 'datatrain-static',
        Body: fs.createReadStream(filePath),
        Key: 'images/' + name + '.jpg'
      };

      if (makePublic) {
        // @ts-ignore
        params.ACL = 'public-read';
      }

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

  getImage(id: string) {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: 'datatrain-static',
        Key: 'images/' + id + '.jpg'
      };

      console.log(params);

      this.s3.getObject(params, (err, data) => {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject(err);
        } else {
          console.log(data); // successful response
          resolve(data);
        }
      });
    });
  }
}
