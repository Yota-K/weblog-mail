import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import fetch from 'node-fetch';
import libmime from 'libmime';
import * as AWS from 'aws-sdk';
import { ALLOWED_ORIGINS } from './allow-origins';
import { mailTemplate } from './mail-template';
import { generateResponseHeader } from './respons-header';
import { EventType, RecaptchaResult, RequestHeaders } from './type';

require('dotenv').config();

export const sendMail: Handler = async (
  event: APIGatewayEvent, 
  context: Context, 
  callback: Callback
) => {
  // リクエストボディの内容を取得
  const { name, email, message, token }: EventType = JSON.parse(event.body);

  console.log(event.body);

  if (!name) {
    throw new Error('名前が入力されていません');
  } else if (!email) {
    throw new Error('メールが入力されていません');
  } else if (!message) {
    throw new Error('お問い合わせ内容が入力されていません');
  }

  // オリジンを取得
  const origin = event.headers.origin;
  let headers: RequestHeaders;

  if (ALLOWED_ORIGINS.includes(origin)) {
    headers = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': true,
    };
  } else {
    headers = {
      'Access-Control-Allow-Origin': '*',
    };
  }

  console.info(`APIが実行されたオリジンは、${origin}です`);

  // Recaptchaによるチェックの実施
  const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${process.env.RECAPTCHA_KEY}&response=${token}`,
  });

  const recaptchaResult: RecaptchaResult = await recaptchaRes.json();

  // Recaptchaによるチェックが失敗した場合はエラーコードを返す
  const hostname = origin.replace(/https:\/\//, '');

  if (!recaptchaResult.success || recaptchaResult.hostname !== hostname || recaptchaResult.score < 0.5) {
    callback(null, generateResponseHeader(400, headers, '不正なリクエストが送信されました'));
  }

  const ses = new AWS.SES({
    region: 'ap-northeast-1',
  });

  // メールを送る処理
  try {
    // 許可されていないオリジンからリクエストが送られたらメールを送信しない
    if (!ALLOWED_ORIGINS.includes(origin)) {
      callback(
        null, 
        generateResponseHeader(403, headers, '許可されていないオリジンからリクエストが送信されました')
      );
    } else {
      await ses.sendEmail({
        // メールの送信元
        // 認証されたメールアドレスからしかメールを送信することはできない
        // libmime・・・送信者名が日本語の場合は文字化け回避のためMIMEエンコードを実施する
        Source: `${libmime.encodeWord('カルキチブログ', 'Q')} <powdersugar828828@gmail.com>`,
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

      callback(null, generateResponseHeader(200, headers, 'メールの送信に成功しました'));
    }
  } catch (er) {
    console.error(er);

    callback(null, generateResponseHeader(500, headers, 'メールの送信に失敗しました'));
  }
}
