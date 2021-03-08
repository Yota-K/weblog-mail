export const generateResponseHeader = (
  statusCode: number, 
  origin: string,
  message: string,
) => {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Origin': `${origin}`,
    },
    body: message,
  }
}
