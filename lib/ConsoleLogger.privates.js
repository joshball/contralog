'use strict';
var assert = require('assert');
var moment = require('moment');
var clc = require('cli-color');
var stack = require('./stack');
var util = require('util');


var allLine = '\n#dashLine\n' +
    '[MOD:#mod (FILE:#file) LINE:#line, COL:#col]\n' +
    '[#mod (FILE:#file) LINE:#line, COL:#col]\n' +
    '[isConstructor:#isConstructor (isEval:#isEval) isNative:#isNative, isToplevel:#isToplevel]\n' +
    '[evalOrigin:#evalOrigin]\n' +
    '[func:#func, method:#method, type:#type]\n' +
    '#dashLine\n';


module.exports = function(ConsoleLogger){

    ConsoleLogger.prototype._createChildLogger = function(childName) {
        var newLogger = new ConsoleLogger(this._moduleObj, this._options, this, childName);
        newLogger.trace(childName);
        return newLogger;
    };

    ConsoleLogger.prototype._getLogLevel =function (logMessageLevelName) {
        var levels = this._options.levels;
        var minLoggingLevelName = this._options.level;
        assert.ok(minLoggingLevelName, 'this._options.level must be set');
        var minLoggingLevel = levels[minLoggingLevelName];
        assert.ok(minLoggingLevel, 'minLoggingLevel is not set');
        var logMessageLevel = levels[logMessageLevelName];
        assert.ok(logMessageLevel, 'logMessageLevel is not set lmln:' + logMessageLevelName);

        if (logMessageLevel.num < minLoggingLevel.num) {
            return;
        }

        if(!this._shouldLog()){
            return;
        }

        return logMessageLevel;
    };

    ConsoleLogger.prototype._log = function (logMessageLevel, lineFormat, colorOverride) {

        var logFunc = logMessageLevel.stream;

        var indent = this._getIndent();
        var lineString = lineFormat.split('\n').map(function(line){
            return indent + line;
        }).join('\n');

        var colorFunc =  function (s) {
            if(colorOverride){
                return clc[colorOverride](s);
            }
            if(logMessageLevel.color){
                return clc[logMessageLevel.color](s);
            }
            return s;
        };

        logFunc(colorFunc(lineString));
    };

    ConsoleLogger.prototype._getIndent = function () {
        var numSpaces = this._indent * this._options.indent;
        if(numSpaces > 0){
            return Array(numSpaces).join(' ');
        }
        return '';
    };


    ConsoleLogger.prototype._shouldLog = function () {

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

    ConsoleLogger.prototype._parseAndReplaceTagWithValue = function (lineFormat, tag, value) {
        var lfvTag = this._options.lineFormatVar + tag;
        return lineFormat.replace(lfvTag, value);
    };
    ConsoleLogger.prototype._handleNullFunc = function (result) {
        return result ? result + '()' : '';
    };

    ConsoleLogger.prototype._lineHasStackTag = function (lineFormat) {
        var stackTags = [ 'line', 'func', 'method', 'file', 'type', 'col', 'evalOrigin', 'isEval', 'isNative', 'isToplevel', 'isConstructor' ];
        for(var i = 0; i < stackTags.length; i++){
            var lfvTag = this._options.lineFormatVar + stackTags[i];
            if(lineFormat.indexOf(lfvTag) >= 0){
                return true;
            }
        }
        return false;
    };


    ConsoleLogger.prototype._createStackLine = function(level) {
        var callerStack = stack.getStack(level);
        var lineString = util.format('STACK[%d]: %s:%d [Func:%s]',
            level,
            callerStack.getFileName(),
            callerStack.getLineNumber(),
            callerStack.getFunctionName() || callerStack.getMethodName() );
        return lineString;
    };

    ConsoleLogger.prototype._createStackLines = function(level, num) {
        level = level || 2;
        num = num || 1;
        var lines = [];
        for(var i = 0; i< num; i++){
			lines.push(this._createStackLine(level+i));
        }
        return lines;
    };

    //ConsoleLogger.prototype._dumpMessage = function (message, color) {
    //    color = color || this._options.dumpColor || 'whiteBright';
    //    console.log(clc[color](message));
    //};

    ConsoleLogger.prototype._parseAndReplaceLine = function (lineFormat, levelName, message) {
        var self = this;
        var now = new Date();
        var timestampFormat = this._options.timestampFormat;
        var dashLine = '------------------------------------------------------------------------------------------------------';
        lineFormat =  lineFormat || this._options.lineFormat;

        var formatLine = function(tag, value){
            var lfvTag = new RegExp(self._options.lineFormatVar + tag, 'g');
            lineFormat = lineFormat.replace(lfvTag, value);
        };

        formatLine('all', allLine);
        if(this._lineHasStackTag(lineFormat)){
            var callerStack = stack.getStack(3);
            formatLine('line', callerStack.getLineNumber());
            formatLine('file', callerStack.getFileName());
            formatLine('func', this._handleNullFunc(callerStack.getFunctionName()));
            formatLine('method', this._handleNullFunc(callerStack.getMethodName()));
            formatLine('type', stack.getTypeName(2));
            formatLine('col', callerStack.getColumnNumber());
            formatLine('evalOrigin', callerStack.getEvalOrigin());
            formatLine('isEval', callerStack.isEval());
            formatLine('isNative', callerStack.isNative());
            formatLine('isToplevel', callerStack.isToplevel());
            formatLine('isConstructor', callerStack.isConstructor());
        }

        formatLine('dashLine', dashLine);
        formatLine('mod', this._moduleName);
        formatLine('level', levelName);
        formatLine('time', moment(now).format(timestampFormat));
        formatLine('msg', message);

        return lineFormat;
    };


};
