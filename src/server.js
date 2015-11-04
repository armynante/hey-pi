"use strict";

import { MongoClient } from './MongoClient.js';

import collectionUtil from './collectionUtil.js';
import utilities from './utilities.js';

const express = require("express");
const url = 'mongodb://localhost:27017/hey-pi';

var Mongo = new MongoClient();

//INTIALIZE EXPRESS:
var app = express();

//LOAD THE DATABASE
Mongo.dbConnect(url);

var urlStrip = function(req, res, next) {
	var path = utilities.stripPath(req.url);
	req.strip_path = path;
	next();
};

//strip path
app.use(urlStrip);

app.route('/api/*')
	.get((req, res) => {
		Mongo._getData(req.strip_path).then((data) => {
			debugger;
			// resp.send(data);
		});
	});



var server = app.listen(3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Listening at http://%s:%s', host, port);
});
