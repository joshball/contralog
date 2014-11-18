'use strict';
var util = require('util');
var path = require('path');
var moment = require('moment');
var clc = require('cli-color');

var stack = require('./stack');
var ContraLogLevels = require('./ContraLogLevels');


var ConsoleLogger = function (moduleObj, options, parentLogger, childName) {

    //console.log('\n==========');
    //console.log('NEW ConsoleLogger');
    //console.log('==========');

    if (!moduleObj && !moduleObj.filename) {
        throw new Error('moduleObj required');
    }
    if (!options) {
        throw new Error('options required');
    }

    this._moduleObj = moduleObj;
    this._moduleName = path.basename(moduleObj.filename, path.extname(moduleObj.filename));
    this._options = options;
    this._indent = 0;
    if(parentLogger){
        this._parentLogger = parentLogger;
        this._indent = parentLogger._indent + 1;
        if(!childName){
            throw new Error('A child name is required for a parent logger');
        }
        this._childName = childName;
    }

    var self = this;
    Object.keys(options.levels).forEach(function(levelName){
        var proxyFunc = options.useNull ?
            function(){return this;} :
            function() {
                self.log(levelName, util.format.apply(this, arguments));
                return this;
            };
        self[levelName] = proxyFunc;
    });
};

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

ConsoleLogger.prototype.createChildLogger = function (childName) {
    var newLogger = new ConsoleLogger(this._moduleObj, this._options, this, childName);
    return newLogger;
};

ConsoleLogger.prototype.ctor = ConsoleLogger.prototype.method = ConsoleLogger.prototype.func = ConsoleLogger.prototype.createChildLogger;

ConsoleLogger.prototype.ret = function (retArg) {
    //var msg = util.format.apply(this, arguments);
    //this._consoleLog('trace', 'RETURNING:\n', retArg);
    //this._consoleLog('trace', retArg);
    this.log('trace', util.format('RETURNING:\n %j', retArg));
    return retArg;
};

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

ConsoleLogger.prototype.shouldLog = function () {

    var matchOff, matchOn, offSet, onSet;
    if (this._options.off && this._options.off.modules) {
        offSet = true;
        matchOff = this._moduleName.match(this._options.off.modules);
        //console.log('matchOff:', matchOff);
    }
    if (this._options.on && this._options.on.modules) {
        onSet = true;
        matchOn = this._moduleName.match(this._options.on.modules);
        //console.log('matchOn:', matchOn);
    }
    // off:undefined, on:undefined => log all
    // off:undefined, on:set => log only if on matches
    // off:set, on:undefined => log only if off does NOT match
    // off:set, on:set => log only if matches on and not matches off
    //console.log('\noffSet:',offSet);
    //console.log('matchOff:',matchOff);
    //console.log('onSet:',onSet);
    //console.log('matchOn:',matchOn);

    if(!offSet && !onSet){
        //console.log('!off && !on');
        return true;
    }
    else if(!offSet && onSet){
        //console.log('!off && on');
        return matchOn;
    }
    else if (offSet && !onSet) {
        //console.log('off && !on');
        return !matchOff;
    }
    else {
        //console.log('off && on');
        return matchOn || !matchOff;
    }
};


ConsoleLogger.prototype.log = function (logMessageLevelName, message) {

    var now = new Date();
    var levels = this._options.levels;
    var minLoggingLevelName = this._options.level;
    var minLoggingLevel = levels[minLoggingLevelName];
    var logMessageLevel = levels[logMessageLevelName];

    if (logMessageLevel.num < minLoggingLevel.num) {
        return;
    }

    if(!this.shouldLog()){
        return;
    }
    var callerStack = stack.getStack(2);

    var logFunc = logMessageLevel.stream;
    var lfv = this._options.lineFormatVar || '#';

    var moduleName = this._moduleName;
    var lineFormat = logMessageLevel.lineFormat || this._options.lineFormat;
    var timestampFormat = this._options.timestampFormat;

    var color = function (s) {
        if(logMessageLevel.color){
            return clc[logMessageLevel.color](s);
        }
        return s;
    };

    var formatLine = function(tag, value){
        var lfvTag = lfv + tag;
        lineFormat = lineFormat.replace(lfvTag, value);
    };

    var handleNullFunc = function(result){
        if(result == 'null'){
            return '';
        }
        else return result + '()';
    };

    formatLine('mod', moduleName);
    formatLine('level', logMessageLevel.name);
    formatLine('msg', message);
    formatLine('line', callerStack.getLineNumber());
    formatLine('file', callerStack.getFileName());
    formatLine('func', handleNullFunc(callerStack.getFunctionName()));
    formatLine('method', handleNullFunc(callerStack.getMethodName()));
    formatLine('type', stack.getTypeName(2));
    formatLine('col', callerStack.getColumnNumber());
    formatLine('evalOrigin', callerStack.getEvalOrigin());
    formatLine('isEval', callerStack.isEval());
    formatLine('isNative', callerStack.isNative());
    formatLine('isToplevel', callerStack.isToplevel());
    formatLine('isConstructor', callerStack.isConstructor());
    formatLine('time', moment(now).format(timestampFormat));

    if(this._options.dumpWithLines){
        logFunc(color('------------------------------------------------------------------------------------------------------'));
    }
    if(this._options.dumpLocation){
        //var fileName = callerStack.getFileName();
        //var line = callerStack.getLineNumber();
        //var func = callerStack.getFunctionName() || callerStack.getMethodName();
        //var locationLine = util.format('%s:%s | %s()', fileName, line, func);
        //logFunc(color(path.resolve(__dirname)));
        //logFunc(color(path.resolve('.')));
        //logFunc(color(locationLine));
    }
    logFunc(color(lineFormat));
    if(this._options.dumpWithLines){
        logFunc(color('------------------------------------------------------------------------------------------------------'));
    }
};


module.exports = ConsoleLogger;
