const winston = require("winston");

module.exports = function (err, req, res, next) {
  // log levels: error, warn, info, verbose, debug, silly
  winston.error(err.message, err);

  // Log the exception
  res.status(500).send("Something failed");
};
