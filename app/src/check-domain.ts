const PROD_ORIGIN = 'https://karukichi-blog.netlify.app';
const STG_ORIGIN = 'https://staging--karukichi-blog.netlify.app';

export const checkDomain = (origin: string) => {
  if (origin === PROD_ORIGIN) return true;
  if (origin === STG_ORIGIN) return true;

  return false;
}
