import { Readable } from 'stream';
import Busboy from 'busboy';
import { LambdaHandlerEvent } from './types';

type File = {
  file: Buffer;
  fileName: string;
  mimeType: string;
};

type ResultFiles = Record<string, File>;

type ResultFields = Record<string, string>;

type Result = {
  files: ResultFiles;
  fields: ResultFields;
};

/**
 * Parsing multipart/form-data request
 */
export class BusboyWrapper {
  /**
     * Convert stream into the object with files and fields
     * @param event - AWS Lambda event
     */
  static async getData(event: LambdaHandlerEvent): Promise<Result> {
    return new Promise((resolve, reject) => {
      const busboy = Busboy({
        headers: {
          'content-type': event.headers['Content-Type'] || event.headers['content-type'],
        },
      });

      const files: ResultFiles = {};
      const fields: ResultFields = {};

      busboy.on(
        'file',
        (
          fieldName: string,
          stream: Readable,
          fileData: {
            filename: string;
            mimeType: string;
          },
        ) => {
          stream.on('data', (data: Buffer) => {
            files[fieldName] = {
              file: data,
              fileName: fileData.filename,
              mimeType: fileData.mimeType,
            };
          });
        },
      );

      // @ts-ignore
      busboy.on('field', (name, val) => {
        fields[name] = val;
      });

      busboy.on('finish', () => resolve({ files, fields }));
      busboy.on('end', () => resolve({ files, fields }));

      busboy.on('error', (err: unknown) => reject(err));

      busboy.on('partsLimit', () => reject(new Error('partsLimit')));
      busboy.on('filesLimit', () => reject(new Error('filesLimit')));
      busboy.on('fieldsLimit', () => reject(new Error('fieldsLimit')));

      busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
      busboy.end();
    });
  }
}
