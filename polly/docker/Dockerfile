FROM node:6.9.2

EXPOSE 8443

ENV AWS_ACCESS_KEY_ID="aws-access-key-id" AWS_SECRET_ACCESS_KEY="aws-secret-access-key"

WORKDIR /server

COPY ./server.js /server/
COPY ./package.json /server/

# Only contents of source folder is copied
COPY ./certs/ /server/certs/

RUN npm install

CMD ["node","server.js"]