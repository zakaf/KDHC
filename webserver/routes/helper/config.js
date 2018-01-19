const env = process.env.NODE_ENV || 'development';
const config = require('../../dongkeun.config')[env];

module.exports = config;