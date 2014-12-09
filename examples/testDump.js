'use strict';

var contraLog = require('../lib/')(module);

contraLog.dump('contraLog', contraLog);

var foo = function(){
    contraLog.dumpWithStack('contraLog', contraLog);
};

function bar(){
    contraLog.dumpWithStack('contraLog', contraLog);
};

var baz = function(){
    foo();
    bar();
};

baz();
