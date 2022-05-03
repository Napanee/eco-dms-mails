FROM node:16-alpine

ENV CONTAINER_USER=container

RUN apk update \
	&& apk upgrade \
	&& apk add bash cronie

WORKDIR /app

COPY deployment/crontab /etc/crontab
COPY package.json package-lock.json index.js /app/
COPY deployment/server-entrypoint.sh /app/server-entrypoint.sh

RUN set -ex \
	&& addgroup --gid 99 $CONTAINER_USER \
	&& adduser -S -D -H -s /sbin/nologin -u 99 -G $CONTAINER_USER $CONTAINER_USER \
	&& npm install --quiet --loglevel=error --production \
	&& rm -rf /root/.npm \
	&& rm -rf /root/.node-gyp \
	&& chmod +x /app/server-entrypoint.sh \
	&& chmod +x /etc/crontab \
	&& crontab /etc/crontab \
	&& touch /var/log/cron.log

ENTRYPOINT ["./server-entrypoint.sh"]
CMD ["bash"]
