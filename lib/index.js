'use strict';
var ConsoleLogger = require('./ConsoleLogger');
var ContraLogOptions = require('./ContraLogOptions');
var StackHelpers = require('./stack');

// we want to cache a base set of options for all loggers.
var contraLogOptions;

var createContraLog = function(moduleObj, options){
    if(!moduleObj){
        throw new Error('contralog requires a module object as a parameter');
    }
    if(options){
        contraLogOptions = new ContraLogOptions(options);
    }
    if(!contraLogOptions){
        contraLogOptions = new ContraLogOptions();
    }
    return new ConsoleLogger(moduleObj, contraLogOptions, undefined);
};
createContraLog.ConsoleLogger = ConsoleLogger;
createContraLog.ContraLogOptions = ContraLogOptions;
createContraLog.StackHelpers = StackHelpers;

module.exports = createContraLog;