#FROM buildkite/puppeteer:7.1.0
FROM zzave/docker-puppeteer:latest

#RUN apt-get update \
#	&& apt-get install chromium chromium-codecs-ffmpeg -y \
#	&& rm -rf /var/lib/apt/lists/*

#RUN echo $(which chromium-browser) && false
# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY login.js .

#EXPOSE 8080

ENV DEBUG_COLORS=true
ENV NODE_ENV=production


USER node


CMD [ "node", "--unhandled-rejections=strict", "login.js"]