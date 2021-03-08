import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { mailTemplate } from './mail-template';
import { EventType } from './type';
import { checkDomain } from './check-domain';
import { generateResponseHeader } from './respons-header';

export const sendMail: Handler = async (
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

  const origin = event.headers['Origin'];
  
  // メールを送る処理
  try {
    // 許可されていないオリジンからリクエストが送られたらメールを送信しない
    if (!checkDomain(origin)) {
      callback(
        null, 
        generateResponseHeader(403, origin, '許可されていないオリジンからリクエストが送られました')
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
