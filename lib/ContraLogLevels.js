'use strict';
var util = require('util');

var i = 0;
var defaultLevels = {
    trace: {name: 'trace', num: i++, color: 'whiteBright', lineFormat: '[#mod:#line <#func>] #msg'},
    debug: {name: 'debug', num: i++, color: 'cyanBright'},
    info: {name: 'info', num: i++, color: 'greenBright'},
    warn: {name: 'warn', num: i++, color: 'yellowBright'},
    error: {name: 'error', num: i++, color: 'redBright', isError: true, lineFormat: '[#mod:#line <#func>] #msg\n[#file:#line:#col]'}
};

var ContraLogLevel = function (options) {
    this.name = options.name;
    this.num = options.num;
    this.isError = options.isError;
    this.stream = options.isError ? console.error : console.log;
    this.color = options.color || ( options.isError ? 'red': 'white');
    this.lineFormat = options.lineFormat;
};

var ContraLogLevels = function (loggingLevels) {
    var self = this;
    loggingLevels = loggingLevels || defaultLevels;
    var levelNums = {};
    Object.keys(loggingLevels).forEach(function(levelName){
        var level = loggingLevels[levelName];
        if(level.name != levelName){
            throw new Error(util.format('Level Name Mismatch: %s vs %s', levelName, level.name) );
        }
        if(self[levelName]){
            throw new Error(util.format('Level Name Conflict: %s', levelName) );
        }
        if(levelNums[level.num]){
            throw new Error(util.format('Level Num Conflict: %s %d', levelName, level.num) );
        }
        self[levelName] = new ContraLogLevel(level);
    });
};

module.exports = ContraLogLevels;