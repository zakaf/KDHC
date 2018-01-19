const mysql = require('mysql');

const env = process.env.NODE_ENV || 'development';
const config = require('../../dongkeun.config')[env];

module.exports = Object.freeze({
    pool: mysql.createPool({
        host: config.database.host,
        user: config.database.id,
        password: config.database.pw,
        database: config.database.db,
        connectionLimit: 50
    }),
});