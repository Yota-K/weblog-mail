export const mailTemplate = (name: string, email: string, message: string) => {

// 改行コードをbrに変換
const replaceMessage = message.replace(/\n/g, '<br>');

const body = `<html>
<body>
  <p>カルキチブログのお問い合わせフォームからメッセージが送信されました。</p>
  <p>名前</p>
  <p>${name}</p>
  <p>メールアドレス</p>
  <p>${email}</p>
  <p>お問い合わせ内容</p>
  <p>${replaceMessage}</p>
</body>
</html>`;

return body;
}
