import express from 'express'
import Mongo from '../server.js';
import config from '../config.js';
import utilities from '../utilities.js';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

var router = express.Router();

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

router.post('/',(req,res) => {
  var user = new User(req.body.email);
  user.setPassword(req.body.pass).then( ()=> {
    return user.save();
  })
	.then((resp) => {
     res.status(resp.code).json(resp.message);
  })
	.catch((err) => {
		res.status(err.code).json(err.message);
	})
})

router.post('/:email/:pass',(req,res) => {
	var user = { email: req.params.email, pass: req.params.pass};
	// save the user
  registerUser(user).then((resp) => {
    res.status(resp.code).json(resp.message);
  })
 .catch((err) => {
   res.status(err.code).json(err.body.message);
 })
})


export default router
