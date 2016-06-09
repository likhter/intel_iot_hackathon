var wsHost = 'ws://10.170.137.46:8080/',
	ws;

function viewmodel() {
	this.rooms = ko.observableArray();
	this.loadingMessage = ko.observable(null);
	this.lastClickedRoom = ko.observable(null);
	this.schedule = ko.observable(null);
	this.handleRoomClick = function(roomName) {
		_vm.loadingMessage('Loading room schedule...');
		_vm.lastClickedRoom(roomName);
		sendMessage({
			type: 'SHOW_AVAILABLE',
			requestId: 'req2',
			dt: (new Date()).toISOString()
		})
	}
	this.handleScheduleItemClick = function(opts) {
		var start = opts.start,
			duration = opts.duration;

		var duration = prompt('Enter duration in minutes', duration);
		sendMessage({
			type: 'RESERVE',
			requestId: 'req3',
			name: 'Konstantin',
			room: _vm.lastClickedRoom(),
			dt: start,
			duration: duration
		})
	}
	this.prettifyDate = function(dt) {
		var d = new Date(dt);
		var mins = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
		return (d.getMonth() +1)+ '/' + (d.getDay()) + ' ' + d.getHours() + ':' + mins;
	}
}

function sendMessage(msg) {
	ws.send(JSON.stringify(msg));
}

var eventHandlers = {
	ROOM_LIST: function(data) {
		_vm.rooms(data.list);
	},
	SHOW_AVAILABLE_RESPONSE: function(data) {
		console.log('data=', data);
		_vm.loadingMessage(false);
		var needed;
		data.list.forEach(function(item) {
			if (item.room == _vm.lastClickedRoom()) {
				_vm.schedule(item.slots);
			}
		});
	},
	RESERVE_RESPONSE: function(data) {
		if (data.result) alert('CONFIRMED')
	}
};

$(function() {
	ko.applyBindings(window._vm = new viewmodel());


	ws = new WebSocket(wsHost);
	ws.onopen = function() {
		console.log('sockets open');
		sendMessage({type: 'GET_ROOM_LIST', requestId: 'req1'});
	}
	ws.onclose = function() {
		console.log('sockets close');
	}

	ws.onmessage = function(event) {
		// console.log('got message', event.data);
		var parsed = JSON.parse(event.data);
		if (parsed.type) {
			if (typeof eventHandlers[parsed.type] !== 'undefined') {
				eventHandlers[parsed.type](parsed);
			}
		}
	}
});