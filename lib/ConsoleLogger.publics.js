'use strict';
var util = require('util');
var pad = require('./pad');



var parseSelector = function(selector){
    selector = (selector || '').trim();
    var regexFlags= 'i';
    if(!selector){
        return new RegExp('.*', regexFlags);
    }
    if(selector.indexOf('#modules:') !== 0){
        throw new Error('Invalid selector (must start with #module: for now');
    }
    var split = selector.split(':');
    if(split.length !== 2){
        throw new Error('Invalid selector (only single colon)');
    }
    return new RegExp(split[1], regexFlags);
};


module.exports = function(ConsoleLogger){

    ConsoleLogger.prototype.setOptions = function (options) {
        this._options.setOptions(options);
    };

    ConsoleLogger.prototype.resetOptions = function () {
        this._options.reset();
    };

    ConsoleLogger.prototype.setOption = function (option, value) {
        this._options.setOption(option, value);
    };

    ConsoleLogger.prototype.setLevel = function (newLevel) {
        this._options.setOption('level', newLevel);
    };

    ConsoleLogger.prototype.off = function (offSelector) {
        this._options.off = {
            modules: parseSelector(offSelector)
        };
        return this;
    };

    ConsoleLogger.prototype.on = function (onSelector) {
        this._options.on = {
            modules: parseSelector(onSelector)
        };
        return this;
    };


    ConsoleLogger.prototype.ctor = ConsoleLogger.prototype._createChildLogger;
    ConsoleLogger.prototype.method = ConsoleLogger.prototype._createChildLogger;
    ConsoleLogger.prototype.func = ConsoleLogger.prototype._createChildLogger;

    ConsoleLogger.prototype.ret = function (retArg) {
        var retJson =  ConsoleLogger.jsonString(retArg);
        if(retJson.length > 20){
            retJson = '\n' + retJson;
        }
        this.log('trace', util.format('RETURNING:', retJson));
        return retArg;
    };

    ConsoleLogger.prototype.stack = function (level, num, logLevel) {
        logLevel = logLevel || 'error';
        var lines = this._createStackLines(level, num);
        this.logRaw(logLevel, lines.join('\n'));
        return this;
    };

    ConsoleLogger.prototype.lineBreak = function (lineString, color) {
        color = color|| 'cyanBright';
        var lines = [];
        lines.push('');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('-----' + pad.lrpad(lineString, 70) + '-----');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('');

        var indent = this._getIndent();

        lineString = lines.map(function(line){
            return indent + line;
        }).join('\n');

        this._dumpMessage(lineString, color);
        return this;
    };

    ConsoleLogger.prototype.lineBreakWithReturn = function (lineString, returnThing, color) {
        color = color|| 'cyanBright';
        var lines = [];
        lines.push('');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('-----' + pad.lrpad(lineString, 70) + '-----');
        if(returnThing){
            lines.push('--------------------------------------------------------------------------------');
            lines.push('And returned:');
            lines = lines.concat(ConsoleLogger.jsonLines(returnThing));
        }
        lines.push('--------------------------------------------------------------------------------');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('');

        var indent = this._getIndent();

        lineString = lines.map(function(line){
            return indent + line;
        }).join('\n');

        this._dumpMessage(lineString, color);
        return this;
    };

    ConsoleLogger.prototype.serviceCallStart = function (serviceName) {
        var serviceCall = {
            serviceName: serviceName,
            startTime: process.hrtime()
        };

        this.lineBreak('Calling service: ' + serviceName, 'yellowBright');
        return serviceCall;
    };

    ConsoleLogger.prototype.serviceCallEnd = function (serviceCall, response) {
        serviceCall.endTime = process.hrtime();
        var totalHrTime = process.hrtime(serviceCall.startTime);
        var tt = parseFloat(totalHrTime[0] + '.' + totalHrTime[1]);
        serviceCall.totalTime =Math.round(tt * 1000) / 1000;
        var msg = util.format('Service [%s] took %d seconds', serviceCall.serviceName, serviceCall.totalTime);
        if(response){
            this.lineBreakWithReturn(msg, response, 'yellowBright');
        }
        return this;
    };

    ConsoleLogger.prototype.dump = function (thing) {
        var lines = [];
        lines.push('');
        lines.push('--------------------------------------------------------------------------------');
        lines = lines.concat(ConsoleLogger.jsonLines(thing));
        lines.push('--------------------------------------------------------------------------------');

        var indent = this._getIndent();
        var lineString = lines.map(function(line){
            return indent + line;
        }).join('\n');

        this._dumpMessage(lineString);
        return this;
    };

    ConsoleLogger.prototype.dumpWithHeader = function (title, thing) {
        var lines = [];
        lines.push('');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('-----' + pad.lrpad('Dumping: ' + title + '(' + typeof thing + ')', 70) + '-----');
        lines.push('--------------------------------------------------------------------------------');
        lines = lines.concat(ConsoleLogger.jsonLines(thing));
        lines.push('--------------------------------------------------------------------------------');

        var indent = this._getIndent();
        var lineString = lines.map(function(line){
            return indent + line;
        }).join('\n');

        this._dumpMessage(lineString);
        return this;
    };

    ConsoleLogger.prototype.dumpWithStack = function (title, thing, stackStart, stackEnd) {
        var lines = [];
        stackStart = stackStart || 3;
        stackEnd = stackEnd || 1;
        lines.push('');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('-----' + pad.lrpad('Dumping: ' + title + '(' + typeof thing + ')', 70) + '-----');
        lines.push('--------------------------------------------------------------------------------');
        lines = lines.concat(this._createStackLines(stackStart, stackEnd));
        lines.push('--------------------------------------------------------------------------------');
        lines = lines.concat(ConsoleLogger.jsonLines(thing));
        lines.push('--------------------------------------------------------------------------------');

        var indent = this._getIndent();
        var lineString = lines.map(function(line){
            return indent + line;
        }).join('\n');

        this._dumpMessage(lineString);
        return this;
    };

    ConsoleLogger.prototype.wrap = function (title, message) {
        var lines = [];
        lines.push('');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('-----' + pad.lrpad('START: ' + title, 70) + '-----');
        lines.push('--------------------------------------------------------------------------------');
        lines.push(message);
        lines.push('--------------------------------------------------------------------------------');
        lines.push('-----' + pad.lrpad('END: ' + title, 70) + '-----');
        lines.push('--------------------------------------------------------------------------------');

        var indent = this._getIndent();
        var lineString = lines.map(function(line){
            return indent + line;
        }).join('\n');

        this._dumpMessage(lineString);
        return this;
    };

    ConsoleLogger.prototype.exception = function (exception) {

        if(this._options.dumpExceptions){
            //var level = 0, num = 3;
            var lines = [];
            lines.push('Exception:' + exception.message);
            //lines.push('Exception stack:');
            lines.push(exception.stack);
            //lines.push('Local Stack:');
            //for(var i = 0; i< num; i++){
            //    lines.push(this._createStackLine(level+i));
            //}
            this._dumpMessage(lines.join('\n'));
        }
        return this;
    };


    ConsoleLogger.prototype.logRaw = function (logMessageLevelName, message) {
        var logMessageLevel = this._getLogLevel(logMessageLevelName);
        if(logMessageLevel){
            return this._log(logMessageLevel, message);
        }
        return this;
    };

    ConsoleLogger.prototype.log = function (logMessageLevelName, message) {
        var logMessageLevel = this._getLogLevel(logMessageLevelName);
        if(logMessageLevel){
            var lineFormat = this._parseAndReplaceLine(logMessageLevel.lineFormat, logMessageLevelName, message);
            return this._log(logMessageLevel, lineFormat);
        }
        return this;
    };

};
