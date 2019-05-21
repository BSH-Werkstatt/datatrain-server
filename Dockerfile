FROM node



COPY package.json .

RUN yarn install --prod


COPY dist .
RUN ls dist
WORKDIR /dist


# SET PORT AND EXPOSE
ARG PORT=5000
ENV PORT $PORT
EXPOSE $PORT

CMD ["node", "index.js"]
