
var upm = require('jsupm_i2clcd'),
    config = require('./config'),
    display = new upm.Jhd1313m1(0, 0x3E, 0x62);

module.exports = {
    display: function(opts) {
        display.clear();
        if (opts.firstLine) {
            display.setCursor(0,0);
            display.write(opts.firstLine);
        }
        if (opts.secondLine) {
            display.setCursor(1,0);
            display.write(opts.secondLine);
        }
        if (opts.bg) {
            display.setColor.apply(display, opts.bg);
            this._currentBg = opts.bg;
        } else {
            display.setColor.apply(display, this.bg.DEFAULT);
            this._currentBg = this.bg.DEFAULT;
        }
    },
    blink: function() {
        console.log('blink');
        if (this._isBlinking) clearInterval(this._blinkingInterval);
        this._isBlinking = true;
        var self = this;
        var color1, color2, currentColor;
        if (this._currentBg === this.bg.DEFAULT) {
            color1 = this._currentBg;
            color2 = this.bg.DEFAULT_BLINKING;
        } else {
            color1 = this._currentBg;
            color2 = this.bg.DEFAULT;
        }
        currentColor = color1;
        var i = 0,
            count = 10;
        this._blinkingInterval = setInterval(function() {
            var color = currentColor === color1 ? color2 : color1;
            currentColor = color;
            display.setColor.apply(display, color);
            if (++i == count) {
                clearInterval(self._blinkingInterval);
            }
        }, config.blinkingTimeout)
    },
    bg: {
        DEFAULT: [0,0,0],
        DEFAULT_BLINKING: [32,32,32],
        RED: [64, 0, 0],
        GREEN: [0, 64, 0],
        BLUE: [0, 0, 64]
    },
    _currentBg: [0,0,0],
    _isBlinking: false,
    _blinkingInterval: null
}
