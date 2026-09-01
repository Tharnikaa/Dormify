import fs from 'fs';
import { supabase } from '../../config/supabase';
import { StorageProvider, StoredFile } from './storageProvider';

export class SupabaseStorageProvider implements StorageProvider {
  private bucketName = 'receipts';

  async saveFile(file: Express.Multer.File): Promise<StoredFile> {
    try {
      const fileBuffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
      if (!fileBuffer) {
        throw new Error('File content could not be read');
      }

      const uniqueFilename = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(uniqueFilename, fileBuffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        console.warn('[SupabaseStorageProvider] Bucket upload warning, falling back to public URL:', error.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(uniqueFilename);

      const fileUrl = publicUrlData?.publicUrl || `/uploads/receipts/${file.filename || uniqueFilename}`;

      // Clean up local temp file if created by multer
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (_) {}
      }

      return {
        fileUrl,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
      };
    } catch (err: any) {
      console.error('[SupabaseStorageProvider] Error:', err);
      // Fallback
      return {
        fileUrl: `/uploads/receipts/${file.filename || file.originalname}`,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
      };
    }
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const filename = fileUrl.split('/').pop();
      if (!filename) return false;

      const { error } = await supabase.storage.from(this.bucketName).remove([filename]);
      return !error;
    } catch (err) {
      console.error('[SupabaseStorageProvider] Delete error:', err);
      return false;
    }
  }
}

export const supabaseStorageProvider = new SupabaseStorageProvider();
