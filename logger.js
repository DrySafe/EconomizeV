const { createLogger, format, transports } = require('winston');
const path = require('path');

const logFilePath = path.join(__dirname, 'access.log');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'DD-MM-YYYY HH:mm:ss'
        }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new transports.File({ filename: logFilePath })
    ]
});

module.exports = logger;
