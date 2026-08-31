import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import { randomUUID } from 'crypto';

// Ensure upload directory exists
const targetDir = path.resolve(__dirname, '../../uploads/receipts');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, targetDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeFilename = `${Date.now()}-${randomUUID()}${ext}`;
    cb(null, safeFilename);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
  }
};

export const uploadReceipt = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE, // 5MB
  },
  fileFilter,
});
