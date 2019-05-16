const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.File({
      filename: './Config/logs/error.log',
      level: 'error'
    }),
    new transports.File({ filename: './Config/logs/combined.log', level: 'info' }),
    new transports.File({ filename: './Config/logs/debug.log', level: 'debug' })
  ],
  exceptionHandlers: [
    new transports.File({ filename: './Config/logs/exceptions.log' })
  ],
  exitOnError: false
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    })
  );
}

module.exports = logger;
