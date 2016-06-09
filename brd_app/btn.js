var grove = require('jsupm_grove'),
	config = require('./config'),
	btn = new grove.GroveButton(8), // d8
	EventEmitter = require('events').EventEmitter;


module.exports = new EventEmitter();


var oldVal = 0;
setInterval(function() {
	var val = btn.value();
	if (val == 1 && oldVal == 0) {
		oldVal = 1;
		module.exports.emit('click');
	}

	if (oldVal == 1 && val == 0) {
		// unpush, do nothing
		oldVal = 0;
	}

}, config.defaultInterval);