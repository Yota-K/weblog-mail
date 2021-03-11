import { RequestHeaders } from './type';

export const generateResponseHeader = (
  statusCode: number, 
  headers: RequestHeaders,
  message: string,
) => {
  return {
    statusCode: statusCode,
    headers: headers,
    body: message,
  }
}
