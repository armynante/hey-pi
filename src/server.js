"use strict";

import { MongoClient } from './MongoClient.js';
import { UserModel } from './User.js';

import collectionUtil from './collectionUtil.js';
import utilities from './utilities.js';
import express from 'express';
import jwt from 'json-web-token';
import bodyParser from 'body-parser';
import morgan from 'morgan';

const url = 'mongodb://localhost:27017/hey-pi';
const secret = 'SUPERCEREALGUYS';

var Mongo = new MongoClient();

//INTIALIZE EXPRESS:
var app = express();

//LOAD THE DATABASE
Mongo._dbConnect(url);

//SETUP
app.use(morgan('dev')); //logging
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var urlStrip = function(req, res, next) {
	var path = utilities.stripPath(req.url);
	req.strip_path = path;
	next();
};

// var checkAuth = function(req, res, next) {
//
// }

app.route('/register/:email/:pass')

.post((req,res) => {
	var email = req.params.email;
	var pass = req.params.pass;
	var User = new UserModel();

	User.create({email: email, pass: pass }).then((userObj) => {
		return Mongo._save('users',userObj);
	})
	.then((user) => {
		res.json(user);
	})
	.catch((err) => {
		res.json({message: "user looks like it already exists"});
	})
});

app.route('/authorize')

.get((req,res) => {

})

//Check authentication before proceeding to api
// app.use(checkAuth);

//strip path
app.use(urlStrip);

//api routes
app.route('/api/*')
	.get((req, res) => {
		Mongo._getData(req.strip_path).then((data) => {
			res.json(data);
		});
	});



var server = app.listen(3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Listening at http://%s:%s', host, port);
});
