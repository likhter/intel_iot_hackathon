var sockets = require('ws'),
    EventEmitter = require('events').EventEmitter,
    config = require('./config'),
    ids = require('./ids'),
    logger = require('log4js').getLogger('comm'),
    comm;

module.exports = comm = new EventEmitter;

comm.send = function(msg) {
    if (!msg.requestId) {
        msg.requestId = ids.generateId();
    }
    ws.send(JSON.stringify(msg));
};

var ws = new sockets(config.wsHost);

ws.on('open', function() {
    logger.debug('ws connected');
    comm.send({ type: 'GET_ROOM_LIST' });
});
ws.on('message', function(msg) {
    logger.debug('Got message=', msg);
    var decoded = JSON.parse(msg);
    if (decoded.type) comm.emit(decoded.type, decoded);
});
ws.on('close', function() {
    logger.error('ws closed connection')
    comm.emit('DISCONNECTED');
});
ws.on('error', function() {
    logger.fatal('ws error', arguments);
    comm.emit('DISCONNECTED');
});


