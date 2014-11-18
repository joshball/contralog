'use strict';

var contraLog = require('../lib/')(module);
var StackHelpers = require('../lib/').StackHelpers;

console.log('StackHelpers:',StackHelpers);

contraLog.setOptions({
    level: 'trace',
    lineFormat: 'MSG: #msg\n' +
    '\t[MOD:#mod (FILE:#file) LINE:#line, COL:#col]\n' +
    '\t[isConstructor:#isConstructor (isEval:#isEval) isNative:#isNative, isToplevel:#isToplevel]\n' +
    '\t[evalOrigin:#evalOrigin]\n' +
    '\t[func:#func, method:#method, type:#type]'});

var server = require('./lib/server');


// Now lets turn on only modules with 'serv' in the name (server and accountService):

contraLog.off().on('#modules:serv'); // you could skip the off if you wanted to...
contraLog.trace('TRACE from test example');
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
