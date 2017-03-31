/**
 * author: Thuan Q Truong (thuantq@fsoft.com.vn)
 *
 * This is the scipt to do healthcheck for micro services.
 */

var _log = require('./logger'),
  _requert = require('request')
  ;

module.exports = function (options) {
  var self = this;

  this.healthcheck = function (health_uri) {
    return new Promise(function (resolve, reject) {
      var headers = {
        'accept': 'application/json;charset=utf-8'
      };
     
      var options = {
        url: health_uri,
        headers: headers
      };
      _requert.get(options, function (err, res, body) {
        if (err)  
        {
            _log.error("Healthcheck failed, uri = " + health_uri);
            _log.error("Response: " + JSON.stringify(res));
            return reject(err);
        }
        if (res.statusCode >= 200 && res.statusCode < 400) {
          return resolve(JSON.parse(body));
        }
        _log.error("Healthcheck failed, uri = " + health_uri);
        _log.error("Response: " + JSON.stringify(res));
        return reject("");
      });
    });
  };

  return this;
}
