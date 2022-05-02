FROM node:16

ENV CONTAINER_USER=container

RUN apt-get update
RUN apt-get install -y cron

WORKDIR /app

COPY package.json package-lock.json /app/

RUN set -ex \
	&& addgroup --gid 99 $CONTAINER_USER \
	&& adduser -S -D -H -s /sbin/nologin -u 99 -G $CONTAINER_USER $CONTAINER_USER \
	&& npm install --quiet --loglevel=error --production \
	&& rm -rf /root/.npm \
	&& rm -rf /root/.node-gyp \
	&& mkdir -p /scaninput \
	&& chmod 0644 /scaninput \
	&& touch /var/log/cron.log

COPY index.js /app/index.js

RUN crontab -l | { cat; echo "* * * * * /usr/local/bin/node /app/index.js"; } | crontab -

CMD cron && tail -f /var/log/cron.log
