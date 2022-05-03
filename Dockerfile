FROM node:16

ENV CONTAINER_USER=container

RUN apt-get update
RUN apt-get install -y cron

WORKDIR /app

COPY crontab /etc/cron.d/mail-cron
COPY package.json \
	package-lock.json \
	index.js \
	server-entrypoint.sh \
	/app/

RUN set -ex \
	&& addgroup --gid 99 $CONTAINER_USER \
	&& adduser -S -D -H -s /sbin/nologin -u 99 -G $CONTAINER_USER $CONTAINER_USER \
	&& npm install --quiet --loglevel=error --production \
	&& rm -rf /root/.npm \
	&& rm -rf /root/.node-gyp \
	&& chmod +x /app/server-entrypoint.sh \
	&& chmod 0644 /etc/cron.d/mail-cron \
	&& crontab /etc/cron.d/mail-cron \
	&& touch /var/log/cron.log

ENTRYPOINT ["./server-entrypoint.sh"]
CMD ["bash"]
