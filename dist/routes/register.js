'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _serverJs = require('../server.js');

var _serverJs2 = _interopRequireDefault(_serverJs);

var _configJs = require('../config.js');

var _configJs2 = _interopRequireDefault(_configJs);

var _utilitiesJs = require('../utilities.js');

var _utilitiesJs2 = _interopRequireDefault(_utilitiesJs);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var router = _express2['default'].Router();

// var registerUser = function(user) {
// 	// save the user
//   var promise = new Promise(
//     (resolve, reject) => {
//     	utilities.generateHash(user.pass).then((hash) => {
//     		user.pass = hash;
//     		return Mongo._save('users',user);
//     	})
//     	.then((savedUser) => {
//     		//if the user is created assign a token
//     		var token = jwt.sign(savedUser, config.secret, {
//     			expiresInMinutes: 1440 //24r
//     		});
//     		// remover clear text pass
//     		delete savedUser['pass'];
//     		savedUser['token'] = token;
//     		resolve({code: 201, message: savedUser});
//       })
//       .catch((err) => {
//         reject({code:500, message: err});
//       })
//     }
//   )
//   return promise;
// }

router.post('/', function (req, res) {
  var user = new User(req.body.email);
  user.setPassword(req.body.pass).then(function () {
    return user.save();
  }).then(function (resp) {
    res.status(resp.code).json(resp.message);
  })['catch'](function (err) {
    res.status(err.code).json(err.message);
  });
});

router.post('/:email/:pass', function (req, res) {
  var user = { email: req.params.email, pass: req.params.pass };
  // save the user
  registerUser(user).then(function (resp) {
    res.status(resp.code).json(resp.message);
  })['catch'](function (err) {
    res.status(err.code).json(err.body.message);
  });
});

exports['default'] = router;
module.exports = exports['default'];
//# sourceMappingURL=register.js.map