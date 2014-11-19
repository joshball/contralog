'use strict';

var cl = require('../lib/')(module);
var StackHelpers = require('../lib/').StackHelpers;

//console.log('StackHelpers:',StackHelpers);
cl.trace('a trace from testStackCoolness!');

cl.setOptions({
    level: 'trace',
    lineFormat: '#msg\n' +
    '[MOD:#mod (FILE:#file) LINE:#line, COL:#col]\n' +
    '[isConstructor:#isConstructor (isEval:#isEval) isNative:#isNative, isToplevel:#isToplevel]\n' +
    '[evalOrigin:#evalOrigin]\n' +
    '[func:#func, method:#method, type:#type]'});

var server = require('./lib/server');

cl.off().on('#modules:serv'); // you could skip the off if you wanted to...


server.testGetAll();

cl.on();
cl.debug('now you should see three more calls');
server.testGet(2);

function m1(){
    m2();
}
function m2(){
    m3();
}
function m3(){
    console.log('-- 1 ------------------------')
    cl.stack();
    console.log('-- 2 ------------------------')
    cl.stack(0,3);
    console.log('-- 3 ------------------------')
    cl.stack(1,3, 'warn');
}

m1();