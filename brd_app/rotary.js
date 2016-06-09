var Rotary = require('jsupm_rotaryencoder'),
	config = require('./config'),
	EventEmitter = require('events').EventEmitter,
	encoder = new Rotary.RotaryEncoder(2, 3); // d2, d3

module.exports = new EventEmitter;

var pos = 0;

setInterval(function() {
	var p = encoder.position();
	if (p !== pos) {
		pos = p;
		module.exports.emit('newValue', p);
	}

}, config.defaultInterval);