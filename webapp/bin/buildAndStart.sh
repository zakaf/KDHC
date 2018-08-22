#!/bin/bash

today=`date '+%Y%m%d'`;

. /home/ubuntu/.nvm/nvm.sh

npm install --production

npm run-script build

serve -s build -p 3000
