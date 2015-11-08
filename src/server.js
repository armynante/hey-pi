"use strict";

import { MongoClient } from './MongoClient.js';
import config from './config.js';
import bcrypt from 'bcrypt';
import collectionUtil from './collectionUtil.js';
import utilities from './utilities.js';
import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import morgan from 'morgan';

//routers
import auth from './routes/auth.js';
import register from './routes/register.js';
import api from './routes/api.js';

//initialize express:
var app = express();

//load the database
var Mongo = new MongoClient();
export default Mongo;
Mongo._dbConnect(config.mongoUrl);

//setiings
app.use(morgan('dev')); //logging
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//middleware
var urlStrip = function(req, res, next) {
	var path = utilities.stripPath(req.url);
	req.strip_path = path;
	next();
};

var checkAuth = function(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (token) {
		jwt.verify(token, config.secret, (err,valid) => {
			if (err) {
				res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
			} else {
				req.authorized = valid;
			}
		});
	} else {
		res.status(401).json({ success: false, message: 'Failed to provide authentication token.' });
	}
	next();
}

//pre-auth routes
app.use('/register', register)
app.use('/authorize', auth);

//check authentication before proceeding to api
app.use(checkAuth);

//strip path
app.use(urlStrip);

//api routes
app.use('/api', api);




var server = app.listen(config.port, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Listening at http://%s:%s', host, port);
});
