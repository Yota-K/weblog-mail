import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { mailTemplate } from './mail-template';
import { EventType } from './type';

export const sendMail: Handler = (
  event: APIGatewayEvent, 
  context: Context, 
  callback: Callback
) => {
  // リクエストボディの内容を取得
  const { name, email, message }: EventType = JSON.parse(event.body);

  if (!name) throw new Error('名前が入力されていません');

  if (!email) throw new Error('メールが入力されていません');

  if (!message) throw new Error('お問い合わせ内容が入力されていません');

  const ses = new AWS.SES({
    region: 'ap-northeast-1',
  });

  const params = {
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
  };

  // メールを送る処理
  ses.sendEmail(params, (er, result) => {
    if (er) {
      console.error(er);

      callback(null, {
        statusCode: er.statusCode,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST'
        },
        body: 'メールの送信に失敗しました'
      })
    } else {
      callback(null, {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST'
        },
        body: JSON.stringify(result)
      })
    }
  });
}
