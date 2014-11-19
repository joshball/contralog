'use strict';

var contraLog = require('../lib/');
var ConsoleLogger = contraLog.ConsoleLogger;
var log = contraLog(module);
//log.trace('contraLog.ConsoleLogger',contraLog);

var json = ConsoleLogger.jsonString({i:10, s:'foo'});
log.trace('trace', json);
