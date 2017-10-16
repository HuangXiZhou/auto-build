#! /bin/bash
git reset --hard origin/master
git clean -f
git pull
npm start
