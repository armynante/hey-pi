import Mongo from '../server.js';
import config from '../config.js';
import bcrypt from 'bcrypt';
import utilities from '../utilities.js';
import jwt from 'jsonwebtoken';

var now = new Date();

export class User() {
  constructor(email) {
    this.name = name;
    this.email = email;
    this.password = '';
    this.numCollections = 0;
    this.numCollections = 0;
    this.createdOn = now;
  }

  save() {
    Mongo._save('users',this).then((savedUser) => {
      //if the user is created assign a token
      var token = jwt.sign(savedUser, config.secret, {
        expiresInMinutes: 1440 //24r
      });
      // remover clear text pass
      delete savedUser['pass'];
      savedUser['token'] = token;
      resolve({code: 201, message: savedUser});
    })
  }

  setPassword(pass) {
    promise = new Promise(
      (resolve, reject) => {
        utilities.generateHash(pass).then((hash) => {
          this.password = hash;
          resolve(hash);
        })
        .catch((err) => {
          reject({code:500, message: err});
        })
      }
    )
  }
}
