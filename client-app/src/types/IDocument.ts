export interface IDocument {
  filename: string;
  status: string;
  createdAt: string;
  sortKey: string;
  s3Path?: string;
  resultS3Path?: string;
  updatedAt: string;
  fileId?: string;
  promptResult?: {
    accuracy: string;
    result: string;
  };
  filePresignedUrl: string;
  resultPresignedUrl: string;
  textResultPresignedUrl: string;
  reviewStatus?: string;
  reviewComment?: string;
  patientFirstName: string;
  patientLastName: string;
}
