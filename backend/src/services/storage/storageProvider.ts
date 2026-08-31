export interface StoredFile {
  fileUrl: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
}

export interface StorageProvider {
  saveFile(file: Express.Multer.File): Promise<StoredFile>;
  deleteFile(fileUrl: string): Promise<boolean>;
}
