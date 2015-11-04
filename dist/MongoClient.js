"use strict";

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _utilitiesJs = require('./utilities.js');

var _utilitiesJs2 = _interopRequireDefault(_utilitiesJs);

var _collectionUtilJs = require('./collectionUtil.js');

var _collectionUtilJs2 = _interopRequireDefault(_collectionUtilJs);

var Mongo = require("mongodb").MongoClient;
var _ = require("underscore");

var MongoClient = (function (_Mongo) {
  _inherits(MongoClient, _Mongo);

  function MongoClient() {
    _classCallCheck(this, MongoClient);

    _get(Object.getPrototypeOf(MongoClient.prototype), 'constructor', this).call(this);
    this.db = null;
  }

  _createClass(MongoClient, [{
    key: '_dbConnect',
    value: function _dbConnect(url) {
      var _this = this;
      Mongo.connect(url, function (err, db) {
        if (err) throw err;
        db.collection('users').ensureIndex({ "email": 1 }, { unique: true });
        _this.db = db;
      });
    }
  }, {
    key: '_loadCollection',
    value: function _loadCollection(name) {
      var _this2 = this;

      var promise = new Promise(function (resolve, reject) {
        _this2.db.collection(name, function (err, collection) {
          if (err) reject(err);else resolve(collection);
        });
      });
      return promise;
    }
  }, {
    key: '_save',
    value: function _save(name, obj) {
      var _this3 = this;

      var promise = new Promise(function (reject, resolve) {
        _this3.db.collection(name).insertOne(obj, { unique: true }, function (resp) {
          //check for duplicate entry
          resp.code === 11000 ? reject(resp) : resolve(resp);
        })['catch'](function (err) {
          console.log(err);
        });
      });
      return promise;
    }
  }, {
    key: '_getData',
    value: function _getData(path) {
      var _this4 = this;

      var promise = new Promise(function (resolve, reject) {

        _this4._propagateQuery(path).then(function (resolveObj) {
          var collection = resolveObj.collection;
          var mongoQuery = resolveObj.mongoQuery;

          collection.find(mongoQuery).toArray(function (err, docs) {

            console.log(err);
            docs = docs;

            if (err) reject({
              "code": 500,
              "body": err
            });

            var responseData = {
              "code": 200,
              "body": docs
            };
            resolve(responseData);
          });
        }, function (err) {
          var responseData = {
            "code": 500,
            "body": err
          };
          reject(responseData);
        });
      });
      return promise;
    }
  }, {
    key: 'delData',
    value: function delData(path) {

      var promise = new Promise(function (resolve, reject) {

        propagateQuery(path).then(function (resolveObj) {
          var collection = resolveObj.collection;
          var mongoQuery = resolveObj.mongoQuery;

          collection.deleteMany(mongoQuery, function (err, result) {
            if (err) reject({
              "code": 500,
              "body": err
            });

            var numDocsDeleted = result.deletedCount;
            var responseData = {
              "code": 200,
              "body": "Deleteted " + numDocsDeleted + " documents."
            };
            resolve(responseData);
          });
        }, function (err) {
          var responseData = {
            "code": 500,
            "body": err
          };
          reject(responseData);
        });
      });
      return promise;
    }
  }, {
    key: '_propagateQuery',
    value: function _propagateQuery(path) {
      var _this5 = this;

      var pathArray = [];
      if (path.length % 2 === 1) path.push("");

      // load client
      var promise = new Promise(function (resolve, reject) {

        for (var i = 0; i < path.length; i += 2) {
          pathArray.push([path[i], path[i + 1]]);
        }

        var chain = pathArray.reduce(function (previous, item, index, array) {

          return previous.then(function (result) {
            var collectionName = item[0];
            var query = item[1];

            var mongoQuery = _utilitiesJs2['default'].parseQuery(query);

            if (mongoQuery === null) {
              reject("bad request");
            }

            mongoQuery = _.extend(mongoQuery, result.fkQuery);

            var promise = new Promise(function (resolve, reject) {
              _this5._loadCollection(collectionName).then(function (collection) {
                if (index !== pathArray.length - 1) {
                  var cursor = collection.find(mongoQuery);

                  cursor.toArray(function (err, docs) {
                    if (err) {
                      reject(err);
                    } else {
                      var keys = _.pluck(docs, "_id");

                      for (var i = 0; i < keys.length; i++) {
                        keys[i] = keys[i].toString();
                      };

                      var fkFieldName = collectionName + "id";
                      var fkQuery = {};
                      fkQuery[fkFieldName] = {
                        $in: keys
                      };
                      resolve({
                        doc: docs,
                        fkQuery: fkQuery
                      });
                    }
                  });
                } else {
                  var resolveObj = {};
                  resolveObj["collection"] = collection;
                  resolveObj["mongoQuery"] = mongoQuery;
                  resolve(resolveObj);
                }
              });
            });
            return promise;
          });
        }, new Promise(function (resolve, reject) {
          //initial value given to reduce
          var result = {};
          result["fkQuery"] = {};
          resolve(result);
        }));

        chain.then(function (cursor) {
          //var responseData = {"code": 200, "body": result.doc};
          resolve(cursor);
        }, function (err) {
          console.log('got into error clause after chain is finished' + err);
          //var responseData = {"code": 500, "body": err};
          reject(err);
        });
      });
      return promise;
    }
  }, {
    key: 'updateData',
    value: function updateData(path, data) {

      var collectionName = path[0];

      var promise = new Promise(function (resolve, reject) {

        DBClient.connect(url).then(function (db) {
          DBClient.setDB(db);
          return DBClient._loadCollection(collectionName);
        }).then(function (collection) {
          console.log('loading collection');
          return updateDataHelper(collection);
        }).then(function (response) {

          var modifiedCount = response.result.modifiedCount;

          if (modifiedCount > 0) {

            var responseData = {
              "code": 200,
              "body": "Updated " + modifiedCount + " documents"
            };
          } else {

            var responseData = {
              "code": 204,
              "body": "No documents updated :("
            };
          }
          resolve(responseData);
        }, function (err) {
          var responseData = {
            "code": 500,
            "body": err.message
          };
          console.log("response data is: " + responseData);
          resolve(responseData);
        });
      });

      return promise;

      function updateDataHelper(collection) {
        // remove id field from obj
        delete data["id"];

        if (path.length > 1) {
          var mongoQuery = _utilitiesJs2['default'].parseQuery(path[1]);
        }

        if (path.length == 2) {
          //TODO: need to take this out into its own function!!!

          var promise = new Promise(function (resolve, reject) {

            _collectionUtilJs2['default'].updateOne(collection, mongoQuery, data).then(function (result) {

              resolve(result);
            }, function (err) {
              console.log(err);
              reject(err);
            });
          });
          return promise;
        }
      }
    }
  }, {
    key: 'saveData',
    value: function saveData(path, data, update) {

      var collectionName = path[0];

      var promise = new Promise(function (resolve, reject) {

        DBClient.connect(url).then(function (db) {
          DBClient.setDB(db);
          return DBClient._loadCollection(collectionName);
        }).then(function (collection) {
          console.log('loading collection');

          return saveDataHelper(collection);
        }).then(function (docs) {

          docs = _utilitiesJs2['default'].sanitizeId(docs);
          var responseData = {
            "code": 201,
            "body": docs
          };
          resolve(responseData);
        }, function (err) {

          var responseData = {
            "code": 500,
            "body": err.message
          };
          console.log("response data is: " + responseData);
          resolve(responseData);
        });
      });

      return promise;

      function saveDataHelper(collection) {

        if (path.length > 1) {
          var mongoQuery = _utilitiesJs2['default'].parseQuery(path[1]);
        }

        if (path.length === 1) {
          var promise = new Promise(function (resolve, reject) {
            collection.insertOne(data, function (err, result) {
              if (err) {
                reject(err);
              } else {
                resolve(result.ops[0]);
              }
            });
          });
          return promise;
        } else if (path.length == 2) {
          //TODO: need to take this out into its own function!!!

          var promise = new Promise(function (resolve, reject) {
            _collectionUtilJs2['default'].updateOne(collection, mongoQuery, data).then(function (result) {
              resolve(result);
            }, function (err) {
              reject(err);
            });
          });
          return promise;
        } else if (path.length === 3) {
          var collectionToAddTo = path[2];
          var parentID;

          var promise = new Promise(function (resolve, reject) {
            _collectionUtilJs2['default'].findOne(collection, mongoQuery).then(function (doc) {
              parentID = doc._id.toString();
              return DBClient._loadCollection(collectionToAddTo);
            }).then(function (collectionToAddToObj) {
              var obj = {};
              var keyName = collectionName + "id";
              obj[keyName] = parentID;
              data = _.extend(data, obj);
              return _collectionUtilJs2['default'].insertOne(collectionToAddToObj, data);
            }).then(function (result) {
              resolve(result.ops[0]);
            }, function (err) {
              reject(err);
            });
          });
          return promise;
        }
      }
    }
  }]);

  return MongoClient;
})(Mongo);

exports.MongoClient = MongoClient;
;
//# sourceMappingURL=MongoClient.js.map