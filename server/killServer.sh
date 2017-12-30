#!/bin/bash

kill $(ps -eaf | grep '[/]bin/bash ./startNewsCrawler.sh' | awk '{print $2}')
