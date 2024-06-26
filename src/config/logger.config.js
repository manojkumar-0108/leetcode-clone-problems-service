const winston = require('winston');
require('winston-mongodb');

const { LOG_DB_URL } = require('./server.config');
const { Writable } = require('stream');
const { cosmosClient } = require('../clientapis');

const allowedTransports = [];

allowedTransports.push(new winston.transports.Stream({
    stream: new Writable({
        write(chunk, encoding, callback) {
            const message = chunk.toString();
            cosmosClient.logToCosmosDB("error", message);
            callback();
        }
    })
}));

allowedTransports.push(new winston.transports.Console({
}));

allowedTransports.push(new winston.transports.MongoDB({
    level: 'error',
    db: LOG_DB_URL,
    collection: 'logs'
}))

allowedTransports.push(new winston.transports.File({
    filename: `combined.log`
}));

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(
            (log) => `\n\n${log.timestamp} [${log.level.toUpperCase()}]: \n${log.message} \n ${log.error}`
        )
    ),
    transports: allowedTransports
});

module.exports = logger;

