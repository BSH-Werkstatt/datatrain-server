FROM node

RUN mkdir /app && chown node:node /app
WORKDIR /app


COPY package.json .

RUN yarn install --prod



COPY dist .
RUN ls



CMD ["node", "index.js"]
