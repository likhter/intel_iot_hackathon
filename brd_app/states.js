
var statesExport,
    states = [
        'CONNECTING',
        'CHOOSING_ROOM',
        'REGISTERING',
        'SHOWING_NEXT_RESERVATION'
    ];

module.exports = statesExport = {};

states.forEach(function(s) {
    statesExport[s] = s;
});


