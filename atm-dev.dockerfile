FROM node:8.11

WORKDIR /src

# use changes to package.json to force Docker not to use the cache
# when we change our application's dependencies:
ADD package.json /tmp/package.json
RUN cd /tmp && npm i
RUN mkdir -p /src && cp -a /tmp/node_modules /src

ADD . /src

CMD ["npm", "run", "dev"]
