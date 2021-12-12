FROM node:16-alpine

# 環境変数の設定
ARG AWS_ACCESS_KEY
ARG AWS_SECRET_KEY

RUN apk update

RUN apk add nodejs

RUN npm install -g serverless

ENV NODE_PATH /usr/local/lib/node_modules

RUN serverless config credentials --provider aws --key $AWS_ACCESS_KEY --secret $AWS_SECRET_KEY

WORKDIR /app
