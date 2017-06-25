#!/bin/bash
mongoimport -d mspweather -c observations --type csv --file FullRecord.csv --headerline
mongo < changeStringToDate.js

