'use strict';

// require('newrelic');

var bunyan = require('bunyan'),
    express = require('express'),
    cors = require('cors'),
    config = require('./config'),
    mubsub = require('mubsub'),
    socketio = require('socket.io'),
    socketioJwt = require('socketio-jwt');

// create logger
var log = bunyan.createLogger(config.logger);

// init express
var app = express();

// configure CORS
app.use(cors());

// init mubsub client
var mubsubclient = mubsub(config.mubsub);
mubsubclient.on('connect', function () {
    log.info('Connected mubsub client to: ' + config.mubsub);
});
mubsubclient.on('error', function (err) {
    log.error(err, 'Could not connect mubsub client!');
});

// init mubsub channel
var channel = mubsubclient.channel('bookings');
channel.on('error', function (err) {
    log.error(err, 'Error on channel bookings');
});

// start http server
var server = app.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    log.info('timax.js socket server listening at http://%s:%s', host, port);
});

// init Socket.IO
var socket = socketio.listen(server);
socket.use(socketioJwt.authorize({
    secret: config.jwtSecret,
    handshake: true
}));

// init channel connection
socket.on('connection', function (socket) {
    var token = socket.decoded_token;
    log.info('Client [' + token.firstName + ' ' + token.lastName + '] with role [' + token.role + '] connected...');

    if (token.role === 'manager' || token.role === 'admin') {
        channel.subscribe('bookings', function (booking) {
            log.debug('New booking from [' + booking.user + '] on project [' + booking.project + ']');
            socket.emit('booking', booking);
        });
    } else {
        log.warn('Client [' + token.firstName + ' ' + token.lastName + '] with role [' + token.role + '] is not authorized.');
    }
});

// expose app
module.exports = app;