var static = require('node-static');
var file = new static.Server('./web_app');
require('http').createServer(function(request, response) {
	request.addListener('end', function() {
		file.serve(request, response);
	}).resume();
}).listen(8081);