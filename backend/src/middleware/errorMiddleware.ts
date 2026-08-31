import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error Middleware]:', err);

  if (err.message && err.message.includes('Only PDF, JPEG, and PNG files are allowed')) {
    return ApiResponse.error(res, err.message, 400);
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return ApiResponse.error(res, 'File size exceeds maximum limit of 5MB', 400);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return ApiResponse.error(res, message, statusCode, err);
}
