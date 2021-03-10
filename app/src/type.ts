export interface EventType {
  name: string;
  email: string;
  message: string;
  token: string;
}

export interface RecaptchaResult {
  success: boolean;
  challenge_ts: string;
  hostname: string,
  score: number,
  action: string;
}
