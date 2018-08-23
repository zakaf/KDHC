const config = require('./config');
const mysql = require('mysql');

module.exports = Object.freeze({
    pool: mysql.createPool({
        host: config.database.host,
        user: config.database.id,
        password: config.database.pw,
        database: config.database.db,
        connectionLimit: 50
    }),
});