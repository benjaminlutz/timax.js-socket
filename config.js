'use strict';

var config = {
    mubsub: 'mongodb://localhost:27017/mubsub',
    port: 7777,
    jwtSecret: 'pL3aS3_ChAnG3_M3!',
    logger: {
        name: 'timax.js-soket',
        streams: [
            {
                level: 'info',
                stream: process.stdout
            },
            {
                level: 'error',
                path: 'timax.js-socket-error.log'
            }
        ]
    }
};

module.exports = config;