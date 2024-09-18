FROM node:18

RUN mkdir -p /usr/app/src

WORKDIR /usr/app/src

COPY package.json .

RUN npm install

COPY . .

CMD ["node", "bot.js"]