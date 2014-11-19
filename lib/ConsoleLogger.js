'use strict';
var util = require('util');
var path = require('path');

var addPrivates = require('./ConsoleLogger.privates');
var addStatics = require('./ConsoleLogger.statics');
var addPublics = require('./ConsoleLogger.publics.js');

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

addStatics(ConsoleLogger);
addPrivates(ConsoleLogger);
addPublics(ConsoleLogger);


module.exports = ConsoleLogger;
