#!/usr/bin/env bash

declare -p | grep "EMAIL_" > /container.env

crond && tail -f /var/log/cron.log
