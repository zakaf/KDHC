#!/bin/bash

today=`date '+%Y%m%d'`;

while true; do
    /home/ubuntu/.local/bin/scrapy crawl news -a config=../kdhc.settings.json >> ../logs/$today.log 2>&1
    sleep 10
done
