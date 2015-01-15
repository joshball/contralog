'use strict';

var contraLog = require('../lib/')(module).on();

var sc = contraLog.serviceCallStart('github');
setTimeout(function(){
    contraLog.serviceCallEnd(sc, { foo: 'bar', x: 1});
}, 2000);

