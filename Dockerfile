FROM node:19

WORKDIR /root/app

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "npm", "run", "prod" ]