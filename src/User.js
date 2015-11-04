import { MongoClient } from './MongoClient.js';
import utilities from './utilities.js';

export class UserModel  {

  constructor(obj) {
    this.email = '';
    this.pass = '';
  }

  create(obj) {
    var promise = new Promise(
      (resolve, reject) => {
        utilities.generateHash(obj.pass).then((hash) => {
        this.pass = hash;
        this.email = obj.email;
        resolve(this);
      })
      .catch((err) => {
        reject(err);
      });
    });
    return promise;
  }
}
