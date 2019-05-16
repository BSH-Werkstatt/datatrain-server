FROM node

ADD . /dist
workdir ./dist

# SET PORT AND EXPOSE
ARG PORT
ENV PORT $PORT
EXPOSE $PORT

CMD ["node", "."]
