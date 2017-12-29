#!/bin/bash

today=`date '+%Y%m%d'`;

npm install

npm run-script build

serve -s build -p 3000 > logs/$today.log 2>&1 &