export const mailTemplate = (name: string, email: string, message: string) => {
const body = `<html>
<body>
  <p>カルキチブログのお問い合わせフォームからメッセージが送信されました。</p>
  <p>名前</p>
  <p>${name}</p>
  <p>メールアドレス</p>
  <p>${email}</p>
  <p>お問い合わせ内容</p>
  <p>${message}</p>
</body>
</html>`;

return body;
}
