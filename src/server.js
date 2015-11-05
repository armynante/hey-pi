"use strict";

import { MongoClient } from './MongoClient.js';
import collectionUtil from './collectionUtil.js';
import utilities from './utilities.js';
import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import bcrypt from 'bcrypt';

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

var checkAuth = function(req, res, next) {
	console.log("in check auth");
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (token) {
		jwt.verify(token, secret, (err,valid) => {
			if (err) {
				res.json({ success: false, message: 'Failed to authenticate token.' });
			} else {
				req.authorized = valid;
			}
		});
	} else {
		res.json({ success: false, message: 'Failed to provide authentication token.' });
	}
	next();
}

app.route('/register/:email/:pass')

.post((req,res) => {
	var user = { email: req.params.email, pass: req.params.pass};

	// save the user
	utilities.generateHash(user.pass).then((hash) => {
		user.pass = hash;
		return Mongo._save('users',user);
	})
	.then((savedUser) => {
		//if the user is created assign a token
		var token = jwt.sign(savedUser, secret, {
			expiresInMinutes: 1440 //24r
		});

		// remover clear text pass
		delete savedUser['pass'];
		savedUser['token'] = token;
		res.json(savedUser);
	})
	.catch((err) => {
		res.json(err);
	})
});

app.route('/authorize')

.post((req,res) => {
	var email = req.body.email || req.query.email;
	var pass = req.body.pass || req.query.pass;

	var user = { "email": email, "pass": pass};
	//find user and test pass
	Mongo._getData(['users','email_is_' + email]).then((resp) => {
		//if we get a match
		if (resp.body.length) {
			var user = resp.body[0];
			//test the password
			bcrypt.compare(pass, user.pass, (err,valid) => {

				if(valid) {
					var token = jwt.sign(user, secret, {
						expiresInMinutes: 1440 //24r
					});

					user['token'] = token;
					delete user['pass'];
					user['authorized'] = true;
					res.json(user);

				} else {
					res.json({success: false, message:"password incorrect"});
				}

			});
		} else {
			res.json({success: false, message:"no user found with that email"});
		}
	})
	.catch((err) => {
		debugger;
	});
});

//Check authentication before proceeding to api
app.use(checkAuth);

//strip path
app.use(urlStrip);

//api routes
app.route('/api/*')
	.get((req, res) => {
		console.log("getting here");
		Mongo._getData(req.strip_path).then((data) => {
			res.json(data);
		})
		.catch((err) => {
			console.log(err);
		});
	});



var server = app.listen(3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Listening at http://%s:%s', host, port);
});
