import { ImageConnector } from '../db/ImageConnector';
import { ImageData } from '../models/data';

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
}
