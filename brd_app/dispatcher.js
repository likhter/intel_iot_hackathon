var dispatcher;

module.exports = dispatcher = {
    _state: { },
    _actionHandlers: [],
    _subscribers: [],
    registerActionHandler: function(fn) {
        this._actionHandlers.push(fn);
    },
    subscribe: function(fn) {
        this._subscribers.push(fn);
    },
    dispatch: function(action) {
        var self = this;
        this._actionHandlers.forEach(function(method) {
            self._state = method(action, self._state);
        });
        this._subscribers.forEach(function(method) {
            method(self);
        });
    },
    getState: function() {
        return this._state;
    }
}; 

