#FROM buildkite/puppeteer:7.1.0
FROM zzave/docker-puppeteer:latest

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY login.js .

#EXPOSE 8080

ENV DEBUG_COLORS=true
ENV NODE_ENV=production


USER node


CMD [ "node", "login.js"]