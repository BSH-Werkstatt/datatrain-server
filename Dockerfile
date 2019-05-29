FROM node

RUN mkdir /app && chown node:node /app
WORKDIR /app


COPY package.json .

RUN yarn install --prod
RUN yarn global add swagger
RUN yarn global add tsoa


COPY dist .
RUN ls



CMD ["node", "index.js"]
