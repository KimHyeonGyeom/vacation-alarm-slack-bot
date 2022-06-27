FROM node:14.19-alpine3.14

RUN mkdir -p /app
WORKDIR /app

ADD . /app
RUN npm install

CMD ["node", "src/app.js"]