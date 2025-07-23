export interface IFile {
  sortKey?: string;
  s3Path?: string;
  createdAt?: string;
  status?: string;
  resultS3Path?: string;
  filename?: string;
  updatedAt?: string;
}

export interface DynamoDBFile extends IFile {
  'sectionName': string;
  ownerId?: string;
}
