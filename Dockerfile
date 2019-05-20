FROM node

COPY . /dist
WORKDIR ./dist

# SET PORT AND EXPOSE
ARG PORT=5000
ENV PORT $PORT
EXPOSE $PORT

CMD ["node", "."]