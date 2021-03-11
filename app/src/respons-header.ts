export const generateResponseHeader = (
  statusCode: number, 
  headers: any,
  message: string,
) => {
  return {
    statusCode: statusCode,
    headers: headers,
    body: message,
  }
}
