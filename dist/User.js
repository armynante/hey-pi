'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _MongoClientJs = require('./MongoClient.js');

var _utilitiesJs = require('./utilities.js');

var _utilitiesJs2 = _interopRequireDefault(_utilitiesJs);

var UserModel = (function () {
  function UserModel(obj) {
    _classCallCheck(this, UserModel);

    this.email = '';
    this.pass = '';
  }

  _createClass(UserModel, [{
    key: 'create',
    value: function create(obj) {
      var _this = this;

      var promise = new Promise(function (resolve, reject) {
        _utilitiesJs2['default'].generateHash(obj.pass).then(function (hash) {
          _this.pass = hash;
          _this.email = obj.email;
          resolve(_this);
        })['catch'](function (err) {
          reject(err);
        });
      });
      return promise;
    }
  }]);

  return UserModel;
})();

exports.UserModel = UserModel;
//# sourceMappingURL=User.js.map