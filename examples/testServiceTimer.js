'use strict';

var contraLog = require('../lib/')(module);

var sc = contraLog.serviceCallStart('github');
setTimeout(function(){
    contraLog.serviceCallEnd(sc);
}, 2000);
