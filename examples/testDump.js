'use strict';

var contraLog = require('../lib/')(module);

var server = require('./lib/server');
var util = require('util');

//console.log('contraLog', contraLog);
//console.log('contraLog.toString()', contraLog.toString());
//console.log('contraLog util %s', util.format('%s', contraLog));
//console.log('contraLog util.inspect:', );
//console.log('server', JSON.stringify(server, undefined, 4));
contraLog.dump('contraLog', contraLog);

//  [server:18] server calling ac.get(2)
//  [accountService:28] RETURNING:
//  2
//  [AccountController:20] RETURNING:
//  2

//conLog.off('#modules:serv');


//conLog.off().on('#modules:serv');

//conLog.trace('server calling ac.getAll');
//conLog.trace('server calling ac.get(2)');
//ac.get(2);
//ac.get(12);
//
//dumpAll(contraLog, 'should dump only errors');
//contraLog.setLevel('info');
//dumpAll(contraLog, 'should dump only info, warnings and errors');
//contraLog.resetOptions('level', 'warn');
//dumpAll(contraLog, 'should dump everything');
