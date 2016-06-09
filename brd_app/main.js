var dispatcher = require('./dispatcher'),
    states = require('./states'),
    actions = require('./actions'),
    comm = require('./comm'),
    lcd = require('./lcd'),
    rotary = require('./rotary'),
    btn = require('./btn'),
    motion = require('./motion'),
    logger = require('log4js').getLogger('main'),
    _ = require('underscore');


dispatcher._state = {
    state: states.CONNECTING,
    room: null,
    reservations: [],
    roomList: [],
    attractAttention: false
};

dispatcher.subscribe(function(self) {
    render(self.getState());
    renderBlinking(self.getState().attractAttention);
});

/* COMM HANDLERS */
comm.on('REGISTER_RESPONSE', function(data) {
    dispatcher.dispatch({ type: actions.SET_REGISTERED });
});

comm.on('ROOM_LIST', function(data) {
    dispatcher.dispatch({ type: actions.SET_SELECT_ROOM_STATE, list: data.list });
});

comm.on('REGISTER_RESPONSE', function(data) {
    if (data.result) {
        dispatcher.dispatch({
            type: actions.SET_REGISTERED
        });
    }
});

comm.on('DISCONNECTED', function(data) {
    dispatcher.dispatch({ type: actions.SET_DISCONNECTED });
});

comm.on('NEW_RESERVATION', function(data) {
    logger.debug('Got new reservation from server: ', data);
    var state = dispatcher.getState();
    if (state.room !== data.room) {
        logger.debug('this is not our reservation, our room=', state.room, ' got=', data.room);
        return;
    }
    dispatcher.dispatch({
        type: actions.ADD_NEW_RESERVATION,
        reservation: data
    })
});

comm.on('RESERVATION_CANCELLED', function(data) {
    logger.debug('Got RESERVATION_CANCELLED from server', data);
    var state = dispatcher.getState();
    if (state.room !== data.room) {
        logger.debug('This is not our cancelletion, our room=', state.room, ' got=', data.room);
        return;
    }
    dispatcher.dispatch({
        type: actions.CANCEL_RESERVATION,
        reservation: data
    });
})

/* ROTARY HANDLERS */
var rotaryOldValue = -1;
rotary.on('newValue', function(val) {
    logger.trace('Got new value from rotary=', val);
    switch (dispatcher.getState().state) {
        case states.CHOOSING_ROOM:
            dispatcher.dispatch({
                type: val > rotaryOldValue ? actions.CHANGE_CHOOSE_ROOM_FWD : actions.CHANGE_CHOOSE_ROOM_RWD
            });
            rotaryOldValue = val;
        break;
    }
});

/* BUTTON HANDLERS */
btn.on('click', function() {
    switch (dispatcher.getState().state) {
        case states.CHOOSING_ROOM:
            dispatcher.dispatch({
                type: actions.SELECT_ROOM
            });
            break;
        case states.SHOWING_NEXT_RESERVATION:
            dispatcher.dispatch({
                type: actions.CONFIRM_RESERVATION
            })    
            break;
    }
});

/* motion handler */
motion.on('motion', function() {
    // logger.debug('Motion detected');
    var s = dispatcher.getState();
    if (s.state == states.SHOWING_NEXT_RESERVATION
        && s.reservations.length
        && !s.reservations[0].confirmed) {
        dispatcher.dispatch({ type: actions.ATTRACT_ATTENTION });
    }
});

motion.on('nomotion', function() {
    dispatcher.dispatch({ type: actions.STOP_ATTRACT_ATTENTION });
    // logger.debug('Motion stopped');
});

/* connection states */
dispatcher.registerActionHandler(function(action, state) {
    switch (action.type) {
        case actions.SET_DISCONNECTED:
            var s = _.clone(state);
            s.state = states.CONNECTING;
            return s;
        break;
    }
    return state;
});

/* registration and room selection handler */
dispatcher.registerActionHandler(function(action, state) {
    switch (action.type) {
        case actions.SET_SELECT_ROOM_STATE:
            var s = _.clone(state);
            s.state = states.CHOOSING_ROOM;
            s.roomList = action.list;
            s.room = action.list[0];
            logger.trace('handling SET_SELECT_ROOM_STATE, new state.state=', state.state);
            return s;
            break;
        case actions.CHANGE_CHOOSE_ROOM_FWD:
            var s = _.clone(state);
            var idx = s.roomList.indexOf(s.room) + 1;
            if (idx > s.roomList.length - 1) idx = 0;
            logger.trace('handling CHANGE_CHOOSE_ROOM_FWD: ', idx, s.roomList[idx]);
            s.room = s.roomList[idx];
            return s;
            break;
        case actions.CHANGE_CHOOSE_ROOM_RWD:
            var s = _.clone(state);
            var idx = s.roomList.indexOf(s.room) - 1;
            if (idx < 0) idx = s.roomList.length - 1;
            logger.trace('handling CHANGE_CHOOSE_ROOM_RWD: ', idx, s.roomList[idx]);
            s.room = s.roomList[idx];
            return s;
            break;
        case actions.SELECT_ROOM:
            var s = _.clone(state);
            s.state = states.REGISTERING;
            comm.send({
                type: 'REGISTER',
                room: s.room
            });
            logger.trace('handling SELECT_ROOM, state.room=', s.room);
            return s;
            break;
        case actions.SET_REGISTERED:
            var s = _.clone(state);
            s.state = states.SHOWING_NEXT_RESERVATION;
            logger.trace('handling SET_REGISTERED, next state.state=', s.state);
            return s;
            break;
        
    }
    return state;
});

/* reservations handler */

dispatcher.registerActionHandler(function(action, state) {
    switch (action.type) {
        case actions.ADD_NEW_RESERVATION:
            // check if we already have one
            for (var i = 0, l = state.reservations.length; i < l; i++) {
                var r = state.reservations[i];
                if (r.dt === action.reservation.dt && 
                    r.duration === action.reservation.duration &&
                    r.name === action.reservation.name) {
                    return state; // we already have this reservation, skipping
                }
            }
            var s = _.clone(state);
            s.reservations.push(action.reservation);
            // sort by start time
            s.reservations.sort(function(a, b) {
                var da = new Date(a),
                    db = new Date(b);
                return da.getTime() - db.getTime()
            });
            return s;
        break;

        case actions.CONFIRM_RESERVATION:
            var s = _.clone(state);
            comm.send({
                type: 'RESERVATION_CONFIRMED',
                reservationId: s.reservations[0].reservationId
            });
            logger.debug('Sending RESERVATION_CONFIRMED for reservation id=', s.reservations[0].reservationId);
            s.reservations[0].confirmed = true;
            return s;
            break;

        case actions.CANCEL_RESERVATION:
            var s = _.clone(state);
            s.reservations = s.reservations.filter(function(r) {
                return r.reservationId !== action.reservation.reservationId;
            });
            return s;
            break;
    }
    return state;
});

/* visual handlers */
dispatcher.registerActionHandler(function(action, state) {
    switch (action.type) {
        case actions.ATTRACT_ATTENTION:
            var s = _.clone(state);
            s.attractAttention = true;
            return s;
            break;

        case actions.STOP_ATTRACT_ATTENTION:
            var s = _.clone(state);
            s.attractAttention = false;
            return s;
            break;
    }
    return state;
});


function render(state) {
    switch (state.state) {
        case states.CONNECTING:
            lcd.display({ firstLine: 'Connecting...' });
            break;
        case states.CHOOSING_ROOM:
            lcd.display({ firstLine: 'Choose room:', secondLine: state.room, bg: lcd.bg.BLUE }); 
            break;
        case states.REGISTERING:
            lcd.display({ firstLine: 'Registering '});
            break;
        case states.SHOWING_NEXT_RESERVATION:
            if (state.reservations.length < 1) {
                lcd.display({ firstLine: 'Тo reservations', secondLine: state.room });
            } else {
                var r = state.reservations[0],
                    dtObj = new Date(r.dt),
                    mins = dtObj.getMinutes();

                if (mins < 10) mins = '0' + mins;

                var dt = ( dtObj.getMonth() + 1 ) + '/' + dtObj.getDate() + ' ' + dtObj.getHours() + ':' + mins;
                lcd.display({ firstLine: dt + ' ' + r.name, secondLine: r.confirmed ? 'CONFIRMED' : 'UNCONFIRMED', bg: r.confirmed ? lcd.bg.GREEN : lcd.bg.RED });
            }
            break;
        default:
            lcd.display({ firstLine: 'state???', secondLine: state.state, bg: lcd.bg.RED });
    }
}

function renderBlinking(blink) {
    if (blink) lcd.blink();
}
