var actionsExport,
    actions = [
        'SET_CONNECTED',
        'SET_DISCONNECTED',
        'SET_SELECT_ROOM_STATE',
        'CHANGE_CHOOSE_ROOM_FWD',
        'CHANGE_CHOOSE_ROOM_RWD',
        'SELECT_ROOM',
        'SET_REGISTERED',
        'ADD_NEW_RESERVATION',
        'CONFIRM_RESERVATION',
        'CANCEL_RESERVATION',
        'ATTRACT_ATTENTION',
        'STOP_ATTRACT_ATTENTION'
    ];

module.exports = actionsExport = {};

actions.forEach(function(action) {
    actionsExport[action] = action;
});
