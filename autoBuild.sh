#! /bin/bash
SITE_PATH='/var/www/html/autoBuild'
USER='root'

cd $SITE_PATH
git reset --hard origin/master
git clean -f
git pull
npm i
npm start

chown -R $USER $SITE_PATH