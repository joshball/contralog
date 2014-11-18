'use strict';

// borrowed from https://github.com/epeli/underscore.string/blob/master/lib/underscore.string.js;

var strRepeat = function(str, qty){
    if (qty < 1) return '';
    var result = '';
    while (qty > 0) {
        if (qty & 1) result += str;
        qty >>= 1, str += str;
    }
    return result;
};

var pad = function (str, length, padStr, type) {
    str = str == null ? '' : String(str);
    length = ~~length;

    var padlen = 0;

    if (!padStr) {
        padStr = ' ';
    } else if (padStr.length > 1) {
        padStr = padStr.charAt(0);
    }

    switch (type) {
        case 'right':
            padlen = length - str.length;
            return str + strRepeat(padStr, padlen);
        case 'both':
            padlen = length - str.length;
            return strRepeat(padStr, Math.ceil(padlen / 2)) + str
                + strRepeat(padStr, Math.floor(padlen / 2));
        default: // 'left'
            padlen = length - str.length;
            return strRepeat(padStr, padlen) + str;
    }
};

var lrpad = function (str, length, padStr) {
    return pad(str, length, padStr, 'both');
};
var lpad = function (str, length, padStr) {
    return pad(str, length, padStr, 'left');
};

module.exports = {
    pad: pad,
    lpad: lpad,
    lrpad: lrpad
};