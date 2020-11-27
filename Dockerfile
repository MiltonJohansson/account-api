FROM node:14-alpine
ARG NPM_TOKEN

WORKDIR /usr/app

COPY .prettierignore jest.config.js package.json tsconfig.json tslint.json yarn.lock .yarnrc ./
COPY .yarn .yarn
COPY src src
RUN yarn install
RUN rm -f .npmrc

CMD [ "yarn", "run", "start" ]
