import express from 'express'
import Mongo from '../server.js';
import {User} from '../models/user.js';
import config from '../config.js';
import utilities from '../utilities.js';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

var router = express.Router();

router.get('/homepage/:email/:pass',(req,res) => {
  var user = new User(req.params.email);
  user.setPassword(req.params.pass).then(()=> {
    return user.save();
  })
	.then((resp) => {
    console.log(resp);
    res.render('home', {  "email":req.params.email,
                          "token":resp.message.User.token,
                       "password":"your_password",
                             "id": resp.message.User._id
                       });
  })
	.catch((err) => {
		res.status(err.code).json(err.message);
	})
});

router.post('/',(req,res) => {
  var user = new User(req.body.email);
  user.setPassword(req.body.pass).then(()=> {
    return user.save();
  })
	.then((resp) => {
     res.status(resp.code).json(resp.message);
  })
	.catch((err) => {
		res.status(err.code).json(err.message);
	})
});

router.post('/:email/:pass',(req,res) => {
	var user = { email: req.params.email, pass: req.params.pass};
  user.setPassword(req.body.pass).then(()=> {
    return user.save();
  })
	.then((resp) => {
     res.status(resp.code).json(resp.message);
  })
	.catch((err) => {
		res.status(err.code).json(err.message);
	})
});


export default router
