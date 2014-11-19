'use strict';
var util = require('util');
var path = require('path');
var moment = require('moment');
var clc = require('cli-color');

var stack = require('./stack');
var pad = require('./pad');


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

    //
    // This creates public methods for each log level (i.e. debug, err, etc...)
    //
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

// ===========================================================================================
//
// STATIC METHODS
//

ConsoleLogger.jsonString = function (obj, indent) {
    try {
        return JSON.stringify(obj, undefined, indent || 4);
    }
    catch(e){
        return util.inspect(obj);
    }
};

ConsoleLogger.jsonLines = function (obj, indent) {
    var json = ConsoleLogger.jsonString(obj, indent);
    return json.split('\n');
};



// ===========================================================================================
//
// PUBLIC METHODS
//

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
    var lineString = util.format('STACK DUMP: [%s:%d]',
        callerStack.getFileName(),
        callerStack.getLineNumber(),
        callerStack.getFunctionName());
    return lineString;
}
ConsoleLogger.prototype.stack = function (level, num) {
    num = num || 1;
    var lines = [];
    for(var i = 0; i< num; i++){
        lines.push(createStackLine(level+i));
    }
    this._dumpMessage(lines.join('\n'));
    return this;
};


ConsoleLogger.prototype.dump = function (title, thing) {
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


ConsoleLogger.prototype.log = function (logMessageLevelName, message) {

    var levels = this._options.levels;
    var minLoggingLevelName = this._options.level;
    var minLoggingLevel = levels[minLoggingLevelName];
    var logMessageLevel = levels[logMessageLevelName];

    if (logMessageLevel.num < minLoggingLevel.num) {
        return;
    }

    if(!this._shouldLog()){
        return;
    }

    var logFunc = logMessageLevel.stream;

    var lineFormat = this._parseAndReplaceLine(logMessageLevel.lineFormat, logMessageLevelName, message);

    var indent = this._getIndent();
    var lineString = lineFormat.split('\n').map(function(line){
        return indent + line;
    }).join('\n');

    var color = function (s) {
        if(logMessageLevel.color){
            return clc[logMessageLevel.color](s);
        }
        return s;
    };

    logFunc(color(lineString));
};



// ===========================================================================================
//
// PRIVATE METHODS
//


function _createChildLogger (childName) {
    var newLogger = new ConsoleLogger(this._moduleObj, this._options, this, childName);
    newLogger.trace(childName);
    return newLogger;
};


ConsoleLogger.prototype._getIndent = function () {
    var numSpaces = this._indent * this._options.indent;
    if(numSpaces > 0){
        return Array(numSpaces).join(' ');
    }
    return '';
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
    if(result == 'null'){
        return '';
    }
    return result + '()';
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

var allLine = '#dashLine' +
    '[MOD:#mod (FILE:#file) LINE:#line, COL:#col]\n' +
    '[#mod (FILE:#file) LINE:#line, COL:#col]\n' +
    '[isConstructor:#isConstructor (isEval:#isEval) isNative:#isNative, isToplevel:#isToplevel]\n' +
    '[evalOrigin:#evalOrigin]\n' +
    '[func:#func, method:#method, type:#type]' +
    '#dashLine';

ConsoleLogger.prototype._parseAndReplaceLine = function (lineFormat, levelName, message) {
    var self = this;
    var now = new Date();
    var timestampFormat = this._options.timestampFormat;
    var dashLine = '------------------------------------------------------------------------------------------------------';
    lineFormat =  lineFormat || this._options.lineFormat;

    var formatLine = function(tag, value){
        var lfvTag = self._options.lineFormatVar + tag;
        lineFormat = lineFormat.replace(lfvTag, value);
    };

    formatLine('all', '');
    if(this._lineHasStackTag(lineFormat)){
        var callerStack = stack.getStack(2);
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


ConsoleLogger.prototype._dumpMessage = function (message) {
    var color = this._options.dumpColor || 'whiteBright';
    console.log(clc[color](message));
};


module.exports = ConsoleLogger;
