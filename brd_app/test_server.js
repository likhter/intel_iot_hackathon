// Emulation of server

var ws = require('ws').Server,
    wss = new ws({ port: 8080 });

function send(s, msg) {
    s.send(JSON.stringify(msg));
}
wss.on('connection', function(s) {

    setTimeout(function() {
        console.log('sending NEW_RESERVATION');
        send(s, {
            type: 'NEW_RESERVATION',
            dt: (new Date()).toISOString(),
            duration: 45,
            name: 'Konst',
            reservationId: 'res-id-1',
            room: 'r2'
        });
    }, 10 * 1000 );

    setTimeout(function() {
        console.log('sending NEW_RESERVATION again');
        send(s, {
            type: 'NEW_RESERVATION',
            dt: (new Date()).toISOString(),
            duration: 10,
            name: 'Someone',
            reservationId: 'res-id-2',
            room: 'r2'
        })
    }, 20 * 1000);

    setTimeout(function() {
        console.log('sending RESERVATION_CANCELLED');
        send(s, {
            type: 'RESERVATION_CANCELLED',
            requestId: '123123123',
            reservationId: 'res-id-1',
            room: 'r2'
        })
    }, 30 * 1000);

    s.on('message', function(msg) {
        var decoded = JSON.parse(msg);
        switch (decoded.type) {
            case 'GET_ROOM_LIST':
                send(s, {
                    type: 'ROOM_LIST',
                    requestId: decoded.requestId,
                    list: ['r1', 'r2', 'r3', 'r4']
                });
                break;
            case 'REGISTER':
                send(s, {
                    type: 'REGISTER_RESPONSE',
                    requestId: decoded.requestId,
                    localTime: Date.now()
                })
                break;
        }
    });
});
