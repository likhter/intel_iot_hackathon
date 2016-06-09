// Emulation of mobile device

var sockets = require('ws'),
	config = require('./config'),
	ids = require('./ids'),
	logger = require('log4js').getLogger('test-sender');

function s(str) {
	ws.send(JSON.stringify(str));
}

var ws = new sockets(config.wsHost);

ws.on('open', function() {
	logger.debug('ws open');
	s({
		type: 'RESERVE',
		requestId: ids.generateId(),
		name: 'Konstantin',
		room: 'Room2',
		dt: (new Date()).toISOString(),
		duration: 45
	});

	setTimeout(function() {
		s({
		type: 'RESERVE',
		requestId: ids.generateId(),
		name: 'Bob',
		room: 'Room1',
		dt: (new Date()).toISOString(),
		duration: 10
	});
	}, 5 * 1000);

	setTimeout(function() {
		s({
			type: 'SHOW_AVAILABLE',
			requestId: ids.generateId(),
			dt: (new Date()).toISOString()
		})
	}, 10 * 1000);
});

ws.on('message', function(msg) {
	var decoded;
	try {
		decoded = JSON.parse(msg);
	} catch (e) {
		logger.error('Could not parse incoming msg=', msg);
	}
	logger.debug('INCOMING MESSAGE', decoded);
})

ws.on('error', function() {
	logger.fatal('ws error', arguments);
})
