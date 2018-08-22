#!/bin/bash

kill $(ps aux | grep '[n]ode routes/index.js' | awk '{print $2}')
