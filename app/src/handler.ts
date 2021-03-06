import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

export const sendMail: Handler = (
  event: APIGatewayEvent, 
  context: Context, 
  callback: Callback
) => {
  // リクエストボディの内容を取得
  const data = JSON.parse(event.body);

  if (!data.name) throw new Error('名前が入力されていません');

  if (!data.email) throw new Error('メールが入力されていません');

  if (!data.message) throw new Error('お問い合わせ内容が入力されていません');

  // ローカル実行用
  if (process.env.NODE_ENV) {
    console.log(event.body);
    return;
  }

  const ses = new AWS.SES({
    region: 'ap-northeast-1',
  });

  const params = {
    // FROM
    Source: data.email,
    Destination: {
      ToAddresses: [
        'powdersugar828828@gmail.com',
      ],
    },
    Message: {
      Subject: {
        Data: `カルキチブログからメッセージです ${data.name}`,
        Charset: 'utf-8',
      },
      Body: {
        Text: {
          Data: data.message,
          Charset: 'utf-8'
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
          'Access-Control-Allow-Origin': '*',
        },
        body: 'メールの送信に失敗しました'
      })
    } else {
      callback(null, {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(result)
      })
    }
  });
}
