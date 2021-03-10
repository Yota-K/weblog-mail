import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import fetch from 'node-fetch';
import * as AWS from 'aws-sdk';
import { mailTemplate } from './mail-template';
import { EventType, RecaptchaResult } from './type';
import { checkDomain } from './check-domain';
import { generateResponseHeader } from './respons-header';

require('dotenv').config();

export const sendMail: Handler = async (
  event: APIGatewayEvent, 
  context: Context, 
  callback: Callback
) => {
  // オリジンを取得
  const origin = event.headers['Origin'];

  // リクエストボディの内容を取得
  const { name, email, message, token }: EventType = JSON.parse(event.body);

  const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${process.env.RECAPTCHA_KEY}&response=${token}`,
  });

  const recaptchaResult: RecaptchaResult = await recaptchaRes.json();

  if (!recaptchaResult.success) {
    callback(null, generateResponseHeader(403, origin, '不正なリクエストが送信されました'));
  }

  if (!name) {
    throw new Error('名前が入力されていません');
  } else if (!email) {
    throw new Error('メールが入力されていません');
  } else if (!message) {
    throw new Error('お問い合わせ内容が入力されていません');
  }

  const ses = new AWS.SES({
    region: 'ap-northeast-1',
  });

  // メールを送る処理
  try {
    // 許可されていないオリジンからリクエストが送られたらメールを送信しない
    if (!checkDomain(origin)) {
      callback(
        null, 
        generateResponseHeader(403, origin, '許可されていないオリジンからリクエストが送信されました')
      );
    } else {
      await ses.sendEmail({
        // メールの送信元
        // 認証されたメールアドレスからしかメールを送信することはできない
        Source: 'powdersugar828828@gmail.com',
        Destination: {
          // メールの送り先
          ToAddresses: [
            'karukichi_yah0124@icloud.com',
          ],
        },
        Message: {
          Subject: {
            Data: `カルキチブログからメッセージが送信されました`,
            Charset: 'utf-8',
          },
          Body: {
            Html: {
              Data: mailTemplate(name, email, message),
              Charset : 'utf-8',
            },
          },
        },
      })
      .promise();

      callback(null, generateResponseHeader(200, origin, 'メールの送信に成功しました'));
    }
  } catch (er) {
    console.error(er);

    callback(null, generateResponseHeader(500, origin, 'メールの送信に失敗しました'));
  }
}
