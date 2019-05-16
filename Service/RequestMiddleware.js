const uuid = require('uuid/v1');
const log = require('../Config/winston');

module.exports = function(req, res, next) {
  const id = uuid();
  log.debug(`ID: ${id} Request ${req.method} ${req.url}, IP: ${req.ip}`);
  const reqTime = Date.now();

  res.on('finish', () => {
    log.debug(
      `ID: ${id} ${res.statusCode} ${res.statusMessage}; ${res.get(
        'Content-Length'
      ) || 0}b sent; Time: ${Date.now() - reqTime}ms`
    );
    log.debug(
      `ID: ${id} ${res.statusCode} ${res.statusMessage}; ${res.get(
        'Content-Length'
      ) || 0}b sent for Request ${req.method} ${req.url}, IP: ${
        req.ip
      } ; Time: ${Date.now() - reqTime}ms`
    );
  });

  next();
};
