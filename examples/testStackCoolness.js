'use strict';

var cl = require('../lib/')(module);
var StackHelpers = require('../lib/').StackHelpers;

//console.log('StackHelpers:',StackHelpers);
cl.trace('a trace from testStackCoolness!');

cl.setOptions({
    level: 'trace',
    lineFormat: 'MSG: #msg\n' +
    '[MOD:#mod (FILE:#file) LINE:#line, COL:#col]\n' +
    '[isConstructor:#isConstructor (isEval:#isEval) isNative:#isNative, isToplevel:#isToplevel]\n' +
    '[evalOrigin:#evalOrigin]\n' +
    '[func:#func, method:#method, type:#type]'});

var server = require('./lib/server');



cl.off().on('#modules:serv'); // you could skip the off if you wanted to...


server.testGetAll();
// but you should have seen:
//  [server:14] server calling ac.getAll
//    [accountService:21] RETURNING:
//    [{"id":1,"name":"abby"},{"id":2,"name":"bill"},{"id":3,"name":"cate"},{"id":4,"name":"dave"}]

cl.on();
cl.debug('now you should see three more calls');
cl.stack(1);
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
