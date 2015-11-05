"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _MongoClientJs = require('./MongoClient.js');

var _collectionUtilJs = require('./collectionUtil.js');

var _collectionUtilJs2 = _interopRequireDefault(_collectionUtilJs);

var _utilitiesJs = require('./utilities.js');

var _utilitiesJs2 = _interopRequireDefault(_utilitiesJs);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var url = 'mongodb://localhost:27017/hey-pi';
var secret = 'SUPERCEREALGUYS';

var Mongo = new _MongoClientJs.MongoClient();

//INTIALIZE EXPRESS:
var app = (0, _express2['default'])();

//LOAD THE DATABASE
Mongo._dbConnect(url);

//SETUP
app.use((0, _morgan2['default'])('dev')); //logging
app.use(_bodyParser2['default'].urlencoded({ extended: false }));
app.use(_bodyParser2['default'].json());

var urlStrip = function urlStrip(req, res, next) {
	var path = _utilitiesJs2['default'].stripPath(req.url);
	req.strip_path = path;
	next();
};

var checkAuth = function checkAuth(req, res, next) {
	console.log("in check auth");
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (token) {
		_jsonwebtoken2['default'].verify(token, secret, function (err, valid) {
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
};

app.route('/register/:email/:pass').post(function (req, res) {
	var user = { email: req.params.email, pass: req.params.pass };

	// save the user
	_utilitiesJs2['default'].generateHash(user.pass).then(function (hash) {
		user.pass = hash;
		return Mongo._save('users', user);
	}).then(function (savedUser) {
		//if the user is created assign a token
		var token = _jsonwebtoken2['default'].sign(savedUser, secret, {
			expiresInMinutes: 1440 //24r
		});

		// remover clear text pass
		delete savedUser['pass'];
		savedUser['token'] = token;
		res.json(savedUser);
	})['catch'](function (err) {
		res.json(err);
	});
});

app.route('/authorize').post(function (req, res) {
	var email = req.body.email || req.query.email;
	var pass = req.body.pass || req.query.pass;

	var user = { "email": email, "pass": pass };
	//find user and test pass
	Mongo._getData(['users', 'email_is_' + email]).then(function (resp) {
		//if we get a match
		if (resp.body.length) {
			var user = resp.body[0];
			//test the password
			_bcrypt2['default'].compare(pass, user.pass, function (err, valid) {

				if (valid) {
					var token = _jsonwebtoken2['default'].sign(user, secret, {
						expiresInMinutes: 1440 //24r
					});

					user['token'] = token;
					delete user['pass'];
					user['authorized'] = true;
					res.json(user);
				} else {
					res.json({ success: false, message: "password incorrect" });
				}
			});
		} else {
			res.json({ success: false, message: "no user found with that email" });
		}
	})['catch'](function (err) {
		debugger;
	});
});

//Check authentication before proceeding to api
app.use(checkAuth);

//strip path
app.use(urlStrip);

//api routes
app.route('/api/*').get(function (req, res) {
	console.log("getting here");
	Mongo._getData(req.strip_path).then(function (data) {
		res.json(data);
	})['catch'](function (err) {
		console.log(err);
	});
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Listening at http://%s:%s', host, port);
});
//# sourceMappingURL=server.js.map