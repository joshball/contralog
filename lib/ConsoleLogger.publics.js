'use strict';
var util = require('util');
var stack = require('./stack');
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

    function _createChildLogger (childName) {
        var newLogger = new ConsoleLogger(this._moduleObj, this._options, this, childName);
        newLogger.trace(childName);
        return newLogger;
    }

    ConsoleLogger.prototype.ctor = ConsoleLogger.prototype.method = ConsoleLogger.prototype.func = _createChildLogger;

    ConsoleLogger.prototype.ret = function (retArg) {
        var retJson =  ConsoleLogger.jsonString(retArg);
        if(retJson.length > 20){
            retJson = '\n' + retJson;
        }
        this.log('trace', util.format('RETURNING:', retJson));
        return retArg;
    };

    function createStackLine(level) {
        var callerStack = stack.getStack(level);
        var lineString = util.format('STACK[%d]: %s:%d [Func:%s]',
            level,
            callerStack.getFileName(),
            callerStack.getLineNumber(),
            callerStack.getFunctionName() || callerStack.getMethodName() );
        return lineString;
    }

    function createStackLines(level, num) {
        level = level || 2;
        num = num || 1;
        var lines = [];
        for(var i = 0; i< num; i++){
            lines.push(createStackLine(level+i));
        }
        return lines;
    }

    ConsoleLogger.prototype.stack = function (level, num, logLevel) {
        logLevel = logLevel || 'error';
        var lines = createStackLines(level, num);
        this.logRaw(logLevel, lines.join('\n'));
        return this;
    };

    ConsoleLogger.prototype.lineBreak = function (lineString, color) {
        var lines = [];
        lines.push('');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('-----' + pad.lrpad(lineString, 70) + '-----');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('--------------------------------------------------------------------------------');
        lines.push('');

        var indent = this._getIndent();
        var lineString = lines.map(function(line){
            return indent + line;
        }).join('\n');

        this._dumpMessage(lineString, color);
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
        lines = lines.concat(createStackLines(stackStart, stackEnd));
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
            //    lines.push(createStackLine(level+i));
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
