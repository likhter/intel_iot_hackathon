var uuid = require('node-uuid');

module.exports = {
	generateId: function() {
		return uuid.v4();
	}
};