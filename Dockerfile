FROM node

RUN mkdir /app && chown node:node /app
WORKDIR /app


COPY package.json .

RUN yarn install --prod



COPY dist .
RUN ls



# SET PORT AND EXPOSE
ARG PORT=5000
ENV PORT $PORT
EXPOSE $PORT

CMD ["node", "index.js"]
