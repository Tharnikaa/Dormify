import fs from 'fs';
import path from 'path';
import { StorageProvider, StoredFile } from './storageProvider';

export class LocalStorageProvider implements StorageProvider {
  async saveFile(file: Express.Multer.File): Promise<StoredFile> {
    const fileUrl = `/uploads/receipts/${file.filename}`;
    return {
      fileUrl,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    };
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const filename = path.basename(fileUrl);
      const filePath = path.resolve(__dirname, '../../../uploads/receipts', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[LocalStorageProvider] Delete error:', err);
      return false;
    }
  }
}

export const storageProvider = new LocalStorageProvider();
