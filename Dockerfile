FROM node

COPY package.json .

RUN apt-get install tree

RUN npm i -g yarn

RUN yarn install --prod

COPY dist .


RUN tree

# SET PORT AND EXPOSE
ARG PORT=5000
ENV PORT $PORT
EXPOSE $PORT

CMD ["node", "index.js"]
