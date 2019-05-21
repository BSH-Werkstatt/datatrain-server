FROM node

COPY package.json .

RUN npm i -g yarn

RUN yarn install --prod

COPY dist .


RUN ls

# SET PORT AND EXPOSE
ARG PORT=5000
ENV PORT $PORT
EXPOSE $PORT

CMD ["node", "index.js"]
