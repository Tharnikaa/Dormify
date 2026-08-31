import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  meta?: any;
}

export class ApiResponse {
  static success<T>(res: Response, data?: T, message = 'Operation successful', statusCode = 200, meta?: any) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  static error(res: Response, message = 'Internal Server Error', statusCode = 500, error?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
}
