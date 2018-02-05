const env = process.env.NODE_ENV || 'development';
let config;

if (env === 'test')
    config = require('../../sample.config')[env];
else
    config = require('../../dongkeun.config')[env];

module.exports = config;