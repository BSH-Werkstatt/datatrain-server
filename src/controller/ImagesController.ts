import { ImageConnector } from '../db/ImageConnector';
import { ImageData } from '../models/data';
import fs from 'fs';
import { S3ImageService } from '../services/S3ImageService';
import { Duplex } from 'stream';

export class ImagesController {
  static redirectToS3(req: any, res: any) {
    ImageConnector.getInstance((conn: ImageConnector) => {
      conn
        .get(req.params.imageId)
        .then((imageData: ImageData) => {
          if (imageData) {
            res.status(301).redirect(imageData.url);
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'image with id ' + req.params.imageId + ' not found' }));
          }
        })
        .catch(err => {
          console.error('Error while retrieving image: ', err);
        });
    });
  }

  static serveFromS3(req: any, res: any) {
    const s3 = new S3ImageService();
    ImageConnector.getInstance((conn: ImageConnector) => {
      conn
        .get(req.params.imageId)
        .then((imageData: ImageData) => {
          if (imageData) {
            s3.getImage(req.params.imageId).then((image: any) => {
              conn.connection.close();
              const stream = ImagesController.bufferToStream(image.Body);
              res.statusCode = '200';
              res.setHeader('Content-Type', 'image/jpeg');
              stream.pipe(res);
            });
          } else {
            conn.connection.close();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'image with id ' + req.params.imageId + ' not found' }));
          }
        })
        .catch(err => {
          console.error('Error while retrieving image: ', err);
        });
    });
  }

  static bufferToStream(buffer: Buffer) {
    const stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}
