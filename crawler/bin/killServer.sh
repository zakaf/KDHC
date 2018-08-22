#!/bin/bash

kill $(ps -eaf | grep '[/]startNewsCrawler.sh' | awk '{print $2}')
