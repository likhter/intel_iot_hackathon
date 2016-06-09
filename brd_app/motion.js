var mraa = require('mraa'),
	EventEmitter = require('events').EventEmitter,
	config = require('./config'),
	motionSensor = new mraa.Gpio(5); // d5

module.exports = new EventEmitter;

var oldVal = 0;
setInterval(function() {
	var val = motionSensor.read();
	if (val === 1 && oldVal === 0) {
		module.exports.emit('motion');
		oldVal = 1;
	}
	if (val === 0 && oldVal === 1) {
		module.exports.emit('nomotion');
		oldVal = 0;
	}
}, config.defaultInterval)