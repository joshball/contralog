'use strict';

var contraLog = require('../lib/')(module);
contraLog.off();
var server = require('./lib/server');
// The above server line creats the following log entries:
//  [server:6] Creating AccountController
//  [accountService:17] RETURNING:
//      true
//  [AccountController:11] connected
//  [server:10] server started
// Which you will not see when contraLog is off()
console.log('--- should not have seen anything before here --')

contraLog.setOptions({level: 'trace'});

// Now lets turn on only modules with 'serv' in the name (server and accountService):

contraLog.off().on('#modules:serv'); // you could skip the off if you wanted to...
contraLog.error('you should not see this!!!!');
server.testGetAll();
// but you should have seen:
//  [server:14] server calling ac.getAll
//    [accountService:21] RETURNING:
//    [{"id":1,"name":"abby"},{"id":2,"name":"bill"},{"id":3,"name":"cate"},{"id":4,"name":"dave"}]

contraLog.on();
contraLog.debug('now you should see three more calls');
server.testGet(2);

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
