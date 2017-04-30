FROM node:6.6.0

COPY . /starter
ADD package.json /starter/package.json
RUN cd /starter && npm install  # && cp -a /starter/node_modules /starter
COPY .env.example /starter/.env.example
COPY .env /starter/.env

WORKDIR /starter

# RUN npm install
# RUN npm install node-fetch --save

CMD ["npm","start"]

EXPOSE 8888