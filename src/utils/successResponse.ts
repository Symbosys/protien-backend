import  type { Response } from "express";

interface SuccessOptions<T = unknown> {
  message?: string;
  data?: T;
  statusCode?: number;
}

/**
 * Sends a standardized success response
 * @param res Express Response object
 * @param message Optional success message
 * @param data Optional payload
 * @param statusCode 
 */
export const SuccessResponse = <T = unknown>(
  res: Response,
  message: string = "Success",
  data: T = {} as T,
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
