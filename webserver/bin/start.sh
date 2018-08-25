#!/bin/bash

today=`date '+%Y%m%d'`;

. /home/ubuntu/.nvm/nvm.sh

npm install --production

npm start >> ../logs/$today.log 2>&1
