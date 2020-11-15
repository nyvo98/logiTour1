FROM gogojungle/node:10.16.0 AS builder

## current path as root
# Create app directory
WORKDIR /usr/src/app

# --no-cache: download package index on-the-fly, no need to cleanup afterwards
# --virtual: bundle packages, remove whole bundle at once, when done
COPY package.json yarn.lock ./
COPY . .
# install app dependencies
RUN yarn --prod
RUN yarn build:prod

FROM gogojungle/node:10.16.0
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules/. ./node_modules  
COPY --from=builder /usr/src/app/dist/. ./dist
COPY ./package.json ./package.json

EXPOSE 3031


CMD [ "yarn", "start:prod" ]

